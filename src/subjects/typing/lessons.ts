// Type Rocket lessons: one or two new keys at a time, from the home row out.

import { pick, shuffle } from '../../engine/random';
import type { Rng } from '../../engine/types';
import { GRADE3_WORDS } from '../spelling/skills';

export type Finger = 'L5' | 'L4' | 'L3' | 'L2' | 'R2' | 'R3' | 'R4' | 'R5' | 'T';

export const FINGER_NAME: Record<Finger, string> = {
  L5: 'left pinky', L4: 'left ring finger', L3: 'left middle finger', L2: 'left pointer finger',
  R2: 'right pointer finger', R3: 'right middle finger', R4: 'right ring finger', R5: 'right pinky', T: 'thumb',
};

export const KEY_ROWS = ['qwertyuiop', 'asdfghjkl;', 'zxcvbnm,./'];

export const FINGER_OF: Record<string, Finger> = (() => {
  const map: Record<string, Finger> = { ' ': 'T' };
  const cols: Finger[] = ['L5', 'L4', 'L3', 'L2', 'L2', 'R2', 'R2', 'R3', 'R4', 'R5'];
  for (const row of KEY_ROWS) row.split('').forEach((k, i) => (map[k] = cols[i]));
  map["'"] = 'R5';
  map['?'] = 'R5';
  map['!'] = 'L5';
  return map;
})();

export interface Lesson {
  id: string;
  name: string;
  newKeys: string;
  /** Letters allowed so far, used to pick practice words. */
  keys: string;
  targetWpm: number;
  make: (rng: Rng, extraWords: string[]) => string;
}

const WORDS = `a ad add all as ask dad fad fall flask gal glad had hall has jag lad lass sad salad shall flag
lake leak like kid did said fish dish desk side hide ride lid file life kite tide sit fit hit kit wish swish
red rug run fun sun nut cut hut hurt true rust rule rest tree feet free three street dress fresh shut just
yes yet try fly sky type yard ray stay play day way they these those other our out your you young
top pot hop stop shop pop up pup open pool soap rope hope poke park part port post spot sport
we was wet wow web wish week sweet swim quiz quit queen quack squid quiet
car cat cake come cold coat cup cub camp clock milk moon mom map me my much more music
van very vest vote ever never seven nest net nine name now new snow win when even oven give
box fox six mix wax zoo zip zero buzz fizz big bag bus bed bike book best bob baby black brown
the and for are but not all can had her was one our out day get has him his how man new now old see two way who boy did its let put say she too use`
  .split(/\s+/)
  .filter(Boolean);

const SENTENCES = [
  'The moose ate the green leaves.', 'We play hockey after school.', 'My dog likes to run in the snow.', 'The sun is hot in July.',
  'Can you skate on the pond?', 'I packed a hat, mittens, and a scarf.', 'Calgary is a big city in Alberta.', 'The mountains are very tall.',
  'Sam scored a goal!', 'We read a book about space.', 'Look at the bright stars.', 'Grandma baked a pie for us.',
];

function drill(rng: Rng, keys: string, groups = 8): string {
  const k = keys.split('');
  return Array.from({ length: groups }, () => Array.from({ length: 3 }, () => pick(rng, k)).join('')).join(' ');
}

function words(rng: Rng, keys: string, count = 8, extra: string[] = []): string {
  const ok = [...WORDS, ...extra].filter((w) => w.split('').every((c) => keys.includes(c)));
  if (ok.length < 3) return drill(rng, keys, count);
  return Array.from({ length: count }, () => pick(rng, ok)).join(' ');
}

const keyLesson = (id: string, name: string, newKeys: string, keys: string, targetWpm: number): Lesson => ({
  id, name, newKeys, keys, targetWpm,
  make: (rng) => `${drill(rng, newKeys, 4)} ${drill(rng, keys, 3)} ${words(rng, keys, 5)}`.trim(),
});

const HOME = 'asdfjkl;gh';

export const LESSONS: Lesson[] = [
  { id: 'fj', name: 'F and J', newKeys: 'fj', keys: 'fj', targetWpm: 5, make: (rng) => drill(rng, 'fj', 10) },
  { id: 'dk', name: 'D and K', newKeys: 'dk', keys: 'fjdk', targetWpm: 5, make: (rng) => `${drill(rng, 'dk', 4)} ${drill(rng, 'fjdk', 6)}` },
  { id: 'sl', name: 'S and L', newKeys: 'sl', keys: 'fjdksl', targetWpm: 6, make: (rng) => `${drill(rng, 'sl', 4)} ${drill(rng, 'fjdksl', 6)}` },
  { id: 'a;', name: 'A and ;', newKeys: 'a;', keys: 'fjdksla;', targetWpm: 6, make: (rng) => `${drill(rng, 'a;', 3)} ${words(rng, 'fjdksla', 6)}` },
  keyLesson('gh', 'G and H: the whole home row', 'gh', HOME, 7),
  keyLesson('ei', 'E and I', 'ei', HOME + 'ei', 7),
  keyLesson('ru', 'R and U', 'ru', HOME + 'eiru', 8),
  keyLesson('ty', 'T and Y', 'ty', HOME + 'eiruty', 8),
  keyLesson('op', 'O and P', 'op', HOME + 'eirutyop', 9),
  keyLesson('wq', 'W and Q', 'wq', HOME + 'eirutyopwq', 9),
  keyLesson('cm', 'C and M', 'cm', HOME + 'eirutyopwqcm', 10),
  keyLesson('vn', 'V and N', 'vn', HOME + 'eirutyopwqcmvn', 10),
  keyLesson('bxz', 'B, X and Z: every letter', 'bxz', 'abcdefghijklmnopqrstuvwxyz;', 10),
  {
    id: 'words', name: 'My spelling words', newKeys: '', keys: "abcdefghijklmnopqrstuvwxyz'", targetWpm: 10,
    make: (rng, extra) => {
      const list = extra.length ? extra : GRADE3_WORDS.map((w) => w[0]);
      return shuffle(rng, [...list, ...list]).slice(0, 10).join(' ').toLowerCase();
    },
  },
  {
    id: 'sentences', name: 'Capitals and punctuation', newKeys: '⇧.,?!', keys: '', targetWpm: 12,
    make: (rng) => shuffle(rng, SENTENCES).slice(0, 2).join(' '),
  },
];

/** Stars for a finished run: 1 for finishing, 2 for good accuracy and speed, 3 for great. */
export function starsFor(lesson: Lesson, wpm: number, accuracy: number): number {
  if (accuracy >= 0.95 && wpm >= lesson.targetWpm) return 3;
  if (accuracy >= 0.9 && wpm >= lesson.targetWpm * 0.7) return 2;
  return 1;
}

export function fingerFor(ch: string): Finger {
  return FINGER_OF[ch.toLowerCase()] ?? 'T';
}
