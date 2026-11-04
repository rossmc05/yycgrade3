// Your team: a batting order and an ace pitcher picked from the cards you own.
// Each card has an overall rating, and better versions of a card rate higher.
// When that player is up, the card gives a small boost. The answer still decides the at-bat.

import { RANK, type Parallel } from './cards';
import type { BallData } from './data';
import { playerById, PLAYERS, type Player } from './players';

export const LINEUP_SIZE = 8;

/** Overall points a version adds on top of the player's ratings. */
export const VERSION_BONUS: Record<Parallel, number> = { base: 0, rare: 2, refractor: 4, relic: 5, diamond: 7, auto: 9, super: 10, milestone: 10 };

export interface Squad {
  /** Player ids, in batting order after you. */
  lineup: string[];
  ace?: string;
}

export interface TeamCard {
  player: Player;
  parallel: Parallel;
  ovr: number;
  /** Chance of the card's boost, 0 to 1. */
  boost: number;
}

export const cardOvr = (p: Player, par: Parallel) => Math.min(99, Math.round(p.ratings.reduce((a, b) => a + b, 0) / 3) + VERSION_BONUS[par]);

/** 2% for a 65 overall, up to 16% for a 99. */
export const boostOf = (ovr: number) => Math.round(Math.max(2, Math.min(16, (ovr - 60) * 0.42))) / 100;

/** Milestone and Moment cards are for the binder, not the lineup. */
const playable = (p: Player | undefined): p is Player => !!p && !p.milestone;

/** The best version you own of a player, or nothing if you have none. */
export function bestCard(b: BallData, playerId: string): TeamCard | undefined {
  const p = playerById(playerId);
  if (!playable(p)) return;
  const pars = Object.keys(b.cards).filter((k) => k.startsWith(`${playerId}:`)).map((k) => k.slice(playerId.length + 1) as Parallel);
  if (!pars.length) return;
  const par = pars.sort((x, y) => RANK[y] - RANK[x])[0];
  const ovr = cardOvr(p, par);
  return { player: p, parallel: par, ovr, boost: boostOf(ovr) };
}

/** Every player you own for a role, best first. */
export function roster(b: BallData, role: Player['role']): TeamCard[] {
  return PLAYERS.filter((p) => p.role === role).map((p) => bestCard(b, p.id)).filter((c): c is TeamCard => !!c).sort((x, y) => y.ovr - x.ovr);
}

export function bestSquad(b: BallData): Squad {
  return { lineup: roster(b, 'hitter').slice(0, LINEUP_SIZE).map((c) => c.player.id), ace: roster(b, 'pitcher')[0]?.player.id };
}

/** The team you picked, or your best cards if you haven't picked one. Always uses your best version of each player. */
export function squadOf(b: BallData): { lineup: TeamCard[]; ace?: TeamCard } {
  const s = b.squad ?? bestSquad(b);
  const lineup = s.lineup.map((id) => bestCard(b, id)).filter((c): c is TeamCard => !!c && c.player.role === 'hitter').slice(0, LINEUP_SIZE);
  const ace = s.ace ? bestCard(b, s.ace) : undefined;
  return { lineup, ace: ace?.player.role === 'pitcher' ? ace : undefined };
}

/** Team overall: the eight hitters and the ace, with an empty spot counting as 50. */
export function teamOvr(b: BallData): number {
  const { lineup, ace } = squadOf(b);
  const all = [...lineup.map((c) => c.ovr), ...Array(LINEUP_SIZE - lineup.length).fill(50), ace?.ovr ?? 50];
  return Math.round(all.reduce((a, x) => a + x, 0) / all.length);
}
