// Copies the 3D art for every emoji used in src/ into public/art/.
// The art is Microsoft's Fluent Emoji 3D (MIT licence), from the
// @lobehub/fluent-emoji-3d dev dependency. Run: node scripts/copy-art.mjs
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'node_modules/@lobehub/fluent-emoji-3d/assets';
const OUT = 'public/art';

const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|json)$/.test(f)) files.push(p);
  }
})('src');

const seg = new Intl.Segmenter('en', { granularity: 'grapheme' });
const found = new Set();
for (const f of files) {
  for (const { segment } of seg.segment(readFileSync(f, 'utf8'))) {
    if (/\p{Extended_Pictographic}/u.test(segment)) found.add(segment);
  }
}

/** Same rule as src/art/sprite.ts: code points in hex, joined by dashes. */
const code = (e) => [...e].map((c) => c.codePointAt(0).toString(16)).join('-');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const have = [];
const missing = [];
for (const e of found) {
  const full = code(e);
  const bare = full.replace(/-fe0f/g, '');
  const from = [full, bare, `${bare}-fe0f`].map((c) => join(SRC, `${c}.webp`)).find(existsSync);
  if (!from) { missing.push(e); continue; }
  copyFileSync(from, join(OUT, `${bare}.webp`));
  have.push(bare);
}
have.sort();
writeFileSync(
  join(OUT, 'LICENSE.txt'),
  'Fluent Emoji 3D art, MIT License, Copyright (c) Microsoft Corporation.\nhttps://github.com/microsoft/fluentui-emoji\n',
);
writeFileSync('src/art/have.json', JSON.stringify(have) + '\n');
console.log(`Copied ${have.length} sprites. No art for: ${missing.join(' ') || 'none'}`);
