import { describe, expect, it } from 'vitest';
import { seeded } from '../src/engine/random';
import { newProfile } from '../src/engine/storage';
import { flagNotLearned, isPaused, onSkills, setPaused } from '../src/engine/topics';
import { planSkills, skillAt } from '../src/ballpark/questions';
import { MATH_SKILLS } from '../src/subjects/math/skills';

describe('topics not taught yet', () => {
  it('keeps paused skills out of the mix, but never leaves it empty', () => {
    let p = newProfile('Sam', '🦊');
    p = setPaused(p, MATH_SKILLS[0].id, true);
    expect(onSkills(p, MATH_SKILLS).map((s) => s.id)).not.toContain(MATH_SKILLS[0].id);
    for (const s of MATH_SKILLS) p = setPaused(p, s.id, true);
    expect(onSkills(p, MATH_SKILLS)).toHaveLength(MATH_SKILLS.length);
  });

  it('flags a skipped topic and clears the flag when switched back on', () => {
    let p = flagNotLearned(newProfile('Sam', '🦊'), MATH_SKILLS[1].id);
    expect(isPaused(p, MATH_SKILLS[1].id)).toBe(true);
    expect(p.flagged).toEqual([MATH_SKILLS[1].id]);
    p = flagNotLearned(p, MATH_SKILLS[1].id);
    expect(p.flagged).toEqual([MATH_SKILLS[1].id]);
    p = setPaused(p, MATH_SKILLS[1].id, false);
    expect(isPaused(p, MATH_SKILLS[1].id)).toBe(false);
    expect(p.flagged).toEqual([]);
  });

  it('plans ballpark questions without paused topics', () => {
    let p = newProfile('Sam', '🦊');
    const off = MATH_SKILLS.slice(0, 3).map((s) => s.id);
    for (const id of off) p = setPaused(p, id, true);
    const plan = planSkills(p, ['math'], 30, seeded(2), Date.now());
    expect(plan.some((s) => off.includes(s.id))).toBe(false);
    // A topic skipped mid-game is passed over for the rest of the plan.
    const q = flagNotLearned(p, plan[0].id);
    expect(skillAt(q, plan, 0).id).not.toBe(plan[0].id);
    expect(skillAt(p, plan, 0, plan[0].id).id).not.toBe(plan[0].id);
  });
});
