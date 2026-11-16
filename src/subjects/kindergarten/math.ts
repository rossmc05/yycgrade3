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
function nearNumbers(rng: Rng, n: number, max: number, min = 1): string[] {
  const near = [n - 1, n + 1, n - 2, n + 2, n + 10, n - 10, +String(n).split('').reverse().join(''), n - 3, n + 3];
  const ok = [...new Set(near)].filter((x) => x >= min && x <= max && x !== n);
  return shuffle(rng, ok.slice(0, 4)).map(String);
}

const RANGE = [5, 10, 20, 20];

// ---------- Counting ----------

function counting(level: number, rng: Rng): Question {
  if (level === 3 && rng() < 0.5) return countOn(rng);
  const max = RANGE[level];
  const n = int(rng, level === 0 ? 1 : level === 1 ? 4 : level === 2 ? 9 : 13, max);
  const item = pick(rng, COUNTABLE);
  const name = plural(nameOf(item), n);
  return kq(rng, {
    key: `kcount-${n}-${item}`,
    prompt: `How many ${plural(nameOf(item))}? Count them!`,
    visual: { kind: 'k-groups', groups: [`${n}×${item}`] },
    answer: String(n),
    // At the challenge level the wrong numbers are only one away, so she has to count carefully.
    wrong: level === 3 ? shuffle(rng, [n - 1, n + 1].filter((x) => x <= 20)).map(String).concat(String(n - 2)) : nearNumbers(rng, n, max),
    hint: level === 3 ? 'Count the first row of five, then keep counting. Touch each one.' : 'Touch each one as you count. Say one number for each.',
    explain: n === 1 ? `There is one ${name}.` : `There are ${WORDS[n]} ${name}.`,
  });
}

/** The counting sequence to 20: what comes next, or one more and one less. */
function countOn(rng: Rng): Question {
  const n = int(rng, 4, 18);
  if (rng() < 0.5) {
    // One more or one less, with a group to look at.
    const item = pick(rng, COUNTABLE);
    const more = rng() < 0.6;
    const a = more ? n + 1 : n - 1;
    return kq(rng, {
      key: `kmoreless-${n}-${more}-${item}`,
      prompt: `Here are ${WORDS[n]} ${plural(nameOf(item))}. What is one ${more ? 'more' : 'less'}?`,
      visual: { kind: 'k-groups', groups: [`${n}×${item}`] },
      answer: String(a),
      wrong: [String(more ? n - 1 : n + 1), String(more ? n + 2 : n - 2)],
      hint: more ? `One more means the next number when you count. Count up from ${WORDS[n]}.` : `One less means the number just before. Count back from ${WORDS[n]}.`,
      explain: `One ${more ? 'more' : 'less'} than ${WORDS[n]} is ${WORDS[a]}.`,
    });
  }
  const after = rng() < 0.65;
  const a = after ? n + 1 : n - 1;
  const row = after ? [String(n - 2), String(n - 1), String(n), '❓'] : ['❓', String(n), String(n + 1), String(n + 2)];
  return kq(rng, {
    key: `kcounton-${n}-${after}`,
    prompt: after ? 'Count with me! What number comes next?' : 'Count with me! What number comes before?',
    say: after ? `${WORDS[n - 2]}, ${WORDS[n - 1]}, ${WORDS[n]}. What number comes next?` : `What number comes just before ${WORDS[n]}, ${WORDS[n + 1]}, ${WORDS[n + 2]}?`,
    visual: { kind: 'k-row', items: row },
    answer: String(a),
    wrong: after ? [String(n + 2), String(n - 1)] : [String(n - 2), String(n + 1)],
    hint: after ? `Say the numbers out loud. What do you say after ${WORDS[n]}?` : `Count up to ${WORDS[n]}. What do you say just before it?`,
    explain: after ? `After ${WORDS[n]} comes ${WORDS[a]}.` : `${WORDS[a][0].toUpperCase() + WORDS[a].slice(1)} comes just before ${WORDS[n]}.`,
  });
}

// ---------- Number recognition ----------

function numbers(level: number, rng: Rng): Question {
  const max = RANGE[level];
  const n = int(rng, level === 3 ? 11 : level === 2 ? 10 : 0, max);
  if (rng() < (level === 0 ? 0.5 : level === 3 ? 0.3 : 0.4)) {
    // Match a numeral to a group.
    const item = pick(rng, COUNTABLE);
    const g = Math.max(1, n);
    return kq(rng, {
      key: `knummatch-${g}-${item}`,
      prompt: `Which group has ${WORDS[g]}?`,
      answer: `${g}×${item}`,
      wrong: nearNumbers(rng, g, max).map((x) => `${x}×${item}`),
      visual: { kind: 'k-word', text: String(g) },
      hint: 'Count each group. Find the one that matches the number.',
      explain: `This group has ${WORDS[g]}.`,
    });
  }
  return kq(rng, {
    key: `knum-${n}`,
    prompt: `Tap the number ${WORDS[n]}.`,
    answer: String(n),
    // The challenge level offers flipped numbers (12 and 21) and close teens, the ones that get mixed up.
    wrong: n === 0 ? ['6', '8', '9'] : level === 3 ? teenTraps(rng, n) : nearNumbers(rng, n, Math.max(max, 9), level === 2 ? 10 : 1),
    hint: n === 20 ? 'Twenty starts with a 2.' : n >= 10 ? 'Numbers from ten to nineteen start with a 1.' : 'Look carefully at the shape of each number.',
    explain: `That's ${WORDS[n]}.`,
  });
}

/** Wrong choices for a teen number: its flip (14 and 41), then the numbers next to it. */
function teenTraps(rng: Rng, n: number): string[] {
  const flip = +String(n).split('').reverse().join('');
  const near = shuffle(rng, [n - 1, n + 1].filter((x) => x >= 10 && x <= 20 && x !== n));
  return [...new Set([flip !== n && flip !== 2 ? flip : n - 10, ...near])].map(String);
}

// ---------- More and less ----------

/** Three different numbers in a row, `gap` apart, starting somewhere from `min` so the biggest is at most `max`. */
function three(rng: Rng, gap: number, min: number, max: number): number[] {
  const lo = int(rng, min, max - 2 * gap);
  return [lo, lo + gap, lo + 2 * gap];
}

function compare(level: number, rng: Rng): Question {
  const item = pick(rng, COUNTABLE);
  const gap = level === 0 ? int(rng, 2, 3) : level === 1 ? int(rng, 1, 2) : 1;
  const max = level === 0 ? 8 : level === 1 ? 10 : level === 2 ? 12 : 15;
  const more = rng() < 0.6;
  const most = more ? 'most' : 'fewest';
  if (level === 3 && rng() < 0.3) {
    // The same: find the group that matches.
    const n = int(rng, 5, 12);
    const other = pick(rng, COUNTABLE.filter((x) => x !== item));
    return kq(rng, {
      key: `kcmpsame-${n}-${item}-${other}`,
      prompt: `Which group has the same number as the ${plural(nameOf(item))}?`,
      visual: { kind: 'k-groups', groups: [`${n}×${item}`] },
      answer: `${n}×${other}`,
      wrong: [`${n - 1}×${other}`, `${n + 1}×${other}`],
      hint: `Count the ${plural(nameOf(item))} first. Then find a group with the same count.`,
      explain: `${WORDS[n][0].toUpperCase() + WORDS[n].slice(1)} and ${WORDS[n]} are the same.`,
    });
  }
  if (level >= 2 && rng() < 0.4) {
    // Compare three numerals.
    const nums = three(rng, level === 2 ? int(rng, 1, 2) : 1, level === 2 ? 1 : 8, 20);
    const a = more ? nums[2] : nums[0];
    return kq(rng, {
      key: `kcmpn-${nums.join('-')}-${more}`,
      prompt: `Which number is the ${more ? 'biggest' : 'smallest'}?`,
      answer: String(a),
      wrong: nums.filter((x) => x !== a).map(String),
      hint: more ? 'Count up from one. The number you say last is the biggest.' : 'Count up from one. The number you say first is the smallest.',
      explain: `${WORDS[a][0].toUpperCase() + WORDS[a].slice(1)} is the ${more ? 'biggest' : 'smallest'}.`,
    });
  }
  const nums = three(rng, gap, 1, max);
  const a = more ? nums[2] : nums[0];
  return kq(rng, {
    key: `kcmp-${nums.join('-')}-${more}-${item}`,
    prompt: `Which has the ${most} ${plural(nameOf(item))}?`,
    answer: `${a}×${item}`,
    wrong: nums.filter((x) => x !== a).map((x) => `${x}×${item}`),
    hint: more ? 'The most means the biggest group. Count each group.' : 'The fewest means the smallest group. Count each group.',
    explain: `${WORDS[a][0].toUpperCase() + WORDS[a].slice(1)} is the ${most}.`,
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

const CORES = [['AB'], ['AAB', 'ABB', 'AB'], ['ABC', 'AABB', 'ABB', 'AAB'], ['ABCD', 'AABC', 'ABBC', 'ABCC', 'AABB', 'ABAC']];

function patterns(level: number, rng: Rng): Question {
  const set = shuffle(rng, pick(rng, PATTERN_SETS));
  const core = pick(rng, CORES[level]).split('').map((c) => set[c.charCodeAt(0) - 65]);
  // Always show at least two full repeats, so she can check the rule.
  const shown = Math.min(Math.max(level === 0 ? 5 : int(rng, 5, 7), 2 * core.length), 8);
  const row = Array.from({ length: shown + 1 }, (_, i) => core[i % core.length]);
  // At the challenge level the missing one can be in the middle of the pattern, not just at the end.
  const gap = level === 3 && rng() < 0.5 ? int(rng, core.length, shown - 1) : shown;
  const answer = row[gap];
  const used = [...new Set(core)];
  const wrong = [...shuffle(rng, used.filter((x) => x !== answer)), ...others(set, ...used)];
  const items = row.slice(0, shown + (gap < shown ? 1 : 0)).map((x, i) => (i === gap ? '❓' : x));
  if (gap === shown) items.push('❓');
  return kq(rng, {
    key: `kpat-${items.join('')}`,
    prompt: gap === shown ? 'What comes next in the pattern?' : 'What is missing in the pattern?',
    visual: { kind: 'k-row', items },
    answer,
    wrong: wrong.slice(0, 2),
    hint: 'Say the pattern out loud and point to each one. What do you say next?',
    explain: `The pattern goes ${core.map(nameOf).join(', ')}, then starts again.`,
  });
}

// ---------- Shapes ----------

const COLOURS = ['red', 'blue', 'yellow', 'green', 'purple', 'pink'];
const SHAPES_BY_LEVEL = [['circle', 'square', 'triangle'], ['circle', 'square', 'triangle', 'rectangle'], ['circle', 'square', 'triangle', 'rectangle', 'star', 'heart', 'oval'], ['circle', 'square', 'triangle', 'rectangle', 'oval']];

/** Things from home and the world, by the shape they look like (2-D) or are (3-D). */
const SHAPE_THINGS: { shape: string; things: string[]; clue: string }[] = [
  { shape: 'circle', things: ['🍪', '🕰️', '🍕'], clue: 'round and flat' },
  { shape: 'ball', things: ['🌍', '🔮', '🍊'], clue: 'round all over, so it rolls every way' },
  { shape: 'box', things: ['🎁', '🎲', '🧊'], clue: 'flat sides and corners, so it stacks' },
  { shape: 'can', things: ['🕯️', '🥁'], clue: 'round at the ends, with flat tops' },
  { shape: 'cone', things: ['🍦', '🎉'], clue: 'round at the bottom and pointy at the top' },
];
const SIDES: Record<string, string> = { triangle: '3 sides', square: '4 sides the same', rectangle: '2 long sides and 2 short sides', circle: 'no corners', oval: 'no corners, like an egg' };

function shapes(level: number, rng: Rng): Question {
  if (level === 3 && rng() < 0.6) return shapeThings(rng);
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
    hint: SIDES[shape] ? `${shape === 'oval' ? 'An' : 'A'} ${shape} has ${SIDES[shape]}.` : `Look for the ${shape} shape.`,
    explain: `That's the ${shape}.`,
  });
}

/** Shapes in the world: which thing is shaped like a ball, a box, a can or a cone? */
function shapeThings(rng: Rng): Question {
  const set = shuffle(rng, SHAPE_THINGS.slice(1));
  const [want, ...rest] = set;
  const answer = pick(rng, want.things);
  return kq(rng, {
    key: `kshapething-${want.shape}-${answer}`,
    prompt: `Which one is shaped like a ${want.shape}?`,
    answer,
    wrong: rest.slice(0, 2).map((s) => pick(rng, s.things)),
    hint: `A ${want.shape} is ${want.clue}.`,
    explain: `The ${nameOf(answer)} is shaped like a ${want.shape}.`,
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

/** Groups that are close together, for the challenge level: she has to think about what makes them different. */
const CLOSE: [string, string[], string, string[]][] = [
  ['fruit', ['🍎', '🍌', '🍇', '🍓', '🍊', '🍐', '🍒'], 'vegetables', ['🥕', '🥦', '🌽', '🥒', '🧅']],
  ['farm animals', ['🐄', '🐷', '🐑', '🐔', '🐴', '🐐'], 'wild animals', ['🦁', '🐘', '🦒', '🐒', '🦊', '🐻']],
  ['winter clothes', ['🧤', '🧣', '🧥'], 'summer clothes', ['🩳', '👒', '🕶️']],
  ['animals that fly', ['🐦', '🦆', '🦉', '🦋', '🐝'], 'animals that swim', ['🐟', '🐳', '🐙', '🦈']],
  ['things that go on roads', ['🚗', '🚌', '🚲', '🚜'], 'things that go in the sky', ['✈️', '🚀']],
];

/** Airplanes and rockets are in the sky too, so those two groups never meet in one question. */
const clash = (a: string, b: string) => [a, b].includes('things in the sky') && [a, b].includes('things that go');

function sorting(level: number, rng: Rng): Question {
  if (level === 3 && rng() < 0.7) {
    const pair = pick(rng, CLOSE);
    const flip = rng() < 0.5;
    const [g, same, h, odds] = flip ? [pair[2], pair[3], pair[0], pair[1]] : [pair[0], pair[1], pair[2], pair[3]];
    const odd = pick(rng, odds);
    const two = shuffle(rng, same).slice(0, 2);
    return kq(rng, {
      key: `ksortclose-${g}-${odd}`,
      prompt: 'Which one does not belong?',
      answer: odd,
      wrong: two,
      hint: `Look closely. Two of these are ${g}.`,
      explain: `The ${nameOf(odd)} is not one of the ${g}. It goes with the ${h}.`,
    });
  }
  const names = Object.keys(GROUPS).slice(0, level === 0 ? 4 : 5);
  let [g, h] = shuffle(rng, names);
  while (clash(g, h)) [g, h] = shuffle(rng, names);
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
    wrong: shuffle(rng, names.filter((n) => n !== g && !clash(n, g))).slice(0, 2).map((n) => pick(rng, GROUPS[n])),
    hint: `These are all ${g}.`,
    explain: `The ${nameOf(same[3])} goes with the other ${g}.`,
  });
}

const K = 'Alberta Kindergarten Mathematics (2022)';

export const KMATH_SKILLS: Skill[] = [
  { id: 'k-count', subject: S, name: 'Counting', blurb: 'Count the pictures', strand: 'Number', outcome: `${K}: Children count to 20 and connect counting to quantity.`, icon: '🔢', levels: ['Count to 5', 'Count to 10', 'Count to 20', 'Count on and one more'], generate: counting },
  { id: 'k-numbers', subject: S, name: 'Numbers', blurb: 'Find the number', strand: 'Number', outcome: `${K}: Children recognize and name numerals to 20.`, icon: '7️⃣', levels: ['0 to 5', '0 to 10', '10 to 20', 'Tricky teens'], generate: numbers },
  { id: 'k-compare', subject: S, name: 'More or less', blurb: 'Which group has more?', strand: 'Number', outcome: `${K}: Children compare quantities using more, fewer and the same.`, icon: '⚖️', levels: ['Easy to see', 'Count to check', 'Very close', 'Most, fewest, the same'], generate: compare },
  { id: 'k-patterns', subject: S, name: 'Patterns', blurb: 'What comes next?', strand: 'Patterns', outcome: `${K}: Children recognize, copy and extend repeating patterns.`, icon: '🔁', levels: ['AB patterns', 'AAB and ABB', 'ABC patterns', 'Missing piece'], generate: patterns },
  { id: 'k-shapes', subject: S, name: 'Shapes', blurb: 'Circles, squares and triangles', strand: 'Geometry', outcome: `${K}: Children recognize and describe 2-D shapes and 3-D objects.`, icon: '🔺', levels: ['3 shapes', 'Add rectangles', 'More shapes', 'Shapes around us'], generate: shapes },
  { id: 'k-sort', subject: S, name: 'Sorting', blurb: 'What goes together?', strand: 'Geometry', outcome: `${K}: Children sort objects by one attribute and explain the rule.`, icon: '🧺', levels: ['Odd one out', 'Goes together', 'Mixed', 'Look closely'], generate: sorting },
];
