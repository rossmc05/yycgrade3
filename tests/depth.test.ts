import { describe, expect, it } from 'vitest';
import { seeded } from '../src/engine/random';
import { ALL_SKILLS } from '../src/subjects';

/** Every level needs enough different questions that a 20-answer mastery window rarely repeats. */
const MIN_DISTINCT = 30;

describe('question bank depth', () => {
  for (const skill of ALL_SKILLS) {
    for (let level = 0; level < skill.levels.length; level++) {
      it(`${skill.id} level ${level + 1} has at least ${MIN_DISTINCT} distinct questions`, () => {
        const rng = seeded(level + 7);
        const keys = new Set<string>();
        for (let i = 0; i < 4000; i++) keys.add(skill.generate(level, rng, { spellingList: [] }).key);
        expect(keys.size).toBeGreaterThanOrEqual(MIN_DISTINCT);
      });
    }
  }
});
