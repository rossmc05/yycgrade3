import { describe, expect, it } from 'vitest';
import { seeded } from '../src/engine/random';
import { LESSONS, fingerFor, starsFor } from '../src/subjects/typing/lessons';

describe('typing lessons', () => {
  it('only use keys taught so far', () => {
    const rng = seeded(1);
    for (const l of LESSONS.filter((x) => x.keys && x.id !== 'words')) {
      for (let i = 0; i < 50; i++) {
        const text = l.make(rng, []);
        expect(text.length, l.id).toBeGreaterThan(15);
        for (const c of text.replace(/ /g, '')) expect(l.keys, `${l.id}: ${text}`).toContain(c);
        expect(l.newKeys.split('').some((k) => text.includes(k)), l.id).toBe(true);
      }
    }
  });

  it('every character has a finger', () => {
    const rng = seeded(2);
    for (const l of LESSONS) for (const c of l.make(rng, ['friend'])) expect(fingerFor(c)).toBeTruthy();
  });

  it('gives stars for accuracy and speed', () => {
    const l = LESSONS[0];
    expect(starsFor(l, 2, 0.5)).toBe(1);
    expect(starsFor(l, 4, 0.92)).toBe(2);
    expect(starsFor(l, 6, 0.97)).toBe(3);
  });
});
