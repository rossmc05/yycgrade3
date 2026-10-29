import { describe, expect, it } from 'vitest';
import { medalFor, nextGoal } from '../src/games/medals';

describe('arcade medals', () => {
  const m: [number, number, number] = [5, 10, 15];
  it('awards the highest medal reached', () => {
    expect(medalFor(4, m)).toBe(null);
    expect(medalFor(5, m)).toBe('bronze');
    expect(medalFor(12, m)).toBe('silver');
    expect(medalFor(15, m)).toBe('gold');
  });
  it('names the next goal', () => {
    expect(nextGoal(0, m)).toEqual({ medal: 'bronze', score: 5 });
    expect(nextGoal(10, m)).toEqual({ medal: 'gold', score: 15 });
    expect(nextGoal(20, m)).toBe(null);
  });
});
