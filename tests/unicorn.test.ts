import { describe, expect, it } from 'vitest';
import { RANKS } from '../src/ballpark/data';
import { seeded } from '../src/engine/random';
import { newProfile } from '../src/engine/storage';
import { bank, buy, newMeadow, wear, toggleDecor, RIDE_BONUS, XP_RIGHT } from '../src/unicorn/data';
import { planRide } from '../src/unicorn/questions';
import { ITEMS } from '../src/unicorn/shop';
import { nextUnicorn, UNICORNS, unlocked } from '../src/unicorn/unicorns';
import { K_SKILLS } from '../src/subjects/kindergarten';

const ride = (right: number, asked = 10) => ({ right, firstTry: right, asked, bestRun: right });

describe('unicorn unlocks', () => {
  it('match the ballpark rank steps', () => {
    expect(UNICORNS.map((u) => u.xp)).toEqual(RANKS.map((r) => r.xp));
  });

  it('starts with one unicorn and adds one at each step', () => {
    expect(unlocked(0).map((u) => u.id)).toEqual(['starlight']);
    expect(unlocked(299)).toHaveLength(1);
    expect(unlocked(300)).toHaveLength(2);
    expect(nextUnicorn(250)).toMatchObject({ need: 50, from: 0 });
    expect(nextUnicorn(18000)).toBeUndefined();
  });

  it('a perfect ride earns 100 XP and 70 points, and the second unicorn comes on the third ride', () => {
    let m = newMeadow();
    const arrived: string[][] = [];
    for (let i = 0; i < 3; i++) {
      const out = bank(m, 10 * XP_RIGHT, 10 * 5, ride(10), RIDE_BONUS, true);
      m = out.meadow;
      arrived.push(out.payout.arrived);
      if (i === 0) expect(out.payout.points).toBe(70);
    }
    expect(arrived).toEqual([[], [], ['bluebell']]);
    expect(m.rides).toBe(3);
  });

  it('gives Moments once, with their item', () => {
    const first = bank(newMeadow(), 100, 50, ride(10), RIDE_BONUS, true);
    expect(first.payout.moments.sort()).toEqual(['firstRide', 'perfect', 'run10', 'run5']);
    expect(first.meadow.owned).toContain('mane-rainbow');
    const again = bank(first.meadow, 100, 50, ride(10), RIDE_BONUS, true);
    expect(again.payout.moments).toEqual([]);
  });

  it('a Star Catch is not a ride', () => {
    const out = bank(newMeadow(), 50, 25, ride(5, 5), 10, false);
    expect(out.meadow.rides).toBe(0);
    expect(out.payout.moments).not.toContain('perfect');
  });
});

describe('shop and outfits', () => {
  it('buys only what she can afford, once', () => {
    const m = { ...newMeadow(), points: 100 };
    expect(buy(m, 'wings-white', 600)).toBeUndefined();
    const after = buy(m, 'coat-pink', 40)!;
    expect(after.points).toBe(60);
    expect(buy(after, 'coat-pink', 40)).toBeUndefined();
  });

  it('keeps an outfit for each unicorn', () => {
    let m = wear(newMeadow(), 'starlight', 'crown', 'crown-rose');
    m = wear(m, 'bluebell', 'crown', 'crown-daisy');
    expect(m.outfits.starlight.crown).toBe('crown-rose');
    expect(m.outfits.bluebell.crown).toBe('crown-daisy');
    expect(wear(m, 'starlight', 'crown', 'crown-rose').outfits.starlight.crown).toBeUndefined();
    expect(toggleDecor(toggleDecor(m, 'decor-hay'), 'decor-hay').decor).toEqual([]);
  });

  it('has something to buy after the first ride in every slot but wings', () => {
    const ids = new Set(ITEMS.map((i) => i.id));
    expect(ids.size).toBe(ITEMS.length);
    for (const slot of ['coat', 'crown', 'saddle', 'decor']) expect(ITEMS.some((i) => i.slot === slot && i.cost <= 100), slot).toBe(true);
    expect(Math.max(...ITEMS.map((i) => i.cost))).toBe(1500);
  });
});

describe('ride planning', () => {
  it('asks only Kindergarten questions and mixes the subjects', () => {
    const p = newProfile('Ava', '🦄');
    const plan = planRide(p, 10, seeded(3), Date.now());
    expect(plan).toHaveLength(10);
    expect(plan.every((s) => K_SKILLS.includes(s))).toBe(true);
    expect(new Set(plan.map((s) => s.subject)).size).toBe(3);
  });
});
