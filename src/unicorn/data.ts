// Unicorn Meadow's part of a profile: its own points and XP (like the ballpark's coins and XP),
// the shop items bought, and each unicorn's outfit. Answers go through the shared learning
// engine, so levels, mastery, reviews and the parent dashboard work the same way.

import type { Profile } from '../engine/types';
import type { Slot } from './shop';
import { unlocked } from './unicorns';

export type Outfit = Partial<Record<Slot, string>>;

export interface MeadowData {
  xp: number;
  points: number;
  /** Shop items bought. */
  owned: string[];
  /** What each unicorn is wearing, by unicorn id. */
  outfits: Record<string, Outfit>;
  /** Decorations showing in the stable. */
  decor: string[];
  /** The unicorn she rides. */
  rider: string;
  rides: number;
  /** Most right answers in a row, ever. */
  bestRun: number;
  /** Moments earned, such as ten right in a row. */
  moments: string[];
}

export const newMeadow = (): MeadowData => ({ xp: 0, points: 0, owned: [], outfits: {}, decor: [], rider: 'starlight', rides: 0, bestRun: 0, moments: [] });

export const meadowOf = (p: Profile): MeadowData => ({ ...newMeadow(), ...p.meadow });

/** Points and XP for one answer. A right answer after a try still earns something: no penalty. */
export const XP_RIGHT = 10;
export const XP_RETRY = 5;
export const POINTS_RIGHT = 5;
export const POINTS_RETRY = 2;
/** Bonus at the end of every ride. */
export const RIDE_BONUS = 20;
export const RIDE_LENGTH = 10;
/** Star Catch: a shorter bonus round, with a smaller bonus. */
export const STAR_LENGTH = 5;
export const STAR_BONUS = 10;

/** Moments: special rewards for big plays, like the ballpark's Moment cards. Each gives an item. */
export const MOMENTS: { id: string; name: string; how: string; item: string; e: string }[] = [
  { id: 'firstRide', name: 'First ride', how: 'Finish your first ride', item: 'crown-daisy', e: '🌼' },
  { id: 'run5', name: 'Five in a row', how: 'Get 5 right in a row', item: 'saddle-hearts', e: '💖' },
  { id: 'run10', name: 'Ten in a row', how: 'Get 10 right in a row', item: 'mane-rainbow', e: '🌈' },
  { id: 'perfect', name: 'Perfect ride', how: 'Get every question right on the first try', item: 'horn-gold', e: '🏆' },
  { id: 'rides25', name: '25 rides', how: 'Go on 25 rides', item: 'decor-castle', e: '🏰' },
];

export interface RideResult {
  right: number;
  firstTry: number;
  asked: number;
  bestRun: number;
}

export interface Payout {
  xp: number;
  points: number;
  /** Unicorns that arrived with this payout. */
  arrived: string[];
  /** Moments earned, with their free item. */
  moments: string[];
}

/** Bank a ride or a Star Catch: XP, points, any new unicorns and moments. */
export function bank(m: MeadowData, xp: number, points: number, result: RideResult, bonus: number, ride: boolean): { meadow: MeadowData; payout: Payout } {
  const before = unlocked(m.xp).map((u) => u.id);
  const rides = m.rides + (ride ? 1 : 0);
  let next: MeadowData = { ...m, xp: m.xp + xp, points: m.points + points + bonus, rides, bestRun: Math.max(m.bestRun, result.bestRun) };
  const arrived = unlocked(next.xp).map((u) => u.id).filter((id) => !before.includes(id));
  const earned = MOMENTS.filter((mo) => !m.moments.includes(mo.id) && (
    (mo.id === 'firstRide' && rides >= 1) ||
    (mo.id === 'run5' && result.bestRun >= 5) ||
    (mo.id === 'run10' && result.bestRun >= 10) ||
    (mo.id === 'perfect' && ride && result.asked >= RIDE_LENGTH && result.firstTry === result.asked) ||
    (mo.id === 'rides25' && rides >= 25)
  ));
  next = { ...next, moments: [...next.moments, ...earned.map((e) => e.id)], owned: [...new Set([...next.owned, ...earned.map((e) => e.item)])] };
  return { meadow: next, payout: { xp, points: points + bonus, arrived, moments: earned.map((e) => e.id) } };
}

/** Buy an item. Returns nothing if she can't afford it or already has it. */
export function buy(m: MeadowData, id: string, cost: number): MeadowData | undefined {
  if (m.owned.includes(id) || m.points < cost) return;
  return { ...m, points: m.points - cost, owned: [...m.owned, id] };
}

/** Put an item on a unicorn, or take it off if it's already on. */
export function wear(m: MeadowData, unicorn: string, slot: Slot, id: string | undefined): MeadowData {
  const cur = m.outfits[unicorn] ?? {};
  const on = cur[slot] === id ? undefined : id;
  return { ...m, outfits: { ...m.outfits, [unicorn]: { ...cur, [slot]: on } } };
}

export function toggleDecor(m: MeadowData, id: string): MeadowData {
  return { ...m, decor: m.decor.includes(id) ? m.decor.filter((d) => d !== id) : [...m.decor, id] };
}
