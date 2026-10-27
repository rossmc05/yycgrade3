import { describe, expect, it } from 'vitest';
import { applyTurn, battleOver, startBattle, type Outcome } from '../src/battle/engine';
import { seeded } from '../src/engine/random';

const NAMES = ['a', 'b', 'c', 'boss'];

function run(outcomes: Outcome[], seconds = 12) {
  let b = startBattle(outcomes.length, NAMES, seeded(1));
  const events = [];
  for (let i = 0; i < outcomes.length; i++) {
    const r = applyTurn(b, outcomes[i], seconds, outcomes.length - i);
    b = r.battle;
    events.push(r.event);
  }
  return { b, events };
}

describe('battle engine', () => {
  it('plans three foes with a boss last', () => {
    const b = startBattle(10, NAMES, seeded(2));
    expect(b.foes).toHaveLength(3);
    expect(b.foes[2].boss).toBe(true);
    expect(b.foes[2].name).toBe('boss');
  });

  it('defeats every foe by the last question when every answer is right', () => {
    for (const n of [5, 10, 15, 20]) {
      const { b } = run(Array(n).fill('first'));
      expect(battleOver(b), `session of ${n}`).toBe(true);
      expect(b.foes.every((f) => f.end === 'defeated')).toBe(true);
    }
  });

  it('still finishes every foe when answers come on the second try', () => {
    const { b } = run(Array(10).fill('block'));
    expect(b.foes.every((f) => f.end === 'defeated')).toBe(true);
  });

  it('never ends early on misses: foes heal or flee, the session plays out', () => {
    const { b, events } = run(Array(10).fill('miss'));
    expect(events.some((e) => e.kind === 'miss')).toBe(true);
    expect(b.foes.every((f) => f.end === 'fled')).toBe(true);
  });

  it('gives a special move on three in a row and crits for fast answers', () => {
    const { events } = run(['first', 'first', 'first', 'first', 'block', 'first', 'first', 'first', 'first', 'first'], 3);
    expect(events[0].kind).toBe('crit');
    expect(events[2].kind).toBe('special');
    expect(events[4].kind).toBe('block');
  });

  it('keeps the boss alive until the last question even with fast answers', () => {
    for (const n of [6, 10, 15]) {
      let b = startBattle(n, NAMES, seeded(3));
      for (let i = 0; i < n; i++) {
        expect(battleOver(b), `over early at ${i} of ${n}`).toBe(false);
        b = applyTurn(b, 'first', 2, n - i).battle;
      }
      expect(battleOver(b)).toBe(true);
    }
  });

  it('handles a mixed, realistic session', () => {
    const { b } = run(['first', 'miss', 'block', 'first', 'first', 'miss', 'first', 'block', 'first', 'first']);
    expect(battleOver(b)).toBe(true);
  });
});
