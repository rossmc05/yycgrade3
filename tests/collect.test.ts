import { describe, expect, it } from 'vitest';
import { applyTurn, startBattle } from '../src/battle/engine';
import { GEAR, perksOf } from '../src/collect/gear';
import { PALS, rollPal } from '../src/collect/pals';
import { seeded } from '../src/engine/random';

describe('pals', () => {
  it('have unique ids and 8 per zone, with one legendary each', () => {
    expect(new Set(PALS.map((p) => p.id)).size).toBe(PALS.length);
    for (const z of ['math', 'spelling', 'grammar', 'science'] as const) {
      const zone = PALS.filter((p) => p.zone === z);
      expect(zone.length).toBe(8);
      expect(zone.filter((p) => p.rarity === 'legendary').length).toBe(1);
    }
  });

  it('come from the zone, and bosses give rarer pals more often', () => {
    const rng = seeded(4);
    const rare = (boss: boolean) => {
      let n = 0;
      for (let i = 0; i < 4000; i++) {
        const p = rollPal('math', boss, rng)!;
        expect(p.zone).toBe('math');
        if (p.rarity !== 'common') n += 1;
      }
      return n;
    };
    expect(rare(true)).toBeGreaterThan(rare(false));
  });
});

describe('gear', () => {
  it('has unique ids and a free starter weapon', () => {
    expect(new Set(GEAR.map((g) => g.id)).size).toBe(GEAR.length);
    expect(GEAR.find((g) => g.id === 'stick')?.cost).toBe(0);
  });

  it('boosts damage, coins and crits, and stops healing', () => {
    const b = startBattle(10, ['a', 'b', 'boss'], seeded(1));
    const plain = applyTurn(b, 'first', 20, 10);
    const boosted = applyTurn(b, 'first', 20, 10, perksOf({ weapon: 'hammer' }));
    expect(boosted.event.damage).toBeGreaterThan(plain.event.damage);
    expect(applyTurn(b, 'first', 10, 10).event.kind).toBe('hit');
    expect(applyTurn(b, 'first', 10, 10, perksOf({ charm: 'stopwatch' })).event.kind).toBe('crit');
    const hurt = { ...b, foes: b.foes.map((f, i) => (i === 0 ? { ...f, hp: f.hp - 5 } : f)) };
    expect(applyTurn(hurt, 'miss', 20, 10).event.heal).toBeGreaterThan(0);
    expect(applyTurn(hurt, 'miss', 20, 10, perksOf({ charm: 'shield' })).event.heal).toBe(0);
    const weak = { ...b, foes: b.foes.map((f, i) => (i === 0 ? { ...f, hp: 1 } : f)) };
    expect(applyTurn(weak, 'first', 20, 10, perksOf({ charm: 'magnet' })).event.coins).toBe(13);
  });
});
