import { describe, expect, it } from 'vitest';
import { seeded } from '../src/engine/random';
import { newProfile } from '../src/engine/storage';
import { isPaused, onSkills, setPaused } from '../src/engine/topics';
import { planSkills } from '../src/ballpark/questions';
import { MATH_SKILLS } from '../src/subjects/math/skills';

describe('topics not taught yet', () => {
  it('keeps paused skills out of the mix, but never leaves it empty', () => {
    let p = newProfile('Sam', '🦊');
    p = setPaused(p, MATH_SKILLS[0].id, true);
    expect(onSkills(p, MATH_SKILLS).map((s) => s.id)).not.toContain(MATH_SKILLS[0].id);
    for (const s of MATH_SKILLS) p = setPaused(p, s.id, true);
    expect(onSkills(p, MATH_SKILLS)).toHaveLength(MATH_SKILLS.length);
  });

  it('switches a topic back on', () => {
    let p = setPaused(newProfile('Sam', '🦊'), MATH_SKILLS[1].id, true);
    expect(isPaused(p, MATH_SKILLS[1].id)).toBe(true);
    p = setPaused(p, MATH_SKILLS[1].id, false);
    expect(isPaused(p, MATH_SKILLS[1].id)).toBe(false);
    expect(p.paused).toEqual([]);
  });

  it('plans ballpark questions without paused topics', () => {
    let p = newProfile('Sam', '🦊');
    const off = MATH_SKILLS.slice(0, 3).map((s) => s.id);
    for (const id of off) p = setPaused(p, id, true);
    const plan = planSkills(p, ['math'], 30, seeded(2), Date.now());
    expect(plan.some((s) => off.includes(s.id))).toBe(false);
  });
});
