// The ballpark's part of a player's profile: its own coins, XP, gear, cards and records.
// Answers still go through the shared learning engine, so practice counts everywhere.

import { lookOf, type Look } from '../avatar/catalog';
import type { Profile } from '../engine/types';
import { playerById, PLAYERS } from './players';
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
  /** Games won in a row. */
  winStreak?: number;
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

/** Special cards you can't pull: Milestones for ranks past MVP, and Moments for big plays. */
export type SpecialStyle = 'rookieauto' | 'ruby' | 'crew' | 'cut' | 'logoman' | 'gold' | 'ice' | 'fire' | 'moon' | 'captain';
export type MomentId = 'walkoff' | 'perfectDerby' | 'moonshot' | 'shutout' | 'cycle' | 'hotStreak' | 'tenStraight' | 'masterSet';
export interface Special {
  player: string;
  style: SpecialStyle;
  title: string;
  about: string;
  /** How to earn it, shown on the locked slot. */
  how: string;
  rank?: string;
  moment?: MomentId;
  serial?: number;
  caption?: string;
  /** Players shown together on a multi-player card. */
  crew?: { name: string; colors: [string, string] }[];
}

export const MILESTONES: Special[] = [
  { rank: 'Hall of Famer', how: 'Reach Hall of Famer', player: 'ohtani-rc', style: 'rookieauto', title: 'Rookie Auto', about: 'A signed rookie card from his first season in the big leagues.', serial: 1 },
  { rank: 'Legend', how: 'Reach Legend', player: 'bautista', style: 'ruby', title: 'Bat Flip Ruby Refractor', about: 'A Ruby Refractor of the famous 2015 bat flip.', serial: 1, caption: 'Bat Flip · 2015' },
  { rank: 'Retired Jersey', how: 'Reach Retired Jersey', player: 'trio', style: 'crew', title: 'Triple Patch Auto', about: 'A triple patch autograph: three jersey patches and three signatures on one card.', serial: 1,
    crew: [{ name: 'Ohtani', colors: ['#005a9c', '#ef3e42'] }, { name: 'Murakami', colors: ['#27251f', '#c4ced4'] }, { name: 'Freeman', colors: ['#005a9c', '#ef3e42'] }] },
  { rank: 'All-Time Great', how: 'Reach All-Time Great', player: 'griffey', style: 'cut', title: 'Cut Signature', about: 'A Cut Signature card: a real signature cut out and set into the card.' },
  { rank: 'GOAT', how: 'Reach GOAT', player: 'ohtani', style: 'logoman', title: 'Logoman 1/1', about: 'A Logoman card: the logo patch from a game-worn jersey. The rarest card a collector can own.', serial: 1 },
];

export const MOMENT_CARDS: Special[] = [
  { moment: 'walkoff', how: 'Win a game with a walk-off', player: 'freeman-ws', style: 'gold', title: 'Walk-Off Grand Slam', caption: 'World Series · 2024', about: 'Earned by winning a game with a walk-off.', serial: 1 },
  { moment: 'perfectDerby', how: 'Hit 10 home runs in one Derby', player: 'judge-hrd', style: 'gold', title: 'HR Derby Gold Refractor', caption: 'Home Run Derby', about: 'Earned with a perfect Home Run Derby: 10 swings, 10 home runs.', serial: 1 },
  { moment: 'moonshot', how: 'Hit a 500 ft home run in the Derby', player: 'ohtani-moon', style: 'moon', title: 'Moonshot', caption: '500 ft', about: 'Earned by hitting a home run 500 feet or more.' },
  { moment: 'shutout', how: 'Win a game without giving up a run', player: 'skenes-ace', style: 'ice', title: 'Ace', caption: 'Shutout', about: 'Earned by winning a game without giving up a single run.' },
  { moment: 'cycle', how: 'Hit for the cycle: a single, double, triple and home run in one game', player: 'ichiro-hits', style: 'gold', title: 'Hit Machine', caption: 'Hit for the Cycle', about: 'Earned by hitting for the cycle: a single, double, triple and home run in one game.' },
  { moment: 'hotStreak', how: 'Win 5 games in a row', player: 'vlad-hot', style: 'fire', title: 'Hot Streak Fire Refractor', caption: '5 Wins in a Row', about: 'Earned by winning 5 games in a row.' },
  { moment: 'tenStraight', how: 'Get 10 answers right in a row in one game or derby', player: 'jeter-cap', style: 'captain', title: 'The Captain', caption: '10 in a Row', about: 'Earned by getting 10 questions right in a row.' },
  { moment: 'masterSet', how: "Collect every player in Today's Stars", player: 'master', style: 'crew', title: 'Master Set Gold Dual', about: "Earned by collecting at least one card of every player in Today's Stars.", serial: 1,
    crew: [{ name: 'Griffey', colors: ['#0c2c56', '#005c5c'] }, { name: 'Judge', colors: ['#0c2340', '#c4ced3'] }] },
];

export const SPECIALS = [...MILESTONES, ...MOMENT_CARDS];
export const milestoneOf = (playerId: string) => SPECIALS.find((m) => m.player === playerId);

/** What happened in the game or derby that just ended, for Moment cards. */
export interface Moments {
  walkoff?: boolean;
  shutout?: boolean;
  cycle?: boolean;
  perfectDerby?: boolean;
  longest?: number;
  winStreak?: number;
  answerRun?: number;
}

/** The players in the Today's Stars binder section. */
export const TODAYS_STARS = PLAYERS.filter((p) => !p.legend && !p.rookie && !p.chase && !p.milestone);

function momentMet(id: MomentId, m: Moments, cards: BallData['cards']): boolean {
  switch (id) {
    case 'walkoff': return !!m.walkoff;
    case 'perfectDerby': return !!m.perfectDerby;
    case 'moonshot': return (m.longest ?? 0) >= 500;
    case 'shutout': return !!m.shutout;
    case 'cycle': return !!m.cycle;
    case 'hotStreak': return (m.winStreak ?? 0) >= 5;
    case 'tenStraight': return (m.answerRun ?? 0) >= 10;
    case 'masterSet': return TODAYS_STARS.every((p) => Object.keys(cards).some((k) => k.startsWith(`${p.id}:`)));
  }
}

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
export function payout(b: BallData, xp: number, coins: number, luck: number | null, coinBonus: number, rng: () => number, now: number, count = 1, moments: Moments = {}): { ball: BallData; payout: Payout } {
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
  // Milestone cards for every rank reached (including ones reached before these cards existed), and Moment cards.
  for (const m of SPECIALS) {
    const player = playerById(m.player);
    const earned = m.rank ? rank >= RANKS.findIndex((r) => r.name === m.rank) : momentMet(m.moment!, moments, ball.cards);
    if (player && earned && !ball.cards[cardKey(m.player, 'milestone')]) {
      const r = addCard(ball, { player, parallel: 'milestone', serial: m.serial }, now);
      ball = r.ball;
      pulls.push(r.pulled);
    }
  }
  return { ball, payout: { xp, coins: gained, pulls, rankUp } };
}
