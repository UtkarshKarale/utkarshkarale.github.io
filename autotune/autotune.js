// app.js - Main Thread Logic for AutoTune Studio

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const btnConnect = document.getElementById('btnConnect');
  const keySelect = document.getElementById('keySelect');
  const scaleSelect = document.getElementById('scaleSelect');
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  const canvas = document.getElementById('visualizer');
  // Initialize WebGL instead of 2D
  const gl = canvas.getContext('webgl');
  let glProgram, glBuffer, aPos, uResolution, uTime, uAmplitude;
  let visualizerStart = 0;

  // WebGL Shaders for Siri Wave
  const VERTEX_SHADER = `attribute vec2 aPos; void main(){ gl_Position=vec4(aPos,0.0,1.0); }`;
  const WAVE_SHADER = `precision highp float;
uniform vec2 iResolution; uniform float iTime; uniform float uAmplitude;
const float PI = 3.14159265359;
const float FREQ        = 1.1;
const float ABER_FREQ   = 1.0;
const float SPEED       = 2.4;
const float WAVE_SCALE  = 0.6;
const float ABERRATION  = 2.6;
const float THICKNESS   = 3.0;
const float INTENSITY   = 2.;
const float FALLOFF     = 1.7;
const float EDGE_MASK   = 0.4;
const float EDGE_INSET  = 0.0;
const float BAND_FILL   = 30000.0;
const float BAND_THICK  = 0.08;
const float SOFTNESS    = 2.5;
const float LOW_AMP     = 6.0;
const float LOW_INT     = 1.5;
const float MID_ABER    = 0.8;
const float MID_ABAMP   = 0.05;
const float MID_BAND    = 20.0;
const float MID_SOFT    = 0.4;
const float HIGH_ABER   = 0.5;
const float HIGH_ABAMP  = 0.06;
const float RESOLVED    = 1.0;
const float UNRES_SCALE = 0.14;

vec3 spectral4(int s){
    float x = float(s);
    return clamp(vec3(abs(x-3.0)-1.0, 2.0-abs(x-2.0), 2.0-abs(x-4.0)), 0.0, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 R = iResolution.xy;
    float aspect = R.x / R.y;
    vec2 p = (fragCoord + 0.5) * 2.0 / R - 1.0;
    p.x *= aspect;
    float yScreen = p.y;
    p /= max(WAVE_SCALE, 0.1);

    float t   = iTime;
    float low  = clamp(0.45 + 0.45*sin(t*0.8)*sin(t*0.37+1.0), 0.0, 1.0);
    float mid  = clamp(0.40 + 0.40*sin(t*1.7+2.0)*sin(t*0.53), 0.0, 1.0);
    float high = clamp(0.30 + 0.30*sin(t*2.9+4.0)*sin(t*0.71+2.0), 0.0, 1.0);

    float res   = clamp(RESOLVED, 0.0, 1.0);
    float drift = mod(t, 20.0*PI) * SPEED;

    float xN  = p.x / max(aspect, 1.0);
    float env = cos(PI*0.5 * min(abs(0.9*xN), 1.0));
    env *= env;

    // Use dynamic amplitude from mic instead of static constant
    float dynAmp = max(0.05, uAmplitude * 2.5); // base + reaction
    float A1    = dynAmp + 0.01*low*LOW_AMP;
    float A2    = A1 + mid*MID_ABAMP + high*HIGH_ABAMP;
    float AB    = (ABERRATION + mid*MID_ABER + high*HIGH_ABER)*res;
    float th    = mix(0.1, 0.01*THICKNESS, res);
    float inten = mix(0.1, 0.01*(INTENSITY + low*LOW_INT), res);
    float soft  = 0.01*res*max(0.0, SOFTNESS + mid*MID_SOFT);

    float dUnres = max(length(p) - mix(0.14, UNRES_SCALE, res), 0.0);
    float yMain = A1 * env * res * sin(p.x*FREQ + drift);

    float bandFillTh = max(BAND_THICK, 1e-4);
    float bandAmt    = 1e-4 * BAND_FILL * inten;
    vec3 num = vec3(0.0), den = vec3(0.0);
    for(int s = 0; s < 4; s++){
        vec3 hue = mix(vec3(1.0), spectral4(s), res);
        den += hue;
        float ab = mix(-AB, AB, float(s)/3.0);
        float yL = A2 * env * res * sin(p.x*ABER_FREQ + drift + ab);
        float d   = mix(dUnres, abs(p.y - yL), res);
        float lor = mix(1.0/(1.0 + (0.02*d)*(0.02*d)), 1.0, res);
        float line = inten / (sqrt(d*d + soft*soft) + th);
        float lo = min(yMain, yL), hi = max(yMain, yL);
        float dBand = max(0.0, max(p.y - hi, lo - p.y));
        float band  = bandAmt / (dBand + bandFillTh);
        num += hue * lor * (line + band);
    }
    vec3 col = num / den;

    float dM    = mix(dUnres, abs(p.y - yMain), res);
    float lorM  = mix(1.0/(1.0 + (0.02*dM)*(0.02*dM)), 1.0, res);
    float boost = (1.0 - res) * (14.0*low + 4.0);
    col += 0.5 * inten * (lorM + boost) / (sqrt(dM*dM + soft*soft) + th);

    col = pow(max(col, 0.0), vec3(1.5));
    float emT = clamp((abs(yScreen) - 1.0 + EDGE_INSET) / (-max(EDGE_MASK, 1e-4)), 0.0, 1.0);
    float em  = emT*emT*(3.0 - 2.0*emT);
    float gauss = exp(-pow(xN*FALLOFF, 2.0));
    col *= mix(1.0, em*gauss, res);
    col *= res;
    fragColor = vec4(col, 1.0);
}
void main(){ mainImage(gl_FragColor, gl_FragCoord.xy); }`;

  function initWebGL() {
    if (!gl) return;
    const compile = (type, src) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
      }
      return shader;
    };

    glProgram = gl.createProgram();
    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, WAVE_SHADER);
    gl.attachShader(glProgram, vs);
    gl.attachShader(glProgram, fs);
    gl.linkProgram(glProgram);
    gl.useProgram(glProgram);

    glBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    
    aPos = gl.getAttribLocation(glProgram, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    uResolution = gl.getUniformLocation(glProgram, "iResolution");
    uTime = gl.getUniformLocation(glProgram, "iTime");
    uAmplitude = gl.getUniformLocation(glProgram, "uAmplitude");
  }
  initWebGL();

  // Audio State
  let audioCtx;
  let micStream;
  let micSource;
  let workletNode;
  let analyser;
  let isRunning = false;

  // Recording State
  let mediaStreamDestination;
  let mediaRecorder;
  let recordedChunks = [];
  let isRecording = false;

  // New UI Elements
  const btnRecord = document.getElementById('btnRecord');
  const btnRecordText = document.getElementById('btnRecordText');
  const btnDownload = document.getElementById('btnDownload');
  const btnConnectText = document.getElementById('btnConnectText');
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');

  // Music Theory Constants
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const SCALES = {
    'major': [0, 2, 4, 5, 7, 9, 11],
    'natural_minor': [0, 2, 3, 5, 7, 8, 10],
    'harmonic_minor': [0, 2, 3, 5, 7, 8, 11],
    'pentatonic_major': [0, 2, 4, 7, 9],
    'pentatonic_minor': [0, 3, 5, 7, 10],
    'chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  };

  // Generate frequencies for a given key and scale (C2 to C6)
  function generateScaleFrequencies(rootNoteIndex, scaleIntervals) {
    const freqs = [];
    const A4 = 440.0;
    const A4_INDEX = 57; // A4 is index 57 if C0 is 0. Actually let's use standard MIDI numbers.
    // MIDI note 69 = A4 = 440Hz
    // C2 = 36, C6 = 84
    for (let midi = 36; midi <= 84; midi++) {
      const noteClass = midi % 12; // 0 = C, 1 = C#...
      // Check if noteClass is in the selected scale for the given root
      // Shift noteClass relative to root
      const relativeInterval = (noteClass - rootNoteIndex + 12) % 12;
      if (scaleIntervals.includes(relativeInterval)) {
        const hz = A4 * Math.pow(2, (midi - 69) / 12);
        freqs.push(hz);
      }
    }
    return freqs;
  }

  function updateWorkletParams() {
    if (!workletNode) return;
    
    const rootIndex = NOTES.indexOf(keySelect.value);
    const intervals = SCALES[scaleSelect.value];
    const freqs = generateScaleFrequencies(rootIndex, intervals);
    const speed = parseInt(speedSlider.value, 10);

    workletNode.port.postMessage({
      scaleFreqs: freqs,
      retuneSpeed: speed
    });
  }

  // Event Listeners for UI
  keySelect.addEventListener('change', updateWorkletParams);
  scaleSelect.addEventListener('change', updateWorkletParams);
  
  speedSlider.addEventListener('input', (e) => {
    speedValue.textContent = e.target.value;
    updateWorkletParams();
  });

  // Start / Stop Microphone & Processing
  btnConnect.addEventListener('click', async () => {
    if (isRunning) {
      // Stop
      if (isRecording) stopRecording();
      if (micStream) micStream.getTracks().forEach(t => t.stop());
      if (audioCtx) await audioCtx.suspend();
      btnConnectText.textContent = 'Connect Mic';
      btnConnect.classList.remove('active');
      btnRecord.disabled = true;
      statusIndicator.className = 'status-indicator';
      statusText.textContent = 'STANDBY';
      isRunning = false;
      return;
    }

    try {
      // Init AudioContext
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        await audioCtx.audioWorklet.addModule('/autotune/pitch-processor.js');
      }

      await audioCtx.resume();

      // Get Mic
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true, // Also enabling AGC for better mic levels
        }
      });
      micSource = audioCtx.createMediaStreamSource(micStream);

      // Create Worklet
      workletNode = new AudioWorkletNode(audioCtx, 'pitch-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        channelCount: 1,
        processorOptions: {}
      });

      updateWorkletParams();

      // Create Analyser for Visualizer
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;

      // Create MediaStreamDestination for recording
      mediaStreamDestination = audioCtx.createMediaStreamDestination();

      // Routing: 
      // Mic -> Worklet -> Analyser -> Output & Record Dest
      micSource.connect(workletNode);
      workletNode.connect(analyser);
      analyser.connect(audioCtx.destination);
      analyser.connect(mediaStreamDestination);

      btnConnect.classList.add('active');
      btnConnectText.textContent = 'Disconnect Mic';
      btnRecord.disabled = false;
      
      statusIndicator.classList.remove('is-recording');
      statusIndicator.classList.add('is-live');
      statusText.textContent = 'LIVE';
      
      isRunning = true;

      drawVisualizer();
    } catch (err) {
      console.error('Microphone access error:', err);
      alert('Could not access microphone. Please ensure permissions are granted.');
    }
  });

  // Canvas WebGL Visualizer
  function drawVisualizer() {
    if (!isRunning || !analyser || !gl) return;
    requestAnimationFrame(drawVisualizer);

    const now = performance.now();
    if (!visualizerStart) visualizerStart = now;
    const t = (now - visualizerStart) / 1000;

    // Calculate RMS volume from analyser to modulate amplitude
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(dataArray);
    
    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i++) {
      sumSquares += dataArray[i] * dataArray[i];
    }
    let rms = Math.sqrt(sumSquares / bufferLength);
    
    // Smooth the amplitude a bit
    let targetAmp = rms * 5.0; // scale factor
    
    // Draw WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(glProgram);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uTime, t);
    gl.uniform1f(uAmplitude, targetAmp);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // Handle resizing canvas
  function resizeCanvas() {
    if (canvas) {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = 120;
    }
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas(); // initial setup

  // Recording Logic
  function startRecording() {
    if (!mediaStreamDestination) return;
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      btnDownload.href = url;
      btnDownload.download = `autotune-session-${new Date().getTime()}.webm`;
      btnDownload.style.display = 'flex';
    };

    mediaRecorder.start();
    isRecording = true;
    
    // Mute live playback while recording (to prevent feedback/echo through speakers)
    if (analyser && audioCtx) {
      try { analyser.disconnect(audioCtx.destination); } catch(e){}
    }
    
    btnRecord.classList.add('active');
    btnRecordText.textContent = 'Stop Recording';
    btnDownload.style.display = 'none';

    statusIndicator.className = 'status-indicator is-recording';
    statusText.textContent = 'REC';
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    isRecording = false;

    // Re-enable live playback after recording stops
    if (analyser && audioCtx) {
      analyser.connect(audioCtx.destination);
    }
    
    btnRecord.classList.remove('active');
    btnRecordText.textContent = 'Record Mix';

    statusIndicator.className = 'status-indicator is-live';
    statusText.textContent = 'LIVE';
  }

  if (btnRecord) {
    btnRecord.addEventListener('click', () => {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    });
  }
});
