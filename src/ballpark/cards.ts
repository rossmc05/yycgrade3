// Collector cards: a player in one of six parallels, from Base up to a signed Autograph.

import { PLAYERS, type Player } from './players';

export type Parallel = 'base' | 'rare' | 'refractor' | 'relic' | 'diamond' | 'auto';

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

export const parallelOf = (id: Parallel) => PARALLELS.find((p) => p.id === id)!;
export const RANK: Record<Parallel, number> = { base: 0, rare: 1, refractor: 2, relic: 3, diamond: 4, auto: 5 };

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

/** A random card. `atLeast` turns anything below that parallel into it. Pass `chase: false` once the chase card is owned. */
export function rollCard(rng: () => number, luck = 0, atLeast: Parallel = 'base', chase = true): Pull {
  if (chase && rng() < chaseChance(luck)) return { player: CHASE, parallel: 'auto', serial: 1 };
  const w = chances(luck);
  let r = rng() * w.reduce((a, b) => a + b, 0);
  let i = 0;
  for (; i < w.length - 1; i++) {
    if (r < w[i]) break;
    r -= w[i];
  }
  const parallel = PARALLELS[Math.max(i, RANK[atLeast])];
  // Legends turn up a little less often than today's stars.
  const pool = PLAYERS.flatMap((p) => (p.chase ? [] : p.legend ? [p] : [p, p]));
  const player = pool[Math.floor(rng() * pool.length)];
  const serial = parallel.printRun ? 1 + Math.floor(rng() * parallel.printRun) : undefined;
  return { player, parallel: parallel.id, serial };
}

/** Print run for a card: the chase card is a 1/1. */
export const printRunOf = (player: Player, parallel: Parallel) => (player.chase ? 1 : parallelOf(parallel).printRun);

export const cardKey = (playerId: string, parallel: Parallel) => `${playerId}:${parallel}`;
