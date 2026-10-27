import { describe, expect, it } from 'vitest';
import { DOWN_AFTER, MASTERY_DAYS, MASTERY_WINDOW, newSkillState, recordAnswer, status, UP_AFTER, UP_OF_FIVE } from '../src/engine/adaptive';
import { applyAnswer, freshQuestion, planMix, planSkill } from '../src/engine/progress';
import { seeded } from '../src/engine/random';
import { ALL_SKILLS } from '../src/subjects';
import { checkBadges, playerLevel, touchStreak } from '../src/engine/rewards';
import { newProfile } from '../src/engine/storage';
import type { Question } from '../src/engine/types';
import { MATH_SKILLS } from '../src/subjects/math/skills';

const skill = MATH_SKILLS.find((s) => s.id === 'math.multiply')!;
const q = (key: string): Question => ({ key, prompt: key, input: 'number', answer: '1', hint: '', explain: '' });
const DAY = 86400000;
const T0 = new Date(2026, 9, 1, 16).getTime();

describe('adaptive difficulty', () => {
  it(`moves up after ${UP_AFTER} right in a row`, () => {
    let s = newSkillState();
    for (let i = 0; i < UP_AFTER; i++) s = recordAnswer(skill, s, q(`a${i}`), true, T0).state;
    expect(s.level).toBe(1);
  });

  it(`moves up on ${UP_OF_FIVE} of the last 5, so one slip doesn't wipe progress`, () => {
    let s = newSkillState();
    for (const ok of [true, true, false, true]) s = recordAnswer(skill, s, q(`u${Math.random()}`), ok, T0).state;
    expect(s.level).toBe(0);
    s = recordAnswer(skill, s, q('u5'), true, T0).state;
    expect(s.level).toBe(1);
  });

  it('keeps level progress across sessions', () => {
    let p = newProfile('Test', '🦊');
    for (let i = 0; i < UP_AFTER - 1; i++) p = applyAnswer(p, skill, q(`s1-${i}`), true, true, 5, T0).profile;
    // A later session, after practising other things.
    p = applyAnswer(p, skill, q('s2'), true, true, 5, T0 + DAY).profile;
    expect(p.skills[skill.id].level).toBe(1);
  });

  it(`moves down after ${DOWN_AFTER} misses in the last 4 and remembers missed items`, () => {
    let s = { ...newSkillState(), level: 2 };
    s = recordAnswer(skill, s, q('x'), false, T0).state;
    s = recordAnswer(skill, s, q('y'), false, T0).state;
    expect(s.level).toBe(2);
    s = recordAnswer(skill, s, q('z'), false, T0).state;
    expect(s.level).toBe(1);
    expect(s.missed.map((m) => m.key)).toEqual(['x', 'y', 'z']);
    s = recordAnswer(skill, s, q('x'), true, T0).state;
    expect(s.missed.map((m) => m.key)).toEqual(['y', 'z']);
  });

  it('never goes below level 1 or above the top level', () => {
    let s = newSkillState();
    for (let i = 0; i < 6; i++) s = recordAnswer(skill, s, q(`m${i}`), false, T0).state;
    expect(s.level).toBe(0);
    for (let i = 0; i < 60; i++) s = recordAnswer(skill, s, q(`r${i}`), true, T0).state;
    expect(s.level).toBe(skill.levels.length - 1);
  });

  it(`needs ${MASTERY_DAYS} different days at the top level to master`, () => {
    let s = { ...newSkillState(), level: skill.levels.length - 1 };
    for (let i = 0; i < MASTERY_WINDOW * 2; i++) s = recordAnswer(skill, s, q(`t${i}`), true, T0).state;
    expect(status(s)).toBe('practising');
    for (let i = 0; i < 5; i++) s = recordAnswer(skill, s, q(`d2-${i}`), true, T0 + DAY).state;
    expect(status(s)).toBe('practising');
    const r = recordAnswer(skill, s, q('day-3'), true, T0 + 2 * DAY);
    expect(r.newlyMastered).toBe(true);
    expect(status(r.state)).toBe('mastered');
    expect(r.state.reviewAt).toBe(T0 + 3 * DAY);
  });

  it(`needs ${MASTERY_WINDOW} answers at the top level, not just a few good ones`, () => {
    let s = { ...newSkillState(), level: skill.levels.length - 1 };
    for (let d = 0; d < 3; d++) for (let i = 0; i < 4; i++) s = recordAnswer(skill, s, q(`w${d}-${i}`), true, T0 + d * DAY).state;
    expect(status(s)).toBe('practising');
  });
});

describe('rewards', () => {
  it('levels the player up on a growing curve', () => {
    expect(playerLevel(0).level).toBe(1);
    expect(playerLevel(100).level).toBe(2);
    expect(playerLevel(299).level).toBe(2);
    expect(playerLevel(300).level).toBe(3);
  });

  it('counts streaks across days and resets after a gap', () => {
    let p = newProfile('Test', '🦊');
    p = touchStreak(p, T0);
    p = touchStreak(p, T0 + DAY);
    p = touchStreak(p, T0 + DAY);
    expect(p.streak).toBe(2);
    p = touchStreak(p, T0 + 4 * DAY);
    expect(p.streak).toBe(1);
  });

  it('awards XP, coins and badges for answers', () => {
    let p = newProfile('Test', '🦊');
    p = applyAnswer(p, skill, q('a'), true, true, 5, T0).profile;
    p = applyAnswer(p, skill, q('b'), false, true, 5, T0).profile;
    expect(p.xp).toBe(14);
    expect(p.coins).toBe(7);
    expect(p.totalCorrect).toBe(1);
    const { won } = checkBadges(p, MATH_SKILLS, T0);
    expect(won.map((b) => b.id)).toContain('first-session');
  });

  it('brings missed items back in the next session', () => {
    let p = newProfile('Test', '🦊');
    p = applyAnswer(p, skill, q('tricky'), false, false, 5, T0).profile;
    const plan = planSkill(p, skill, 10);
    expect(plan).toHaveLength(10);
    expect(plan.filter((x) => x.retry?.key === 'tricky')).toHaveLength(1);
  });
});

describe('session planning', () => {
  it('focuses a mixed warm-up on a few skills, in pairs', () => {
    const p = newProfile('Test', '🦊');
    const plan = planMix(p, ALL_SKILLS, 10, seeded(3), T0);
    const ids = new Set(plan.map((x) => x.skill.id));
    expect(plan).toHaveLength(10);
    expect(ids.size).toBeLessThanOrEqual(4);
    expect(ids.size).toBeGreaterThanOrEqual(2);
    expect(plan[0].skill.id).toBe(plan[1].skill.id);
  });

  it('starts new skills from different subjects', () => {
    const p = newProfile('Test', '🦊');
    p.skills['math.place-value'] = { ...newSkillState(), history: [{ t: T0, correct: true, level: 0, key: 'k' }] };
    const plan = planMix(p, ALL_SKILLS, 10, seeded(3), T0 + DAY);
    expect(plan.map((x) => x.skill.id)).toContain('math.place-value');
    expect(plan.some((x) => x.skill.subject !== 'math')).toBe(true);
  });

  it('avoids questions seen in recent days', () => {
    const sk = ALL_SKILLS.find((s) => s.id === 'gram.similes')!;
    const state = newSkillState();
    const first = sk.generate(0, seeded(1), { spellingList: [] });
    state.history.push({ t: T0, correct: true, level: 0, key: first.key });
    for (let seed = 1; seed < 30; seed++) {
      expect(freshQuestion(sk, state, 0, seeded(seed), { spellingList: [] }, new Set()).key).not.toBe(first.key);
    }
  });
});

describe('first warm-up', () => {
  it('mixes subjects for a brand-new player', () => {
    const plan = planMix(newProfile('Test', '🦊'), ALL_SKILLS, 10, seeded(5), T0);
    expect(new Set(plan.map((x) => x.skill.subject)).size).toBeGreaterThanOrEqual(2);
  });
});
