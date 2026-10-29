// Spell Builder skills, from the Alberta grade 3 ELAL outcomes for phonics (3P1),
// vocabulary and morphology (3V1) and spelling conventions (3CV1). Canadian spelling throughout.

import { int, options, pick, shuffle } from '../../engine/random';
import type { GenContext, Question, Rng, Skill } from '../../engine/types';
import bank from '../../content/spelling.json';

const S = 'spelling' as const;

/** A typed spelling question: the word is spoken, never shown. */
function hearAndSpell(word: string, sentence: string | undefined, key: string, hint: string): Question {
  const shown = sentence ? sentence.replace(new RegExp(`\\b${word}\\b`, 'i'), '_____') : undefined;
  return {
    key,
    prompt: shown ? `🔊 Spell the missing word: ${shown}` : '🔊 Spell the word.',
    say: sentence ? `${word}. ${sentence} ${word}.` : `${word}. ${word}.`,
    input: 'text',
    answer: word,
    hint,
    explain: `It is spelled ${word.split('').join('-')}.`,
  };
}

// ---------- Plurals (3CV1.3) ----------

const PLURALS: { one: string; many: string; rule: number }[] = bank.PLURALS as { one: string; many: string; rule: number }[];

const PLURAL_HINTS = bank.PLURAL_HINTS;

function plurals(level: number, rng: Rng): Question {
  const rule = level < 4 ? level : int(rng, 0, 3);
  const w = pick(rng, PLURALS.filter((p) => p.rule === rule));
  if (w.one !== w.many && rng() < 0.3) {
    return { key: `pl-back-${w.many}`, prompt: `Two ${w.many}, one ______. Type the singular (just one).`, input: 'text', answer: w.one, hint: PLURAL_HINTS[rule], explain: `Two ${w.many}, one ${w.one}.` };
  }
  return {
    key: `pl-${w.one}`,
    prompt: `One ${w.one}, two ______. Type the plural.`,
    input: 'text',
    answer: w.many,
    hint: PLURAL_HINTS[rule],
    explain: `One ${w.one}, two ${w.many}.`,
  };
}

// ---------- Endings: -ing and -ed (3CV1.5) ----------

const ENDINGS: { base: string; ing: string; ed: string; rule: number }[] = bank.ENDINGS as { base: string; ing: string; ed: string; rule: number }[];

const ENDING_HINTS = bank.ENDING_HINTS;

function endings(level: number, rng: Rng): Question {
  const rule = level < 3 ? level : int(rng, 0, 2);
  // Irregular past tenses (slid, shone) are skipped for -ed questions.
  const pool = ENDINGS.filter((e) => e.rule === rule);
  const w = pick(rng, pool);
  const useEd = level >= 3 && rng() < 0.5 && w.ed !== 'slid' && w.ed !== 'shone';
  const answer = useEd ? w.ed : w.ing;
  return {
    key: `end-${w.base}-${useEd ? 'ed' : 'ing'}`,
    prompt: `${w.base} + ${useEd ? 'ed' : 'ing'} = ______`,
    input: 'text',
    answer,
    hint: ENDING_HINTS[rule],
    explain: `${w.base} + ${useEd ? 'ed' : 'ing'} = ${answer}.`,
  };
}

// ---------- Contractions (3CV1.5) ----------

const CONTRACTIONS: [string, string][] = bank.CONTRACTIONS as [string, string][];

function contractions(level: number, rng: Rng): Question {
  const [long, short] = pick(rng, CONTRACTIONS);
  const hint = 'A contraction joins two words. An apostrophe ( \' ) takes the place of the missing letters.';
  if (level === 0) {
    const fake = [short.replace("'", ''), long.replace(' ', "'"), short.replace(/'(.)/, "$1'")];
    return {
      key: `con-pick-${short}`,
      prompt: `Which is the contraction for "${long}"?`,
      input: 'choice',
      choices: options(rng, short, fake),
      answer: short,
      hint,
      explain: `${long} → ${short}.`,
    };
  }
  if (level === 1) {
    return { key: `con-type-${short}`, prompt: `Type the contraction for "${long}". Use the ' key.`, input: 'text', answer: short.toLowerCase(), hint, explain: `${long} → ${short}.` };
  }
  const others = shuffle(rng, CONTRACTIONS.filter((c) => c[1] !== short)).slice(0, 3).map((c) => c[0]);
  return {
    key: `con-back-${short}`,
    prompt: `"${short}" is short for…`,
    input: 'choice',
    choices: options(rng, long, others),
    answer: long,
    hint,
    explain: `${short} means ${long}.`,
  };
}

// ---------- Prefixes and suffixes (3V1.2, 3CV1.3) ----------

const PREFIX_MEANING: Record<string, string> = bank.PREFIX_MEANING as Record<string, string>;
const PREFIX_WORDS: { word: string; prefix: string; base: string; meaning: string }[] = bank.PREFIX_WORDS as { word: string; prefix: string; base: string; meaning: string }[];

/** Real words not in the bank, so they are never offered as a wrong prefix. */
const ALSO_WORDS = ['unlike', 'mistrust', 'disable', 'unstick', 'displace', 'undo', 'unfill', 'misplay', 'distrust', 'unread', 'unwind'];

function prefixes(level: number, rng: Rng): Question {
  const sets = [['re', 'un'], ['re', 'un', 'dis', 'mis'], Object.keys(PREFIX_MEANING), Object.keys(PREFIX_MEANING)];
  const w = pick(rng, PREFIX_WORDS.filter((p) => sets[Math.min(level, 3)].includes(p.prefix)));
  const hint = `The prefix "${w.prefix}-" means "${PREFIX_MEANING[w.prefix]}".`;
  if (level === 3) {
    return { ...hearAndSpell(w.word, undefined, `pre-spell-${w.word}`, hint), prompt: `🔊 Spell the word that means "${w.meaning}".` };
  }
  const addChoices = options(rng, w.prefix, sets[Math.min(level, 3)].filter((p) => !PREFIX_WORDS.some((x) => x.word === p + w.base) && !ALSO_WORDS.includes(p + w.base)));
  if (rng() < 0.5 || addChoices.length < 2) {
    const others = shuffle(rng, PREFIX_WORDS.filter((p) => p.meaning !== w.meaning)).slice(0, 3).map((p) => p.meaning);
    return { key: `pre-mean-${w.word}`, prompt: `What does "${w.word}" mean?`, input: 'choice', choices: options(rng, w.meaning, others), answer: w.meaning, hint, explain: `${w.prefix} + ${w.base} = ${w.word}, which means ${w.meaning}.` };
  }
  const choices = addChoices;
  return { key: `pre-add-${w.word}`, prompt: `Which prefix makes a word that means "${w.meaning}"? ___${w.base}`, input: 'choice', choices, answer: w.prefix, hint, explain: `${w.prefix} + ${w.base} = ${w.word}.` };
}

const PEOPLE: { base: string; word: string; doing: string }[] = bank.PEOPLE as { base: string; word: string; doing: string }[];
const LY: [string, string][] = bank.LY as [string, string][];

function suffixes(level: number, rng: Rng): Question {
  if (level === 0 || (level === 3 && rng() < 0.4)) {
    const [base, word] = pick(rng, LY);
    return { key: `suf-ly-${word}`, prompt: `Add -ly: ${base} + ly = ______`, input: 'text', answer: word, hint: 'Adding -ly tells how something is done: quick → quickly.', explain: `${base} + ly = ${word}.` };
  }
  const stem = (x: { base: string }) => x.base.replace(/e$/, '');
  const pool = level === 1 ? PEOPLE.filter((x) => x.word.endsWith('er')) : level === 2 ? PEOPLE.filter((x) => ['er', 'or', 'ist'].some((e) => x.word === stem(x) + e)) : PEOPLE;
  const p = pick(rng, pool);
  if (level === 2) {
    const end = p.word.endsWith('ist') ? 'ist' : p.word.endsWith('or') ? 'or' : 'er';
    return {
      key: `suf-who-${p.word}`,
      prompt: `A person who ${p.doing} is a ${stem(p)}___. Which ending?`,
      input: 'choice',
      choices: ['er', 'or', 'ist'],
      answer: end,
      hint: 'The endings -er, -or and -ist all name a person who does something. Say each one and listen.',
      explain: `A person who ${p.doing} is a ${p.word}.`,
    };
  }
  return { key: `suf-type-${p.word}`, prompt: `${p.base} → A person who ${p.doing} is a ______.`, input: 'text', answer: p.word, hint: 'Add -er, -or or -ist to name a person who does something.', explain: `${p.base} → ${p.word}.` };
}

// ---------- Compound words (3V1.2, 3CV1.5) ----------

const COMPOUNDS: [string, string][] = bank.COMPOUNDS as [string, string][];

function compounds(level: number, rng: Rng): Question {
  const [a, b] = pick(rng, COMPOUNDS);
  const word = a + b;
  if (level === 0) {
    const fakes = shuffle(rng, COMPOUNDS.filter((c) => c[0] + c[1] !== word)).slice(0, 3).map((c) => `${c[0]} + ${b}`);
    return { key: `cmp-split-${word}`, prompt: `Which two words make "${word}"?`, input: 'choice', choices: options(rng, `${a} + ${b}`, fakes), answer: `${a} + ${b}`, hint: 'A compound word is two small words joined together. Find the first small word.', explain: `${a} + ${b} = ${word}.` };
  }
  if (level === 1) {
    return { key: `cmp-join-${word}`, prompt: `Join the words: ${a} + ${b} = ______`, input: 'text', answer: word, hint: 'Write the two words together with no space.', explain: `${a} + ${b} = ${word}.` };
  }
  return { ...hearAndSpell(word, undefined, `cmp-hear-${word}`, `It is a compound word. Listen for the two small words.`), prompt: '🔊 Spell the compound word.' };
}

// ---------- Silent letters and tricky sounds (3P1) ----------

const SILENT: { word: string; letter: string; sentence: string }[] = bank.SILENT as { word: string; letter: string; sentence: string }[];
const SOUNDS: { word: string; sentence: string; hint: string }[] = bank.SOUNDS as { word: string; sentence: string; hint: string }[];

function silent(level: number, rng: Rng): Question {
  if (level === 0) {
    const w = pick(rng, SILENT);
    const letters = [...new Set(w.word.split(''))].filter((l) => l === w.letter || !(l === 'e' || (l === 'c' && w.word.includes('ck')) || (l === 'w' && /[oa]w/.test(w.word)) || (l === 'h' && /[cgsw]h/.test(w.word)) || (l === 'u' && /ou/.test(w.word))));
    return { key: `sil-which-${w.word}`, prompt: `Which letter is silent in "${w.word}"?`, input: 'choice', choices: options(rng, w.letter, letters), answer: w.letter, hint: 'Say the word slowly. Which letter do you not hear? Look at the start or the end.', explain: `In "${w.word}" the ${w.letter} is silent.` };
  }
  if (level === 1) {
    const w = pick(rng, SILENT);
    return hearAndSpell(w.word, w.sentence, `sil-spell-${w.word}`, `This word has a silent ${w.letter}.`);
  }
  const w = pick(rng, SOUNDS);
  return hearAndSpell(w.word, w.sentence, `snd-spell-${w.word}`, w.hint);
}

// ---------- Vowel teams (3P1) ----------

/** Words by vowel team. 'ow*' and 'oo' sound groups are kept apart: snow (ow) and cow (ow*). */
const TEAMS: Record<string, string[]> = {
  ai: ['rain', 'train', 'paint', 'snail', 'wait', 'chain', 'brain', 'nail', 'tail', 'mail'],
  ay: ['play', 'day', 'stay', 'tray', 'clay', 'spray', 'away', 'crayon', 'today', 'may'],
  ee: ['tree', 'green', 'sleep', 'sheep', 'cheese', 'bee', 'feet', 'queen', 'sweet', 'wheel'],
  ea: ['team', 'leaf', 'dream', 'clean', 'peach', 'eat', 'beach', 'meat', 'read', 'seat'],
  oa: ['boat', 'coat', 'toast', 'soap', 'goat', 'float', 'coach', 'oak', 'loaf', 'road'],
  ow: ['snow', 'grow', 'blow', 'yellow', 'window', 'show', 'elbow', 'slow', 'bowl', 'throw'],
  oo: ['moon', 'spoon', 'food', 'school', 'room', 'boot', 'pool', 'tooth', 'goose', 'zoo'],
  igh: ['night', 'light', 'bright', 'high', 'fight', 'tight', 'flight', 'right', 'might', 'sight'],
  ie: ['pie', 'tie', 'cried', 'fried', 'tried', 'dried', 'spied', 'lie'],
  ou: ['cloud', 'house', 'mouse', 'shout', 'round', 'mouth', 'count', 'proud'],
  'ow*': ['cow', 'town', 'brown', 'crown', 'owl', 'flower', 'clown', 'growl'],
  oi: ['coin', 'soil', 'point', 'boil', 'voice', 'noise', 'join', 'oil'],
  oy: ['boy', 'toy', 'joy', 'enjoy', 'oyster', 'royal', 'annoy', 'cowboy'],
};
/** Other spellings of the same sound, used to make wrong choices. x_e means x, then the consonants, then a silent e. */
const SAME_SOUND: Record<string, string[]> = {
  ai: ['ay', 'a_e'], ay: ['ai', 'ey'], ee: ['ea', 'e_e'], ea: ['ee', 'e_e'], oa: ['ow', 'o_e'], ow: ['oa', 'oe'],
  oo: ['ew', 'u_e', 'ue'], igh: ['ie', 'i_e'], ie: ['igh', 'y'], ou: ['ow'], 'ow*': ['ou'], oi: ['oy'], oy: ['oi'],
};
/** Words whose other spelling is also a real word (meet, rode, write...), so "which spelling?" would be unfair. */
const SOUND_ALIKE = new Set(['tail', 'mail', 'feet', 'queen', 'sweet', 'wheel', 'team', 'beach', 'meat', 'read', 'seat', 'road', 'slow', 'bowl', 'throw', 'right', 'might', 'sight', 'lie', 'tie', 'may', 'day', 'flower', 'boil', 'oil', 'pie']);

const teamOf = (word: string) => Object.keys(TEAMS).find((t) => TEAMS[t].includes(word))!;
const letters = (team: string) => team.replace('*', '');

function respell(word: string, team: string, alt: string): string {
  const t = letters(team);
  const at = word.indexOf(t);
  const pre = word.slice(0, at);
  const post = word.slice(at + t.length);
  if (!alt.endsWith('_e')) return pre + alt + post;
  const cons = post.match(/^[^aeiouy]+/)?.[0];
  return cons ? pre + alt[0] + cons + 'e' + post.slice(cons.length) : pre + alt[0] + post + 'e';
}

function vowelTeams(level: number, rng: Rng): Question {
  const all = Object.values(TEAMS).flat();
  if (level === 0) {
    const word = pick(rng, all);
    const team = teamOf(word);
    const ans = letters(team);
    const wrong = [...new Set(Object.keys(TEAMS).map(letters))].filter((t) => !word.includes(t));
    return {
      key: `vt-find-${word}`,
      prompt: `Which vowel team is in "${word}"?`,
      say: word,
      input: 'choice',
      choices: options(rng, ans, wrong),
      answer: ans,
      hint: 'A vowel team is two or three letters that make one sound together, like ai in rain or ee in tree.',
      explain: `"${word}" has the ${ans} team.`,
    };
  }
  const fair = all.filter((w) => !SOUND_ALIKE.has(w));
  const word = pick(rng, fair);
  const team = teamOf(word);
  if (level === 1) {
    const wrong = [...new Set(SAME_SOUND[team].map((a) => respell(word, team, a)))].filter((w) => w !== word);
    return {
      key: `vt-pick-${word}`,
      prompt: '🔊 Which spelling is right?',
      say: word,
      input: 'choice',
      choices: shuffle(rng, [word, ...wrong]),
      answer: word,
      hint: `Listen for the vowel sound. This word uses the ${letters(team)} team.`,
      explain: `It is spelled ${word}, with ${letters(team)}.`,
    };
  }
  return hearAndSpell(word, undefined, `vt-spell-${word}`, `Listen for the vowel sound. This word uses the ${letters(team)} team.`);
}

// ---------- Homophones (3V1) ----------

const HOMOPHONES: { s: string; a: string; c: string[] }[] = bank.HOMOPHONES as { s: string; a: string; c: string[] }[];

function homophones(level: number, rng: Rng): Question {
  const pool = level === 0 ? HOMOPHONES.filter((h) => h.c.length === 2 && !h.a.includes("'")) : level === 1 ? HOMOPHONES.filter((h) => h.c.length === 3 || h.a.toLowerCase().startsWith('t')) : HOMOPHONES;
  const h = pick(rng, pool.length ? pool : HOMOPHONES);
  return {
    key: `hom-${h.s}`,
    prompt: `Choose the right word: ${h.s.replace('___', '_____')}`,
    say: h.s.replace('___', 'blank'),
    input: 'choice',
    choices: shuffle(rng, h.c),
    answer: h.a,
    hint: 'Homophones sound the same but have different spellings and meanings. Which meaning fits the sentence?',
    explain: h.s.replace('___', h.a),
  };
}

// ---------- Synonyms and antonyms (3V1) ----------

const SYN: [string, string][] = bank.SYN as [string, string][];
const ANT: [string, string][] = bank.ANT as [string, string][];
/** Close-in-meaning groups used only to keep wrong choices fair. */
const NEAR: string[][] = [['up', 'above'], ['down', 'below'], ['last', 'end', 'finish'], ['take', 'grab', 'snatch'], ['sad', 'unhappy'], ['happy', 'glad'], ['weak', 'sick', 'ill'], ['asleep', 'sleepy', 'tired'], ['afraid', 'scared', 'shy', 'timid'], ['cold', 'chilly'], ['hot', 'warm'], ['big', 'large', 'tall'], ['small', 'tiny', 'short'], ['quiet', 'silent', 'soft'], ['shut', 'close'], ['near', 'close'], ['start', 'begin', 'first']];

/** Words that mean about the same as `w`, including `w`. */
function near(w: string): string[] {
  const groups = [...SYN, ...NEAR];
  const out = new Set([w]);
  for (let pass = 0; pass < 2; pass++) for (const g of groups) if (g.some((x) => out.has(x))) g.forEach((x) => out.add(x));
  return [...out];
}

function synonyms(level: number, rng: Rng): Question {
  const anti = level === 1 || (level === 2 && rng() < 0.5);
  const list = anti ? ANT : SYN;
  const [a, b] = pick(rng, list);
  const [w, ans] = rng() < 0.5 ? [a, b] : [b, a];
  const others = shuffle(rng, [...SYN, ...ANT].flat().filter((x) => x !== w && x !== ans)).slice(0, 6);
  // Keep the other word of each pair out so there is only one right answer.
  // Leave out anything close in meaning to either word, so only one choice is right.
  const pairs = [...near(w), ...near(ans), ...ANT.filter(([x, y]) => near(w).includes(x) || near(w).includes(y)).flat().flatMap(near)];
  const kind = anti ? 'an antonym (opposite)' : 'a synonym (means the same)';
  return {
    key: `syn-${anti ? 'a' : 's'}-${w}`,
    prompt: `Which word is ${kind} of "${w}"?`,
    input: 'choice',
    choices: options(rng, ans, others.filter((o) => !pairs.includes(o))),
    answer: ans,
    hint: anti ? 'An antonym means the opposite.' : 'A synonym means the same or almost the same.',
    explain: `"${ans}" is ${anti ? 'an antonym' : 'a synonym'} of "${w}".`,
  };
}

// ---------- Abbreviations (3CV1.5) ----------

const ABBR: [string, string][] = bank.ABBR as [string, string][];

function abbreviations(_level: number, rng: Rng): Question {
  const [long, short] = pick(rng, ABBR);
  const kind = (a: string) => (/^[a-z]/.test(a) ? 'unit' : /^[A-Z]{2}$/.test(a) ? 'place' : /^(Mon|Tues|Wed|Thurs|Fri|Sat|Sun|Jan|Feb|Mar|Apr|Aug|Sept|Oct|Nov|Dec)/.test(a) ? 'date' : 'other');
  const same = ABBR.filter((x) => x[1] !== short && kind(x[1]) === kind(short)).map((x) => x[1]);
  const others = same.length >= 3 ? same : ABBR.filter((x) => x[1] !== short).map((x) => x[1]);
  return { key: `abbr-${long}`, prompt: `What is the short form (abbreviation) of "${long}"?`, input: 'choice', choices: options(rng, short, others), answer: short, hint: 'Abbreviations are short ways to write words. Many use the first letters and end with a period. Metric units like cm and kg have no period.', explain: `${long} → ${short}` };
}

// ---------- Word lists ----------

/** Grade 3 words with sentences. Canadian spellings (colour, favourite, neighbour). */
export const GRADE3_WORDS: [string, string][] = bank.GRADE3_WORDS as [string, string][];

function wordList(level: number, rng: Rng, ctx: GenContext): Question {
  const mine = ctx.spellingList.map((w) => w.trim().toLowerCase()).filter((w) => /^[a-z' ]+$/.test(w));
  if (mine.length && (level === 0 || rng() < 0.7)) {
    const w = pick(rng, mine);
    return hearAndSpell(w, undefined, `list-${w}`, 'This word is on your spelling list. Say it slowly and spell each sound.');
  }
  const [w, s] = pick(rng, level === 0 ? GRADE3_WORDS.slice(0, 60) : GRADE3_WORDS.slice(30));
  return hearAndSpell(w, s, `word-${w}`, 'Say it slowly. Break it into chunks and spell each chunk.');
}

// ---------- Skill list ----------

const OUT_CONV = 'Students investigate and demonstrate how conventions support written communication.';
const OUT_VOCAB = 'Students analyze new words and morphemes to enhance vocabulary.';
const OUT_PHON = 'Students investigate how phonics connects to word formation and supports reading and writing.';

export const SPELLING_SKILLS: Skill[] = [
  { id: 'spell.words', subject: S, name: 'Spelling Words', icon: '📝', blurb: 'Your weekly list (set by a grown-up) and grade 3 words', strand: 'Conventions: Spelling', outcome: OUT_CONV, levels: ['Starter words', 'All grade 3 words'], generate: wordList },
  { id: 'spell.plurals', subject: S, name: 'Plurals', icon: '👯', blurb: 'One pony, two ponies', strand: 'Conventions: Spelling', outcome: OUT_CONV, levels: ['Add s or es', 'y to ies', 'f to ves', 'Special plurals', 'Mixed'], generate: plurals },
  { id: 'spell.endings', subject: S, name: 'Adding -ing and -ed', icon: '🏃', blurb: 'Drop the e, double the letter', strand: 'Conventions: Spelling', outcome: OUT_CONV, levels: ['Just add it', 'Drop the e', 'Double the letter', 'Mixed -ing and -ed'], generate: endings },
  { id: 'spell.contractions', subject: S, name: 'Contractions', icon: '✂️', blurb: "do not → don't", strand: 'Conventions: Spelling', outcome: OUT_CONV, levels: ['Pick it', 'Type it', 'What does it mean?'], generate: contractions },
  { id: 'spell.abbreviations', subject: S, name: 'Abbreviations', icon: '🏷️', blurb: 'Mr., St., AB, cm', strand: 'Conventions: Spelling', outcome: OUT_CONV, levels: ['Short forms'], generate: abbreviations },
  { id: 'spell.prefixes', subject: S, name: 'Prefixes', icon: '⬅️', blurb: 'un-, re-, dis-, mis- and more', strand: 'Vocabulary: Word parts', outcome: OUT_VOCAB, levels: ['re- and un-', 'dis- and mis-', 'sub-, super-, non-, in-', 'Spell it'], generate: prefixes },
  { id: 'spell.suffixes', subject: S, name: 'Suffixes', icon: '➡️', blurb: '-ly, -er, -or, -ist', strand: 'Vocabulary: Word parts', outcome: OUT_VOCAB, levels: ['-ly words', '-er people', '-er, -or or -ist?', 'Mixed'], generate: suffixes },
  { id: 'spell.compounds', subject: S, name: 'Compound Words', icon: '🧩', blurb: 'snow + man = snowman', strand: 'Vocabulary: Word parts', outcome: OUT_VOCAB, levels: ['Split it', 'Join it', 'Hear and spell'], generate: compounds },
  { id: 'spell.homophones', subject: S, name: 'Homophones', icon: '👂', blurb: 'there, their, they’re', strand: 'Vocabulary: Word meaning', outcome: OUT_VOCAB, levels: ['Pairs', 'Tricky trios', 'All'], generate: homophones },
  { id: 'spell.synonyms', subject: S, name: 'Synonyms and Antonyms', icon: '🔄', blurb: 'Same and opposite', strand: 'Vocabulary: Word meaning', outcome: OUT_VOCAB, levels: ['Synonyms', 'Antonyms', 'Mixed'], generate: synonyms },
  { id: 'spell.vowels', subject: S, name: 'Vowel Teams', icon: '🚣', blurb: 'rain, tree, boat, night', strand: 'Phonics', outcome: OUT_PHON, levels: ['Find the vowel team', 'Which spelling is right?', 'Hear and spell'], generate: vowelTeams },
  { id: 'spell.silent', subject: S, name: 'Silent Letters and Tricky Sounds', icon: '🤫', blurb: 'know, write, lamb, phone', strand: 'Phonics', outcome: OUT_PHON, levels: ['Find the silent letter', 'Spell silent-letter words', 'ph, gh, igh, str, spl'], generate: silent },
];
