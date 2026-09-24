/**
 * Web Audio API synthesizer for Samsung S23 Ultra haptics, S-Pen clicks,
 * mindful chimes, and procedural ambient focus soundscapes.
 * Works 100% offline without external audio files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private soundEnabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopAmbient();
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // Tactile One UI haptic tap
  public playHapticTick() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Authentic S-Pen top click (dual micro-click)
  public playSpenClick() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.initCtx();
      const t = ctx.currentTime;

      // Click 1 (down)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1200, t);
      osc1.frequency.exponentialRampToValueAtTime(400, t + 0.015);
      gain1.gain.setValueAtTime(0.2, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.02);

      // Click 2 (spring release ~50ms later)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1600, t + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(600, t + 0.065);
      gain2.gain.setValueAtTime(0.15, t + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t + 0.05);
      osc2.stop(t + 0.07);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Mindful bell / Zen completion chime
  public playZenChime() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.initCtx();
      const t = ctx.currentTime;
      const freqs = [528, 792, 1056]; // 528Hz Solfeggio love/focus frequency & overtones

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        const initialGain = 0.15 / (idx + 1);
        gain.gain.setValueAtTime(initialGain, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1.8);
      });
    } catch {
      // AudioContext policy fallback
    }
  }

  // Ambient focus soundscapes
  public startAmbient(type: 'rain' | 'binaural' | 'forest') {
    if (!this.soundEnabled) return;
    this.stopAmbient();

    try {
      const ctx = this.initCtx();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.1, ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.ambientGain = masterGain;

      if (type === 'binaural') {
        // Binaural beat: 432Hz Left, 438Hz Right (6Hz Theta wave for calm focus)
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        const panL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const panR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(432, ctx.currentTime);
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(438, ctx.currentTime);

        if (panL && panR) {
          panL.pan.setValueAtTime(-0.8, ctx.currentTime);
          panR.pan.setValueAtTime(0.8, ctx.currentTime);
          oscL.connect(panL);
          oscR.connect(panR);
          panL.connect(masterGain);
          panR.connect(masterGain);
        } else {
          oscL.connect(masterGain);
          oscR.connect(masterGain);
        }

        oscL.start();
        oscR.start();
        this.ambientSource = oscL; // Tracking
      } else if (type === 'rain' || type === 'forest') {
        // Procedural noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === 'rain') {
            // Pinkish filter
            b0 = 0.99 * b0 + white * 0.05;
            b1 = 0.95 * b1 + white * 0.1;
            output[i] = (b0 + b1) * 0.5;
          } else {
            // Forest breeze: deeper brown noise
            b0 = (b0 + (0.02 * white)) / 1.02;
            b1 = (b1 + (0.01 * white)) / 1.01;
            b2 = (b2 + (0.005 * white)) / 1.005;
            output[i] = (b0 + b1 + b2) * 2;
          }
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
        filter.frequency.setValueAtTime(type === 'rain' ? 800 : 450, ctx.currentTime);
        filter.Q.setValueAtTime(1.2, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
        this.ambientSource = whiteNoise;
      }
    } catch {
      // AudioContext error fallback
    }
  }

  public stopAmbient() {
    try {
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, this.ctx.currentTime);
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
      }
      setTimeout(() => {
        if (this.ambientSource) {
          try {
            (this.ambientSource as AudioScheduledSourceNode).stop();
          } catch {
            // ignore
          }
          this.ambientSource.disconnect();
          this.ambientSource = null;
        }
      }, 350);
    } catch {
      // ignore
    }
  }
}

export const sound = new SoundEngine();
