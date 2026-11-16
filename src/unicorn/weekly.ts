// The Challenge of the Week, like the ballpark's weekly challenge: one goal a week, Monday to
// Sunday, and a special prize she can only win there (not sold in the Sparkle Shop).
// Every goal is something she can see filling up, and nothing is ever lost: a finished
// challenge from an earlier week can still be claimed.

import { dayKey } from '../engine/adaptive';
import type { MeadowData } from './data';
import { itemById } from './shop';

export type WeeklyKind = 'right' | 'rides' | 'stars' | 'run5' | 'sparkles' | 'days';

export interface WeeklyGoal {
  kind: WeeklyKind;
  /** How many to do. Kept small: 5 to 30, so a few rides in the week are enough. */
  need: number;
  /** Read aloud, and shown for grown-ups. */
  say: string;
  /** The picture each step of the progress row shows. */
  e: string;
}

/** The goals, in turn, one each week. */
export const GOALS: WeeklyGoal[] = [
  { kind: 'right', need: 30, say: 'Get 30 questions right on the first try.', e: '⭐' },
  { kind: 'rides', need: 5, say: 'Go on 5 rides.', e: '🌈' },
  { kind: 'sparkles', need: 8, say: 'Get 8 Sparkle questions right.', e: '✨' },
  { kind: 'days', need: 4, say: 'Go on a ride on 4 different days.', e: '☀️' },
  { kind: 'run5', need: 3, say: 'Get 5 right in a row, 3 times.', e: '💖' },
  { kind: 'stars', need: 4, say: 'Play Star Catch 4 times.', e: '🌟' },
];

/** The special prizes, in turn. Each is only won here. */
export const PRIZE_IDS = ['wings-aurora', 'crown-snowflake', 'mane-aurora', 'horn-crystal', 'coat-moonbeam', 'saddle-snow', 'decor-snowglobe', 'wings-moon'];

/** Stars instead, once every prize is in her stable. */
export const BONUS_POINTS = 200;

/** Week 0 starts on this Monday. */
const FIRST_MONDAY = new Date(2026, 10, 16).getTime();
const WEEK = 7 * 24 * 60 * 60 * 1000;

/** The Monday (YYYY-MM-DD) that starts the week holding `now`. */
export function weekOf(now: number): string {
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return dayKey(d.getTime());
}

const weekIndex = (week: string) => {
  const [y, m, d] = week.split('-').map(Number);
  return Math.round((new Date(y, m - 1, d, 12).getTime() - FIRST_MONDAY - 12 * 3600 * 1000) / WEEK);
};
const mod = (n: number, k: number) => ((n % k) + k) % k;

export interface WeeklyState {
  count: number;
  /** Days with a ride, for the 'days' goal. */
  days?: string[];
  claimed?: boolean;
  /** What was won: an item id, or 'points'. */
  prize?: string;
}

export interface ThisWeek {
  week: string;
  goal: WeeklyGoal;
  /** The prize item if one is still to win, or undefined for bonus stars. */
  prize?: string;
  state: WeeklyState;
  done: boolean;
}

/** The prize for a week: that week's item, or the next one she doesn't have yet. */
export function prizeFor(m: MeadowData, week: string): string | undefined {
  const i = weekIndex(week);
  for (let k = 0; k < PRIZE_IDS.length; k++) {
    const id = PRIZE_IDS[mod(i + k, PRIZE_IDS.length)];
    if (!m.owned.includes(id)) return id;
  }
}

export function weekly(m: MeadowData, now: number, week = weekOf(now)): ThisWeek {
  const goal = GOALS[mod(weekIndex(week), GOALS.length)];
  const state = m.weekly?.[week] ?? { count: 0 };
  return { week, goal, prize: state.prize && state.prize !== 'points' ? state.prize : prizeFor(m, week), state, done: state.count >= goal.need };
}

/** What a ride or Star Catch adds to the week. */
export interface Played {
  mode: 'ride' | 'stars';
  /** Finished, not left early. */
  finished: boolean;
  firstTry: number;
  sparkles: number;
  /** Times she got 5 in a row during it. */
  runs5: number;
}

export function addPlay(m: MeadowData, p: Played, now: number): MeadowData {
  const w = weekly(m, now);
  if (w.state.claimed) return m;
  const today = dayKey(now);
  const days = w.state.days ?? [];
  const step = {
    right: p.firstTry,
    rides: p.mode === 'ride' && p.finished ? 1 : 0,
    stars: p.mode === 'stars' && p.finished ? 1 : 0,
    run5: p.runs5,
    sparkles: p.sparkles,
    days: p.mode === 'ride' && p.finished && !days.includes(today) ? 1 : 0,
  }[w.goal.kind];
  const state: WeeklyState = {
    ...w.state,
    count: Math.min(w.goal.need, w.state.count + step),
    days: w.goal.kind === 'days' && step ? [...days, today] : w.state.days,
  };
  return { ...m, weekly: { ...m.weekly, [w.week]: state } };
}

/** Finished challenges not yet claimed, this week or earlier, oldest first. */
export function unclaimed(m: MeadowData, now: number): ThisWeek[] {
  const weeks = Object.keys(m.weekly ?? {}).filter((wk) => wk <= weekOf(now)).sort();
  return weeks.map((wk) => weekly(m, now, wk)).filter((w) => w.done && !w.state.claimed);
}

/** Claim every finished challenge: its prize item, or bonus stars once she has them all. */
export function claimWeekly(m: MeadowData, now: number): { meadow: MeadowData; won: string[] } {
  let next = m;
  const won: string[] = [];
  for (const w of unclaimed(m, now)) {
    const prize = prizeFor(next, w.week);
    const state: WeeklyState = { ...w.state, claimed: true, prize: prize ?? 'points' };
    next = prize
      ? { ...next, owned: [...next.owned, prize], weekly: { ...next.weekly, [w.week]: state } }
      : { ...next, points: next.points + BONUS_POINTS, weekly: { ...next.weekly, [w.week]: state } };
    won.push(prize ?? 'points');
  }
  return { meadow: next, won };
}

/** "Sunday" for the last day of a week, for grown-ups. */
export const prizeName = (id?: string) => (id ? itemById(id)?.name ?? id : `${BONUS_POINTS} stars`);
