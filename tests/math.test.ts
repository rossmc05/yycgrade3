import { describe, expect, it } from 'vitest';
import { seeded } from '../src/engine/random';
import { MATH_SKILLS } from '../src/subjects/math/skills';
import { ALL_SKILLS } from '../src/subjects';
import { normalize } from '../src/screens/Play';

const RUNS = 400;

describe('every question is well formed', () => {
  for (const skill of ALL_SKILLS) {
    for (let level = 0; level < skill.levels.length; level++) {
      it(`${skill.id} level ${level + 1}`, () => {
        const rng = seeded(level * 1000 + skill.id.length);
        for (let i = 0; i < RUNS; i++) {
          const q = skill.generate(level, rng, { spellingList: i % 2 ? ['Because', 'friend'] : [] });
          const all = [q.prompt, q.answer, q.hint, q.explain, q.key, ...(q.choices ?? [])].join(' | ');
          expect(all, all).not.toMatch(/NaN|undefined|Infinity|null/);
          expect(q.answer.length).toBeGreaterThan(0);
          if (q.input === 'number') {
            expect(normalize(q.answer), q.prompt).toMatch(/^\d+$/);
            expect(normalize(q.answer).length).toBeLessThanOrEqual(7);
          }
          if (q.input === 'text') {
            expect(normalize(q.answer), q.prompt).toMatch(/^[a-z']+$/);
            if (q.say) expect(q.prompt.toLowerCase().split(" ")).not.toContain(normalize(q.answer));
          }
          if (q.input === 'order') {
            expect([...q.choices!].sort(), q.prompt).toEqual(q.answer.split(' → ').sort());
            expect(q.choices!.join(' → '), q.prompt).not.toBe(q.answer);
          }
          if (q.input === 'choice') {
            expect(q.choices, q.prompt).toBeDefined();
            expect(q.choices!.length, q.prompt).toBeGreaterThanOrEqual(2);
            expect(q.choices, q.prompt).toContain(q.answer);
            expect(new Set(q.choices).size, `${q.prompt} ${q.choices}`).toBe(q.choices!.length);
          }
        }
      });
    }
  }
});

/** Re-check arithmetic from the prompt text itself, independent of the generator's own maths. */
function solve(prompt: string): number | null {
  const p = prompt.replace(/(\d) (\d{3})/g, '$1$2').replace(/−/g, '-');
  let m = p.match(/^(\d+) ([+\-×÷]) (\d+) = ▢$/);
  if (m) {
    const [a, op, b] = [Number(m[1]), m[2], Number(m[3])];
    return op === '+' ? a + b : op === '-' ? a - b : op === '×' ? a * b : a / b;
  }
  m = p.match(/^(\d+) \+ ▢ = (\d+)$/);
  if (m) return Number(m[2]) - Number(m[1]);
  m = p.match(/^(\d+) × ▢ = (\d+)$/);
  if (m) return Number(m[2]) / Number(m[1]);
  m = p.match(/^▢ × (\d+) = (\d+)$/);
  if (m) return Number(m[2]) / Number(m[1]);
  m = p.match(/^▢ - (\d+) = (\d+)$/);
  if (m) return Number(m[1]) + Number(m[2]);
  m = p.match(/^(\d+) = (\d+) - ▢$/);
  if (m) return Number(m[2]) - Number(m[1]);
  m = p.match(/^(\d+) \+ (\d+) = ▢ \+ (\d+)$/);
  if (m) return Number(m[1]) + Number(m[2]) - Number(m[3]);
  m = p.match(/^What number is ([\d+ ]+)\?$/);
  if (m) return m[1].split('+').reduce((s, x) => s + Number(x.trim().replace(/ /g, '')), 0);
  return null;
}

describe('arithmetic answers match the question', () => {
  it('checks thousands of generated questions', () => {
    const rng = seeded(42);
    let checked = 0;
    for (const skill of MATH_SKILLS) {
      for (let level = 0; level < skill.levels.length; level++) {
        for (let i = 0; i < 300; i++) {
          const q = skill.generate(level, rng, { spellingList: [] });
          const want = solve(q.prompt);
          if (want === null) continue;
          checked++;
          expect(Number(normalize(q.answer)), q.prompt).toBe(want);
          expect(want, q.prompt).toBeGreaterThanOrEqual(0);
          expect(Number.isInteger(want), q.prompt).toBe(true);
        }
      }
    }
    expect(checked).toBeGreaterThan(2000);
  });

  it('keeps grade 3 limits', () => {
    const rng = seeded(7);
    const get = (id: string) => MATH_SKILLS.find((s) => s.id === id)!;
    for (let i = 0; i < 2000; i++) {
      for (let level = 0; level < 4; level++) {
        const q = get('math.add-sub').generate(level, rng);
        const nums = q.prompt.replace(/(\d) (\d{3})/g, '$1$2').match(/\d+/g)!.map(Number);
        nums.forEach((n) => expect(n, q.prompt).toBeLessThanOrEqual(1000));
        expect(Number(q.answer), q.prompt).toBeLessThanOrEqual(1000);
      }
      for (let level = 0; level < 5; level++) {
        const q = get('math.multiply').generate(level, rng);
        expect(Number(q.answer), q.prompt).toBeLessThanOrEqual(100);
      }
      const pv = get('math.place-value').generate(4, rng);
      expect(Number(normalize(pv.answer))).toBeLessThan(100000);
    }
  });

  it('reads clocks correctly', () => {
    const rng = seeded(3);
    const time = MATH_SKILLS.find((s) => s.id === 'math.time')!;
    for (let i = 0; i < 500; i++) {
      const q = time.generate(2, rng);
      if (q.visual?.kind !== 'clock') continue;
      expect(q.answer).toBe(`${q.visual.hour}:${String(q.visual.minute).padStart(2, '0')}`);
    }
  });

  it('counts coins correctly', () => {
    const value: Record<string, number> = { nickel: 5, dime: 10, quarter: 25, loonie: 100, toonie: 200, five: 500, ten: 1000, twenty: 2000 };
    const rng = seeded(9);
    const money = MATH_SKILLS.find((s) => s.id === 'math.money')!;
    for (let level = 0; level < 3; level++) {
      for (let i = 0; i < 300; i++) {
        const q = money.generate(level, rng);
        if (q.visual?.kind !== 'coins') continue;
        const cents = q.visual.coins.reduce((s, c) => s + value[c], 0);
        expect(Number(q.answer)).toBe(q.unit === '$' ? cents / 100 : cents);
      }
    }
  });
});
