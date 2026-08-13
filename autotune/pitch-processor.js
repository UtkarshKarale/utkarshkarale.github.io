/**
 * AutoTune Pitch Processor — AudioWorklet
 * YIN pitch detection + granular overlap-add pitch shifting
 */
class PitchProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.SR = sampleRate;

    // === Config (updated via messages) ===
    this.retuneSpeed = 0;       // 0 = instant snap, 100 = no correction
    this.scaleFreqs = [];       // target frequencies array
    this.enabled = true;

    // === YIN Pitch Detection ===
    this.yinSize = 2048;
    this.yinHalf = 1024;
    this.yinBuf = new Float32Array(1024);
    this.ringBuf = new Float32Array(8192);
    this.ringMask = 8191;
    this.writePos = 0;
    this.samplesSinceDetect = 0;
    this.detectInterval = 512;

    // === Pitch state ===
    this.detectedHz = 0;
    this.confidence = 0;
    this.targetHz = 0;
    this.currentRatio = 1.0;
    this.targetRatio = 1.0;

    // Stability
    this.pitchHistory = [0,0,0,0,0];
    this.histIdx = 0;
    this.stableHz = 0;
    this.lockCount = 0;

    // === Granular pitch shifter (2 overlapping grains) ===
    this.grainSize = 1024;
    this.readPos0 = 0;
    this.readPos1 = 512; // half grain offset
    this.grainIdx0 = 0;
    this.grainIdx1 = 512;

    // Hann window
    this.hann = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      this.hann[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / 1024));
    }

    // Messages from main thread
    this.port.onmessage = (e) => {
      const d = e.data;
      if (d.scaleFreqs) this.scaleFreqs = d.scaleFreqs;
      if (d.retuneSpeed !== undefined) this.retuneSpeed = d.retuneSpeed;
      if (d.enabled !== undefined) this.enabled = d.enabled;
    };
  }

  // ─── YIN pitch detection ───
  yin(buf, N) {
    const half = N >> 1;
    const yb = this.yinBuf;

    // RMS gate
    let rms = 0;
    for (let i = 0; i < N; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / N);
    if (rms < 0.015) return { hz: 0, conf: 0 };

    // Difference function
    yb[0] = 0;
    for (let tau = 1; tau < half; tau++) {
      let sum = 0;
      for (let i = 0; i < half; i++) {
        const d = buf[i] - buf[i + tau];
        sum += d * d;
      }
      yb[tau] = sum;
    }

    // CMND
    yb[0] = 1;
    let run = 0;
    for (let tau = 1; tau < half; tau++) {
      run += yb[tau];
      yb[tau] = yb[tau] * tau / run;
    }

    // Threshold
    const tauMin = Math.max(2, Math.floor(this.SR / 900));
    const tauMax = Math.min(half - 1, Math.floor(this.SR / 65));
    let best = -1;

    for (let tau = tauMin; tau < tauMax; tau++) {
      if (yb[tau] < 0.15) {
        while (tau + 1 < tauMax && yb[tau + 1] < yb[tau]) tau++;
        best = tau;
        break;
      }
    }
    if (best < 0) return { hz: 0, conf: 0 };

    // Parabolic interpolation
    let refined = best;
    if (best > 0 && best < half - 1) {
      const a = yb[best-1], b = yb[best], c = yb[best+1];
      const den = 2*b - c - a;
      if (den !== 0) refined = best + (a - c) / (2 * den);
    }

    const hz = this.SR / refined;
    if (hz < 65 || hz > 900) return { hz: 0, conf: 0 };
    return { hz, conf: 1 - yb[best] };
  }

  // ─── Stabilize pitch (median + octave rejection) ───
  stabilize(rawHz, conf) {
    if (conf < 0.6 || rawHz <= 0) {
      this.lockCount = Math.max(0, this.lockCount - 1);
      if (this.lockCount <= 0) this.stableHz = 0;
      return this.stableHz;
    }
    this.pitchHistory[this.histIdx] = rawHz;
    this.histIdx = (this.histIdx + 1) % 5;

    const valid = this.pitchHistory.filter(p => p > 0);
    if (valid.length < 2) return rawHz;
    valid.sort((a, b) => a - b);
    const median = valid[Math.floor(valid.length / 2)];

    const r = rawHz / median;
    if (r > 1.7 || r < 0.6) return this.stableHz || median;

    this.stableHz = median;
    this.lockCount = 8;
    return median;
  }

  // ─── Find nearest scale frequency ───
  findTarget(hz) {
    if (!this.scaleFreqs || this.scaleFreqs.length === 0 || hz <= 0) return hz;
    let closest = this.scaleFreqs[0];
    let minDist = Infinity;
    for (const f of this.scaleFreqs) {
      const dist = Math.abs(1200 * Math.log2(hz / f)); // distance in cents
      if (dist < minDist) { minDist = dist; closest = f; }
    }
    return closest;
  }

  // ─── Update correction ratio ───
  updateRatio(stableHz) {
    if (stableHz <= 0 || !this.enabled) {
      this.currentRatio += (1.0 - this.currentRatio) * 0.03;
      return;
    }

    this.targetHz = this.findTarget(stableHz);
    this.targetRatio = this.targetHz / stableHz;

    // Retune speed: 0 = instant snap, 100 = no correction
    // Convert to smoothing alpha
    if (this.retuneSpeed <= 1) {
      // Instant but with tiny smoothing to prevent hard popping clicks
      this.currentRatio += (this.targetRatio - this.currentRatio) * 0.8;
    } else {
      const speed01 = this.retuneSpeed / 100;
      const tMs = 3 + speed01 * 200; // 3ms to 203ms
      const fps = this.SR / this.detectInterval;
      const tFrames = (tMs / 1000) * fps;
      const alpha = tFrames > 0 ? (1 - Math.exp(-1 / tFrames)) : 1;
      this.currentRatio += (this.targetRatio - this.currentRatio) * alpha;
    }

    this.currentRatio = Math.max(0.5, Math.min(2.0, this.currentRatio));
  }

  // ─── Main process ───
  process(inputs, outputs) {
    const inp = inputs[0] && inputs[0][0];
    const out = outputs[0] && outputs[0][0];
    if (!inp || !out) return true;

    const N = inp.length;
    const ring = this.ringBuf;
    const mask = this.ringMask;
    const gs = this.grainSize;
    const hann = this.hann;

    for (let i = 0; i < N; i++) {
      const s = inp[i];

      // Write to ring buffer
      ring[this.writePos & mask] = s;
      this.writePos++;
      this.samplesSinceDetect++;

      // Periodic pitch detection
      if (this.samplesSinceDetect >= this.detectInterval) {
        this.samplesSinceDetect = 0;
        const abuf = new Float32Array(this.yinSize);
        for (let j = 0; j < this.yinSize; j++) {
          abuf[j] = ring[(this.writePos - this.yinSize + j) & mask];
        }
        const det = this.yin(abuf, this.yinSize);
        const stable = this.stabilize(det.hz, det.conf);
        this.updateRatio(stable);

        // Report to main thread
        this.port.postMessage({
          detectedHz: stable,
          targetHz: this.targetHz,
          confidence: det.conf,
          ratio: this.currentRatio
        });
      }

      // === Granular pitch shift ===
      const ratio = this.currentRatio;

      // Read head 0
      const ri0 = Math.floor(this.readPos0) & mask;
      const f0 = this.readPos0 - Math.floor(this.readPos0);
      const v0 = ring[ri0] * (1 - f0) + ring[(ri0 + 1) & mask] * f0;
      const w0 = hann[this.grainIdx0];

      // Read head 1
      const ri1 = Math.floor(this.readPos1) & mask;
      const f1 = this.readPos1 - Math.floor(this.readPos1);
      const v1 = ring[ri1] * (1 - f1) + ring[(ri1 + 1) & mask] * f1;
      const w1 = hann[this.grainIdx1];

      out[i] = v0 * w0 + v1 * w1;

      // Advance read positions at shifted rate
      this.readPos0 += ratio;
      this.readPos1 += ratio;
      this.grainIdx0++;
      this.grainIdx1++;

      // Reset grains when complete.
      // We must start far enough behind the write head so we don't overtake it.
      // If we are reading 'ratio' times faster, we need to start 'gs * ratio' samples behind.
      if (this.grainIdx0 >= gs) {
        this.grainIdx0 = 0;
        this.readPos0 = this.writePos - (gs * ratio);
      }
      if (this.grainIdx1 >= gs) {
        this.grainIdx1 = 0;
        this.readPos1 = this.writePos - (gs * ratio);
      }
    }

    return true;
  }
}

registerProcessor('pitch-processor', PitchProcessor);
