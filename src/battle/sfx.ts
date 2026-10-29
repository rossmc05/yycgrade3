// Battle sound effects, synthesised with Web Audio so there are no files to load.

let ctx: AudioContext | null = null;
let enabled = true;

export function setSound(on: boolean) {
  enabled = on;
  if (!on) ctx?.suspend().catch(() => {});
  else ctx?.resume().catch(() => {});
}

export function ac(): AudioContext | null {
  if (!enabled) return null;
  if (!ctx) {
    try {
      const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      ctx = C ? new C() : null;
    } catch {
      ctx = null;
    }
  }
  if (ctx?.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.06, when = 0, slideTo?: number) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + when;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(dur: number, vol = 0.12, freq = 1200) {
  const a = ac();
  if (!a) return;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = freq;
  const g = a.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(a.destination);
  src.start();
}

export const sfx = {
  /** Call from a tap or key press so browsers allow sound. */
  unlock: () => ac(),
  whoosh: () => tone(300, 0.18, 'sine', 0.05, 0, 900),
  hit: () => { noise(0.15, 0.18, 900); tone(160, 0.12, 'square', 0.05); },
  crit: () => { noise(0.2, 0.22, 2000); tone(880, 0.1, 'square', 0.05); tone(1320, 0.14, 'square', 0.05, 0.08); },
  special: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'square', 0.05, i * 0.07)); noise(0.5, 0.2, 1500); },
  block: () => { tone(600, 0.08, 'triangle', 0.08); tone(400, 0.12, 'triangle', 0.06, 0.05); },
  growl: () => { tone(120, 0.4, 'sawtooth', 0.06, 0, 70); noise(0.3, 0.08, 400); },
  ouch: () => tone(400, 0.25, 'square', 0.04, 0, 150),
  coin: () => { tone(988, 0.08, 'square', 0.04); tone(1319, 0.2, 'square', 0.04, 0.08); },
  defeat: () => { tone(500, 0.5, 'sawtooth', 0.04, 0, 60); noise(0.4, 0.1, 600); },
  fanfare: () => { [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i === 5 ? 0.5 : 0.16, 'square', 0.05, i * 0.14)); },
};
