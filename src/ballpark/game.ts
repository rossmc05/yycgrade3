// A single game, simulated one plate appearance at a time. You are the home team:
// you pitch in the top of each inning and bat in the bottom.
// At bat, a right answer is a hit (harder swings hit farther) and a wrong one is an out.
// Pitching, a right answer gets the batter out (harder pitches more surely) and a wrong one gives up a hit.

import type { BallPerks } from './gear';

export type Swing = 'contact' | 'line' | 'power' | 'homer';
export type Pitch = 'fastball' | 'curve' | 'heater';

export const SWINGS: { id: Swing; name: string; hit: string; offset: number }[] = [
  { id: 'contact', name: 'Contact swing', hit: 'Single', offset: -1 },
  { id: 'line', name: 'Line drive', hit: 'Double', offset: 0 },
  { id: 'power', name: 'Power swing', hit: 'Triple', offset: 1 },
  { id: 'homer', name: 'Home run swing', hit: 'Home run', offset: 2 },
];

export const PITCHES: { id: Pitch; name: string; does: string; offset: number; outChance: number }[] = [
  { id: 'fastball', name: 'Fastball', does: 'Easier. Usually an out.', offset: -1, outChance: 0.8 },
  { id: 'curve', name: 'Curveball', does: 'Your level. Almost always an out.', offset: 0, outChance: 0.92 },
  { id: 'heater', name: 'Heater', does: 'Harder. Always a strikeout.', offset: 1, outChance: 1 },
];

/**
 * The level to ask for a swing or pitch: easier or harder than the child's level in the skill.
 * When the skill has no harder level left, the question gets a pitch clock instead.
 */
export function tierLevel(levels: number, current: number, offset: number): { level: number; clock?: number } {
  const top = levels - 1;
  const ideal = Math.max(1, current) + offset;
  const level = Math.max(0, Math.min(top, ideal));
  const over = ideal - top;
  return over > 0 ? { level, clock: [30, 20, 15][Math.min(2, over - 1)] } : { level };
}

export type Bases = [boolean, boolean, boolean];
export type Side = 'you' | 'them';
export type PlayKind = 'single' | 'double' | 'triple' | 'hr' | 'strikeout' | 'ground' | 'fly' | 'double-play' | 'sac-fly' | 'foul' | 'catch';

export interface Play {
  id: number;
  side: Side;
  kind: PlayKind;
  text: string;
  runs: number;
  /** Bases the batter reached on a hit. */
  reached: number;
  coins: number;
}

export interface Game {
  innings: number;
  inning: number;
  half: 'top' | 'bottom';
  outs: number;
  bases: Bases;
  you: number;
  them: number;
  /** Runs per inning, for the scoreboard. */
  line: { you: number[]; them: number[] };
  halfRuns: number;
  fouls: number;
  coins: number;
  plays: number;
  stats: { hits: number; hrs: number; ks: number; right: number; asked: number };
  over: boolean;
  result?: 'win' | 'loss' | 'tie';
  walkoff?: boolean;
  /** Set when the last half-inning ended by the five-run rule. */
  runRule?: boolean;
}

/** The most runs a team can score in one inning, except you in your last at-bat. */
export const RUN_RULE = 5;
export const EXTRA_INNINGS = 3;
export const HIT_COINS = [0, 2, 4, 6, 10];
export const RUN_COINS = 2;
export const OUT_COINS = 2;

export function newGame(innings: number, perks: BallPerks = {}): Game {
  return {
    innings, inning: 1, half: 'top', outs: 0, bases: [false, false, false], you: 0, them: 0,
    line: { you: [], them: [0] }, halfRuns: 0, fouls: perks.fouls ?? 0, coins: 0, plays: 0,
    stats: { hits: 0, hrs: 0, ks: 0, right: 0, asked: 0 }, over: false,
  };
}

/** Move the runners for a hit of `n` bases. On a single the runner on second scores; fast runners take an extra base. */
export function advance(bases: Bases, n: number, fast: boolean): { bases: Bases; runs: number } {
  const next: Bases = [false, false, false];
  let runs = 0;
  for (let b = 2; b >= 0; b--) {
    if (!bases[b]) continue;
    let to = b + 1 + n;
    if (n === 1 && b === 1) to += 1;
    if (fast && n <= 2 && b === 0) to += 1;
    while (to < 4 && next[to - 1]) to -= 1;
    if (to >= 4) runs++;
    else next[to - 1] = true;
  }
  if (n >= 4) runs++;
  else next[n - 1] = true;
  return { bases: next, runs };
}

const cap = (g: Game) => (g.half === 'bottom' && g.inning >= g.innings ? Infinity : RUN_RULE);
const pick = <T,>(rng: () => number, xs: T[]) => xs[Math.floor(rng() * xs.length)];

function score(g: Game, runs: number): number {
  const counted = Math.max(0, Math.min(runs, cap(g) - g.halfRuns));
  if (!counted) return 0;
  const side: Side = g.half === 'bottom' ? 'you' : 'them';
  const line = [...g.line[side]];
  line[g.inning - 1] = (line[g.inning - 1] ?? 0) + counted;
  g.line = { ...g.line, [side]: line };
  g[side] += counted;
  g.halfRuns += counted;
  return counted;
}

/** After a play: walk-offs, three outs, the run rule and the end of the game. */
function settle(g: Game) {
  g.runRule = false;
  if (g.half === 'bottom' && g.inning >= g.innings && g.you > g.them) {
    g.over = true;
    g.result = 'win';
    g.walkoff = true;
    return;
  }
  const ruled = g.halfRuns >= cap(g);
  if (g.outs < 3 && !ruled) return;
  g.runRule = ruled && g.outs < 3;
  g.outs = 0;
  g.bases = [false, false, false];
  g.halfRuns = 0;
  if (g.half === 'top') {
    if (g.inning >= g.innings && g.you > g.them) {
      g.over = true;
      g.result = 'win';
      return;
    }
    g.half = 'bottom';
    g.line = { ...g.line, you: [...g.line.you, 0] };
    return;
  }
  if (g.inning >= g.innings && g.you !== g.them) {
    g.over = true;
    g.result = g.you > g.them ? 'win' : 'loss';
    return;
  }
  if (g.inning >= g.innings + EXTRA_INNINGS) {
    g.over = true;
    g.result = 'tie';
    return;
  }
  g.inning += 1;
  g.half = 'top';
  g.line = { ...g.line, them: [...g.line.them, 0] };
}

const HIT_NAME: PlayKind[] = ['single', 'single', 'double', 'triple', 'hr'];

function hit(g: Game, n: number, fast: boolean, text: string, mine: boolean): Play {
  const a = advance(g.bases, n, fast);
  g.bases = a.bases;
  const runs = score(g, a.runs);
  const coins = mine ? HIT_COINS[n] + RUN_COINS * runs : 0;
  return { id: 0, side: mine ? 'you' : 'them', kind: HIT_NAME[n], text, runs, reached: n, coins };
}

function out(g: Game, rng: () => number, mine: boolean, strikeout: boolean): Play {
  const side: Side = mine ? 'you' : 'them';
  if (strikeout) {
    g.outs += 1;
    return { id: 0, side, kind: 'strikeout', text: mine ? 'Strike three!' : 'Strikeout!', runs: 0, reached: 0, coins: 0 };
  }
  const r = rng();
  if (g.bases[0] && g.outs < 2 && r < 0.15) {
    g.outs += 2;
    g.bases = [false, g.bases[1], g.bases[2]];
    return { id: 0, side, kind: 'double-play', text: 'Double play! Two outs.', runs: 0, reached: 0, coins: 0 };
  }
  if (g.bases[2] && g.outs < 2 && r < 0.4) {
    g.outs += 1;
    g.bases = [g.bases[0], g.bases[1], false];
    const runs = score(g, 1);
    return { id: 0, side, kind: 'sac-fly', text: 'Sacrifice fly! The runner tags up and scores.', runs, reached: 0, coins: 0 };
  }
  g.outs += 1;
  const kind = pick(rng, ['strikeout', 'ground', 'fly', 'ground', 'fly'] as const);
  const text = kind === 'strikeout' ? (mine ? 'Struck out swinging.' : 'Strikeout!')
    : kind === 'ground' ? pick(rng, ['Ground ball to short. Out at first.', 'Grounder to second. Out!', 'Chopper to third. Out at first.'])
    : pick(rng, ['Fly ball, caught in centre field.', 'Pop-up, caught by the catcher.', 'Line drive, caught in left field.']);
  return { id: 0, side, kind, text, runs: 0, reached: 0, coins: 0 };
}

function finish(g: Game, p: Play, correct: boolean): { game: Game; play: Play } {
  g.plays += 1;
  g.stats = { ...g.stats, asked: g.stats.asked + 1, right: g.stats.right + (correct ? 1 : 0) };
  g.coins += p.coins;
  settle(g);
  return { game: g, play: { ...p, id: g.plays } };
}

const clone = (g: Game): Game => ({ ...g, bases: [...g.bases] as Bases, line: { you: [...g.line.you], them: [...g.line.them] }, stats: { ...g.stats } });

/** Your turn at bat. */
export function bat(prev: Game, swing: Swing, correct: boolean, rng: () => number, perks: BallPerks = {}): { game: Game; play: Play } {
  const g = clone(prev);
  if (!correct && g.fouls > 0) {
    g.fouls -= 1;
    g.plays += 1;
    g.stats = { ...g.stats, asked: g.stats.asked + 1 };
    return { game: g, play: { id: g.plays, side: 'you', kind: 'foul', text: 'Foul ball! Your helmet gives you another pitch.', runs: 0, reached: 0, coins: 0 } };
  }
  if (!correct) return finish(g, out(g, rng, true, false), false);
  let n = SWINGS.findIndex((s) => s.id === swing) + 1;
  let stretched = false;
  if (n < 4 && perks.extraBase && rng() < perks.extraBase) {
    n += 1;
    stretched = true;
  }
  const fast = !!perks.speed && rng() < perks.speed;
  const text = n === 4
    ? stretched ? 'Inside-the-park home run! Your bat gave it extra zip!' : pick(rng, ['HOME RUN! That ball is gone!', 'HOME RUN! Way out of here!', 'Goodbye, baseball! HOME RUN!'])
    : `${['', 'Single', 'Double', 'Triple'][n]}!${stretched ? ' Your bat gave it extra zip for one more base.' : n === 1 ? ' A clean hit.' : n === 2 ? ' Into the gap!' : ' Off the wall!'}`;
  g.stats = { ...g.stats, hits: g.stats.hits + 1, hrs: g.stats.hrs + (n === 4 ? 1 : 0) };
  return finish(g, hit(g, n, fast, text, true), true);
}

/** Your turn on the mound. */
export function pitch(prev: Game, kind: Pitch, correct: boolean, rng: () => number, perks: BallPerks = {}): { game: Game; play: Play } {
  const g = clone(prev);
  const def = PITCHES.find((p) => p.id === kind)!;
  if (correct) {
    if (rng() < def.outChance) {
      const p = out(g, rng, false, kind === 'heater');
      if (p.kind === 'strikeout') g.stats = { ...g.stats, ks: g.stats.ks + 1 };
      return finish(g, { ...p, coins: OUT_COINS + (kind === 'heater' ? 1 : 0) }, true);
    }
    return finish(g, hit(g, 1, false, 'A bloop single just over the infield. Good pitch, lucky hit!', false), true);
  }
  if (perks.catchChance && rng() < perks.catchChance) {
    g.outs += 1;
    return finish(g, { id: 0, side: 'them', kind: 'catch', text: 'What a diving catch! Your glove saves the day.', runs: 0, reached: 0, coins: OUT_COINS }, false);
  }
  const r = rng() * 100;
  const n = r < 52 ? 1 : r < 77 ? 2 : r < 85 ? 3 : 4;
  const text = ['', 'They hit a single.', 'They hit a double into the gap.', 'They hit a triple off the wall.', 'They hit a home run!'][n];
  return finish(g, hit(g, n, false, text, false), false);
}

export const WIN_COINS = { win: 40, tie: 20, loss: 15 };

/** Coins for the final result, on top of the coins from plays. */
export function resultCoins(g: Game): number {
  if (!g.result) return 0;
  return WIN_COINS[g.result] + (g.walkoff ? 10 : 0) + (g.result === 'win' && g.them === 0 ? 10 : 0);
}

/** Card luck for a win: a blow-out or a shutout pulls better cards. No card for a loss or tie. */
export function winLuck(g: Game, perks: BallPerks = {}): number | null {
  if (g.result !== 'win') return null;
  const big = g.you - g.them >= 5 || g.them === 0;
  return Math.min(3, (big ? 1 : 0) + (perks.luck ?? 0));
}
