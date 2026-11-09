// The weekly spelling challenge: spell every word on this week's list perfectly (3 or 5 times),
// before the end of test day, to claim a 3-card pack with that week's Card of the Week.

import { dayKey } from '../engine/adaptive';
import type { Profile } from '../engine/types';
import { cardKey, oneOfOneParallel, rollCard } from './cards';
import { addCard, type BallData, type Pulled } from './data';
import { weeklyPlayer } from './players';

/** Perfect rounds a new week's challenge needs, unless the challenge says otherwise. */
export const PERFECT_NEEDED = 5;

/** How a week's Card of the Week looks. */
export type WeeklyDesign = 'starlight' | 'bee';
export const DESIGNS: Record<WeeklyDesign, { name: string; stamp: string }> = {
  starlight: { name: 'Starlight', stamp: 'Card of the Week' },
  bee: { name: 'Golden Bee', stamp: 'Spelling Bee' },
};

export interface WeeklyChallenge {
  /** Test day, YYYY-MM-DD. The challenge is open until the end of that day. */
  date: string;
  words: string[];
  /** A sentence for each word, read aloud with it. */
  sentences?: Record<string, string>;
  /** Perfect rounds needed. Defaults to PERFECT_NEEDED. */
  perfect?: number;
  /** The Card of the Week's design. Defaults to the newest design. */
  design?: WeeklyDesign;
}

export const neededOf = (c: WeeklyChallenge) => c.perfect ?? PERFECT_NEEDED;

/** The design of the Card of the Week for a test date. */
export const designOf = (date: string): WeeklyDesign => CHALLENGES.find((c) => c.date === date)?.design ?? 'bee';

export interface WeeklyProgress {
  perfect: number;
  claimed?: boolean;
}

/** Lists sent in by a grown-up, newest last. A list typed in the Parent screen with a test date is used when it's newer. */
export const CHALLENGES: WeeklyChallenge[] = [
  {
    date: '2026-11-09',
    perfect: 3,
    design: 'starlight',
    words: ['get', 'light', 'people', 'little', 'pick', 'thank', 'live', 'play', 'went', 'where', 'who', 'much', 'were', 'put', 'must'],
    sentences: {
      get: 'I want to get a hit today.',
      light: 'Turn on the light so we can see.',
      people: 'Lots of people came to the game.',
      little: 'My little brother plays T-ball.',
      pick: 'Pick a bat that feels just right.',
      thank: 'Say thank you to the coach.',
      live: 'We live close to the ballpark.',
      play: "Let's play catch after school.",
      went: 'We went to the game on Saturday.',
      where: 'Where is my glove?',
      who: 'Who hit the home run?',
      much: 'How much is a hot dog?',
      were: 'We were happy when our team won.',
      put: 'Put your helmet on before you bat.',
      must: 'You must run fast to steal a base.',
    },
  },
];

const clean = (words: string[]) => [...new Set(words.map((w) => w.trim().toLowerCase()).filter((w) => /^[a-z' -]+$/.test(w)))];

/** This week's challenge: the newest of the built-in lists and the one typed in the Parent screen. */
export function challengeOf(p: Profile): WeeklyChallenge | undefined {
  const typed = p.spellingTest && p.spellingList?.length ? { date: p.spellingTest, words: clean(p.spellingList) } : undefined;
  const all = [...CHALLENGES, ...(typed?.words.length ? [typed] : [])].sort((a, b) => a.date.localeCompare(b.date));
  const c = all.at(-1);
  if (!c) return;
  // A typed list for the same day as a built-in one keeps the built-in sentences where the words match.
  const built = CHALLENGES.find((x) => x.date === c.date);
  return built && c !== built ? { ...c, sentences: built.sentences, perfect: built.perfect, design: built.design } : c;
}

export const isOpen = (c: WeeklyChallenge, now: number) => dayKey(now) <= c.date;

export const progressOf = (b: BallData, c: WeeklyChallenge): WeeklyProgress => b.weekly?.[c.date] ?? { perfect: 0 };

export const canClaim = (b: BallData, c: WeeklyChallenge, now: number) => {
  const pr = progressOf(b, c);
  return isOpen(c, now) && !pr.claimed && pr.perfect >= neededOf(c);
};

/** Count one perfect round. */
export function addPerfect(b: BallData, c: WeeklyChallenge): BallData {
  const pr = progressOf(b, c);
  return { ...b, weekly: { ...b.weekly, [c.date]: { ...pr, perfect: pr.perfect + 1 } } };
}

/** "Mon Nov 9" for a YYYY-MM-DD date. */
export function dayLabel(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
}

/** The prize: the Card of the Week, an Autograph or rarer, and a Refractor or better. */
export function claimWeekly(b: BallData, c: WeeklyChallenge, rng: () => number, now: number): { ball: BallData; pulls: Pulled[] } {
  if (!canClaim(b, c, now)) return { ball: b, pulls: [] };
  let ball = b;
  const pulls: Pulled[] = [];
  const add = (r: ReturnType<typeof addCard>) => { ball = r.ball; pulls.push(r.pulled); };
  add(addCard(ball, { player: weeklyPlayer(c.date)!, parallel: 'weekly', serial: 1 + Math.floor(rng() * 25) }, now));
  const owned = (id: string, par: Parameters<typeof cardKey>[1]) => !!ball.cards[cardKey(id, par)];
  add(addCard(ball, rollCard(rng, 3, 'auto', (p) => owned(p.id, oneOfOneParallel(p))), now));
  add(addCard(ball, rollCard(rng, 2, 'refractor', (p) => owned(p.id, oneOfOneParallel(p))), now));
  ball = { ...ball, weekly: { ...ball.weekly, [c.date]: { ...progressOf(ball, c), claimed: true } } };
  return { ball, pulls };
}
