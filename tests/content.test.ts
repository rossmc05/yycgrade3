import { describe, expect, it } from 'vitest';
import grammar from '../src/content/grammar.json';
import math from '../src/content/math.json';
import science from '../src/content/science.json';
import spelling from '../src/content/spelling.json';

const FILES: Record<string, Record<string, unknown>> = { grammar, math, science, spelling };

/** The prompt that a child sees, for spotting two items that ask the same thing. */
function promptOf(x: unknown): string {
  if (x && typeof x === 'object' && !Array.isArray(x)) {
    const o = x as Record<string, unknown>;
    return JSON.stringify(o.q ?? o.p ?? o.s ?? o.word ?? o.one ?? o.base ?? o).toLowerCase();
  }
  return JSON.stringify(x).toLowerCase();
}

describe('question bank data files', () => {
  for (const [file, bank] of Object.entries(FILES)) {
    for (const [name, value] of Object.entries(bank)) {
      if (Array.isArray(value)) {
        it(`${file} ${name} has no repeated items`, () => {
          const seen = new Map<string, number>();
          for (const x of value) seen.set(promptOf(x), (seen.get(promptOf(x)) ?? 0) + 1);
          expect([...seen].filter(([, n]) => n > 1).map(([k]) => k)).toEqual([]);
        });
      } else if (value && typeof value === 'object' && Object.values(value).every(Array.isArray)) {
        it(`${file} ${name} puts each thing in only one group`, () => {
          const all = Object.values(value as Record<string, string[]>).flat().map((x) => x.toLowerCase());
          expect(all.filter((x, i) => all.indexOf(x) !== i)).toEqual([]);
        });
      }
    }
  }
});
