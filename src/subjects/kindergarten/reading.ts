// Kindergarten early literacy, from the Alberta Kindergarten English Language Arts
// and Literature program (2022): letter names and sounds, rhyming, beginning sounds and sight words.
// The voice never has to say a letter sound on its own: questions use whole words ("sun starts with...").

import { pick, shuffle } from '../../engine/random';
import type { Question, Rng, Skill } from '../../engine/types';
import { kq, nameOf } from './pics';

const S = 'kreading' as const;

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** Letters that look alike, for harder wrong choices. */
const LOOKALIKE: Record<string, string[]> = {
  b: ['d', 'p', 'q'], d: ['b', 'p', 'q'], p: ['q', 'b', 'd'], q: ['p', 'g', 'd'], m: ['n', 'w'], n: ['m', 'h', 'u'], w: ['m', 'v'],
  u: ['n', 'v'], i: ['l', 'j'], l: ['i', 't'], t: ['f', 'l'], f: ['t'], h: ['n', 'b'], g: ['q', 'j'], j: ['i', 'g'], c: ['o', 'e'],
  o: ['c', 'a'], e: ['c', 'a'], a: ['o', 'e'], s: ['z', 'c'], z: ['s', 'x'], v: ['w', 'y', 'u'], y: ['v', 'g'], k: ['x', 'h'], x: ['k', 'z'], r: ['n', 'h'],
  B: ['D', 'P', 'R'], D: ['B', 'O', 'P'], P: ['R', 'B', 'F'], R: ['P', 'B', 'K'], M: ['N', 'W'], N: ['M', 'H', 'Z'], W: ['M', 'V'], E: ['F', 'L'],
  F: ['E', 'P', 'T'], O: ['Q', 'C', 'D'], Q: ['O', 'G'], C: ['G', 'O'], G: ['C', 'Q'], I: ['L', 'T', 'J'], L: ['I', 'E'], T: ['I', 'L', 'F'],
  U: ['V', 'J'], V: ['U', 'W', 'Y'], K: ['X', 'R'], X: ['K', 'Y'], Y: ['V', 'X'], H: ['N', 'A'], A: ['H', 'V'], S: ['Z', 'C'], Z: ['S', 'N'], J: ['I', 'U'],
};

function letterWrong(rng: Rng, letter: string, hard: boolean, pool: string[]): string[] {
  const near = hard ? LOOKALIKE[letter] ?? [] : [];
  return [...shuffle(rng, near), ...shuffle(rng, pool.filter((x) => x !== letter && !near.includes(x)))];
}

/** How the voice should say a letter's name, so "A" isn't read as the word "a". */
const say = (l: string) => `the letter ${l.toUpperCase()}`;

// ---------- Letter names ----------

function letters(level: number, rng: Rng): Question {
  const L = pick(rng, UPPER);
  const l = L.toLowerCase();
  if (level === 0) {
    return kq(rng, { key: `klet-${L}`, prompt: `Tap the letter ${L}.`, say: `Tap ${say(L)}.`, answer: L, wrong: letterWrong(rng, L, false, UPPER), visual: undefined, hint: `Look for ${say(L)}.`, explain: `That's ${say(L)}.` });
  }
  if (level === 1) {
    return kq(rng, { key: `kletl-${l}`, prompt: `Tap the small letter ${l}.`, say: `Tap the small letter ${L}.`, answer: l, wrong: letterWrong(rng, l, true, UPPER.map((x) => x.toLowerCase())), hint: `Look for the small ${L}.`, explain: `That's a small ${L}.` });
  }
  return kq(rng, {
    key: `kletm-${L}`,
    prompt: `Find the small letter that matches the big ${L}.`,
    say: `Find the small letter that matches the big ${L}.`,
    visual: { kind: 'k-word', text: L },
    answer: l,
    wrong: letterWrong(rng, l, true, UPPER.map((x) => x.toLowerCase())),
    hint: `Big ${L} and small ${L} are partners.`,
    explain: `Big ${L} goes with small ${l}.`,
  });
}

// ---------- Letter sounds and beginning sounds ----------

/** Pictures by first letter. Only words that start with the plain letter sound (no "sh", "ch" or silent letters). */
export const STARTS: Record<string, string[]> = {
  b: ['🐻', '🍌', '🎈', '🐝', '🚌', '🚲', '⚽', '🛏️', '📕', '🦇'],
  c: ['🐱', '🚗', '🐄', '🧁', '🥕', '🍪', '🌵', '🐪', '🌽'],
  d: ['🐶', '🦆', '🦌', '🥁'],
  f: ['🐸', '🐟', '🦊', '🔥', '🪶'],
  g: ['🐐', '🍇', '🎸', '🧄'],
  h: ['🐴', '🏠', '🎩', '❤️', '🍯', '🔨'],
  k: ['🔑', '🪁'],
  l: ['🦁', '🍋', '🐞'],
  m: ['🐭', '🌙', '🐒', '🍄', '🥛', '🧲'],
  p: ['🐷', '🍐', '🐧', '🍕', '🎃', '🥧'],
  r: ['🐰', '🌈', '🚀', '💍', '🌹', '🪨'],
  s: ['☀️', '🐍', '🧦', '⭐', '🐿️', '🧂', '🌻', '🧽'],
  t: ['🐢', '🌳', '🚜', '🚂', '🦷', '🧸'],
  w: ['🐳', '🍉', '🌊'],
};

// The sun picture is named "sunny" for weather; here it is "sun".
const WORD: Record<string, string> = { '☀️': 'sun', '❤️': 'heart', '🌊': 'water', '⭐': 'star', '🌙': 'moon', '🐞': 'ladybug', '🧸': 'teddy bear' };
const word = (e: string) => WORD[e] ?? nameOf(e);

const SOUND_LETTERS = [['s', 'm', 't', 'b', 'c', 'p'], ['s', 'm', 't', 'b', 'c', 'p', 'f', 'h', 'r', 'd', 'l'], Object.keys(STARTS)];

function sounds(level: number, rng: Rng): Question {
  const pool = SOUND_LETTERS[level];
  const letter = pick(rng, pool);
  const pic = pick(rng, STARTS[letter]);
  const w = word(pic);
  return {
    ...kq(rng, {
      key: `ksound-${pic}`,
      prompt: `${w[0].toUpperCase() + w.slice(1)}. What letter does ${w} start with?`,
      visual: { kind: 'k-row', items: [pic] },
      answer: letter,
      wrong: letterWrong(rng, letter, level === 2, pool.filter((l) => !(letter === 'c' && l === 'k') && !(letter === 'k' && l === 'c'))),
      hint: `Say ${w} slowly. Listen to the very first sound.`,
      explain: `${w[0].toUpperCase() + w.slice(1)} starts with ${say(letter)}.`,
    }),
    labels: undefined,
  };
}

function beginning(level: number, rng: Rng): Question {
  const pool = level === 0 ? ['s', 'm', 'b', 'p', 't', 'c'] : Object.keys(STARTS);
  const letters = Object.keys(STARTS).filter((l) => STARTS[l].length >= 2 && pool.includes(l));
  const letter = pick(rng, letters);
  const [target, match] = shuffle(rng, STARTS[letter]);
  // C and K make the same sound in these words, so they are never wrong choices for each other.
  const twin = (l: string) => (l === 'c' ? 'k' : l === 'k' ? 'c' : l);
  const wrongLetters = shuffle(rng, Object.keys(STARTS).filter((l) => l !== letter && l !== twin(letter)));
  const wrong = wrongLetters.slice(0, 3).map((l) => pick(rng, STARTS[l]));
  const q = kq(rng, {
    key: `kbegin-${target}-${match}`,
    prompt: `Which picture starts with the same sound as ${word(target)}?`,
    visual: { kind: 'k-row', items: [target] },
    answer: match,
    wrong,
    hint: `Say ${word(target)} slowly. Then say each picture. Which one starts the same way?`,
    explain: `${word(target)[0].toUpperCase() + word(target).slice(1)} and ${word(match)} both start with ${say(letter)}.`,
  });
  return { ...q, labels: q.choices!.map(word) };
}

// ---------- Rhyming ----------

/** Rhyming families, each with pictures that are easy to name. */
const RHYMES: string[][] = [
  ['🐱', '🎩', '🦇'], // cat, hat, bat
  ['🐶', '🐸', '🪵'], // dog, frog, log
  ['🐝', '🌳', '🔑'], // bee, tree, key
  ['🚗', '⭐', '🫙'], // car, star, jar
  ['🎂', '🐍'], // cake, snake
  ['🐟', '🍽️'], // fish, dish
  ['🏠', '🐭'], // house, mouse
  ['🌙', '🥄'], // moon, spoon
  ['🐻', '🍐', '🪑'], // bear, pear, chair
  ['🐐', '⛵', '🧥'], // goat, boat, coat
  ['🧦', '🕰️', '🪨'], // sock, clock, rock
  ['🐛', '☕'], // bug, mug
];
const RHYME_WORD: Record<string, string> = { '🪵': 'log', '⛵': 'boat', '🐛': 'bug', '☕': 'mug', '⭐': 'star', '🌙': 'moon', '🍽️': 'dish' };
const rw = (e: string) => RHYME_WORD[e] ?? word(e);

function rhyme(level: number, rng: Rng): Question {
  const fam = pick(rng, RHYMES);
  const [target, match] = shuffle(rng, fam);
  const wrong = shuffle(rng, RHYMES.filter((f) => f !== fam)).slice(0, 3).map((f) => pick(rng, f));
  const t = rw(target);
  const q = kq(rng, {
    key: `krhyme-${target}-${match}`,
    prompt: level === 0 ? `Which one rhymes with ${t}?` : `${t[0].toUpperCase() + t.slice(1)}. Which word rhymes with ${t}?`,
    visual: { kind: 'k-row', items: [target] },
    answer: match,
    wrong: wrong.slice(0, level === 2 ? 3 : 2),
    count: level === 2 ? 3 : level === 0 ? 2 : 3,
    hint: `Rhyming words sound the same at the end, like cat and hat.`,
    explain: `${t[0].toUpperCase() + t.slice(1)} and ${rw(match)} rhyme!`,
  });
  return { ...q, labels: q.choices!.map(rw) };
}

// ---------- Sight words ----------

/** Common Kindergarten sight words, easiest first. */
export const SIGHT = [
  ['I', 'a', 'the', 'is', 'see', 'can', 'me', 'my', 'we', 'go'],
  ['I', 'a', 'the', 'is', 'see', 'can', 'me', 'my', 'we', 'go', 'like', 'to', 'and', 'up', 'you', 'it', 'in', 'at', 'no', 'mom', 'dad'],
  ['the', 'see', 'can', 'like', 'to', 'and', 'up', 'you', 'it', 'in', 'at', 'look', 'play', 'yes', 'he', 'she', 'said', 'here', 'for', 'big', 'little', 'come', 'are', 'was', 'on'],
];

/** Words that look alike, for harder wrong choices. */
const SIGHT_NEAR: Record<string, string[]> = {
  the: ['he', 'she', 'then'], he: ['the', 'she', 'me'], she: ['he', 'see', 'the'], see: ['she', 'me', 'we'], me: ['my', 'we', 'he'], my: ['me', 'by'],
  we: ['me', 'he', 'was'], it: ['in', 'at', 'is'], in: ['it', 'on', 'is'], is: ['it', 'in', 'as'], at: ['it', 'an', 'a'], on: ['no', 'in'], no: ['on', 'go'],
  go: ['no', 'to'], to: ['go', 'no'], up: ['us', 'at'], can: ['and', 'come'], and: ['can', 'an'], look: ['like', 'book'], like: ['look', 'little'],
  you: ['yes', 'your'], yes: ['you', 'see'], was: ['saw', 'we'], said: ['sad', 'see'], here: ['he', 'her'], come: ['can', 'came'], are: ['a', 'at'],
  big: ['bag', 'dig'], little: ['like', 'look'], play: ['plan', 'yes'], for: ['from', 'of'], mom: ['me', 'my'], dad: ['did', 'and'], I: ['a', 'it'], a: ['I', 'at'],
};

function sight(level: number, rng: Rng): Question {
  const list = SIGHT[level];
  const w = pick(rng, list);
  const near = level === 0 ? [] : SIGHT_NEAR[w] ?? [];
  const wrong = [...shuffle(rng, near), ...shuffle(rng, list.filter((x) => x !== w && !near.includes(x)))];
  const q = kq(rng, {
    key: `ksight-${w}`,
    prompt: `Tap the word "${w}".`,
    say: `Tap the word, ${w}.`,
    answer: w,
    wrong,
    count: level === 0 ? 2 : 3,
    hint: `Look at the first letter of ${w}.`,
    explain: `That word is ${w}.`,
  });
  return { ...q, labels: undefined };
}

const K = 'Alberta Kindergarten English Language Arts and Literature (2022)';

export const KREADING_SKILLS: Skill[] = [
  { id: 'k-letters', subject: S, name: 'Letter names', blurb: 'Find the letter', strand: 'Phonics', outcome: `${K}: Children name upper and lower case letters.`, icon: '🔤', levels: ['Big letters', 'Small letters', 'Big and small partners'], generate: letters },
  { id: 'k-sounds', subject: S, name: 'Letter sounds', blurb: 'What letter does it start with?', strand: 'Phonics', outcome: `${K}: Children connect letters to the sounds they make.`, icon: '🗣️', levels: ['6 letters', 'More letters', 'All the letters'], generate: sounds },
  { id: 'k-beginning', subject: S, name: 'Beginning sounds', blurb: 'Same first sound', strand: 'Phonological awareness', outcome: `${K}: Children identify the first sound in a spoken word.`, icon: '👂', levels: ['Easy sounds', 'More sounds', 'All sounds'], generate: beginning },
  { id: 'k-rhyme', subject: S, name: 'Rhyming', blurb: 'Words that sound alike', strand: 'Phonological awareness', outcome: `${K}: Children recognize words that rhyme.`, icon: '🎵', levels: ['Pick from 2', 'Pick from 3', 'Trickier'], generate: rhyme },
  { id: 'k-sight', subject: S, name: 'Sight words', blurb: 'Words to know by heart', strand: 'Reading', outcome: `${K}: Children recognize common high-frequency words.`, icon: '👁️', levels: ['First words', 'More words', 'Look-alike words'], generate: sight },
];

/** For tests: the word a picture stands for in these questions. */
export const startWord = word;
export const rhymeWord = rw;
