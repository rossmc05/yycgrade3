import { describe, expect, it } from 'vitest';
import { newSkillState, recordAnswer } from '../src/engine/adaptive';
import { seeded } from '../src/engine/random';
import { newProfile } from '../src/engine/storage';
import { CHASE, cardKey, chances, chaseChance, PARALLELS, RANK, rollCard } from '../src/ballpark/cards';
import { addCard, ballLookOf, newBall, payout, rankOf, RANKS } from '../src/ballpark/data';
import { derbyCards, derbyHit, derbyLuck, derbyTotal, FENCE } from '../src/ballpark/derby';
import { advance, bat, newGame, pitch, RUN_RULE, tierLevel, winCards, winLuck, type Game } from '../src/ballpark/game';
import { BALL_GEAR, ballPerks } from '../src/ballpark/gear';
import { PLAYERS } from '../src/ballpark/players';
import { planSkills, recordBall } from '../src/ballpark/questions';
import { MATH_SKILLS } from '../src/subjects/math/skills';

const always = () => 0;

describe('ballpark game', () => {
  it('moves runners on hits', () => {
    expect(advance([false, false, false], 1, false)).toEqual({ bases: [true, false, false], runs: 0 });
    // A single scores the runner from second.
    expect(advance([false, true, false], 1, false)).toEqual({ bases: [true, false, false], runs: 1 });
    expect(advance([true, false, false], 2, false)).toEqual({ bases: [false, true, true], runs: 0 });
    expect(advance([true, true, true], 4, false)).toEqual({ bases: [false, false, false], runs: 4 });
    // Fast runners go first to third on a single.
    expect(advance([true, false, false], 1, true)).toEqual({ bases: [true, false, true], runs: 0 });
  });

  it('gives harder swings bigger hits, and a wrong answer is an out', () => {
    const g = { ...newGame(3), half: 'bottom' as const };
    expect(bat(g, 'contact', true, () => 0.9).play.kind).toBe('single');
    expect(bat(g, 'line', true, () => 0.9).play.kind).toBe('double');
    expect(bat(g, 'power', true, () => 0.9).play.kind).toBe('triple');
    const hr = bat(g, 'homer', true, () => 0.9);
    expect(hr.play.kind).toBe('hr');
    expect(hr.game.you).toBe(1);
    const out = bat(g, 'homer', false, () => 0.9);
    expect(out.game.outs).toBe(1);
    expect(out.game.you).toBe(0);
  });

  it('pitching: a heater answered right is always a strikeout; a wrong answer gives up a hit', () => {
    const g = newGame(3);
    const k = pitch(g, 'heater', true, () => 0.99);
    expect(k.play.kind).toBe('strikeout');
    expect(k.game.outs).toBe(1);
    const hit = pitch(g, 'curve', false, () => 0.3);
    expect(['single', 'double', 'triple', 'hr']).toContain(hit.play.kind);
    expect(hit.game.outs).toBe(0);
  });

  it('switches sides after three outs and ends with the home team ahead', () => {
    let g: Game = newGame(1);
    for (let i = 0; i < 3; i++) g = pitch(g, 'heater', true, always).game;
    expect(g.half).toBe('bottom');
    g = bat(g, 'homer', true, () => 0.9).game;
    expect(g.over).toBe(true);
    expect(g.result).toBe('win');
    expect(g.walkoff).toBe(true);
  });

  it('skips the last bottom half when the home team already leads', () => {
    let g: Game = { ...newGame(1), you: 2, line: { you: [], them: [0] } };
    for (let i = 0; i < 3; i++) g = pitch(g, 'heater', true, always).game;
    expect(g.over).toBe(true);
    expect(g.result).toBe('win');
    expect(g.walkoff).toBeFalsy();
  });

  it('stops a half-inning at the run limit, and always finishes', () => {
    let g: Game = newGame(3);
    for (let i = 0; i < 20 && g.half === 'top'; i++) g = pitch(g, 'fastball', false, () => 0.99).game;
    expect(g.them).toBe(RUN_RULE);
    expect(g.half).toBe('bottom');
    // A whole game of wrong answers still ends.
    let all: Game = newGame(3);
    const rng = seeded(3);
    for (let i = 0; i < 500 && !all.over; i++) all = all.half === 'top' ? pitch(all, 'curve', false, rng).game : bat(all, 'line', false, rng).game;
    expect(all.over).toBe(true);
    expect(all.result).toBe('loss');
  });

  it('uses foul balls from the helmet before outs', () => {
    const g = { ...newGame(3, ballPerks({ helmet: 'helmet' })), half: 'bottom' as const };
    const f = bat(g, 'line', false, always);
    expect(f.play.kind).toBe('foul');
    expect(f.game.outs).toBe(0);
    expect(bat(f.game, 'line', false, () => 0.9).game.outs).toBe(1);
  });

  it('picks easier and harder levels, with a pitch clock when there is no harder level', () => {
    expect(tierLevel(5, 2, -1)).toEqual({ level: 1 });
    expect(tierLevel(5, 2, 2)).toEqual({ level: 4 });
    expect(tierLevel(4, 3, 1)).toEqual({ level: 3, clock: 30 });
    expect(tierLevel(1, 0, 2).level).toBe(0);
    expect(tierLevel(1, 0, 2).clock).toBeGreaterThan(0);
  });

  it('gives a card only for a win', () => {
    expect(winLuck({ ...newGame(3), over: true, result: 'loss' })).toBeNull();
    expect(winLuck({ ...newGame(3), over: true, result: 'win', you: 6, them: 0 })).toBe(1);
    expect(winCards({ ...newGame(3), over: true, result: 'loss' })).toBe(0);
    expect(winCards({ ...newGame(3), over: true, result: 'win', you: 4, them: 2 })).toBe(2);
    expect(winCards({ ...newGame(3), over: true, result: 'win', you: 1, them: 0 })).toBe(3);
  });
});

describe('ballpark derby', () => {
  it('hits harder questions farther', () => {
    const mid = () => 0.5;
    expect(derbyHit('homer', true, mid).feet).toBeGreaterThan(derbyHit('power', true, mid).feet);
    expect(derbyHit('power', true, mid).feet).toBeGreaterThan(derbyHit('contact', true, mid).feet);
    expect(derbyHit('homer', false, mid)).toEqual({ feet: 0, hr: false });
    expect(derbyHit('homer', true, mid).hr).toBe(true);
    expect(derbyHit('contact', true, always, { derbyFeet: 45 }).feet).toBe(285);
    const t = derbyTotal([{ feet: 400, hr: true }, { feet: 300, hr: false }, { feet: FENCE, hr: true }]);
    expect(t).toEqual({ hrs: 2, feet: 400 + FENCE, longest: 400 });
    expect(derbyLuck({ hrs: 10, feet: 4000, longest: 450 })).toBe(3);
    expect([0, 4, 7].map((hrs) => derbyCards({ hrs, feet: 0, longest: 0 }))).toEqual([1, 2, 3]);
  });
});

describe('ballpark cards and economy', () => {
  it('has unique players and six parallels from Base to Autograph', () => {
    expect(new Set(PLAYERS.map((p) => p.id)).size).toBe(PLAYERS.length);
    expect(PLAYERS.length).toBeGreaterThanOrEqual(74);
    // About ten legends, all from 1995 on, plus the one chase card.
    expect(PLAYERS.filter((p) => p.legend && !p.chase).length).toBe(10);
    expect(PLAYERS.filter((p) => p.chase).map((p) => p.name)).toEqual(['Babe Ruth']);
    expect(PARALLELS.map((p) => p.id)).toEqual(['base', 'rare', 'refractor', 'relic', 'diamond', 'auto']);
    expect(PARALLELS.reduce((n, p) => n + p.weight, 0)).toBe(100);
  });

  it('pulls rarer cards with more luck, and respects a minimum', () => {
    expect(chances(3)[0]).toBeLessThan(chances(0)[0]);
    const rng = seeded(9);
    const rare = (luck: number) => Array.from({ length: 3000 }, () => rollCard(rng, luck)).filter((c) => c.parallel !== 'base').length;
    expect(rare(2)).toBeGreaterThan(rare(0));
    for (let i = 0; i < 200; i++) expect(RANK[rollCard(rng, 0, 'refractor').parallel]).toBeGreaterThanOrEqual(RANK.refractor);
    const numbered = rollCard(() => 0.999, 0, 'base', false);
    expect(numbered.parallel).toBe('auto');
    expect(numbered.serial).toBeLessThanOrEqual(25);
  });

  it('has a 1/1 Babe Ruth autograph chase card that is rare and never pulled twice', () => {
    expect(rollCard(() => 0, 0)).toEqual({ player: CHASE, parallel: 'auto', serial: 1 });
    expect(rollCard(() => 0, 0, 'base', false).player.chase).toBeFalsy();
    expect(chaseChance(3)).toBeGreaterThan(chaseChance(0));
    expect(chaseChance(3)).toBeLessThan(0.01);
    const rng = seeded(5);
    for (let i = 0; i < 2000; i++) {
      const c = rollCard(rng, 1);
      if (c.player.chase) expect(c.parallel).toBe('auto');
    }
    const owned = addCard(newBall(), { player: CHASE, parallel: 'auto', serial: 1 }, 1).ball;
    for (let i = 0; i < 50; i++) expect(payout(owned, 0, 0, 3, 0, () => 0, i).payout.pulls[0].player.chase).toBeFalsy();
  });

  it('trades in repeat cards for coins', () => {
    const pull = { player: PLAYERS[0], parallel: 'refractor' as const, serial: 5 };
    const once = addCard(newBall(), pull, 1);
    expect(once.pulled.isNew).toBe(true);
    const twice = addCard(once.ball, pull, 2);
    expect(twice.pulled.isNew).toBe(false);
    expect(twice.ball.coins).toBe(15);
    expect(twice.ball.cards[cardKey(PLAYERS[0].id, 'refractor')].count).toBe(2);
  });

  it('banks coins with the cap bonus and gives a bonus card on promotion', () => {
    const b = { ...newBall(), xp: RANKS[1].xp - 5 };
    const out = payout(b, 10, 100, null, 0.25, seeded(1), 1);
    expect(out.payout.coins).toBe(125);
    expect(out.payout.rankUp).toBe(RANKS[1].name);
    expect(out.payout.pulls.length).toBe(1);
    expect(RANK[out.payout.pulls[0].parallel]).toBeGreaterThanOrEqual(RANK.refractor);
    expect(rankOf(out.ball.xp).index).toBe(1);
    expect(payout(newBall(), 0, 0, 0, 0, seeded(3), 1, 3).payout.pulls.length).toBe(3);
    // No second bonus for the same rank.
    expect(payout(out.ball, 1, 0, null, 0, seeded(2), 2).payout.pulls.length).toBe(0);
  });

  it('has gear with a free starting bat', () => {
    expect(new Set(BALL_GEAR.map((g) => g.id)).size).toBe(BALL_GEAR.length);
    expect(BALL_GEAR.find((g) => g.id === 'bat-wood')?.cost).toBe(0);
    expect(ballPerks({ bat: 'bat-gold', cap: 'cap-lucky' })).toMatchObject({ extraBase: 0.4, luck: 1 });
  });
});

describe('ballpark questions use the shared learning engine', () => {
  it('records answers in the skill without touching Grade 3 Quest coins or XP', () => {
    const p = { ...newProfile('Sam', '🦊'), xp: 50, coins: 7 };
    const skill = MATH_SKILLS[0];
    const q = skill.generate(0, seeded(1), { spellingList: [] });
    const after = recordBall(p, skill, q, true, 5, 0, Date.now());
    expect(after.skills[skill.id].history.length).toBe(1);
    expect(after.totalCorrect).toBe(1);
    expect(after.xp).toBe(50);
    expect(after.coins).toBe(7);
  });

  it('does not move the level for an easy question right or a hard one wrong', () => {
    const skill = MATH_SKILLS.find((s) => s.levels.length >= 3)!;
    const q = skill.generate(0, seeded(2), { spellingList: [] });
    let s = { ...newSkillState(), level: 1 };
    for (let i = 0; i < 6; i++) s = recordAnswer(skill, s, q, true, Date.now(), 0).state;
    expect(s.level).toBe(1);
    for (let i = 0; i < 6; i++) s = recordAnswer(skill, s, q, false, Date.now(), 2).state;
    expect(s.level).toBe(1);
    // Harder questions answered right do count toward moving up.
    for (let i = 0; i < 4; i++) s = recordAnswer(skill, s, q, true, Date.now(), 2).state;
    expect(s.level).toBe(2);
  });

  it('plans a mixed game across the chosen subjects', () => {
    const p = newProfile('Sam', '🦊');
    const plan = planSkills(p, ['math', 'science'], 20, seeded(4), Date.now());
    expect(plan.length).toBe(20);
    expect(new Set(plan.map((s) => s.subject))).toEqual(new Set(['math', 'science']));
  });
});

describe('ballpark look', () => {
  it('keeps the Quest face and hair with a baseball uniform', () => {
    const p = { ...newProfile('Sam', '🦊'), look: { ...ballLookOf(newProfile('x', 'y')), hair: 'hair-spiky', top: 'top-hoodie', hat: 'hat-crown', pet: 'pet-dog' } };
    const l = ballLookOf(p);
    expect(l.hair).toBe('hair-spiky');
    expect(l.top).toBe('top-baseball');
    expect(l.hat).toBe('hat-cap');
    expect(l.pet).toBe('pet-none');
    expect(ballLookOf({ ...p, ball: { ...newBall(), look: { ...newBall().look, hat: 'hat-batting' } } }).hat).toBe('hat-batting');
  });
});
