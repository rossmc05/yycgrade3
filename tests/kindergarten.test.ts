import { describe, expect, it } from 'vitest';
import { seeded } from '../src/engine/random';
import { K_SKILLS, K_SUBJECTS } from '../src/subjects/kindergarten';
import { NAMES, nameOf } from '../src/subjects/kindergarten/pics';
import { STARTS, rhymeWord, startWord } from '../src/subjects/kindergarten/reading';
import { SUBJECTS } from '../src/subjects';

const emoji = /\p{Extended_Pictographic}/u;

describe('Kindergarten questions', () => {
  for (const skill of K_SKILLS) {
    for (let level = 0; level < skill.levels.length; level++) {
      it(`${skill.id} level ${level + 1} has 2 or 3 picture-friendly choices`, () => {
        const rng = seeded(level * 77 + skill.id.length);
        for (let i = 0; i < 300; i++) {
          const q = skill.generate(level, rng, { spellingList: [] });
          expect(q.input).toBe('choice');
          expect(q.choices!.length, q.prompt).toBeGreaterThanOrEqual(2);
          expect(q.choices!.length, q.prompt).toBeLessThanOrEqual(3);
          // Short choices only: pictures, numbers, letters or a single sight word.
          for (const c of q.choices!) if (!c.startsWith('shape:')) expect(c.length, `${q.prompt} ${c}`).toBeLessThanOrEqual(12);
          if (q.labels) {
            expect(q.labels.length).toBe(q.choices!.length);
            // Every picture has a real spoken name.
            for (const l of q.labels) expect(l, q.prompt).not.toMatch(emoji);
          }
          for (const v of q.visual?.kind === 'k-row' ? q.visual.items : q.visual?.kind === 'k-groups' ? q.visual.groups : []) {
            if (v !== '❓') expect(nameOf(v), q.prompt).not.toMatch(emoji);
          }
          expect(`${q.prompt} ${q.say ?? ''} ${q.hint} ${q.explain}`).not.toMatch(emoji);
          // The words on screen must not show a text answer (a letter, number or word) she could just match.
          if (!emoji.test(q.answer) && !q.answer.startsWith('shape:')) {
            const shown = `${q.prompt} ${q.visual?.kind === 'k-word' && skill.id !== 'k-letters' ? q.visual.text : ''}`;
            expect(shown.split(/[^A-Za-z0-9]+/), `${skill.id}: ${q.prompt}`).not.toContain(q.answer);
          }
        }
      });
    }
  }

  it('every start-sound picture really starts with its letter', () => {
    for (const [letter, pics] of Object.entries(STARTS)) for (const p of pics) expect(startWord(p)[0], `${p} ${startWord(p)}`).toBe(letter);
  });

  it('every picture has a name', () => {
    for (const pics of Object.values(STARTS)) for (const p of pics) expect(NAMES[p] ?? startWord(p), p).toBeTruthy();
    expect(rhymeWord('🪵')).toBe('log');
  });

  it('stays out of Grade 3 Quest and the ballpark', () => {
    const grade3 = SUBJECTS.flatMap((s) => s.skills.map((k) => k.id));
    expect(K_SKILLS.some((k) => grade3.includes(k.id))).toBe(false);
    expect(K_SUBJECTS.map((s) => s.skills.length)).toEqual([6, 5, 4]);
  });
});
