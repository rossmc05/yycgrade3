// Home Run Derby: ten swings. Harder questions hit the ball farther; anything past the fence is a home run.

import type { BallPerks } from './gear';
import type { Swing } from './game';

export const DERBY_SWINGS = 10;
export const FENCE = 330;
const RANGE: Record<Swing, [number, number]> = { contact: [240, 345], line: [305, 395], power: [355, 440], homer: [410, 495] };

export interface DerbyHit {
  feet: number;
  hr: boolean;
}

export function derbyHit(swing: Swing, correct: boolean, rng: () => number, perks: BallPerks = {}): DerbyHit {
  if (!correct) return { feet: 0, hr: false };
  const [lo, hi] = RANGE[swing];
  const feet = Math.round(lo + rng() * (hi - lo) + (perks.derbyFeet ?? 0));
  return { feet, hr: feet >= FENCE };
}

export interface DerbyTotal {
  hrs: number;
  /** Total feet of the home runs: the derby score. */
  feet: number;
  longest: number;
}

export function derbyTotal(hits: DerbyHit[]): DerbyTotal {
  const hrs = hits.filter((h) => h.hr);
  return { hrs: hrs.length, feet: hrs.reduce((n, h) => n + h.feet, 0), longest: Math.max(0, ...hrs.map((h) => h.feet)) };
}

export const derbyCoins = (t: DerbyTotal) => 10 + 3 * t.hrs;

/** The collector card always comes; more home runs make a rarer one likelier. */
/** Cards for a derby: 1, plus 1 at 4 home runs and 1 more at 7. */
export const derbyCards = (t: DerbyTotal) => 1 + (t.hrs >= 4 ? 1 : 0) + (t.hrs >= 7 ? 1 : 0);

export function derbyLuck(t: DerbyTotal, perks: BallPerks = {}): number {
  const base = t.hrs >= DERBY_SWINGS ? 3 : t.hrs >= 7 ? 2 : t.hrs >= 4 ? 1 : 0;
  return Math.min(3, base + (perks.luck ?? 0));
}
