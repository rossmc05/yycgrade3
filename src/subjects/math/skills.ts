// Math Quest skills, one per Alberta grade 3 mathematics learning outcome (2022 program).

import { fmt, int, options, pick, shuffle } from '../../engine/random';
import type { Question, Rng, Skill } from '../../engine/types';

const S = 'math' as const;

// ---------- Place value ----------

const PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands'];

function placeValue(level: number, rng: Rng): Question {
  const digits = [3, 4, 5, 5, 5][level];
  const n = int(rng, 10 ** (digits - 1), 10 ** digits - 1);
  const kind = level < 3 ? pick(rng, ['value', 'digit', 'build'] as const) : pick(rng, ['value', 'build', 'expanded'] as const);
  const s = String(n);
  if (kind === 'value' || kind === 'digit') {
    // Choose a place whose digit is not 0 so the value is meaningful.
    let p = int(rng, 0, digits - 1);
    while (s[digits - 1 - p] === '0') p = (p + 1) % digits;
    const d = Number(s[digits - 1 - p]);
    if (kind === 'digit') {
      return {
        key: `pv-digit-${n}-${p}`,
        prompt: `Which digit is in the ${PLACES[p]} place in ${fmt(n)}?`,
        input: 'number',
        answer: String(d),
        hint: `Count places from the right: ones, tens, hundreds${digits > 3 ? ', thousands' : ''}${digits > 4 ? ', ten thousands' : ''}.`,
        explain: `In ${fmt(n)}, the ${PLACES[p]} digit is ${d}.`,
      };
    }
    const value = d * 10 ** p;
    return {
      key: `pv-value-${n}-${p}`,
      prompt: `What is the value of the ${d} in ${fmt(n)}?`,
      input: 'choice',
      choices: options(rng, fmt(value), [String(d), fmt(d * 10 ** ((p + 1) % digits)), fmt(d * 10 ** Math.max(p - 1, 0)), fmt(d * 10 ** (p + 1))]),
      answer: fmt(value),
      hint: `The ${d} is in the ${PLACES[p]} place. Its value is ${d} × ${fmt(10 ** p)}.`,
      explain: `The ${d} is in the ${PLACES[p]} place, so it is worth ${d} × ${fmt(10 ** p)} = ${fmt(value)}.`,
    };
  }
  if (kind === 'build' && level === 0) {
    const h = Number(s[0]);
    const t = Number(s[1]);
    const o = Number(s[2]);
    return {
      key: `pv-blocks-${n}`,
      prompt: 'What number do these blocks show?',
      visual: { kind: 'base-ten', hundreds: h, tens: t, ones: o },
      input: 'number',
      answer: String(n),
      hint: 'Big squares are hundreds, sticks are tens, little cubes are ones.',
      explain: `${h} hundreds + ${t} tens + ${o} ones = ${n}.`,
    };
  }
  // Expanded form, e.g. 40 000 + 3 000 + 200 + 7 = ?
  const parts = s
    .split('')
    .map((c, i) => Number(c) * 10 ** (digits - 1 - i))
    .filter((v) => v > 0);
  const order = level >= 4 ? shuffle(rng, parts) : parts;
  return {
    key: `pv-expanded-${n}-${order.join('.')}`,
    prompt: `What number is ${order.map(fmt).join(' + ')}?`,
    input: 'number',
    answer: String(n),
    hint: 'Line up each part by its place: ten thousands, thousands, hundreds, tens, ones. A missing place gets a 0.',
    explain: `${order.map(fmt).join(' + ')} = ${fmt(n)}.`,
  };
}

function compareNumbers(level: number, rng: Rng): Question {
  const digits = [2, 3, 4, 5][level];
  const a = int(rng, 10 ** (digits - 1), 10 ** digits - 1);
  // Make the numbers close at higher levels so place value matters.
  let b = level >= 2 ? a + pick(rng, [-1, 1]) * pick(rng, [1, 10, 100, 1000].filter((x) => x < 10 ** digits)) : int(rng, 10 ** (digits - 1), 10 ** digits - 1);
  if (rng() < 0.12) b = a;
  if (b < 10 ** (digits - 1) || b >= 10 ** digits) b = a;
  const sign = a < b ? '<' : a > b ? '>' : '=';
  return {
    key: `cmp-${a}-${b}`,
    prompt: `Choose the sign: ${fmt(a)} ▢ ${fmt(b)}`,
    input: 'choice',
    choices: ['<', '>', '='],
    answer: sign,
    hint: 'Compare digits from the left. The first place where they differ decides it. The open side of < or > faces the bigger number.',
    explain: a === b ? `They are the same number, so ${fmt(a)} = ${fmt(b)}.` : `${fmt(a)} ${sign} ${fmt(b)}.`,
  };
}

function rounding(level: number, rng: Rng): Question {
  const to = [10, 100, 1000, 10000][level];
  const n = int(rng, to + 1, Math.min(to * 100, 99999));
  const r = Math.round(n / to) * to;
  const down = Math.floor(n / to) * to;
  const up = down + to;
  return {
    key: `round-${n}-${to}`,
    prompt: `Round ${fmt(n)} to the nearest ${fmt(to)}.`,
    input: 'choice',
    choices: options(rng, fmt(r), [fmt(down), fmt(up), fmt(Math.round(n / (to / 10 || 1)) * (to / 10 || 1)), fmt(down - to)]),
    answer: fmt(r),
    hint: `It is between ${fmt(down)} and ${fmt(up)}. Halfway is ${fmt(down + to / 2)}. Halfway or more rounds up.`,
    explain: `${fmt(n)} is between ${fmt(down)} and ${fmt(up)}; it is closer to ${fmt(r)}${n - down === to / 2 ? ' (exactly halfway rounds up)' : ''}.`,
  };
}

// ---------- Money ----------

const COIN_VALUE: Record<string, number> = { nickel: 5, dime: 10, quarter: 25, loonie: 100, toonie: 200, five: 500, ten: 1000, twenty: 2000 };

function money(level: number, rng: Rng): Question {
  if (level <= 1) {
    const kinds = level === 0 ? ['nickel', 'dime'] : ['nickel', 'dime', 'quarter'];
    const count = int(rng, 3, level === 0 ? 6 : 8);
    const coins = Array.from({ length: count }, () => pick(rng, kinds)).sort((x, y) => COIN_VALUE[y] - COIN_VALUE[x]);
    const total = coins.reduce((t, c) => t + COIN_VALUE[c], 0);
    return {
      key: `money-c-${coins.join('.')}`,
      prompt: 'How many cents are these coins worth?',
      visual: { kind: 'coins', coins },
      input: 'number',
      unit: '¢',
      answer: String(total),
      hint: 'Start with the biggest coins. Quarters are 25¢, dimes 10¢, nickels 5¢. Count on.',
      explain: `${coins.map((c) => `${COIN_VALUE[c]}`).join(' + ')} = ${total}¢.`,
    };
  }
  if (level === 2) {
    const kinds = ['loonie', 'toonie', 'five', 'ten', 'twenty'];
    const count = int(rng, 2, 6);
    const coins = Array.from({ length: count }, () => pick(rng, kinds)).sort((x, y) => COIN_VALUE[y] - COIN_VALUE[x]);
    const total = coins.reduce((t, c) => t + COIN_VALUE[c], 0) / 100;
    return {
      key: `money-d-${coins.join('.')}`,
      prompt: 'How many dollars is this money worth?',
      visual: { kind: 'coins', coins },
      input: 'number',
      unit: '$',
      answer: String(total),
      hint: 'A loonie is $1, a toonie is $2, then $5, $10 and $20 bills. Start with the biggest.',
      explain: `${coins.map((c) => `$${COIN_VALUE[c] / 100}`).join(' + ')} = $${total}.`,
    };
  }
  // Level 3: can you afford it / change from a purchase.
  const price = int(rng, 2, 18);
  const paid = pick(rng, [5, 10, 20].filter((v) => v > price));
  const item = pick(rng, ['a hockey puck', 'a book', 'a toy car', 'a bag of popcorn', 'a pack of stickers', 'a water bottle']);
  return {
    key: `money-change-${price}-${paid}`,
    prompt: `You buy ${item} for $${price} and pay with $${paid}. How much change do you get?`,
    input: 'number',
    unit: '$',
    answer: String(paid - price),
    hint: `Count up from $${price} to $${paid}.`,
    explain: `$${paid} − $${price} = $${paid - price}.`,
  };
}

// ---------- Addition and subtraction ----------

function addSub(level: number, rng: Rng): Question {
  const op = pick(rng, ['+', '-'] as const);
  let a: number;
  let b: number;
  if (level === 0) {
    // Two-digit, no regrouping.
    a = int(rng, 20, 89);
    b = op === '+' ? int(rng, 10, 99 - a) : int(rng, 10, a - 10);
    if (op === '+' && (a % 10) + (b % 10) >= 10) b -= b % 10;
    if (op === '-' && b % 10 > a % 10) b -= b % 10;
  } else if (level === 1) {
    // Two-digit with regrouping.
    a = int(rng, 25, 89);
    b = op === '+' ? int(rng, 12, 99) : int(rng, 12, a - 1);
  } else if (level === 2) {
    a = int(rng, 120, 899);
    b = op === '+' ? int(rng, 100, 999 - a) : int(rng, 100, a - 10);
  } else {
    // Three-digit with regrouping across zeros, up to 1000.
    a = op === '-' ? pick(rng, [int(rng, 300, 1000), int(rng, 3, 9) * 100 + int(rng, 0, 9)]) : int(rng, 150, 850);
    b = op === '+' ? int(rng, 100, 1000 - a) : int(rng, 101, a - 1);
  }
  if (b < 0) b = 0;
  const ans = op === '+' ? a + b : a - b;
  const sym = op === '+' ? '+' : '−';
  const story = level >= 2 && rng() < 0.35;
  const prompt = story
    ? op === '+'
      ? `The Blue Raptors sold ${a} tickets on Friday and ${b} on Saturday. How many tickets in all?`
      : `A library had ${a} books. It lent out ${b}. How many books are left?`
    : `${a} ${sym} ${b} = ▢`;
  return {
    key: `as-${a}${op}${b}`,
    prompt,
    input: 'number',
    answer: String(ans),
    hint: op === '+'
      ? 'Add the ones first. If they make 10 or more, regroup 10 ones into 1 ten. Then tens, then hundreds.'
      : 'Subtract the ones first. If the top ones digit is too small, regroup 1 ten into 10 ones.',
    explain: `${a} ${sym} ${b} = ${ans}. Check: ${op === '+' ? `${ans} − ${b} = ${a}` : `${ans} + ${b} = ${a}`}.`,
  };
}

function estimate(level: number, rng: Rng): Question {
  const to = level === 0 ? 10 : 100;
  const a = level === 0 ? int(rng, 11, 89) : level === 2 ? int(rng, 400, 890) : int(rng, 110, 890);
  const b = level === 0 ? int(rng, 11, 89) : int(rng, 110, level === 2 ? a - 150 : 890);
  const op = level === 2 ? '-' : '+';
  const ra = Math.round(a / to) * to;
  const rb = Math.round(b / to) * to;
  const est = op === '+' ? ra + rb : ra - rb;
  return {
    key: `est-${a}${op}${b}`,
    prompt: `Round each number to the nearest ${to}, then estimate: ${a} ${op === '+' ? '+' : '−'} ${b}`,
    input: 'choice',
    choices: options(rng, String(est), [String(est + to), String(est - to), String(op === '+' ? a + b : a - b), String(est + 2 * to)]),
    answer: String(est),
    hint: `${a} rounds to ${ra}. Now round ${b}.`,
    explain: `${a} ≈ ${ra} and ${b} ≈ ${rb}, so the estimate is ${ra} ${op === '+' ? '+' : '−'} ${rb} = ${est}.`,
  };
}

// ---------- Multiplication and division ----------

const FACT_SETS = [[2, 5, 10], [2, 3, 4, 5, 10], [0, 1, 2, 3, 4, 5, 6, 10], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]];

function multiply(level: number, rng: Rng): Question {
  const set = FACT_SETS[Math.min(level, 3)];
  const a = pick(rng, set);
  const b = int(rng, level === 0 ? 1 : 0, 10);
  const [x, y] = rng() < 0.5 ? [a, b] : [b, a];
  const p = x * y;
  if (level === 0 && x > 0 && y > 0 && x <= 6 && y <= 10) {
    return {
      key: `mul-arr-${x}x${y}`,
      prompt: `${x} rows of ${y}. How many dots? (${x} × ${y})`,
      visual: { kind: 'array', rows: x, cols: y },
      input: 'number',
      answer: String(p),
      hint: `Skip count by ${y}, ${x} times.`,
      explain: `${x} × ${y} = ${p}.`,
    };
  }
  if (level === 1 && rng() < 0.4 && x > 0 && y > 0) {
    return {
      key: `mul-grp-${x}x${y}`,
      prompt: `${x} groups of ${y}. How many in all?`,
      visual: { kind: 'groups', groups: x, each: y },
      input: 'number',
      answer: String(p),
      hint: `Add ${y} again and again, ${x} times, or skip count.`,
      explain: `${x} groups of ${y} is ${x} × ${y} = ${p}.`,
    };
  }
  if (level >= 4) {
    // Missing factor.
    const f = int(rng, 1, 10);
    const g = int(rng, 1, 10);
    return {
      key: `mul-miss-${f}x${g}`,
      prompt: `${f} × ▢ = ${f * g}`,
      input: 'number',
      answer: String(g),
      hint: `Think: what times ${f} makes ${f * g}? Or divide: ${f * g} ÷ ${f}.`,
      explain: `${f} × ${g} = ${f * g}, so the missing factor is ${g}.`,
    };
  }
  return {
    key: `mul-${x}x${y}`,
    prompt: `${x} × ${y} = ▢`,
    input: 'number',
    answer: String(p),
    hint: x === 0 || y === 0 ? 'Any number times 0 is 0.' : `Skip count by ${Math.max(x, y)}, ${Math.min(x, y)} times. Or use a fact you know: ${Math.min(x, y)} × ${Math.max(x, y)} is the same.`,
    explain: `${x} × ${y} = ${p}.`,
  };
}

function divide(level: number, rng: Rng): Question {
  const set = FACT_SETS[Math.min(level + 1, 3)].filter((v) => v > 0);
  const d = pick(rng, set);
  const q = int(rng, 1, 10);
  const n = d * q;
  if (level === 0) {
    const thing = pick(rng, ['cookies', 'stickers', 'hockey cards', 'marbles', 'crayons']);
    return {
      key: `div-share-${n}/${d}`,
      prompt: `Share ${n} ${thing} equally among ${d} friends. How many does each friend get?`,
      input: 'number',
      answer: String(q),
      hint: `Think: ${d} × ▢ = ${n}.`,
      explain: `${n} ÷ ${d} = ${q}, because ${d} × ${q} = ${n}.`,
    };
  }
  if (level === 3) {
    // Remainders.
    const dd = int(rng, 2, 9);
    const qq = int(rng, 1, 9);
    const r = int(rng, 1, dd - 1);
    const total = dd * qq + r;
    const thing = pick(rng, ['apples', 'pencils', 'pucks', 'books']);
    return {
      key: `div-rem-${total}/${dd}`,
      prompt: `${total} ${thing} are put into bags of ${dd}. How many ${thing} are left over?`,
      input: 'number',
      answer: String(r),
      hint: `Find the biggest multiple of ${dd} that fits in ${total}.`,
      explain: `${dd} × ${qq} = ${dd * qq}, and ${total} − ${dd * qq} = ${r} left over. So ${total} ÷ ${dd} = ${qq} R${r}.`,
    };
  }
  if (level === 4) {
    // Fact families.
    return {
      key: `div-fam-${d}x${q}`,
      prompt: `${d} × ${q} = ${n}. So ${n} ÷ ${q} = ▢`,
      input: 'number',
      answer: String(d),
      hint: 'Multiplication and division undo each other. Use the fact you were given.',
      explain: `${d} × ${q} = ${n}, so ${n} ÷ ${q} = ${d}.`,
    };
  }
  return {
    key: `div-${n}/${d}`,
    prompt: `${n} ÷ ${d} = ▢`,
    input: 'number',
    answer: String(q),
    hint: `Think of multiplication: ${d} × ▢ = ${n}.`,
    explain: `${n} ÷ ${d} = ${q}, because ${d} × ${q} = ${n}.`,
  };
}

// ---------- Fractions ----------

const DENOMS = [2, 3, 4, 6, 8, 5, 10, 12];
const NAMES: Record<number, [string, string]> = {
  2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['fourth', 'fourths'], 5: ['fifth', 'fifths'], 6: ['sixth', 'sixths'],
  8: ['eighth', 'eighths'], 10: ['tenth', 'tenths'], 12: ['twelfth', 'twelfths'],
};
const NUMWORD = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

export function fractionName(n: number, d: number): string {
  return `${NUMWORD[n]} ${n === 1 ? NAMES[d][0] : NAMES[d][1]}`;
}

function fractions(level: number, rng: Rng): Question {
  const d = pick(rng, level === 0 ? [2, 3, 4] : DENOMS);
  if (level <= 1) {
    const n = int(rng, 1, d);
    return {
      key: `fr-name-${n}/${d}`,
      prompt: 'What fraction of the bar is shaded?',
      visual: { kind: 'fraction-bar', parts: d, shaded: n },
      input: 'choice',
      choices: options(rng, `${n}/${d}`, [`${d - n || 1}/${d}`, `${n}/${d + 1}`, `${d}/${n}`, `${n + 1}/${d}`, `1/${d}`]),
      answer: `${n}/${d}`,
      hint: `Count all the equal parts (the bottom number), then the shaded parts (the top number).`,
      explain: `${n} of ${d} equal parts are shaded: ${n}/${d}, ${fractionName(n, d)}${n === d ? ', which is one whole' : ''}.`,
    };
  }
  if (level === 2) {
    // Same denominator.
    const a = int(rng, 1, d);
    let b = int(rng, 1, d);
    if (a === b && rng() < 0.7) b = a === d ? a - 1 : a + 1;
    const sign = a < b ? '<' : a > b ? '>' : '=';
    return {
      key: `fr-cmpd-${a}-${b}-${d}`,
      prompt: `Choose the sign: ${a}/${d} ▢ ${b}/${d}`,
      visual: { kind: 'fraction-compare', a: [a, d], b: [b, d] },
      input: 'choice',
      choices: ['<', '>', '='],
      answer: sign,
      hint: 'The parts are the same size, so more parts means a bigger fraction.',
      explain: `Both are ${NAMES[d][1]}. ${a} ${NAMES[d][a === 1 ? 0 : 1]} ${sign} ${b} ${NAMES[d][b === 1 ? 0 : 1]}.`,
    };
  }
  if (level === 3) {
    // Same numerator, different denominators.
    const n = int(rng, 1, 3);
    const [d1, d2] = shuffle(rng, DENOMS.filter((x) => x > n)).slice(0, 2);
    const sign = d1 < d2 ? '>' : '<';
    return {
      key: `fr-cmpn-${n}-${d1}-${d2}`,
      prompt: `Choose the sign: ${n}/${d1} ▢ ${n}/${d2}`,
      visual: { kind: 'fraction-compare', a: [n, d1], b: [n, d2] },
      input: 'choice',
      choices: ['<', '>', '='],
      answer: sign,
      hint: 'Same number of parts. The more pieces a whole is cut into, the smaller each piece is.',
      explain: `${NAMES[Math.min(d1, d2)][1]} are bigger than ${NAMES[Math.max(d1, d2)][1]}, so ${n}/${d1} ${sign} ${n}/${d2}.`,
    };
  }
  if (level === 4) {
    // Number line.
    const n = int(rng, 1, d - 1);
    return {
      key: `fr-line-${n}/${d}`,
      prompt: 'What fraction is marked on the number line?',
      visual: { kind: 'number-line', denominator: d, mark: n },
      input: 'choice',
      choices: options(rng, `${n}/${d}`, [`${n + 1}/${d}`, `${n}/${d + 1}`, `${Math.max(n - 1, 1)}/${d}`, `1/${n + 1}`]),
      answer: `${n}/${d}`,
      hint: `The space from 0 to 1 is cut into ${d} equal jumps. Count the jumps to the dot.`,
      explain: `The dot is ${n} jumps of 1/${d} from 0: ${n}/${d}.`,
    };
  }
  // Benchmarks 0, 1/2, 1.
  const n = int(rng, 0, d);
  const v = n / d;
  // Exactly 1/4 or 3/4 is halfway between two benchmarks, so ask a number-line question instead.
  if (v === 0.25 || v === 0.75) return fractions(4, rng);
  const ans = v < 0.25 ? '0' : v > 0.75 ? '1' : '1/2';
  return {
    key: `fr-bench-${n}/${d}`,
    prompt: `Is ${n}/${d} closest to 0, 1/2, or 1?`,
    visual: { kind: 'fraction-bar', parts: d, shaded: n },
    input: 'choice',
    choices: ['0', '1/2', '1'],
    answer: ans,
    hint: `Half of ${d} is ${d / 2}. Compare ${n} to ${d / 2}.`,
    explain: `${n}/${d} is closest to ${ans}.`,
  };
}

// ---------- Algebra: equations ----------

function equations(level: number, rng: Rng): Question {
  if (level === 0) {
    const a = int(rng, 2, 15);
    const b = int(rng, 2, 15);
    return {
      key: `eq-add-${a}-${b}`,
      prompt: `${a} + ▢ = ${a + b}`,
      visual: { kind: 'balance', left: `${a} + ▢`, right: `${a + b}` },
      input: 'number',
      answer: String(b),
      hint: `Count up from ${a} to ${a + b}.`,
      explain: `${a} + ${b} = ${a + b}, so ▢ = ${b}.`,
    };
  }
  if (level === 1) {
    const c = int(rng, 15, 90);
    const b = int(rng, 3, c - 5);
    const leftUnknown = rng() < 0.5;
    return {
      key: `eq-sub-${c}-${b}-${leftUnknown}`,
      prompt: leftUnknown ? `▢ − ${b} = ${c - b}` : `${c - b} = ${c} − ▢`,
      visual: leftUnknown ? { kind: 'balance', left: `▢ − ${b}`, right: `${c - b}` } : { kind: 'balance', left: `${c - b}`, right: `${c} − ▢` },
      input: 'number',
      answer: String(leftUnknown ? c : b),
      hint: 'Both sides must balance. Use the opposite operation to find the missing number.',
      explain: leftUnknown ? `${c} − ${b} = ${c - b}, so ▢ = ${c}.` : `${c} − ${b} = ${c - b}, so ▢ = ${b}.`,
    };
  }
  if (level === 2) {
    // Two expressions: 8 + 5 = ▢ + 7
    const a = int(rng, 3, 20);
    const b = int(rng, 3, 20);
    const c = int(rng, 1, a + b - 1);
    return {
      key: `eq-two-${a}-${b}-${c}`,
      prompt: `${a} + ${b} = ▢ + ${c}`,
      visual: { kind: 'balance', left: `${a} + ${b}`, right: `▢ + ${c}` },
      input: 'number',
      answer: String(a + b - c),
      hint: `Work out the left side first: ${a} + ${b}. Then what plus ${c} makes that?`,
      explain: `${a} + ${b} = ${a + b}. ${a + b - c} + ${c} = ${a + b}, so ▢ = ${a + b - c}.`,
    };
  }
  // Level 3: multiplication or division with an unknown, or a story.
  const f = int(rng, 2, 10);
  const g = int(rng, 2, 10);
  const form = pick(rng, ['m1', 'm2', 'd1', 'story'] as const);
  if (form === 'story') {
    return {
      key: `eq-story-${f}-${g}`,
      prompt: `Some players split into ${f} equal teams with ${g} players each. Which equation finds the number of players, ▢?`,
      input: 'choice',
      choices: options(rng, `▢ ÷ ${f} = ${g}`, [`▢ + ${f} = ${g}`, `${f} ÷ ▢ = ${g}`, `▢ − ${g} = ${f}`]),
      answer: `▢ ÷ ${f} = ${g}`,
      hint: 'The total is split into equal teams. That is division.',
      explain: `The total divided into ${f} teams gives ${g} each: ▢ ÷ ${f} = ${g}, so there are ${f * g} players.`,
    };
  }
  const prompt = form === 'm1' ? `▢ × ${g} = ${f * g}` : form === 'm2' ? `${f * g} = ${f} × ▢` : `${f * g} ÷ ▢ = ${g}`;
  const answer = form === 'm1' ? f : form === 'm2' ? g : f;
  return {
    key: `eq-${form}-${f}-${g}`,
    prompt,
    input: 'number',
    answer: String(answer),
    hint: 'Use a multiplication fact you know, or the fact family.',
    explain: `${f} × ${g} = ${f * g}, so ▢ = ${answer}.`,
  };
}

// ---------- Patterns: numerical sequences ----------

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];

function sequences(level: number, rng: Rng): Question {
  if (level === 0) {
    const kind = pick(rng, ['odd-even', 'ordinal'] as const);
    if (kind === 'odd-even') {
      const n = int(rng, 11, 999);
      const odd = n % 2 === 1;
      return {
        key: `seq-oe-${n}`,
        prompt: `Is ${n} odd or even?`,
        input: 'choice',
        choices: ['odd', 'even'],
        answer: odd ? 'odd' : 'even',
        hint: 'Look only at the ones digit. Even numbers end in 0, 2, 4, 6 or 8.',
        explain: `${n} ends in ${n % 10}, so it is ${odd ? 'odd' : 'even'}.`,
      };
    }
    const step = pick(rng, [2, 5, 10]);
    const start = step * int(rng, 1, 5);
    const terms = Array.from({ length: 6 }, (_, i) => start + i * step);
    const pos = int(rng, 1, 5);
    return {
      key: `seq-ord-${start}-${step}-${pos}`,
      prompt: `${terms.join(', ')}. What is the ${ORDINALS[pos]} number?`,
      input: 'number',
      answer: String(terms[pos]),
      hint: 'First is the one at the start. Count along.',
      explain: `The ${ORDINALS[pos]} number is ${terms[pos]}.`,
    };
  }
  if (level === 3) {
    const kind = pick(rng, ['finite', 'infinite'] as const);
    const finite = ['a countdown from 10 to 0', 'the days of the week', 'the pages in a book', 'the months in a year', 'the players on a hockey team'];
    const infinite = ['the counting numbers 1, 2, 3, …', 'the even numbers 2, 4, 6, …', 'counting by 5s forever: 5, 10, 15, …', 'the odd numbers 1, 3, 5, …'];
    const item = kind === 'finite' ? pick(rng, finite) : pick(rng, infinite);
    return {
      key: `seq-fin-${item}`,
      prompt: `Is ${item} a finite or infinite sequence?`,
      input: 'choice',
      choices: ['finite', 'infinite'],
      answer: kind,
      hint: 'Finite means it has an end. Infinite means it goes on forever.',
      explain: kind === 'finite' ? `${item} has an end, so it is finite.` : `${item} never ends, so it is infinite.`,
    };
  }
  // Skip counting and rules, with one missing term.
  const steps = level === 1 ? [2, 3, 4, 5, 10, 25] : [3, 4, 6, 7, 8, 9, 11, 50, 100];
  const step = pick(rng, steps);
  const down = level === 2 && rng() < 0.4;
  const start = down ? step * int(rng, 7, 12) : step * int(rng, 0, 5);
  const terms = Array.from({ length: 6 }, (_, i) => start + (down ? -1 : 1) * i * step);
  const miss = int(rng, 1, 5);
  const shown = terms.map((t, i) => (i === miss ? '▢' : String(t)));
  return {
    key: `seq-skip-${terms.join('.')}-${miss}`,
    prompt: `Find the missing number: ${shown.join(', ')}`,
    input: 'number',
    answer: String(terms[miss]),
    hint: `How much does it change each time? Look at two numbers next to each other.`,
    explain: `The rule is ${down ? 'subtract' : 'add'} ${step} each time, so the missing number is ${terms[miss]}.`,
  };
}

// ---------- Time ----------

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function time(level: number, rng: Rng): Question {
  if (level <= 2) {
    const hour = int(rng, 1, 12);
    const minute = level === 0 ? pick(rng, [0, 30]) : level === 1 ? pick(rng, [0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55]) : int(rng, 0, 59);
    const ans = `${hour}:${pad2(minute)}`;
    const wrongHour = hour === 12 ? 1 : hour + 1;
    return {
      key: `time-read-${ans}`,
      prompt: 'What time does the clock show?',
      visual: { kind: 'clock', hour, minute },
      input: 'choice',
      choices: options(rng, ans, [
        `${wrongHour}:${pad2(minute)}`,
        `${hour}:${pad2((minute + 5) % 60)}`,
        `${Math.round(minute / 5) || 12}:${pad2((hour * 5) % 60)}`,
        `${hour === 1 ? 12 : hour - 1}:${pad2(minute)}`,
      ]),
      answer: ans,
      hint: 'The short hand points to the hour. The long hand counts minutes: each number is 5 minutes.',
      explain: `The hour hand is at ${hour}${minute > 0 ? ' (just past)' : ''} and the minute hand shows ${minute} minutes: ${ans}.`,
    };
  }
  if (level === 3) {
    const kind = pick(rng, ['until', 'units', 'ampm'] as const);
    if (kind === 'until') {
      const m = pick(rng, [5, 10, 15, 20, 25, 35, 40, 45, 50, 55]);
      const h = int(rng, 1, 11);
      return {
        key: `time-until-${h}-${m}`,
        prompt: `It is ${h}:${pad2(m)}. How many minutes until ${h + 1}:00?`,
        visual: { kind: 'clock', hour: h, minute: m },
        input: 'number',
        unit: 'min',
        answer: String(60 - m),
        hint: 'There are 60 minutes in an hour.',
        explain: `60 − ${m} = ${60 - m} minutes.`,
      };
    }
    if (kind === 'units') {
      const q = pick(rng, [
        { p: 'How many seconds are in 1 minute?', a: '60' },
        { p: 'How many minutes are in 1 hour?', a: '60' },
        { p: 'How many minutes are in 2 hours?', a: '120' },
        { p: 'How many seconds are in 2 minutes?', a: '120' },
        { p: 'How many minutes are in half an hour?', a: '30' },
        { p: 'How many hours are in one day?', a: '24' },
      ]);
      return { key: `time-units-${q.p}`, prompt: q.p, input: 'number', answer: q.a, hint: '60 seconds make a minute and 60 minutes make an hour.', explain: `The answer is ${q.a}.` };
    }
    const q = pick(rng, [
      { p: 'You eat breakfast at 7:30. Is that a.m. or p.m.?', a: 'a.m.' },
      { p: 'School ends at 3:15. Is that a.m. or p.m.?', a: 'p.m.' },
      { p: 'You go to bed at 8:00 at night. Is that a.m. or p.m.?', a: 'p.m.' },
      { p: 'Hockey practice starts at 6:00 in the morning. Is that a.m. or p.m.?', a: 'a.m.' },
      { p: 'Lunch is at 12:00 noon. After that, times are…', a: 'p.m.' },
      { p: 'Recess is at 10:15 in the morning. Is that a.m. or p.m.?', a: 'a.m.' },
    ]);
    return { key: `time-ampm-${q.p}`, prompt: q.p, input: 'choice', choices: ['a.m.', 'p.m.'], answer: q.a, hint: 'a.m. is from midnight to noon. p.m. is from noon to midnight.', explain: `It is ${q.a}.` };
  }
  // Level 4: 24-hour time.
  const h24 = int(rng, 0, 23);
  const m = pick(rng, [0, 15, 30, 45]);
  const toTwelve = rng() < 0.5;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const ampm = h24 < 12 ? 'a.m.' : 'p.m.';
  const t12 = `${h12}:${pad2(m)} ${ampm}`;
  const t24 = `${h24}:${pad2(m)}`;
  if (toTwelve) {
    return {
      key: `time-24to12-${t24}`,
      prompt: `What is ${t24} on a 24-hour clock in 12-hour time?`,
      input: 'choice',
      choices: options(rng, t12, [`${h12}:${pad2(m)} ${ampm === 'a.m.' ? 'p.m.' : 'a.m.'}`, `${(h24 + 2) % 12 || 12}:${pad2(m)} ${ampm}`, `${h24 % 10 || 10}:${pad2(m)} ${ampm}`]),
      answer: t12,
      hint: 'Hours 13 to 23 are p.m.: subtract 12. Hour 0 is 12 a.m. (midnight).',
      explain: `${t24} is ${t12}.`,
    };
  }
  return {
    key: `time-12to24-${t12}`,
    prompt: `What is ${t12} on a 24-hour clock?`,
    input: 'choice',
    choices: options(rng, t24, [`${(h24 + 12) % 24}:${pad2(m)}`, `${h12}:${pad2(m)}`, `${(h24 + 1) % 24}:${pad2(m)}`]),
    answer: t24,
    hint: 'For p.m. times after 12:59, add 12 to the hour. 12 a.m. is 0:00.',
    explain: `${t12} is ${t24}.`,
  };
}

// ---------- Length and perimeter ----------

function length(level: number, rng: Rng): Question {
  if (level === 0) {
    const q = pick(rng, [
      { p: 'Which unit would you use to measure the length of a hockey rink?', a: 'metres' },
      { p: 'Which unit would you use to measure the length of an ant?', a: 'millimetres' },
      { p: 'Which unit would you use to measure the length of a pencil?', a: 'centimetres' },
      { p: 'Which unit would you use to measure the height of a door?', a: 'metres' },
      { p: 'Which unit would you use to measure the thickness of a coin?', a: 'millimetres' },
      { p: 'Which unit would you use to measure the width of your hand?', a: 'centimetres' },
      { p: 'Which unit would you use to measure the length of a school hallway?', a: 'metres' },
      { p: 'Which unit would you use to measure the length of a crayon?', a: 'centimetres' },
    ]);
    return { key: `len-unit-${q.p}`, prompt: q.p, input: 'choice', choices: ['millimetres', 'centimetres', 'metres'], answer: q.a, hint: 'A millimetre is about the thickness of a dime. A centimetre is about a fingernail wide. A metre is about one big step.', explain: `Use ${q.a}.` };
  }
  if (level === 1) {
    const q = pick(rng, [
      () => { const m = int(rng, 1, 9); return { p: `${m} m = ▢ cm`, a: m * 100, h: '1 m = 100 cm' }; },
      () => { const c = int(rng, 1, 9); return { p: `${c} cm = ▢ mm`, a: c * 10, h: '1 cm = 10 mm' }; },
      () => { const m = int(rng, 1, 3); return { p: `${m} m = ▢ mm`, a: m * 1000, h: '1 m = 1000 mm' }; },
      () => { const c = int(rng, 1, 9) * 100; return { p: `${c} cm = ▢ m`, a: c / 100, h: '100 cm = 1 m' }; },
      () => { const f = int(rng, 1, 3); return { p: `${f} ft = ▢ in`, a: f * 12, h: '1 foot = 12 inches' }; },
      () => { const y = int(rng, 1, 3); return { p: `${y} yd = ▢ ft`, a: y * 3, h: '1 yard = 3 feet' }; },
    ])();
    return { key: `len-conv-${q.p}`, prompt: q.p, input: 'number', answer: String(q.a), hint: q.h, explain: `${q.h}, so the answer is ${q.a}.` };
  }
  const sides = pick(rng, [3, 4, 4, 5, 6]);
  const regular = rng() < 0.4;
  const base = int(rng, 2, 12);
  const lens = Array.from({ length: sides }, () => (regular ? base : int(rng, 4, 12)));
  if (sides === 3 && !regular) {
    // Keep it a real triangle: each side shorter than the other two together.
    lens[2] = int(rng, Math.abs(lens[0] - lens[1]) + 1, lens[0] + lens[1] - 1);
  }
  if (sides === 4 && !regular) {
    // Rectangle: opposite sides equal.
    lens[2] = lens[0];
    lens[3] = lens[1];
  }
  const unit = pick(rng, ['cm', 'm']);
  const per = lens.reduce((a, b) => a + b, 0);
  if (level === 2) {
    return {
      key: `len-per-${lens.join('.')}`,
      prompt: 'What is the perimeter of this shape?',
      visual: { kind: 'polygon', sides, labels: lens.map((l) => `${l} ${unit}`), regular },
      input: 'number',
      unit,
      answer: String(per),
      hint: 'Perimeter is the distance all the way around. Add every side.',
      explain: `${lens.join(' + ')} = ${per} ${unit}.`,
    };
  }
  const missing = int(rng, 0, sides - 1);
  return {
    key: `len-miss-${lens.join('.')}-${missing}`,
    prompt: `The perimeter is ${per} ${unit}. How long is the side marked ▢?`,
    visual: { kind: 'polygon', sides, labels: lens.map((l, i) => (i === missing ? '▢' : `${l} ${unit}`)), regular },
    input: 'number',
    unit,
    answer: String(lens[missing]),
    hint: 'Add the sides you know, then subtract from the perimeter.',
    explain: `${per} − ${lens.filter((_, i) => i !== missing).reduce((a, b) => a + b, 0)} = ${lens[missing]} ${unit}.`,
  };
}

// ---------- Geometry and angles ----------

const POLY_NAMES: Record<number, string> = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 8: 'octagon' };

function geometry(level: number, rng: Rng): Question {
  if (level === 0) {
    const sides = pick(rng, [3, 4, 5, 6, 8]);
    const regular = rng() < 0.5;
    return {
      key: `geo-name-${sides}-${regular}`,
      prompt: 'What is the name of this polygon?',
      visual: { kind: 'polygon', sides, regular },
      input: 'choice',
      choices: options(rng, POLY_NAMES[sides], Object.values(POLY_NAMES)),
      answer: POLY_NAMES[sides],
      hint: 'Count the sides. Tri = 3, quad = 4, penta = 5, hexa = 6, octa = 8.',
      explain: `It has ${sides} sides, so it is a ${POLY_NAMES[sides]}.`,
    };
  }
  if (level === 1) {
    const sides = pick(rng, [3, 4, 5, 6, 8]);
    const regular = rng() < 0.5;
    return {
      key: `geo-reg-${sides}-${regular}`,
      prompt: 'Is this polygon regular or irregular?',
      visual: { kind: 'polygon', sides, regular },
      input: 'choice',
      choices: ['regular', 'irregular'],
      answer: regular ? 'regular' : 'irregular',
      hint: 'A regular polygon has all sides the same length and all angles the same size.',
      explain: regular ? 'All its sides and angles are equal, so it is regular.' : 'Its sides are not all equal, so it is irregular.',
    };
  }
  if (level === 2) {
    const q = pick(rng, [
      { p: 'Lines that never meet and stay the same distance apart are…', a: 'parallel', c: ['parallel', 'perpendicular', 'curved'] },
      { p: 'Lines that meet to make a square corner (90°) are…', a: 'perpendicular', c: ['parallel', 'perpendicular', 'curved'] },
      { p: 'The two rails of a train track are…', a: 'parallel', c: ['parallel', 'perpendicular'] },
      { p: 'The corner of a piece of paper is a…', a: 'right angle', c: ['right angle', 'smaller angle', 'bigger angle'] },
      { p: 'At 3:00, the hands of a clock make a…', a: 'right angle', c: ['right angle', 'straight line', 'smaller angle'] },
      { p: 'How many right angles does a rectangle have?', a: '4', c: ['0', '2', '4'] },
      { p: 'A square has how many pairs of parallel sides?', a: '2', c: ['0', '1', '2', '4'] },
      { p: 'Which capital letter has a right angle?', a: 'L', c: ['L', 'O', 'S', 'C'] },
    ]);
    return { key: `geo-prop-${q.p}`, prompt: q.p, input: 'choice', choices: shuffle(rng, q.c), answer: q.a, hint: 'A right angle is a square corner, like the letter L. Parallel lines are like train tracks.', explain: `The answer is ${q.a}.` };
  }
  // Transformations keep shape and size.
  const q = pick(rng, [
    { p: 'A triangle is slid across the page (a translation). Does it keep the same side lengths?', a: 'yes' },
    { p: 'A square is turned (a rotation). Is it still a square?', a: 'yes' },
    { p: 'A hexagon is flipped (a reflection). Does it still have 6 sides?', a: 'yes' },
    { p: 'When you flip a shape, do its angles change size?', a: 'no' },
    { p: 'When you slide a shape, does it get bigger?', a: 'no' },
    { p: 'A regular pentagon is turned. Is it still regular?', a: 'yes' },
  ]);
  return { key: `geo-trans-${q.p}`, prompt: q.p, input: 'choice', choices: ['yes', 'no'], answer: q.a, hint: 'Slides, turns and flips move a shape but never change its size or shape.', explain: 'Translations, rotations and reflections keep side lengths and angles the same.' };
}

// ---------- Statistics ----------

const GRAPHS = [
  { title: 'Favourite sport', labels: ['Hockey', 'Soccer', 'Swim', 'Ski'] },
  { title: 'Pets in our class', labels: ['Dogs', 'Cats', 'Fish', 'Birds'] },
  { title: 'Favourite season', labels: ['Winter', 'Spring', 'Summer', 'Fall'] },
  { title: 'Goals scored', labels: ['Game 1', 'Game 2', 'Game 3', 'Game 4'] },
];

function statistics(level: number, rng: Rng): Question {
  const g = pick(rng, GRAPHS);
  const values = g.labels.map(() => int(rng, 1, level === 0 ? 8 : 12));
  const visual = { kind: 'bar-graph' as const, title: g.title, labels: g.labels, values };
  const i = int(rng, 0, 3);
  if (level === 0) {
    return {
      key: `stat-read-${g.title}-${values.join('.')}-${i}`,
      prompt: `How many for ${g.labels[i]}?`,
      visual,
      input: 'number',
      answer: String(values[i]),
      hint: 'Go to the top of the bar, then look across to the numbers on the side.',
      explain: `The ${g.labels[i]} bar reaches ${values[i]}.`,
    };
  }
  if (level === 1) {
    const max = Math.max(...values);
    if (values.filter((v) => v === max).length > 1) values[i] = max + 1;
    const top = values.indexOf(Math.max(...values));
    return {
      key: `stat-most-${g.title}-${values.join('.')}`,
      prompt: 'Which one has the most?',
      visual,
      input: 'choice',
      choices: g.labels,
      answer: g.labels[top],
      hint: 'Find the tallest bar.',
      explain: `${g.labels[top]} has the tallest bar, with ${values[top]}.`,
    };
  }
  const j = (i + 1 + int(rng, 0, 2)) % 4;
  const kind = level === 2 ? 'more' : 'total';
  if (kind === 'more') {
    const [a, b] = values[i] >= values[j] ? [i, j] : [j, i];
    return {
      key: `stat-diff-${g.title}-${values.join('.')}-${a}-${b}`,
      prompt: `How many more for ${g.labels[a]} than ${g.labels[b]}?`,
      visual,
      input: 'number',
      answer: String(values[a] - values[b]),
      hint: 'Read both bars, then subtract.',
      explain: `${values[a]} − ${values[b]} = ${values[a] - values[b]}.`,
    };
  }
  const total = values.reduce((x, y) => x + y, 0);
  return {
    key: `stat-total-${g.title}-${values.join('.')}`,
    prompt: 'How many altogether?',
    visual,
    input: 'number',
    answer: String(total),
    hint: 'Read every bar and add them up.',
    explain: `${values.join(' + ')} = ${total}.`,
  };
}

// ---------- Financial literacy ----------

function financial(level: number, rng: Rng): Question {
  if (level === 0) {
    const q = pick(rng, [
      { p: 'Is food a need or a want?', a: 'need' },
      { p: 'Is a new video game a need or a want?', a: 'want' },
      { p: 'Is a warm winter coat a need or a want?', a: 'need' },
      { p: 'Is candy a need or a want?', a: 'want' },
      { p: 'Is a place to live a need or a want?', a: 'need' },
      { p: 'Is a fourth hockey stick a need or a want?', a: 'want' },
      { p: 'Is clean water a need or a want?', a: 'need' },
      { p: 'Is a toy robot a need or a want?', a: 'want' },
    ]);
    return { key: `fin-nw-${q.p}`, prompt: q.p, input: 'choice', choices: ['need', 'want'], answer: q.a, hint: 'A need is something you must have to live and be safe. A want is nice to have.', explain: `It is a ${q.a}.` };
  }
  if (level === 1) {
    const week = int(rng, 2, 5);
    const goal = week * int(rng, 3, 8);
    return {
      key: `fin-save-${week}-${goal}`,
      prompt: `You want to save $${goal} for a new ball. You save $${week} each week. How many weeks will it take?`,
      input: 'number',
      unit: 'weeks',
      answer: String(goal / week),
      hint: `How many groups of $${week} make $${goal}?`,
      explain: `$${goal} ÷ $${week} = ${goal / week} weeks.`,
    };
  }
  const q = pick(rng, [
    { p: 'You have $10. What is a good money habit?', a: 'Save some and spend some', c: ['Save some and spend some', 'Spend it all right away', 'Lose it'] },
    { p: 'Which is a short-term saving goal?', a: 'A book next week', c: ['A book next week', 'A car when you grow up', 'University'] },
    { p: 'Which is a long-term saving goal?', a: 'A bike next summer', c: ['A bike next summer', 'A treat today', 'A pencil tomorrow'] },
    { p: 'Giving some money to help people in need is called…', a: 'donating', c: ['donating', 'borrowing', 'spending'] },
    { p: 'Before buying something, it is smart to…', a: 'think about whether you need it', c: ['think about whether you need it', 'buy two of everything', 'buy it without looking at the price'] },
  ]);
  return { key: `fin-habit-${q.p}`, prompt: q.p, input: 'choice', choices: shuffle(rng, q.c), answer: q.a, hint: 'Think about what helps you reach your goals and helps others.', explain: `${q.a}.` };
}

// ---------- Skill list ----------

export const MATH_SKILLS: Skill[] = [
  {
    id: 'math.place-value', subject: S, name: 'Place Value', icon: '🔢', blurb: 'Digits, values and big numbers',
    strand: 'Number: Place Value', outcome: 'Students interpret place value within 100 000.',
    levels: ['Hundreds', 'Thousands', 'Ten thousands', 'Expanded form', 'Mixed-up expanded form'], generate: placeValue,
  },
  {
    id: 'math.compare', subject: S, name: 'Compare Numbers', icon: '⚖️', blurb: 'Using <, > and =',
    strand: 'Number: Place Value', outcome: 'Students interpret place value within 100 000.',
    levels: ['Two digits', 'Three digits', 'Four digits, close numbers', 'Five digits, close numbers'], generate: compareNumbers,
  },
  {
    id: 'math.rounding', subject: S, name: 'Rounding', icon: '🎯', blurb: 'Round to the nearest 10, 100, 1000',
    strand: 'Number: Place Value', outcome: 'Students interpret place value within 100 000.',
    levels: ['Nearest 10', 'Nearest 100', 'Nearest 1000', 'Nearest 10 000'], generate: rounding,
  },
  {
    id: 'math.money', subject: S, name: 'Money', icon: '🪙', blurb: 'Count Canadian coins and bills',
    strand: 'Number: Place Value', outcome: 'Students interpret place value within 100 000 (money values).',
    levels: ['Nickels and dimes', 'Add quarters', 'Loonies, toonies and bills', 'Making change'], generate: money,
  },
  {
    id: 'math.add-sub', subject: S, name: 'Add and Subtract', icon: '➕', blurb: 'Within 1000, with regrouping',
    strand: 'Number: Addition and Subtraction', outcome: 'Students apply strategies for addition and subtraction within 1000.',
    levels: ['Two digits', 'Two digits with regrouping', 'Three digits', 'Three digits with regrouping'], generate: addSub,
  },
  {
    id: 'math.estimate', subject: S, name: 'Estimate', icon: '🤔', blurb: 'Round, then add or subtract',
    strand: 'Number: Addition and Subtraction', outcome: 'Students apply strategies for addition and subtraction within 1000.',
    levels: ['Two-digit sums', 'Three-digit sums', 'Three-digit differences'], generate: estimate,
  },
  {
    id: 'math.multiply', subject: S, name: 'Multiply', icon: '✖️', blurb: 'Facts to 10 × 10',
    strand: 'Number: Multiplication and Division', outcome: 'Students analyze and apply strategies for multiplication and division within 100.',
    levels: ['Arrays: 2s, 5s, 10s', 'Groups: 3s and 4s', 'Facts with 0, 1 and 6', 'All facts to 10 × 10', 'Missing factor'], generate: multiply,
  },
  {
    id: 'math.divide', subject: S, name: 'Divide', icon: '➗', blurb: 'Share, group and remainders',
    strand: 'Number: Multiplication and Division', outcome: 'Students analyze and apply strategies for multiplication and division within 100.',
    levels: ['Sharing stories', 'Division facts', 'All division facts', 'Remainders', 'Fact families'], generate: divide,
  },
  {
    id: 'math.fractions', subject: S, name: 'Fractions', icon: '🍕', blurb: 'Parts of one whole',
    strand: 'Number: Fractions', outcome: 'Students interpret fractions in relation to one whole.',
    levels: ['Halves, thirds, fourths', 'Up to twelfths', 'Compare: same bottom', 'Compare: same top', 'Number line', 'Close to 0, 1/2 or 1'], generate: fractions,
  },
  {
    id: 'math.equations', subject: S, name: 'Equations', icon: '🟰', blurb: 'Find the missing number',
    strand: 'Algebra', outcome: 'Students illustrate equality with equations.',
    levels: ['Missing addend', 'Subtraction', 'Two sides', 'Multiply and divide'], generate: equations,
  },
  {
    id: 'math.sequences', subject: S, name: 'Number Patterns', icon: '🔁', blurb: 'Skip counting and sequences',
    strand: 'Patterns', outcome: 'Students analyze patterns in numerical sequences.',
    levels: ['Odd, even and order', 'Skip counting', 'Trickier rules', 'Finite or infinite'], generate: sequences,
  },
  {
    id: 'math.time', subject: S, name: 'Telling Time', icon: '⏰', blurb: 'Clocks, a.m., p.m. and 24-hour time',
    strand: 'Time', outcome: 'Students tell time using clocks.',
    levels: ['Hour and half hour', 'Five minutes', 'To the minute', 'Minutes, a.m. and p.m.', '24-hour clock'], generate: time,
  },
  {
    id: 'math.length', subject: S, name: 'Length and Perimeter', icon: '📏', blurb: 'mm, cm, m and around the edge',
    strand: 'Measurement: Length', outcome: 'Students determine length using standard units.',
    levels: ['Choose a unit', 'Convert units', 'Perimeter', 'Missing side'], generate: length,
  },
  {
    id: 'math.geometry', subject: S, name: 'Shapes and Angles', icon: '🔷', blurb: 'Polygons, right angles, flips and turns',
    strand: 'Geometry and Measurement: Angles', outcome: 'Students relate geometric properties to shape. Students interpret angles.',
    levels: ['Name polygons', 'Regular or irregular', 'Parallel, perpendicular, right angles', 'Slides, turns and flips'], generate: geometry,
  },
  {
    id: 'math.statistics', subject: S, name: 'Graphs', icon: '📊', blurb: 'Read bar graphs',
    strand: 'Statistics', outcome: 'Students interpret and explain representations of data.',
    levels: ['Read a bar', 'Most', 'How many more', 'Total'], generate: statistics,
  },
  {
    id: 'math.financial', subject: S, name: 'Money Smarts', icon: '🐷', blurb: 'Needs, wants and saving',
    strand: 'Financial Literacy', outcome: 'Students describe strategies that support responsible money management.',
    levels: ['Needs and wants', 'Saving goals', 'Good money habits'], generate: financial,
  },
];

// ---------- Mini lessons shown before a skill's first session ----------

const MATH_LESSONS: Record<string, string[]> = {
  'math.place-value': [
    'Each digit has a value that depends on its place.',
    'In 4 752, the 4 means 4 thousands, the 7 means 7 hundreds, the 5 means 5 tens and the 2 means 2 ones.',
    'Expanded form breaks a number into its parts: 4 752 = 4 000 + 700 + 50 + 2.',
  ],
  'math.compare': [
    'To compare numbers, start with the biggest place value and look left to right.',
    'The open mouth of < or > always eats the bigger number: 512 > 498.',
    'If every digit is the same, the numbers are equal: 300 = 300.',
  ],
  'math.rounding': [
    'Rounding finds a nearby friendly number.',
    'Look at the digit to the right of the place you are rounding to.',
    'If it is 5 or more, round up. If it is 4 or less, round down. 47 rounds to 50, and 43 rounds to 40.',
  ],
  'math.money': [
    'Canadian coins: nickel 5¢, dime 10¢, quarter 25¢, loonie $1 and toonie $2.',
    'Count the biggest coins first, then add the smaller ones.',
    '100¢ is the same as $1.00.',
  ],
  'math.add-sub': [
    'Line up the ones, tens and hundreds before you add or subtract.',
    'When adding, if a column makes 10 or more, regroup 10 ones into 1 ten.',
    'When subtracting, if the top digit is too small, borrow 1 ten and make it 10 ones.',
  ],
  'math.estimate': [
    'An estimate is a smart guess that is close to the real answer.',
    'Round each number first, then add or subtract the rounded numbers.',
    '38 + 51 is about 40 + 50, which is 90.',
  ],
  'math.multiply': [
    'Multiplying is adding equal groups. 3 × 4 means 3 groups of 4, which is 4 + 4 + 4 = 12.',
    'An array shows rows and columns. 3 rows of 4 dots is 12 dots.',
    'You can turn it around: 3 × 4 and 4 × 3 are both 12.',
  ],
  'math.divide': [
    'Dividing is sharing equally or making equal groups.',
    '12 ÷ 3 means share 12 into 3 equal groups. Each group gets 4.',
    'Multiplication helps: 3 × 4 = 12, so 12 ÷ 3 = 4. Anything left over is the remainder.',
  ],
  'math.fractions': [
    'A fraction is part of one whole that is cut into equal parts.',
    'The bottom number says how many equal parts. The top number says how many parts we have.',
    'With the same top number, more parts means smaller pieces, so 1/8 is smaller than 1/4.',
  ],
  'math.equations': [
    'An equal sign means both sides have the same value, like a balanced scale.',
    'To find the missing number in ▢ + 5 = 12, ask: what plus 5 makes 12? The answer is 7.',
    'You can use the opposite operation: 12 − 5 = 7.',
  ],
  'math.sequences': [
    'A pattern grows or shrinks by the same rule each time.',
    'Find the rule by checking how much it changes from one number to the next.',
    '5, 10, 15, 20 grows by 5 each time, so next is 25.',
  ],
  'math.time': [
    'The short hand shows the hour. The long hand shows the minutes.',
    'Each number on the clock is 5 minutes for the long hand.',
    'a.m. is from midnight to noon. p.m. is from noon to midnight. On a 24-hour clock, 3 p.m. is 15:00.',
  ],
  'math.length': [
    '10 millimetres make 1 centimetre, and 100 centimetres make 1 metre.',
    'Perimeter is the distance all the way around a shape.',
    'Add up every side to find the perimeter.',
  ],
  'math.geometry': [
    'A polygon is a closed shape with straight sides. Count the sides to name it.',
    'A right angle is a square corner, like the corner of a book.',
    'A flip is a reflection, a slide is a translation and a turn is a rotation.',
  ],
  'math.statistics': [
    'A bar graph uses bars to show how many of each thing.',
    'Read the number at the top of each bar using the scale on the side.',
    'To find how many more, subtract the smaller bar from the bigger bar.',
  ],
  'math.financial': [
    'A need is something you must have, like food and a warm coat. A want is something nice to have.',
    'Saving means keeping some money now for something you want later.',
    'A saving goal helps you plan how much to save each week.',
  ],
};

for (const s of MATH_SKILLS) s.learn = MATH_LESSONS[s.id];
