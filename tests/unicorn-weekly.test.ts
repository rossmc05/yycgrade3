import { describe, expect, it } from 'vitest';
import { newMeadow } from '../src/unicorn/data';
import { ITEMS, SHOP_ITEMS } from '../src/unicorn/shop';
import { addPlay, claimWeekly, GOALS, PRIZE_IDS, unclaimed, weekly, weekOf, BONUS_POINTS } from '../src/unicorn/weekly';

const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 15).getTime();
const play = (o: Partial<Parameters<typeof addPlay>[1]> = {}) => ({ mode: 'ride' as const, finished: true, firstTry: 8, sparkles: 2, runs5: 1, ...o });

describe('Challenge of the Week', () => {
  it('runs Monday to Sunday', () => {
    expect(weekOf(at(2026, 11, 16))).toBe('2026-11-16');
    expect(weekOf(at(2026, 11, 22))).toBe('2026-11-16');
    expect(weekOf(at(2026, 11, 23))).toBe('2026-11-23');
  });

  it('changes the goal and the prize each week', () => {
    const m = newMeadow();
    const a = weekly(m, at(2026, 11, 17));
    const b = weekly(m, at(2026, 11, 24));
    expect(a.goal).toBe(GOALS[0]);
    expect(b.goal).toBe(GOALS[1]);
    expect(a.prize).toBe(PRIZE_IDS[0]);
    expect(b.prize).toBe(PRIZE_IDS[1]);
  });

  it('prizes are real items that the shop never sells', () => {
    for (const id of PRIZE_IDS) expect(ITEMS.find((i) => i.id === id)?.weekly, id).toBe(true);
    expect(SHOP_ITEMS.some((i) => PRIZE_IDS.includes(i.id))).toBe(false);
  });

  it('fills up as she plays, then the prize can be claimed once', () => {
    const now = at(2026, 11, 17); // goal: 30 right
    let m = newMeadow();
    for (let i = 0; i < 3; i++) m = addPlay(m, play(), now);
    expect(weekly(m, now).state.count).toBe(24);
    expect(unclaimed(m, now)).toHaveLength(0);
    m = addPlay(m, play(), now);
    expect(weekly(m, now).state.count).toBe(30);
    const r = claimWeekly(m, now);
    expect(r.won).toEqual([PRIZE_IDS[0]]);
    expect(r.meadow.owned).toContain(PRIZE_IDS[0]);
    expect(claimWeekly(r.meadow, now).won).toEqual([]);
  });

  it('counts different days only once each for the days goal', () => {
    // Week 3 is the days goal.
    const mon = at(2026, 12, 7);
    expect(weekly(newMeadow(), mon).goal.kind).toBe('days');
    let m = addPlay(newMeadow(), play(), mon);
    m = addPlay(m, play(), mon);
    m = addPlay(m, play({ finished: false }), at(2026, 12, 8));
    m = addPlay(m, play(), at(2026, 12, 9));
    expect(weekly(m, mon).state.count).toBe(2);
  });

  it('keeps a finished challenge to claim later, with no penalty', () => {
    let m = newMeadow();
    for (let i = 0; i < 4; i++) m = addPlay(m, play(), at(2026, 11, 17));
    const later = at(2026, 12, 3);
    expect(unclaimed(m, later).map((w) => w.week)).toEqual(['2026-11-16']);
    expect(claimWeekly(m, later).won).toEqual([PRIZE_IDS[0]]);
  });

  it('gives bonus stars once every prize is won', () => {
    let m = { ...newMeadow(), owned: [...PRIZE_IDS] };
    for (let i = 0; i < 4; i++) m = addPlay(m, play(), at(2026, 11, 17));
    const r = claimWeekly(m, at(2026, 11, 17));
    expect(r.won).toEqual(['points']);
    expect(r.meadow.points).toBe(BONUS_POINTS);
  });
});
