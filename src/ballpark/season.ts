// Season mode: 10 games against the league, then the top four play off for the championship.
// Your games are played for real. The other teams' games are simulated from their overall ratings.

import { OPPONENTS, type Team } from './teams';

export const SEASON_GAMES = 10;
export const PLAYOFF_TEAMS = 4;
export const CHAMPION_COINS = 100;

export interface TeamRec { w: number; l: number; t: number }
export type Stage = 'regular' | 'semi' | 'final' | 'champion' | 'out';

export interface Season {
  /** Season number, from 1. */
  n: number;
  stage: Stage;
  you: TeamRec;
  /** Records of the other teams, in OPPONENTS order. */
  others: TeamRec[];
  /** Your games so far, regular season and playoffs. */
  log: { opp: number; you: number; them: number; playoff?: boolean }[];
  /** Your seed when the regular season ends. */
  seed?: number;
  /** Your playoff opponent, as an OPPONENTS index. */
  opp?: number;
  /** Who won the other semifinal, once it's played. */
  otherFinalist?: number;
}

const rec = (): TeamRec => ({ w: 0, l: 0, t: 0 });

export const newSeason = (n = 1): Season => ({ n, stage: 'regular', you: rec(), others: OPPONENTS.map(rec), log: [] });

export const played = (s: Season) => s.log.filter((g) => !g.playoff).length;

const pct = (r: TeamRec) => (r.w + r.t / 2) / Math.max(1, r.w + r.l + r.t);

/** Who you play next, or nothing when the season is over. */
export function nextOpponent(s: Season): number | undefined {
  if (s.stage === 'regular') return (played(s) * 3 + s.n) % OPPONENTS.length;
  if (s.stage === 'semi' || s.stage === 'final') return s.opp;
}

/** The league table, best first. `you` marks your row. Ties go to the stronger team, then you. */
export function standings(s: Season, yourName: string): { name: string; team?: Team; index?: number; rec: TeamRec; you?: boolean }[] {
  const rows = [
    { name: yourName, rec: s.you, you: true, ovr: 1000 },
    ...OPPONENTS.map((team, index) => ({ name: team.name, team, index, rec: s.others[index], ovr: team.ovr })),
  ];
  return rows.sort((a, b) => pct(b.rec) - pct(a.rec) || b.rec.w - a.rec.w || b.ovr - a.ovr).map(({ ovr: _, ...r }) => r);
}

/** The chance team A beats team B, from their overall ratings. */
export const winChance = (a: number, b: number) => Math.max(0.15, Math.min(0.85, 0.5 + (a - b) / 40));

const add = (r: TeamRec, result: 'win' | 'loss' | 'tie'): TeamRec => ({ w: r.w + (result === 'win' ? 1 : 0), l: r.l + (result === 'loss' ? 1 : 0), t: r.t + (result === 'tie' ? 1 : 0) });
const flip = (result: 'win' | 'loss' | 'tie') => (result === 'win' ? 'loss' : result === 'loss' ? 'win' : 'tie');

/** Bank one of your games and move the season along. */
export function recordSeasonGame(s: Season, you: number, them: number, rng: () => number): Season {
  const opp = nextOpponent(s);
  if (opp === undefined) return s;
  const result = you > them ? 'win' : you < them ? 'loss' : 'tie';
  if (s.stage !== 'regular') {
    const log = [...s.log, { opp, you, them, playoff: true }];
    // A tied playoff game is played again.
    if (result === 'tie') return { ...s, log };
    if (result === 'loss') return { ...s, log, stage: 'out' };
    if (s.stage === 'final') return { ...s, log, stage: 'champion' };
    // You won the semifinal: the other semifinal is simulated.
    const top = standings(s, '').filter((r) => !r.you).slice(0, PLAYOFF_TEAMS - 1).map((r) => r.index!).filter((i) => i !== opp);
    const [a, b] = top;
    const winner = b === undefined || rng() < winChance(OPPONENTS[a].ovr, OPPONENTS[b].ovr) ? a : b;
    return { ...s, log, stage: 'final', opp: winner, otherFinalist: winner };
  }
  const others = s.others.map((r, i) => {
    if (i === opp) return add(r, flip(result));
    return add(r, rng() < winChance(OPPONENTS[i].ovr, 78) ? 'win' : 'loss');
  });
  const next: Season = { ...s, you: add(s.you, result), others, log: [...s.log, { opp, you, them }] };
  if (played(next) < SEASON_GAMES) return next;
  const table = standings(next, '');
  const seed = table.findIndex((r) => r.you) + 1;
  if (seed > PLAYOFF_TEAMS) return { ...next, stage: 'out', seed };
  // 1 plays 4, and 2 plays 3.
  return { ...next, stage: 'semi', seed, opp: table[PLAYOFF_TEAMS - seed].index };
}

export const stageName = (s: Season) =>
  s.stage === 'regular' ? `Game ${played(s) + 1} of ${SEASON_GAMES}` : s.stage === 'semi' ? 'Semifinal' : s.stage === 'final' ? 'Championship Final' : s.stage === 'champion' ? 'Champions!' : 'Season over';
