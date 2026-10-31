// The ballpark's part of a player's profile: its own coins, XP, gear, cards and records.
// Answers still go through the shared learning engine, so practice counts everywhere.

import { lookOf, type Look } from '../avatar/catalog';
import type { Profile } from '../engine/types';
import { cardKey, oneOfOneParallel, parallelOf, rollCard, type Parallel, type Pull } from './cards';
import type { BallSlot } from './gear';

export interface OwnedCard {
  count: number;
  /** Serial number of the first one pulled, e.g. 23 for 23/99. */
  serial?: number;
  at: number;
}

export interface BallData {
  xp: number;
  coins: number;
  gear: string[];
  gearOn: Partial<Record<BallSlot, string>>;
  cards: Record<string, OwnedCard>;
  record: { w: number; l: number; t: number };
  derby: { plays: number; bestFeet: number; bestHrs: number; longest: number };
  /** Rank reached, so a rank-up bonus card is given only once. */
  rank: number;
  /** The ballpark look: uniform, number, headwear, face and cleats. Face, hair and skin come from Grade 3 Quest. */
  look: BallLook;
  /** Locker Room items bought. */
  outfits: string[];
}

export type BallLook = Pick<Look, 'top' | 'topColor' | 'hat' | 'face' | 'shoes' | 'number'>;

export const DEFAULT_BALL_LOOK: BallLook = { top: 'top-baseball', topColor: 'bc-royal', hat: 'hat-cap', face: 'face-none', shoes: 'shoes-cleats', number: 9 };

export const newBall = (): BallData => ({
  xp: 0,
  coins: 0,
  gear: ['bat-wood'],
  gearOn: { bat: 'bat-wood' },
  cards: {},
  record: { w: 0, l: 0, t: 0 },
  derby: { plays: 0, bestFeet: 0, bestHrs: 0, longest: 0 },
  rank: 0,
  look: DEFAULT_BALL_LOOK,
  outfits: [],
});

export const ballOf = (p: Profile): BallData => ({ ...newBall(), ...p.ball });

/** The player as they look at the ballpark: their own face and hair, in their baseball uniform. */
export function ballLookOf(p: Profile): Look {
  const quest = lookOf(p);
  return { ...quest, ...DEFAULT_BALL_LOOK, number: quest.number, ...p.ball?.look, pet: 'pet-none', bg: 'bg-sky' };
}

export const RANKS = [
  { name: 'Rookie', xp: 0, e: '🧢' },
  { name: 'Prospect', xp: 300, e: '⭐' },
  { name: 'Starter', xp: 800, e: '🌟' },
  { name: 'All-Star', xp: 1600, e: '🏅' },
  { name: 'MVP', xp: 3000, e: '🏆' },
  { name: 'Hall of Famer', xp: 5000, e: '👑' },
  { name: 'Legend', xp: 7500, e: '🔥' },
  { name: 'Retired Jersey', xp: 10500, e: '👕' },
  { name: 'All-Time Great', xp: 14000, e: '💎' },
  { name: 'GOAT', xp: 18000, e: '🐐' },
];

/** XP between each GOAT star after the last named rank. Ranks never run out. */
export const GOAT_STEP = 5000;

/** Any rank by number: the named ranks, then GOAT ★2, GOAT ★3 and so on. */
export function rankAt(index: number): { name: string; xp: number; e: string } {
  const last = RANKS.length - 1;
  if (index <= last) return RANKS[index];
  const stars = index - last + 1;
  return { name: `GOAT ★${stars}`, xp: RANKS[last].xp + (index - last) * GOAT_STEP, e: '🐐' };
}

export function rankOf(xp: number): { index: number; into: number; need: number } {
  let i = 0;
  while (xp >= rankAt(i + 1).xp) i++;
  return { index: i, into: xp - rankAt(i).xp, need: rankAt(i + 1).xp - rankAt(i).xp };
}

export interface Pulled extends Pull {
  isNew: boolean;
  coins: number;
}

/** Add a card to the binder. A repeat is traded in for coins. */
export function addCard(b: BallData, pull: Pull, now: number): { ball: BallData; pulled: Pulled } {
  const key = cardKey(pull.player.id, pull.parallel);
  const had = b.cards[key];
  const coins = had ? parallelOf(pull.parallel).dupeCoins : 0;
  const cards = { ...b.cards, [key]: had ? { ...had, count: had.count + 1 } : { count: 1, serial: pull.serial, at: now } };
  return { ball: { ...b, cards, coins: b.coins + coins }, pulled: { ...pull, isNew: !had, coins } };
}

export interface Payout {
  xp: number;
  coins: number;
  /** Cards pulled: the win or derby cards, then any rank-up bonus card. */
  pulls: Pulled[];
  rankUp?: string;
}

/** Bank a finished game or derby: XP, coins (with the cap bonus), cards and a rank-up bonus card. */
export function payout(b: BallData, xp: number, coins: number, luck: number | null, coinBonus: number, rng: () => number, now: number, count = 1): { ball: BallData; payout: Payout } {
  const gained = Math.round(coins * (1 + coinBonus));
  let ball: BallData = { ...b, xp: b.xp + xp, coins: b.coins + gained };
  const pulls: Pulled[] = [];
  const give = (luckNow: number, atLeast?: Parallel) => {
    const r = addCard(ball, rollCard(rng, luckNow, atLeast, (p) => !!ball.cards[cardKey(p.id, oneOfOneParallel(p))]), now);
    ball = r.ball;
    pulls.push(r.pulled);
  };
  if (luck !== null) for (let i = 0; i < count; i++) give(luck);
  const rank = rankOf(ball.xp).index;
  let rankUp: string | undefined;
  if (rank > ball.rank) {
    rankUp = rankAt(rank).name;
    ball = { ...ball, rank };
    give(Math.min(3, rank), 'refractor');
  }
  return { ball, payout: { xp, coins: gained, pulls, rankUp } };
}
