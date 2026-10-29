import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import have from '../src/art/have.json';
import { artCode } from '../src/art/sprite';

// Emoji that have no 3D art; they show as plain text.
const NO_ART = new Set(['★', '⛶']);

function sources(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) sources(p, out);
    else if (/\.(tsx?|json)$/.test(f)) out.push(p);
  }
  return out;
}

describe('3D art', () => {
  it('has a file for every listed sprite', () => {
    for (const c of have) expect(existsSync(join('public/art', `${c}.webp`)), c).toBe(true);
  });

  it('covers every emoji in the game (run node scripts/copy-art.mjs after adding one)', () => {
    const seg = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const list = new Set(have);
    const missing = new Set<string>();
    for (const f of sources('src')) {
      for (const { segment } of seg.segment(readFileSync(f, 'utf8'))) {
        if (/\p{Extended_Pictographic}/u.test(segment) && !NO_ART.has(segment) && !list.has(artCode(segment))) missing.add(segment);
      }
    }
    expect([...missing]).toEqual([]);
  });
});
