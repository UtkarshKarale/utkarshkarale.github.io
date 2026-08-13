/**
 * AutoTune AudioWorklet Processor
 * 
 * Real-time pitch correction using:
 * - YIN pitch detection algorithm  
 * - Overlap-add granular pitch shifting (PSOLA-inspired)
 * - Scale-aware note targeting with hysteresis
 * - Smooth retune speed control
 */
class AutoTuneProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.correctionAmount = 0.5;
    this.retuneSpeed = 0.5;
    this.key = 'chromatic';

    const SR = sampleRate;
    this.SR = SR;

    // ── Pitch Detection (YIN) ──
    this.yinSize = 2048;
    this.yinHalf = this.yinSize / 2;
    this.yinBuf = new Float32Array(this.yinHalf);
    // Ring buffer to accumulate input for analysis
    this.analysisBuf = new Float32Array(this.yinSize);
    this.analysisBufPos = 0;
    this.analysisReady = false;
    this.analysisSampleCounter = 0;
    this.analysisHop = 512; // run detection every 512 samples (~86 Hz at 44.1k)

    // ── Pitch State ──
    this.detectedPitch = 0;
    this.confidence = 0;
    this.pitchHistory = [0, 0, 0, 0, 0];
    this.pitchHistIdx = 0;
    this.stablePitch = 0;
    this.lockFrames = 0;

    // ── Correction State ──
    this.currentShift = 1.0; // current pitch shift ratio applied
    this.targetShift = 1.0;  // where we want to be

    // ── Granular Pitch Shifter ──
    // Two overlapping grains, crossfaded with Hann windows
    this.grainSize = 1024;
    this.halfGrain = this.grainSize / 2;
    // Input ring buffer
    this.inBufSize = 8192;
    this.inBuf = new Float32Array(this.inBufSize);
    this.inWritePos = 0;
    // Two read heads with fractional position
    this.readPos0 = 0;
    this.readPos1 = this.halfGrain; // offset by half grain
    this.grainPos0 = 0; // position within current grain window (0..grainSize)
    this.grainPos1 = this.halfGrain;

    // Pre-compute Hann window
    this.hannWindow = new Float32Array(this.grainSize);
    for (let i = 0; i < this.grainSize; i++) {
      this.hannWindow[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / this.grainSize));
    }

    // ── Scale Definitions ──
    this.scales = {
      major:     [0, 2, 4, 5, 7, 9, 11],
      minor:     [0, 2, 3, 5, 7, 8, 10],
      chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    };
    this.noteOffsets = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };

    // Message handler
    this.port.onmessage = (e) => {
      const d = e.data;
      if (d.correction !== undefined) this.correctionAmount = d.correction;
      if (d.retuneSpeed !== undefined) this.retuneSpeed = d.retuneSpeed;
      if (d.key !== undefined) this.key = d.key;
    };
  }

  // ────────────────────────────────────────
  // YIN Pitch Detection
  // ────────────────────────────────────────
  detectPitch(buf, N) {
    const half = N >> 1;
    const yb = this.yinBuf;

    // RMS gate
    let rms = 0;
    for (let i = 0; i < N; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / N);
    if (rms < 0.012) return { pitch: 0, conf: 0 };

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

    // Cumulative mean normalized difference
    yb[0] = 1;
    let running = 0;
    for (let tau = 1; tau < half; tau++) {
      running += yb[tau];
      yb[tau] = (yb[tau] * tau) / running;
    }

    // Absolute threshold
    const tauMin = Math.max(2, Math.floor(this.SR / 900));
    const tauMax = Math.min(half - 1, Math.floor(this.SR / 65));
    let bestTau = -1;

    for (let tau = tauMin; tau < tauMax; tau++) {
      if (yb[tau] < 0.15) {
        while (tau + 1 < tauMax && yb[tau + 1] < yb[tau]) tau++;
        bestTau = tau;
        break;
      }
    }
    if (bestTau < 0) return { pitch: 0, conf: 0 };

    // Parabolic interpolation
    let refined = bestTau;
    if (bestTau > 0 && bestTau < half - 1) {
      const a = yb[bestTau - 1], b = yb[bestTau], c = yb[bestTau + 1];
      const denom = 2 * b - c - a;
      if (denom !== 0) refined = bestTau + (a - c) / (2 * denom);
    }

    const pitch = this.SR / refined;
    const conf = 1 - yb[bestTau];
    if (pitch < 65 || pitch > 900) return { pitch: 0, conf: 0 };

    return { pitch, conf };
  }

  // ────────────────────────────────────────
  // Pitch Stability (median + hysteresis)
  // ────────────────────────────────────────
  stabilize(rawPitch, conf) {
    if (conf < 0.65 || rawPitch <= 0) {
      this.lockFrames = Math.max(0, this.lockFrames - 1);
      if (this.lockFrames <= 0) this.stablePitch = 0;
      return this.stablePitch;
    }

    // Push to history
    this.pitchHistory[this.pitchHistIdx] = rawPitch;
    this.pitchHistIdx = (this.pitchHistIdx + 1) % this.pitchHistory.length;

    // Median filter
    const valid = this.pitchHistory.filter(p => p > 0);
    if (valid.length < 2) return rawPitch;
    valid.sort((a, b) => a - b);
    const median = valid[Math.floor(valid.length / 2)];

    // Reject octave errors
    const r = rawPitch / median;
    if (r > 1.7 || r < 0.6) return this.stablePitch || median;

    this.stablePitch = median;
    this.lockFrames = 10;
    return median;
  }

  // ────────────────────────────────────────
  // Find target note in key/scale
  // ────────────────────────────────────────
  findTarget(midiNote) {
    let keyStr = this.key || 'chromatic';
    let scaleName = 'major';

    if (keyStr === 'chromatic') {
      scaleName = 'chromatic';
      keyStr = 'C';
    } else if (keyStr.endsWith('m') && keyStr.length > 1) {
      scaleName = 'minor';
      keyStr = keyStr.slice(0, -1);
    }

    const root = this.noteOffsets[keyStr] || 0;
    const intervals = this.scales[scaleName] || this.scales.chromatic;
    const validSet = new Set(intervals.map(i => (root + i) % 12));

    const rounded = Math.round(midiNote);
    const nc = ((rounded % 12) + 12) % 12;
    if (validSet.has(nc)) return rounded;

    for (let d = 1; d <= 6; d++) {
      if (validSet.has(((nc - d) % 12 + 12) % 12)) return rounded - d;
      if (validSet.has(((nc + d) % 12 + 12) % 12)) return rounded + d;
    }
    return rounded;
  }

  // ────────────────────────────────────────
  // Update the shift ratio toward target pitch
  // ────────────────────────────────────────
  updateShift(stablePitch) {
    if (stablePitch <= 0) {
      // Decay toward unity (no shift) when unvoiced
      this.currentShift += (1.0 - this.currentShift) * 0.02;
      return;
    }

    const detectedMidi = 69 + 12 * Math.log2(stablePitch / 440);
    const targetMidi = this.findTarget(detectedMidi);
    const errorSemitones = targetMidi - detectedMidi;

    // Scale by correction amount
    const corrected = errorSemitones * this.correctionAmount;
    this.targetShift = Math.pow(2, corrected / 12);

    // Retune speed → smoothing alpha
    // speed 0 = ~100ms convergence, speed 1 = ~3ms
    const updatesPerSec = this.SR / this.analysisHop;
    const tMs = 100 - this.retuneSpeed * 97; // 100ms..3ms
    const tFrames = (tMs / 1000) * updatesPerSec;
    const alpha = tFrames > 0 ? (1 - Math.exp(-1 / tFrames)) : 1;

    this.currentShift += (this.targetShift - this.currentShift) * alpha;
    this.currentShift = Math.max(0.5, Math.min(2.0, this.currentShift));
  }

  // ────────────────────────────────────────
  // Process (128 samples per call)
  // ────────────────────────────────────────
  process(inputs, outputs) {
    const inp = inputs[0] && inputs[0][0];
    const out = outputs[0] && outputs[0][0];
    if (!inp || !out) return true;

    const N = inp.length;
    const inBuf = this.inBuf;
    const inSize = this.inBufSize;
    const gs = this.grainSize;
    const hann = this.hannWindow;

    for (let i = 0; i < N; i++) {
      const s = inp[i];

      // Write to input ring buffer
      inBuf[this.inWritePos & (inSize - 1)] = s;
      this.inWritePos++;

      // Also accumulate for pitch analysis
      this.analysisBuf[this.analysisBufPos] = s;
      this.analysisBufPos = (this.analysisBufPos + 1) % this.yinSize;
      this.analysisSampleCounter++;

      // Run pitch detection every analysisHop samples
      if (this.analysisSampleCounter >= this.analysisHop) {
        this.analysisSampleCounter = 0;

        // Build contiguous buffer for YIN
        const abuf = new Float32Array(this.yinSize);
        for (let j = 0; j < this.yinSize; j++) {
          abuf[j] = this.analysisBuf[(this.analysisBufPos + j) % this.yinSize];
        }

        const det = this.detectPitch(abuf, this.yinSize);
        const stable = this.stabilize(det.pitch, det.conf);
        this.updateShift(stable);

        // Report to main thread
        this.port.postMessage({
          pitch: stable,
          confidence: det.conf,
          shift: this.currentShift,
        });
      }

      // ── Granular pitch shift with two overlapping read heads ──
      const shift = this.currentShift;
      // Read rate: to shift pitch UP, read FASTER through input
      // shiftRatio > 1 means we want higher pitch → read faster
      const readRate = 1.0 / shift; // inverse: to raise pitch, slow down read

      // Wait, that's backwards for PSOLA output:
      // To raise pitch by ratio R, we need to READ at rate R (faster) 
      // through the input, and output grains at normal rate.
      // Actually for overlap-add: read speed = shiftRatio
      const speed = shift;

      // Read head 0
      const rp0 = this.readPos0;
      const gp0 = this.grainPos0;
      const idx0 = Math.floor(rp0) & (inSize - 1);
      const frac0 = rp0 - Math.floor(rp0);
      const s0 = inBuf[idx0] * (1 - frac0) + inBuf[(idx0 + 1) & (inSize - 1)] * frac0;
      const w0 = hann[gp0 | 0];

      // Read head 1
      const rp1 = this.readPos1;
      const gp1 = this.grainPos1;
      const idx1 = Math.floor(rp1) & (inSize - 1);
      const frac1 = rp1 - Math.floor(rp1);
      const s1 = inBuf[idx1] * (1 - frac1) + inBuf[(idx1 + 1) & (inSize - 1)] * frac1;
      const w1 = hann[gp1 | 0];

      // Output: sum of windowed grains
      out[i] = s0 * w0 + s1 * w1;

      // Advance read positions
      this.readPos0 += speed;
      this.readPos1 += speed;
      this.grainPos0++;
      this.grainPos1++;

      // Reset grain 0 when it completes
      if (this.grainPos0 >= gs) {
        this.grainPos0 = 0;
        // Re-sync read position to near current write position
        // This prevents drift and keeps latency low
        this.readPos0 = this.inWritePos - gs;
      }

      // Reset grain 1 when it completes
      if (this.grainPos1 >= gs) {
        this.grainPos1 = 0;
        this.readPos1 = this.inWritePos - gs;
      }
    }

    return true;
  }
}

registerProcessor('autotune-processor', AutoTuneProcessor);
