import { describe, expect, it } from 'vitest';
import { DOWN_AFTER, MASTERY_WINDOW, newSkillState, recordAnswer, status, UP_AFTER } from '../src/engine/adaptive';
import { applyAnswer, planSkill } from '../src/engine/progress';
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

  it(`moves down after ${DOWN_AFTER} misses and remembers missed items`, () => {
    let s = { ...newSkillState(), level: 2 };
    s = recordAnswer(skill, s, q('x'), false, T0).state;
    expect(s.level).toBe(2);
    s = recordAnswer(skill, s, q('y'), false, T0).state;
    expect(s.level).toBe(1);
    expect(s.missed.map((m) => m.key)).toEqual(['x', 'y']);
    s = recordAnswer(skill, s, q('x'), true, T0).state;
    expect(s.missed.map((m) => m.key)).toEqual(['y']);
  });

  it('never goes below level 1 or above the top level', () => {
    let s = newSkillState();
    for (let i = 0; i < 6; i++) s = recordAnswer(skill, s, q(`m${i}`), false, T0).state;
    expect(s.level).toBe(0);
    for (let i = 0; i < 60; i++) s = recordAnswer(skill, s, q(`r${i}`), true, T0).state;
    expect(s.level).toBe(skill.levels.length - 1);
  });

  it('needs two different days at the top level to master', () => {
    let s = { ...newSkillState(), level: skill.levels.length - 1 };
    for (let i = 0; i < MASTERY_WINDOW * 2; i++) s = recordAnswer(skill, s, q(`t${i}`), true, T0).state;
    expect(status(s)).toBe('practising');
    const r = recordAnswer(skill, s, q('next-day'), true, T0 + DAY);
    expect(r.newlyMastered).toBe(true);
    expect(status(r.state)).toBe('mastered');
    expect(r.state.reviewAt).toBe(T0 + 2 * DAY);
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
