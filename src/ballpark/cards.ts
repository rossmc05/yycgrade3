// Collector cards: a player in one of six parallels, from Base up to a signed Autograph.

import { PLAYERS, type Player } from './players';

export type Parallel = 'base' | 'rare' | 'refractor' | 'relic' | 'diamond' | 'auto' | 'super' | 'milestone';

export interface ParallelDef {
  id: Parallel;
  name: string;
  /** Chance in 100 with no luck boost. */
  weight: number;
  /** Print run shown as a serial number, e.g. 23/99. */
  printRun?: number;
  /** Coins given when this card is pulled again. */
  dupeCoins: number;
  /** What makes it special, for the binder. */
  about: string;
}

export const PARALLELS: ParallelDef[] = [
  { id: 'base', name: 'Base', weight: 50, dupeCoins: 4, about: 'The everyday card. Every collection starts here.' },
  { id: 'rare', name: 'Rare', weight: 25, dupeCoins: 8, about: 'Gold foil border.' },
  { id: 'refractor', name: 'Refractor', weight: 13, printRun: 499, dupeCoins: 15, about: 'Rainbow shine that moves when you tilt it. Numbered to 499.' },
  { id: 'relic', name: 'Relic', weight: 7, printRun: 199, dupeCoins: 25, about: 'Has a piece of a game-worn jersey. Numbered to 199.' },
  { id: 'diamond', name: 'Diamond Refractor', weight: 4, printRun: 50, dupeCoins: 40, about: 'Sparkling diamond pattern. Only 50 made.' },
  { id: 'auto', name: 'Autograph', weight: 1, printRun: 25, dupeCoins: 75, about: 'Signed by the player. Only 25 made. The rarest pull!' },
];

/** The 1/1 Superfractor, only for the top 2025 rookies. Rarer than an Autograph, not as rare as Babe Ruth. */
export const SUPER: ParallelDef = { id: 'super', name: 'Superfractor', weight: 0, printRun: 1, dupeCoins: 150, about: 'Superfractor. Swirling rainbow gold, and only one was ever made.' };

/** Milestone cards are never pulled: each one unlocks when you reach a rank past MVP. */
export const MILESTONE: ParallelDef = { id: 'milestone', name: 'Special', weight: 0, dupeCoins: 0, about: 'Special card. Can only be earned, never pulled from a pack.' };

export const parallelOf = (id: Parallel) => (id === 'super' ? SUPER : id === 'milestone' ? MILESTONE : PARALLELS.find((p) => p.id === id)!);
export const RANK: Record<Parallel, number> = { base: 0, rare: 1, refractor: 2, relic: 3, diamond: 4, auto: 5, super: 6, milestone: 7 };

export interface Pull {
  player: Player;
  parallel: Parallel;
  serial?: number;
}

/** Chances for each parallel. Luck 0 to 3 moves chances from Base to the rarer cards. */
export function chances(luck: number): number[] {
  const shift = [0, 12, 22, 30][Math.max(0, Math.min(3, luck))];
  // Take `shift` from Base and share it out, rarer cards getting a bigger share of their size.
  const extra = [0, 0.35, 0.3, 0.17, 0.12, 0.06];
  return PARALLELS.map((p, i) => (i === 0 ? p.weight - shift : p.weight + shift * extra[i]));
}

/** The one-of-one chase card, and its chance per pull: 1 in 400, plus a little for each point of luck. */
export const CHASE = PLAYERS.find((p) => p.chase)!;
export const chaseChance = (luck: number) => 0.0025 + 0.0015 * Math.max(0, Math.min(3, luck));

/** The six 1/1 rookie Superfractors, and the chance a pull is one of them: 1 in 200, plus a little with luck. */
export const ROOKIES = PLAYERS.filter((p) => p.rookie);
export const superChance = (luck: number) => 0.005 + 0.002 * Math.max(0, Math.min(3, luck));

/** Cards that only ever exist as a single 1/1. */
export const isOneOfOne = (p: Player) => !!(p.chase || p.rookie);
export const oneOfOneParallel = (p: Player): Parallel => (p.chase ? 'auto' : 'super');

/**
 * A random card. `atLeast` turns anything below that parallel into it.
 * `owned` says which 1/1 cards are already found, so they are never pulled twice.
 */
export function rollCard(rng: () => number, luck = 0, atLeast: Parallel = 'base', owned: (p: Player) => boolean = () => false): Pull {
  const special = rng();
  if (special < chaseChance(luck) && !owned(CHASE)) return { player: CHASE, parallel: 'auto', serial: 1 };
  if (special >= chaseChance(luck) && special < chaseChance(luck) + superChance(luck)) {
    const left = ROOKIES.filter((p) => !owned(p));
    if (left.length) return { player: left[Math.floor(rng() * left.length)], parallel: 'super', serial: 1 };
  }
  const w = chances(luck);
  let r = rng() * w.reduce((a, b) => a + b, 0);
  let i = 0;
  for (; i < w.length - 1; i++) {
    if (r < w[i]) break;
    r -= w[i];
  }
  const parallel = PARALLELS[Math.max(i, RANK[atLeast])];
  // Legends turn up a little less often than today's stars.
  const pool = PLAYERS.flatMap((p) => (isOneOfOne(p) || p.milestone ? [] : p.legend ? [p] : [p, p]));
  const player = pool[Math.floor(rng() * pool.length)];
  const serial = parallel.printRun ? 1 + Math.floor(rng() * parallel.printRun) : undefined;
  return { player, parallel: parallel.id, serial };
}

/** Print run for a card: the chase card and the rookie Superfractors are 1/1s. */
export const printRunOf = (player: Player, parallel: Parallel) => (isOneOfOne(player) ? 1 : parallelOf(parallel).printRun);

export const cardKey = (playerId: string, parallel: Parallel) => `${playerId}:${parallel}`;
