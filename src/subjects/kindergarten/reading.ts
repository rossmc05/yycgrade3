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
    return kq(rng, { key: `klet-${L}`, prompt: 'Listen, then tap the letter you hear.', say: `Tap ${say(L)}.`, answer: L, wrong: letterWrong(rng, L, false, UPPER), visual: undefined, hint: `Look for ${say(L)}.`, explain: `That's ${say(L)}.` });
  }
  if (level === 1) {
    return kq(rng, { key: `kletl-${l}`, prompt: 'Listen, then tap the small letter you hear.', say: `Tap the small letter ${L}.`, answer: l, wrong: letterWrong(rng, l, true, UPPER.map((x) => x.toLowerCase())), hint: `Look for the small ${L}.`, explain: `That's a small ${L}.` });
  }
  if (level === 3 && rng() < 0.5) {
    // Small to big, with the letters that are easy to flip (b, d, p and q) more often.
    const s = rng() < 0.5 ? pick(rng, ['b', 'd', 'p', 'q', 'n', 'm', 'u', 'g', 'h', 'r']) : l;
    const B = s.toUpperCase();
    return kq(rng, {
      key: `kletbig-${s}`,
      prompt: 'Find the big letter that matches this small letter.',
      say: `Find the big letter that matches the small ${B}.`,
      visual: { kind: 'k-word', text: s },
      answer: B,
      wrong: [...letterWrong(rng, s, true, []).map((x) => x.toUpperCase()), ...letterWrong(rng, B, true, UPPER)],
      hint: `Say the letter's name. Which big letter has the same name?`,
      explain: `Small ${B} goes with big ${B}.`,
    });
  }
  if (level === 3) {
    // Tap the small letter, with flip-around letters as the wrong choices.
    const s = pick(rng, ['b', 'd', 'p', 'q', 'n', 'u', 'm', 'w']);
    return kq(rng, { key: `kletflip-${s}`, prompt: 'Listen, then tap the small letter you hear.', say: `Tap the small letter ${s.toUpperCase()}.`, answer: s, wrong: letterWrong(rng, s, true, []), hint: s === 'b' || s === 'd' ? 'Make a bed with your hands: b is on the left, d is on the right.' : `Look closely. Some letters are ${s.toUpperCase()} turned around.`, explain: `That's a small ${s.toUpperCase()}.` });
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
  g: ['🐐', '🍇', '🎸'],
  h: ['🐴', '🏠', '🎩', '❤️', '🔨'],
  k: ['🔑', '🪁'],
  l: ['🦁', '🍋', '🐞'],
  m: ['🐭', '🌙', '🐒', '🍄', '🥛', '🧲'],
  p: ['🐷', '🍐', '🐧', '🍕', '🎃', '🥧'],
  r: ['🌈', '🚀', '💍', '🌹'],
  s: ['☀️', '🐍', '🧦', '⭐', '🐿️', '🧂', '🌻', '🧽'],
  t: ['🐢', '🌳', '🚜', '🚂', '🦷'],
  w: ['🐳', '🍉', '🌊'],
};

// The sun picture is named "sunny" for weather; here it is "sun".
const WORD: Record<string, string> = { '☀️': 'sun', '❤️': 'heart', '🌊': 'water', '⭐': 'star', '🌙': 'moon', '🐞': 'ladybug', '🧸': 'teddy bear' };
const word = (e: string) => WORD[e] ?? nameOf(e);

/** Pictures whose word ends with one plain letter sound, for the challenge level. */
export const ENDS: Record<string, string[]> = {
  t: ['🐱', '🎩', '🦇', '🐐', '⛵', '🧥'],
  g: ['🐶', '🐷', '🐸', '🥚'],
  n: ['☀️', '🌙', '🥄'],
  s: ['🚌'],
  m: ['🥁'],
  d: ['🛏️', '🍞'],
  p: ['☕'],
  x: ['🦊'],
  l: ['🔔', '⚽'],
  k: ['🧦', '🪨', '🕰️'],
};
const END_WORD: Record<string, string> = { '🐐': 'goat', '⛵': 'boat', '🧥': 'coat', '🐷': 'pig', '🍞': 'bread', '🧦': 'sock', '🕰️': 'clock', '🪨': 'rock' };
export const endWord = (e: string) => END_WORD[e] ?? word(e);

function endSound(rng: Rng): Question {
  const letter = pick(rng, Object.keys(ENDS));
  const pic = pick(rng, ENDS[letter]);
  const w = endWord(pic);
  const W = w[0].toUpperCase() + w.slice(1);
  // The first letter is a tempting wrong choice: she has to listen to the end, not the start.
  const first = w[0] === letter || (letter === 'k' && w[0] === 'c') ? [] : [w[0]];
  const rest = shuffle(rng, Object.keys(ENDS).filter((l) => l !== letter && !first.includes(l) && !(letter === 'k' && l === 'c')));
  return {
    ...kq(rng, {
      key: `kend-${pic}`,
      prompt: 'What letter does this picture end with?',
      say: `${W}. What letter does ${w} end with?`,
      visual: { kind: 'k-row', items: [pic] },
      answer: letter,
      wrong: [...first, ...rest],
      hint: `Say ${w} slowly. Listen to the very last sound.`,
      explain: `${W} ends with ${say(letter)}.`,
    }),
    labels: undefined,
  };
}

const SOUND_LETTERS = [['s', 'm', 't', 'b', 'c', 'p'], ['s', 'm', 't', 'b', 'c', 'p', 'f', 'h', 'r', 'd', 'l'], Object.keys(STARTS)];

function sounds(level: number, rng: Rng): Question {
  if (level === 3 && rng() < 0.5) return endSound(rng);
  const pool = SOUND_LETTERS[Math.min(level, 2)];
  const letter = pick(rng, pool);
  const pic = pick(rng, STARTS[letter]);
  const w = word(pic);
  return {
    ...kq(rng, {
      key: `ksound-${pic}`,
      prompt: 'What letter does this picture start with?',
      say: `${w[0].toUpperCase() + w.slice(1)}. What letter does ${w} start with?`,
      visual: { kind: 'k-row', items: [pic] },
      answer: letter,
      wrong: letterWrong(rng, letter, level >= 2, pool.filter((l) => !(letter === 'c' && l === 'k') && !(letter === 'k' && l === 'c'))),
      hint: `Say ${w} slowly. Listen to the very first sound.`,
      explain: `${w[0].toUpperCase() + w.slice(1)} starts with ${say(letter)}.`,
    }),
    labels: undefined,
  };
}

function beginning(level: number, rng: Rng): Question {
  if (level === 3 && rng() < 0.6) {
    // Letter to picture: no picture to copy the sound from, just the letter.
    const letter = pick(rng, Object.keys(STARTS));
    const answer = pick(rng, STARTS[letter]);
    const twin = (l: string) => (l === 'c' ? 'k' : l === 'k' ? 'c' : l);
    const wrong = shuffle(rng, Object.keys(STARTS).filter((l) => l !== letter && l !== twin(letter))).slice(0, 2).map((l) => pick(rng, STARTS[l]));
    const q = kq(rng, {
      key: `kbeginletter-${letter}-${answer}`,
      prompt: 'Which picture starts with this letter?',
      say: `Which picture starts with ${say(letter)}?`,
      visual: { kind: 'k-word', text: letter },
      answer,
      wrong,
      hint: `Think of the sound ${say(letter)} makes. Say each picture. Which one starts with that sound?`,
      explain: `${word(answer)[0].toUpperCase() + word(answer).slice(1)} starts with ${say(letter)}.`,
    });
    return { ...q, labels: q.choices!.map(word), sayChoices: true };
  }
  const pool = level === 0 ? ['s', 'm', 'b', 'p', 't', 'c'] : Object.keys(STARTS);
  const letters = Object.keys(STARTS).filter((l) => STARTS[l].length >= 2 && pool.includes(l));
  const letter = pick(rng, letters);
  const [target, match] = shuffle(rng, STARTS[letter]);
  // C and K make the same sound in these words, so they are never wrong choices for each other.
  const twin = (l: string) => (l === 'c' ? 'k' : l === 'k' ? 'c' : l);
  const wrongLetters = shuffle(rng, Object.keys(STARTS).filter((l) => l !== letter && l !== twin(letter)));
  const wrong = wrongLetters.slice(0, 2).map((l) => pick(rng, STARTS[l]));
  const q = kq(rng, {
    key: `kbegin-${target}-${match}`,
    prompt: `Which picture starts with the same sound as ${word(target)}?`,
    visual: { kind: 'k-row', items: [target] },
    answer: match,
    wrong,
    hint: `Say ${word(target)} slowly. Then say each picture. Which one starts the same way?`,
    explain: `${word(target)[0].toUpperCase() + word(target).slice(1)} and ${word(match)} both start with ${say(letter)}.`,
  });
  return { ...q, labels: q.choices!.map(word), sayChoices: true };
}

// ---------- Rhyming ----------

/** Rhyming families, each with pictures that are easy to name. */
const RHYMES: string[][] = [
  ['🐱', '🎩', '🦇'], // cat, hat, bat
  ['🐶', '🐸', '🪵'], // dog, frog, log
  ['🐝', '🌳', '🔑'], // bee, tree, key
  ['🚗', '⭐'], // car, star
  ['🎂', '🐍'], // cake, snake
  ['🏠', '🐭'], // house, mouse
  ['🌙', '🥄'], // moon, spoon
  ['🐻', '🍐', '🪑'], // bear, pear, chair
  ['🐐', '⛵', '🧥'], // goat, boat, coat
  ['🧦', '🕰️', '🪨'], // sock, clock, rock
];
const RHYME_WORD: Record<string, string> = { '🧦': 'sock', '🪵': 'log', '⛵': 'boat', '⭐': 'star', '🌙': 'moon' };
const rw = (e: string) => RHYME_WORD[e] ?? word(e);

function rhyme(level: number, rng: Rng): Question {
  if (level === 3 && rng() < 0.6) {
    // Which one does not rhyme? Two from one family and one odd one out.
    const fam = pick(rng, RHYMES.filter((f) => f.length >= 3));
    const two = shuffle(rng, fam).slice(0, 2);
    const odd = pick(rng, pick(rng, RHYMES.filter((f) => f !== fam)));
    const q = kq(rng, {
      key: `knorhyme-${two.join('')}-${odd}`,
      prompt: 'Which word does not rhyme?',
      answer: odd,
      wrong: two,
      hint: 'Say all three words. Two of them sound the same at the end. Which one sounds different?',
      explain: `${rw(two[0])[0].toUpperCase() + rw(two[0]).slice(1)} and ${rw(two[1])} rhyme. ${rw(odd)[0].toUpperCase() + rw(odd).slice(1)} does not.`,
    });
    return { ...q, labels: q.choices!.map(rw), sayChoices: true };
  }
  const fam = pick(rng, RHYMES);
  const [target, match] = shuffle(rng, fam);
  const wrong = shuffle(rng, RHYMES.filter((f) => f !== fam)).slice(0, 3).map((f) => pick(rng, f));
  const t = rw(target);
  // An example from a different family, so the hint never gives the answer away.
  const example = pick(rng, RHYMES.filter((f) => f !== fam));
  const q = kq(rng, {
    key: `krhyme-${target}-${match}`,
    prompt: level === 0 ? `Which one rhymes with ${t}?` : `${t[0].toUpperCase() + t.slice(1)}. Which word rhymes with ${t}?`,
    visual: { kind: 'k-row', items: [target] },
    answer: match,
    wrong: wrong.slice(0, 2),
    hint: `Rhyming words sound the same at the end, like ${rw(example[0])} and ${rw(example[1])}.`,
    explain: `${t[0].toUpperCase() + t.slice(1)} and ${rw(match)} rhyme!`,
  });
  return { ...q, labels: q.choices!.map(rw), sayChoices: true };
}

// ---------- Sight words ----------

/** Common Kindergarten sight words, easiest first. */
export const SIGHT = [
  ['I', 'a', 'the', 'is', 'see', 'can', 'me', 'my', 'we', 'go'],
  ['I', 'a', 'the', 'is', 'see', 'can', 'me', 'my', 'we', 'go', 'like', 'to', 'and', 'up', 'you', 'it', 'in', 'at', 'no', 'mom', 'dad'],
  ['the', 'see', 'can', 'like', 'to', 'and', 'up', 'you', 'it', 'in', 'at', 'look', 'play', 'yes', 'he', 'she', 'said', 'here', 'for', 'big', 'little', 'come', 'are', 'was', 'on'],
  ['said', 'here', 'come', 'are', 'was', 'look', 'little', 'where', 'what', 'they', 'have', 'this', 'with', 'down', 'help', 'make', 'jump', 'away', 'two', 'three', 'one', 'of', 'not', 'run', 'find', 'funny'],
];

/** Words that look alike, for harder wrong choices. */
const SIGHT_NEAR: Record<string, string[]> = {
  the: ['he', 'she', 'then'], he: ['the', 'she', 'me'], she: ['he', 'see', 'the'], see: ['she', 'me', 'we'], me: ['my', 'we', 'he'], my: ['me', 'by'],
  we: ['me', 'he', 'was'], it: ['in', 'at', 'is'], in: ['it', 'on', 'is'], is: ['it', 'in', 'as'], at: ['it', 'an', 'a'], on: ['no', 'in'], no: ['on', 'go'],
  go: ['no', 'to'], to: ['go', 'no'], up: ['us', 'at'], can: ['and', 'come'], and: ['can', 'an'], look: ['like', 'book'], like: ['look', 'little'],
  you: ['yes', 'your'], yes: ['you', 'see'], was: ['saw', 'we'], said: ['sad', 'see'], here: ['he', 'her'], come: ['can', 'came'], are: ['a', 'at'],
  where: ['here', 'were', 'what'], what: ['that', 'want', 'where'], they: ['the', 'then', 'them'], have: ['has', 'had', 'here'], this: ['the', 'that', 'his'],
  with: ['will', 'what', 'wish'], down: ['dog', 'done', 'own'], help: ['here', 'hop', 'held'], make: ['made', 'take', 'like'], jump: ['just', 'pump', 'jam'],
  away: ['always', 'a', 'say'], two: ['tow', 'who'], three: ['there', 'tree', 'these'], one: ['on', 'once', 'own'], of: ['off', 'or', 'on'],
  not: ['no', 'nut', 'net'], run: ['ran', 'fun', 'rug'], find: ['fine', 'kind', 'fin'], funny: ['fun', 'sunny', 'bunny'],
  big: ['bag', 'dig'], little: ['like', 'look'], play: ['plan', 'yes'], for: ['from', 'of'], mom: ['me', 'my'], dad: ['did', 'and'], I: ['a', 'it'], a: ['I', 'at'],
};

function sight(level: number, rng: Rng): Question {
  const list = SIGHT[level];
  const w = pick(rng, list);
  const near = level === 0 ? [] : SIGHT_NEAR[w] ?? [];
  const wrong = [...shuffle(rng, near), ...shuffle(rng, list.filter((x) => x !== w && !near.includes(x)))];
  const q = kq(rng, {
    key: `ksight-${w}`,
    prompt: 'Listen carefully!',
    say: `Tap the word, ${w}.`,
    answer: w,
    wrong,
    hint: w.length === 1 ? `${w} is just one letter.` : `${w} starts with the letter ${w[0].toUpperCase()}.`,
    explain: `That word is ${w}.`,
  });
  return { ...q, labels: undefined };
}

const K = 'Alberta Kindergarten English Language Arts and Literature (2022)';

export const KREADING_SKILLS: Skill[] = [
  { id: 'k-letters', subject: S, name: 'Letter names', blurb: 'Find the letter', strand: 'Phonics', outcome: `${K}: Children name upper and lower case letters.`, icon: '🔤', levels: ['Big letters', 'Small letters', 'Big and small partners', 'Flip-around letters'], generate: letters },
  { id: 'k-sounds', subject: S, name: 'Letter sounds', blurb: 'What letter does it start with?', strand: 'Phonics', outcome: `${K}: Children connect letters to the sounds they make, at the start and end of words.`, icon: '🗣️', levels: ['6 letters', 'More letters', 'All the letters', 'Ending sounds'], generate: sounds },
  { id: 'k-beginning', subject: S, name: 'Beginning sounds', blurb: 'Same first sound', strand: 'Phonological awareness', outcome: `${K}: Children identify the first sound in a spoken word.`, icon: '👂', levels: ['Easy sounds', 'More sounds', 'All sounds', 'Letter to picture'], generate: beginning },
  { id: 'k-rhyme', subject: S, name: 'Rhyming', blurb: 'Words that sound alike', strand: 'Phonological awareness', outcome: `${K}: Children recognize words that rhyme.`, icon: '🎵', levels: ['Rhyme pairs', 'Say the word', 'Trickier', 'Which one does not rhyme?'], generate: rhyme },
  { id: 'k-sight', subject: S, name: 'Sight words', blurb: 'Words to know by heart', strand: 'Reading', outcome: `${K}: Children recognize common high-frequency words.`, icon: '👁️', levels: ['First words', 'More words', 'Look-alike words', 'Harder words'], generate: sight },
];

/** For tests: the word a picture stands for in these questions. */
export const startWord = word;
export const rhymeWord = rw;
