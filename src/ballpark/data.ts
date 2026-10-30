// The ballpark's part of a player's profile: its own coins, XP, gear, cards and records.
// Answers still go through the shared learning engine, so practice counts everywhere.

import type { Profile } from '../engine/types';
import { cardKey, parallelOf, rollCard, type Parallel, type Pull } from './cards';
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
}

export const newBall = (): BallData => ({
  xp: 0,
  coins: 0,
  gear: ['bat-wood'],
  gearOn: { bat: 'bat-wood' },
  cards: {},
  record: { w: 0, l: 0, t: 0 },
  derby: { plays: 0, bestFeet: 0, bestHrs: 0, longest: 0 },
  rank: 0,
});

export const ballOf = (p: Profile): BallData => ({ ...newBall(), ...p.ball });

export const RANKS = [
  { name: 'Rookie', xp: 0, e: '🧢' },
  { name: 'Prospect', xp: 300, e: '⭐' },
  { name: 'Starter', xp: 800, e: '🌟' },
  { name: 'All-Star', xp: 1600, e: '🏅' },
  { name: 'MVP', xp: 3000, e: '🏆' },
  { name: 'Hall of Famer', xp: 5000, e: '👑' },
];

export function rankOf(xp: number): { index: number; into: number; need: number } {
  let i = 0;
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1].xp) i++;
  const next = RANKS[i + 1];
  return { index: i, into: xp - RANKS[i].xp, need: next ? next.xp - RANKS[i].xp : 0 };
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
  /** Cards pulled: the win or derby card, then any rank-up bonus card. */
  pulls: Pulled[];
  rankUp?: string;
}

/** Bank a finished game or derby: XP, coins (with the cap bonus), cards and a rank-up bonus card. */
export function payout(b: BallData, xp: number, coins: number, luck: number | null, coinBonus: number, rng: () => number, now: number): { ball: BallData; payout: Payout } {
  const gained = Math.round(coins * (1 + coinBonus));
  let ball: BallData = { ...b, xp: b.xp + xp, coins: b.coins + gained };
  const pulls: Pulled[] = [];
  const give = (luckNow: number, atLeast?: Parallel) => {
    const r = addCard(ball, rollCard(rng, luckNow, atLeast), now);
    ball = r.ball;
    pulls.push(r.pulled);
  };
  if (luck !== null) give(luck);
  const rank = rankOf(ball.xp).index;
  let rankUp: string | undefined;
  if (rank > ball.rank) {
    rankUp = RANKS[rank].name;
    ball = { ...ball, rank };
    give(Math.min(3, rank), 'refractor');
  }
  return { ball, payout: { xp, coins: gained, pulls, rankUp } };
}
