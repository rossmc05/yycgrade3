import { describe, expect, it } from 'vitest';
import { applyTurn, startBattle, type Battle, type Outcome } from '../src/battle/engine';
import { seeded } from '../src/engine/random';
import { finalOpen, nextStep, SCENES, storyOf, winCrystal } from '../src/story/story';
import type { Profile } from '../src/engine/types';

function play(outcomes: Outcome[]): Battle {
  let b = startBattle(outcomes.length, ['Boss'], seeded(2), { hitsToWin: Math.ceil(outcomes.length * 0.7) });
  outcomes.forEach((o, i) => { if (!b.foes[0].end) b = applyTurn(b, o, 20, outcomes.length - i).battle; });
  return b;
}

describe('story bosses', () => {
  it('are one foe that needs most answers right', () => {
    expect(play(Array(10).fill('first')).foes[0].end).toBe('defeated');
    expect(play([...Array(7).fill('first'), 'miss', 'miss', 'miss']).foes[0].end).toBe('defeated');
    expect(play([...Array(4).fill('first'), ...Array(6).fill('miss')]).foes[0].end).toBe('fled');
    // Getting only the last one right is not enough.
    expect(play([...Array(9).fill('miss'), 'first']).foes[0].end).toBe('fled');
    expect(play([...Array(9).fill('miss'), 'block']).foes[0].end).toBe('fled');
  });

  it('can be beaten early, before the last question', () => {
    let b = startBattle(10, ['Boss'], seeded(2), { hitsToWin: 7 });
    let turns = 0;
    while (!b.foes[0].end) { b = applyTurn(b, 'first', 20, 10 - turns).battle; turns += 1; }
    expect(b.foes[0].end).toBe('defeated');
    expect(turns).toBeLessThan(8);
  });
});

describe('story progress', () => {
  const p = { story: undefined } as unknown as Profile;
  it('collects crystals and opens the fortress with all four', () => {
    let q = p;
    for (const z of ['math', 'spelling', 'grammar'] as const) q = winCrystal(q, z);
    expect(finalOpen(q)).toBe(false);
    q = winCrystal(winCrystal(q, 'science'), 'science');
    expect(storyOf(q).crystals.length).toBe(4);
    expect(finalOpen(q)).toBe(true);
    expect(nextStep(q, () => 0)).toMatch(/Fortress/);
  });

  it('has every scene it uses', () => {
    for (const id of ['intro', 'crystal', 'final-intro', 'ending', 'boss-math', 'boss-spelling', 'boss-grammar', 'boss-science']) expect(SCENES[id]?.length).toBeGreaterThan(0);
  });
});
