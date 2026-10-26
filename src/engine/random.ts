import type { Rng } from './types';

/** Small seeded generator (mulberry32) so tests can reproduce questions. */
export function seeded(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer in [min, max], inclusive. */
export const int = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));

export const pick = <T,>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng() * items.length)];

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Multiple-choice options: the answer plus unique distractors, shuffled. */
export function options(rng: Rng, answer: string, distractors: string[], count = 4): string[] {
  const unique = [...new Set(distractors.filter((d) => d !== answer))];
  return shuffle(rng, [answer, ...shuffle(rng, unique).slice(0, count - 1)]);
}

/** 12345 -> "12 345" (Canadian spacing for numbers of five or more digits). */
export function fmt(n: number): string {
  const s = String(n);
  return s.length >= 5 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : s;
}
