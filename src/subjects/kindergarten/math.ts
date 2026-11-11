// Kindergarten math, from the Alberta Kindergarten mathematics program (2022):
// Number (counting, numerals, comparing), Patterns, Geometry (shapes) and sorting.

import { int, pick, shuffle } from '../../engine/random';
import type { Question, Rng, Skill } from '../../engine/types';
import { kq, nameOf, others, plural } from './pics';

const S = 'kmath' as const;

/** Friendly things to count. */
const COUNTABLE = ['🍎', '🍓', '⭐', '🌸', '🦋', '🐞', '🎈', '🧁', '🍪', '🐟', '🦄', '💎', '🐣', '🍄', '🐚', '❤️'];

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

/** Numbers that are easy to mix up with n, for wrong choices. */
function nearNumbers(rng: Rng, n: number, max: number): string[] {
  const near = [n - 1, n + 1, n - 2, n + 2, n + 10, n - 10, +String(n).split('').reverse().join('')];
  const ok = [...new Set(near)].filter((x) => x >= 1 && x <= max && x !== n);
  return shuffle(rng, ok.slice(0, 4)).map(String);
}

const RANGE = [5, 10, 20];

// ---------- Counting ----------

function counting(level: number, rng: Rng): Question {
  const max = RANGE[level];
  const n = int(rng, level === 0 ? 1 : level === 1 ? 4 : 9, max);
  const item = pick(rng, COUNTABLE);
  const name = plural(nameOf(item), n);
  return kq(rng, {
    key: `kcount-${n}-${item}`,
    prompt: `How many ${plural(nameOf(item))}? Count them!`,
    visual: { kind: 'k-groups', groups: [`${n}×${item}`] },
    answer: String(n),
    wrong: nearNumbers(rng, n, max + 2),
    hint: 'Touch each one as you count. Say one number for each.',
    explain: `There are ${WORDS[n]} ${name}.`,
  });
}

// ---------- Number recognition ----------

function numbers(level: number, rng: Rng): Question {
  const max = RANGE[level];
  const n = int(rng, level === 2 ? 10 : 0, max);
  if (rng() < (level === 0 ? 0.5 : 0.4)) {
    // Match a numeral to a group.
    const item = pick(rng, COUNTABLE);
    return kq(rng, {
      key: `knummatch-${n}-${item}`,
      prompt: `Which group has ${WORDS[n]}?`,
      answer: `${Math.max(1, n)}×${item}`,
      wrong: nearNumbers(rng, Math.max(1, n), max).map((x) => `${x}×${item}`),
      visual: { kind: 'k-word', text: String(Math.max(1, n)) },
      hint: 'Count each group. Find the one that matches the number.',
      explain: `${WORDS[Math.max(1, n)]}.`,
      count: 2,
    });
  }
  return kq(rng, {
    key: `knum-${n}`,
    prompt: `Tap the number ${WORDS[n]}.`,
    answer: String(n),
    wrong: n === 0 ? ['6', '8', '9'] : nearNumbers(rng, n, Math.max(max, 9)),
    hint: n >= 10 ? 'Numbers from ten to nineteen start with a 1.' : 'Look carefully at the shape of each number.',
    explain: `That's ${WORDS[n]}.`,
  });
}

// ---------- More and less ----------

function compare(level: number, rng: Rng): Question {
  const item = pick(rng, COUNTABLE);
  const gap = level === 0 ? int(rng, 2, 4) : level === 1 ? int(rng, 1, 3) : 1;
  const max = level === 0 ? 6 : 10;
  const small = int(rng, 1, max - gap);
  const big = small + gap;
  const more = rng() < 0.6;
  if (level === 2 && rng() < 0.4) {
    // Compare two numerals.
    const a = int(rng, 4, 17);
    const b = a + int(rng, 1, 3) * (rng() < 0.5 ? 1 : -1);
    const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
    if (lo < 0) return compare(level, rng);
    return kq(rng, {
      key: `kcmpn-${lo}-${hi}-${more}`,
      prompt: `Which number is ${more ? 'bigger' : 'smaller'}?`,
      answer: String(more ? hi : lo),
      wrong: [String(more ? lo : hi)],
      count: 2,
      hint: 'Count up from one. The number you say later is bigger.',
      explain: `${WORDS[hi]} is bigger than ${WORDS[lo]}.`,
    });
  }
  return kq(rng, {
    key: `kcmp-${small}-${big}-${more}-${item}`,
    prompt: `Which has ${more ? 'more' : 'fewer'} ${plural(nameOf(item))}?`,
    answer: `${more ? big : small}×${item}`,
    wrong: [`${more ? small : big}×${item}`],
    count: 2,
    hint: more ? 'More means the bigger group. Count both groups.' : 'Fewer means the smaller group. Count both groups.',
    explain: `${WORDS[big]} is more than ${WORDS[small]}.`,
  });
}

// ---------- Patterns ----------

const PATTERN_SETS = [
  ['🔴', '🔵', '🟡', '🟢'],
  ['🍎', '🍌', '🍇', '🍊'],
  ['⭐', '🌙', '❤️', '🌸'],
  ['🐶', '🐱', '🐰', '🐸'],
  ['🦄', '🌈', '💎', '🦋'],
];

const CORES = [['AB'], ['AAB', 'ABB', 'AB'], ['ABC', 'AABB', 'ABB', 'AAB']];

function patterns(level: number, rng: Rng): Question {
  const set = shuffle(rng, pick(rng, PATTERN_SETS));
  const core = pick(rng, CORES[level]).split('').map((c) => set[c.charCodeAt(0) - 65]);
  const shown = level === 0 ? 5 : int(rng, 5, 7);
  const row = Array.from({ length: shown + 1 }, (_, i) => core[i % core.length]);
  const answer = row[shown];
  const used = [...new Set(core)];
  const wrong = [...used.filter((x) => x !== answer), ...others(set, ...used)];
  return kq(rng, {
    key: `kpat-${row.join('')}`,
    prompt: 'What comes next in the pattern?',
    visual: { kind: 'k-row', items: [...row.slice(0, shown), '❓'] },
    answer,
    wrong: wrong.slice(0, 2),
    hint: 'Say the pattern out loud and point to each one. What do you say next?',
    explain: `The pattern goes ${core.map(nameOf).join(', ')}, then starts again.`,
  });
}

// ---------- Shapes ----------

const COLOURS = ['red', 'blue', 'yellow', 'green', 'purple', 'pink'];
const SHAPES_BY_LEVEL = [['circle', 'square', 'triangle'], ['circle', 'square', 'triangle', 'rectangle'], ['circle', 'square', 'triangle', 'rectangle', 'star', 'heart', 'oval']];
const SIDES: Record<string, string> = { triangle: '3 sides', square: '4 sides the same', rectangle: '2 long sides and 2 short sides', circle: 'no corners', oval: 'no corners, like an egg' };

function shapes(level: number, rng: Rng): Question {
  const pool = SHAPES_BY_LEVEL[level];
  const shape = pick(rng, pool);
  const tok = (s: string) => `shape:${s}:${pick(rng, COLOURS)}`;
  const answer = tok(shape);
  if (level >= 1 && rng() < 0.35 && SIDES[shape] && shape !== 'oval') {
    const clue = shape === 'circle' ? 'is round, with no corners' : `has ${SIDES[shape]}`;
    return kq(rng, {
      key: `kshapeclue-${answer}`,
      prompt: `Which shape ${clue}?`,
      answer,
      wrong: others(['circle', 'square', 'triangle', 'rectangle'], shape).map(tok),
      hint: 'Count the sides with your finger.',
      explain: `A ${shape} ${clue}.`,
    });
  }
  return kq(rng, {
    key: `kshape-${answer}`,
    prompt: `Find the ${shape}.`,
    answer,
    wrong: shuffle(rng, others(pool, shape)).map(tok),
    hint: SIDES[shape] ? `A ${shape} has ${SIDES[shape]}.` : `Look for the ${shape} shape.`,
    explain: `That's the ${shape}.`,
  });
}

// ---------- Sorting ----------

const GROUPS: Record<string, string[]> = {
  fruit: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍐', '🍒', '🍉'],
  animals: ['🐶', '🐱', '🐄', '🐷', '🐰', '🐸', '🦁', '🐘'],
  'things that go': ['🚗', '🚌', '🚲', '✈️', '🚂', '⛵', '🚀', '🚜'],
  clothes: ['👕', '👖', '🧦', '👟', '🧢', '🧤', '🧣', '🧥'],
  'things in the sky': ['⭐', '🌙', '☁️', '🌈'],
};

function sorting(level: number, rng: Rng): Question {
  const names = Object.keys(GROUPS).slice(0, level === 0 ? 4 : 5);
  const [g, h] = shuffle(rng, names);
  const same = shuffle(rng, GROUPS[g]);
  const odd = pick(rng, GROUPS[h]);
  if (level === 0 || (level === 2 && rng() < 0.5)) {
    // Which one does not belong?
    return kq(rng, {
      key: `ksortodd-${g}-${odd}`,
      prompt: 'Which one does not belong?',
      answer: odd,
      wrong: same.slice(0, 2),
      hint: `Two of these are ${g}. Which one is different?`,
      explain: `The ${nameOf(odd)} is not one of the ${g}.`,
    });
  }
  // Which one goes with these?
  return kq(rng, {
    key: `ksortwith-${g}-${same[3]}`,
    prompt: 'Which one goes with these?',
    visual: { kind: 'k-row', items: same.slice(0, 3) },
    answer: same[3],
    wrong: shuffle(rng, names.filter((n) => n !== g)).slice(0, 2).map((n) => pick(rng, GROUPS[n])),
    hint: `These are all ${g}.`,
    explain: `The ${nameOf(same[3])} goes with the other ${g}.`,
  });
}

const K = 'Alberta Kindergarten Mathematics (2022)';

export const KMATH_SKILLS: Skill[] = [
  { id: 'k-count', subject: S, name: 'Counting', blurb: 'Count the pictures', strand: 'Number', outcome: `${K}: Children count to 20 and connect counting to quantity.`, icon: '🔢', levels: ['Count to 5', 'Count to 10', 'Count to 20'], generate: counting },
  { id: 'k-numbers', subject: S, name: 'Numbers', blurb: 'Find the number', strand: 'Number', outcome: `${K}: Children recognize and name numerals to 20.`, icon: '7️⃣', levels: ['0 to 5', '0 to 10', '10 to 20'], generate: numbers },
  { id: 'k-compare', subject: S, name: 'More or less', blurb: 'Which group has more?', strand: 'Number', outcome: `${K}: Children compare quantities using more, fewer and the same.`, icon: '⚖️', levels: ['Easy to see', 'Count to check', 'Very close'], generate: compare },
  { id: 'k-patterns', subject: S, name: 'Patterns', blurb: 'What comes next?', strand: 'Patterns', outcome: `${K}: Children recognize, copy and extend repeating patterns.`, icon: '🔁', levels: ['AB patterns', 'AAB and ABB', 'ABC patterns'], generate: patterns },
  { id: 'k-shapes', subject: S, name: 'Shapes', blurb: 'Circles, squares and triangles', strand: 'Geometry', outcome: `${K}: Children recognize and describe 2-D shapes.`, icon: '🔺', levels: ['3 shapes', 'Add rectangles', 'More shapes'], generate: shapes },
  { id: 'k-sort', subject: S, name: 'Sorting', blurb: 'What goes together?', strand: 'Geometry', outcome: `${K}: Children sort objects by one attribute and explain the rule.`, icon: '🧺', levels: ['Odd one out', 'Goes together', 'Mixed'], generate: sorting },
];
