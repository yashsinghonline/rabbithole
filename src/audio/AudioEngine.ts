/*
 * Procedural ambience via Web Audio API.
 * Layers: wind/static (filtered brown noise), electrical hum (low oscillators),
 * whispers (band-passed noise with slow LFO), heartbeat (deep levels).
 * Intensity scales with depth.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseGain: GainNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private humGain: GainNode | null = null;
  private humOsc: OscillatorNode | null = null;
  private whisperGain: GainNode | null = null;
  private depthFactor = 0;
  started = false;
  muted = false;

  start() {
    if (this.started) return;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(ctx.destination);

      // ---- brown noise (wind / static) ----
      const len = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.2;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      this.noiseFilter = ctx.createBiquadFilter();
      this.noiseFilter.type = "lowpass";
      this.noiseFilter.frequency.value = 420;
      this.noiseGain = ctx.createGain();
      this.noiseGain.gain.value = 0.16;
      noise.connect(this.noiseFilter).connect(this.noiseGain).connect(this.master);
      noise.start();

      // ---- electrical hum ----
      this.humOsc = ctx.createOscillator();
      this.humOsc.type = "sine";
      this.humOsc.frequency.value = 55;
      const hum2 = ctx.createOscillator();
      hum2.type = "triangle";
      hum2.frequency.value = 110.4;
      this.humGain = ctx.createGain();
      this.humGain.gain.value = 0.028;
      const hum2Gain = ctx.createGain();
      hum2Gain.gain.value = 0.008;
      this.humOsc.connect(this.humGain).connect(this.master);
      hum2.connect(hum2Gain).connect(this.master);
      this.humOsc.start();
      hum2.start();

      // ---- whispers (deep) ----
      const wSrc = ctx.createBufferSource();
      wSrc.buffer = buffer;
      wSrc.loop = true;
      wSrc.playbackRate.value = 0.5;
      const wFilter = ctx.createBiquadFilter();
      wFilter.type = "bandpass";
      wFilter.frequency.value = 1400;
      wFilter.Q.value = 6;
      this.whisperGain = ctx.createGain();
      this.whisperGain.gain.value = 0;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.13;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.5;
      lfo.connect(lfoGain).connect(wSrc.playbackRate);
      wSrc.connect(wFilter).connect(this.whisperGain).connect(this.master);
      wSrc.start();
      lfo.start();

      // ---- heartbeat scheduler ----
      window.setInterval(() => this.heartbeat(), 1400);

      this.started = true;
    } catch {
      /* audio unsupported — descend in silence */
    }
  }

  private heartbeat() {
    if (!this.ctx || !this.master || this.muted) return;
    if (this.depthFactor < 0.32) return;
    const v = Math.min(0.5, (this.depthFactor - 0.3) * 0.9);
    const thump = (t: number, vol: number) => {
      const ctx = this.ctx!;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(52, ctx.currentTime + t);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + t + 0.14);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.22);
      osc.connect(g).connect(this.master!);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.3);
    };
    thump(0, v);
    thump(0.28, v * 0.7);
  }

  /** short burst of static — used by glitch events */
  glitchBurst(duration = 0.18) {
    if (!this.ctx || !this.master || this.muted) return;
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.value = 0.12;
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    src.connect(hp).connect(g).connect(this.master);
    src.start();
  }

  /** quick low boom — hole opening, impacts */
  boom() {
    if (!this.ctx || !this.master || this.muted) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(90, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(24, ctx.currentTime + 0.8);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.4, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
    osc.connect(g).connect(this.master);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  }

  setDepth(depth: number) {
    if (!this.ctx || !this.started) return;
    const f = Math.min(1, depth / 3000);
    this.depthFactor = f;
    const t = this.ctx.currentTime;
    if (this.noiseGain) this.noiseGain.gain.setTargetAtTime(0.14 + f * 0.2, t, 0.4);
    if (this.noiseFilter) this.noiseFilter.frequency.setTargetAtTime(420 - f * 300, t, 0.5);
    if (this.humGain) this.humGain.gain.setTargetAtTime(0.028 + f * 0.05, t, 0.4);
    if (this.humOsc) this.humOsc.frequency.setTargetAtTime(55 - f * 18, t, 0.6);
    if (this.whisperGain) this.whisperGain.gain.setTargetAtTime(f > 0.2 ? (f - 0.2) * 0.22 : 0, t, 0.8);
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.55, this.ctx.currentTime, 0.1);
    }
  }

  /** velocity 0..1 — quiet wind whoosh while moving */
  setVelocity(v: number) {
    if (!this.ctx || !this.noiseGain) return;
    // reuse noise gain modulation subtly
    const extra = Math.min(0.15, Math.abs(v) * 0.03);
    this.noiseGain.gain.setTargetAtTime(0.14 + this.depthFactor * 0.2 + extra, this.ctx.currentTime, 0.15);
  }
}

export const audio = new AudioEngine();
