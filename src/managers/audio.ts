/** Tiny synthesized SFX (no asset files). Browsers need a prior user gesture; every call is wrapped so it can never throw. */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambience: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

function ac(): AudioContext | null {
  try {
    if (!ctx) {
      const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new C(); master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch { return null; }
}
function noiseBuf(c: AudioContext, sec: number) {
  const b = c.createBuffer(1, Math.floor(c.sampleRate * sec), c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
function burst(freq: number, type: BiquadFilterType, sec: number, vol: number, q = 0.7) {
  const c = ac(); if (!c || !master) return;
  const s = c.createBufferSource(); s.buffer = noiseBuf(c, sec);
  const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = c.createGain(); g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + sec);
  s.connect(f); f.connect(g); g.connect(master); s.start();
}
function tone(freq: number, sec: number, vol: number) {
  const c = ac(); if (!c || !master) return;
  const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(freq, c.currentTime); o.frequency.exponentialRampToValueAtTime(freq * 0.4, c.currentTime + sec);
  const g = c.createGain(); g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + sec);
  o.connect(g); g.connect(master); o.start(); o.stop(c.currentTime + sec);
}
export const thunder = () => { burst(180, 'lowpass', 3.2, 1.0); tone(55, 2.5, 0.5); };
export const rumble = () => { tone(42, 2.8, 0.7); burst(120, 'lowpass', 2.6, 0.5); };
export const splash = () => burst(1400, 'bandpass', 0.6, 0.35);
export const crack = () => { burst(2500, 'highpass', 0.35, 0.6); tone(70, 0.7, 0.7); };
export const thump = () => { tone(90, 0.35, 0.6); burst(300, 'lowpass', 0.3, 0.4); };
export const hitSfx = () => burst(900, 'bandpass', 0.12, 0.25, 2);
export function startWaves() {
  const c = ac(); if (!c || !master || ambience) return;
  const src = c.createBufferSource(); src.buffer = noiseBuf(c, 4); src.loop = true;
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420;
  const gain = c.createGain(); gain.gain.value = 0.18;
  const lfo = c.createOscillator(); lfo.frequency.value = 0.12; const lg = c.createGain(); lg.gain.value = 0.1; lfo.connect(lg); lg.connect(gain.gain); lfo.start();
  src.connect(f); f.connect(gain); gain.connect(master); src.start(); ambience = { src, gain };
}
export function stopWaves() {
  if (!ambience || !ctx) return;
  const a = ambience; ambience = null;
  a.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2); setTimeout(() => { try { a.src.stop(); } catch { /* already stopped */ } }, 1400);
}
