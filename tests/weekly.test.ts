import { describe, expect, it } from 'vitest';
import { seeded } from '../src/engine/random';
import { newProfile } from '../src/engine/storage';
import { RANK } from '../src/ballpark/cards';
import { newBall } from '../src/ballpark/data';
import { playerById, weeklyPlayer } from '../src/ballpark/players';
import { addPerfect, canClaim, challengeOf, claimWeekly, designOf, isOpen, neededOf, PERFECT_NEEDED, progressOf } from '../src/ballpark/weekly';

const at = (d: string, h = 12) => new Date(`${d}T${String(h).padStart(2, '0')}:00:00`).getTime();

describe('weekly spelling challenge', () => {
  it('uses the Nov 9 list, with a sentence for every word', () => {
    const c = challengeOf(newProfile('Sam', '🦊'))!;
    expect(c.date).toBe('2026-11-09');
    expect(c.words).toHaveLength(15);
    for (const w of c.words) expect(c.sentences?.[w]).toMatch(new RegExp(`\\b${w}\\b`, 'i'));
  });

  it('uses a newer list typed in the Parent screen', () => {
    const p = { ...newProfile('Sam', '🦊'), spellingList: ['Boat', 'rain', 'boat', 'x1'], spellingTest: '2026-11-16' };
    expect(challengeOf(p)).toMatchObject({ date: '2026-11-16', words: ['boat', 'rain'] });
    expect(challengeOf({ ...p, spellingTest: '2026-10-01' })?.date).toBe('2026-11-09');
  });

  it('keeps the Nov 9 week at 3 rounds and Starlight, and new weeks at 5 rounds and the Orange Wave Refractor', () => {
    expect(PERFECT_NEEDED).toBe(5);
    const old = challengeOf({ ...newProfile('Sam', '🦊'), spellingTest: '2026-10-01', spellingList: ['boat'] })!;
    expect(neededOf(old)).toBe(3);
    expect(designOf('2026-11-09')).toBe('starlight');
    const next = challengeOf({ ...newProfile('Sam', '🦊'), spellingTest: '2026-11-16', spellingList: ['boat', 'rain'] })!;
    expect(neededOf(next)).toBe(5);
    expect(designOf('2026-11-16')).toBe('orange');
    let b = newBall();
    for (let i = 0; i < 4; i++) b = addPerfect(b, next);
    expect(canClaim(b, next, at('2026-11-12'))).toBe(false);
    expect(canClaim(addPerfect(b, next), next, at('2026-11-12'))).toBe(true);
  });

  it('stays open until the end of test day', () => {
    const c = challengeOf(newProfile('Sam', '🦊'))!;
    expect(isOpen(c, at('2026-11-05'))).toBe(true);
    expect(isOpen(c, at('2026-11-09', 23))).toBe(true);
    expect(isOpen(c, at('2026-11-10', 0))).toBe(false);
  });

  it('needs 3 perfect rounds, then gives the weekly card, an Autograph or rarer, and a Refractor or better, once', () => {
    const c = challengeOf(newProfile('Sam', '🦊'))!;
    let b = newBall();
    for (let i = 0; i < neededOf(c) - 1; i++) b = addPerfect(b, c);
    expect(canClaim(b, c, at('2026-11-06'))).toBe(false);
    expect(claimWeekly(b, c, seeded(1), at('2026-11-06')).pulls).toHaveLength(0);
    b = addPerfect(b, c);
    expect(canClaim(b, c, at('2026-11-10', 9))).toBe(false);
    for (let seed = 1; seed < 30; seed++) {
      const r = claimWeekly(b, c, seeded(seed), at('2026-11-06'));
      expect(r.pulls).toHaveLength(3);
      expect(r.pulls[0]).toMatchObject({ parallel: 'weekly' });
      expect(r.pulls[0].player.weekly).toBe('2026-11-09');
      expect(r.pulls[0].serial).toBeLessThanOrEqual(25);
      expect(RANK[r.pulls[1].parallel]).toBeGreaterThanOrEqual(RANK.auto);
      expect(RANK[r.pulls[2].parallel]).toBeGreaterThanOrEqual(RANK.refractor);
      expect(progressOf(r.ball, c).claimed).toBe(true);
      expect(claimWeekly(r.ball, c, seeded(seed), at('2026-11-06')).pulls).toHaveLength(0);
    }
  });

  it('rotates a different star each week, and finds weekly cards by id', () => {
    const a = weeklyPlayer('2026-11-09')!;
    const b = weeklyPlayer('2026-11-16')!;
    expect(a.name).toBe('Aaron Judge');
    expect(b.name).not.toBe(a.name);
    expect(playerById('wk-2026-11-09')?.name).toBe('Aaron Judge');
  });
});
