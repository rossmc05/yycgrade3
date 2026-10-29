// Grammar Garage skills, from the Alberta grade 3 ELAL conventions outcome (3CV1.1, 3CV1.2)
// and figurative language from vocabulary (3V1).

import { options, pick, shuffle } from '../../engine/random';
import type { Question, Rng, Skill } from '../../engine/types';
import bank from '../../content/grammar.json';

const S = 'grammar' as const;

// ---------- Parts of speech ----------

// [word|tag]: n noun, v verb, a adjective, av adverb, p preposition, pr pronoun.
const TAGGED = bank.TAGGED;

const TAG_NAME: Record<string, string> = bank.TAG_NAME as Record<string, string>;
const TAG_HINT: Record<string, string> = bank.TAG_HINT as Record<string, string>;

function parseTagged(t: string) {
  const words: { word: string; tag: string }[] = [];
  const plain = t.replace(/\[([^|\]]+)\|([a-z]+)\]/g, (_, w: string, tag: string) => {
    words.push({ word: w, tag });
    return w;
  });
  return { plain, words };
}

/** "a noun", "an adjective". */
const an = (word: string) => `${/^[aeiou]/.test(word) ? 'an' : 'a'} ${word}`;

function partsOfSpeech(level: number, rng: Rng): Question {
  const tags = [['n', 'v'], ['a'], ['av'], ['p', 'pr'], ['n', 'v', 'a', 'av', 'p', 'pr']][level];
  const tag = pick(rng, tags);
  const candidates = TAGGED.map(parseTagged).filter((x) => x.words.some((w) => w.tag === tag));
  const { plain, words } = pick(rng, candidates);
  const right = pick(rng, words.filter((w) => w.tag === tag));
  const wrong = shuffle(rng, words.filter((w) => w.tag !== tag)).slice(0, 3).map((w) => w.word);
  return {
    key: `pos-${tag}-${plain}-${right.word}`,
    prompt: `Which word is ${an(TAG_NAME[tag])}? "${plain}"`,
    input: 'choice',
    choices: options(rng, right.word, wrong),
    answer: right.word,
    hint: TAG_HINT[tag],
    explain: `"${right.word}" is ${an(TAG_NAME[tag])}. ${TAG_HINT[tag]}`,
  };
}

// ---------- Capital letters ----------

const CAPS = bank.CAPS;

function capitals(level: number, rng: Rng): Question {
  const correct = pick(rng, CAPS);
  const words = correct.split(' ');
  const capIdx = words.map((w, i) => (/^[A-Z]/.test(w) ? i : -1)).filter((i) => i >= 0);
  const lowIdx = words.map((w, i) => (/^[a-z]/.test(w) ? i : -1)).filter((i) => i >= 0);
  const lower = (i: number) => words.map((w, j) => (j === i ? w[0].toLowerCase() + w.slice(1) : w)).join(' ');
  const upper = (i: number) => words.map((w, j) => (j === i ? w[0].toUpperCase() + w.slice(1) : w)).join(' ');
  const wrongs = [...shuffle(rng, capIdx).slice(0, 3).map(lower), ...shuffle(rng, lowIdx).slice(0, level === 0 ? 0 : 2).map(upper)];
  if (level >= 2) {
    // Find the word that should have a capital.
    const names = capIdx.filter((k) => k > 0 && words[k] !== 'I');
    const i = pick(rng, names.length ? names : capIdx);
    const shown = lower(i);
    const word = words[i].replace(/[.,!?]/g, '');
    const choices = options(rng, word.toLowerCase(), shuffle(rng, lowIdx).map((k) => words[k].replace(/[.,!?]/g, '').toLowerCase()));
    return {
      key: `cap-find-${correct}-${i}`,
      prompt: `Which word needs a capital letter? "${shown}"`,
      input: 'choice',
      choices,
      answer: word.toLowerCase(),
      hint: 'Names of people, pets, places, days, months, teams and titles start with a capital letter.',
      explain: `"${word}" is a name, so it needs a capital: ${correct}`,
    };
  }
  return {
    key: `cap-pick-${correct}`,
    prompt: 'Which sentence uses capital letters correctly?',
    input: 'choice',
    choices: options(rng, correct, wrongs),
    answer: correct,
    hint: 'Start every sentence with a capital. Names of people, places, days and months need capitals too. Other words do not.',
    explain: correct,
  };
}

// ---------- End punctuation and sentence types ----------

const TYPES: { s: string; type: 'statement' | 'question' | 'exclamation' | 'command'; end: string }[] = bank.TYPES as { s: string; type: 'statement' | 'question' | 'exclamation' | 'command'; end: string }[];

function sentenceTypes(level: number, rng: Rng): Question {
  const pool = level === 0 ? TYPES.filter((t) => t.type !== 'command') : TYPES;
  const t = pick(rng, pool);
  if (level === 0) {
    return {
      key: `end-${t.s}`,
      prompt: `Which mark ends this sentence? "${t.s}__"`,
      input: 'choice',
      choices: ['.', '?', '!'],
      answer: t.end,
      hint: 'A telling sentence ends with a period. An asking sentence ends with a question mark. A sentence with strong feeling ends with an exclamation mark.',
      explain: `${t.s}${t.end}`,
    };
  }
  return {
    key: `type-${t.s}`,
    prompt: `What kind of sentence is this? "${t.s}${t.end}"`,
    input: 'choice',
    choices: ['statement', 'question', 'exclamation', 'command'],
    answer: t.type,
    hint: 'Statement: tells something. Question: asks. Exclamation: shows strong feeling. Command: tells someone to do something.',
    explain: `"${t.s}${t.end}" is a ${t.type}.`,
  };
}

// ---------- Commas, quotation marks and apostrophes ----------

const LISTS = bank.LISTS;
const STARTS = bank.STARTS;
const QUOTES = bank.QUOTES as [string, string, string?][];
const POSSESSIVE: { s: string; right: string; wrong: string[] }[] = bank.POSSESSIVE as { s: string; right: string; wrong: string[] }[];

function punctuation(level: number, rng: Rng): Question {
  const kind = level === 0 ? 'comma' : level === 1 ? 'quote' : level === 2 ? 'apostrophe' : pick(rng, ['comma', 'quote', 'apostrophe']);
  if (kind === 'comma') {
    const [a, b, c] = pick(rng, LISTS);
    const st = pick(rng, STARTS);
    const right = `${st} ${a}, ${b}, and ${c}.`;
    return {
      key: `comma-${right}`,
      prompt: 'Which sentence uses commas correctly?',
      input: 'choice',
      choices: options(rng, right, [`${st} ${a} ${b} and ${c}.`, `${st}, ${a} ${b}, and ${c}.`, `${st} ${a}, ${b} and, ${c}.`]),
      answer: right,
      hint: 'Use a comma to separate things in a list. A comma before "and" is fine too.',
      explain: right,
    };
  }
  if (kind === 'quote') {
    const [who, said, end = '.'] = pick(rng, QUOTES);
    const right = `${who} said, "${said}${end}"`;
    return {
      key: `quote-${right}`,
      prompt: 'Which sentence uses quotation marks correctly?',
      input: 'choice',
      choices: options(rng, right, [`"${who} said, ${said}${end}"`, `${who} said, ${said}${end}`, `${who} said "${said}${end}"`, `${who} said, "${said}"${end}`]),
      answer: right,
      hint: 'Quotation marks go around the exact words someone says. Put a comma after said, and put the end mark inside the quotation marks.',
      explain: right,
    };
  }
  const p = pick(rng, POSSESSIVE);
  return {
    key: `apos-${p.s}`,
    prompt: `Choose the right word: ${p.s.replace('___', '_____')}`,
    input: 'choice',
    choices: options(rng, p.right, p.wrong),
    answer: p.right,
    hint: "To show something belongs to one owner, add 's. If the owner word is plural and ends in s, add only the apostrophe.",
    explain: p.s.replace('___', p.right),
  };
}

// ---------- Subject and predicate ----------

const SUBJ_PRED: [string, string][] = bank.SUBJ_PRED as [string, string][];

function subjectPredicate(level: number, rng: Rng): Question {
  const [subj, pred] = pick(rng, SUBJ_PRED);
  const sentence = `${subj} ${pred}`;
  const ask = level === 0 ? 'subject' : rng() < 0.5 ? 'subject' : 'predicate';
  const words = pred.replace('.', '').split(' ');
  const fake1 = `${subj} ${words[0]}`;
  const fake2 = words.slice(1).join(' ');
  const right = ask === 'subject' ? subj : pred.replace('.', '');
  return {
    key: `sp-${ask}-${sentence}`,
    prompt: `What is the ${ask} of this sentence? "${sentence}"`,
    input: 'choice',
    choices: options(rng, right, [ask === 'subject' ? pred.replace('.', '') : subj, fake1, fake2].filter(Boolean)),
    answer: right,
    hint: 'The subject is who or what the sentence is about. The predicate tells what the subject does or is.',
    explain: `Subject: "${subj}". Predicate: "${pred.replace('.', '')}".`,
  };
}

// ---------- Conjunctions ----------

const CONJ: { s: string; a: string }[] = bank.CONJ as { s: string; a: string }[];

function conjunctions(_level: number, rng: Rng): Question {
  const c = pick(rng, CONJ);
  return {
    key: `conj-${c.s}`,
    prompt: `Choose the joining word: ${c.s.replace('___', '_____')}`,
    say: c.s.replace('___', 'blank'),
    input: 'choice',
    choices: c.a === 'and' ? ['and', 'but', 'or', 'so'] : ['but', 'or', 'so'],
    answer: c.a,
    hint: 'and adds more. but shows something different. or gives a choice. so tells what happened because of it.',
    explain: c.s.replace('___', c.a),
  };
}

// ---------- Subject-verb agreement ----------

const SUBJECTS: { s: string; many: boolean }[] = bank.SUBJECTS as { s: string; many: boolean }[];
const VERBS: { one: string; many: string; rest: string }[] = bank.VERBS as { one: string; many: string; rest: string }[];

function agreement(_level: number, rng: Rng): Question {
  const sub = pick(rng, SUBJECTS);
  const v = pick(rng, sub.s === 'I' ? VERBS.filter((x) => x.one !== 'is' && x.one !== 'was') : VERBS);
  const ans = sub.many ? v.many : v.one;
  return {
    key: `sva-${sub.s}-${v.one}`,
    prompt: `Choose the verb that fits: ${sub.s} _____ ${v.rest}.`,
    say: `${sub.s} blank ${v.rest}.`,
    input: 'choice',
    choices: shuffle(rng, [v.one, v.many]),
    answer: ans,
    hint: 'One person or thing usually takes a verb ending in s (the dog runs). More than one, or I, we, you, they, takes no s (the dogs run).',
    explain: `${sub.s} ${ans} ${v.rest}.`,
  };
}

// ---------- Verb tense ----------

// [base verb, past tense, the rest of the sentence]
const REGULAR: [string, string, string][] = [
  ['walk', 'walked', 'the dog'], ['play', 'played', 'hockey'], ['paint', 'painted', 'a picture'], ['bake', 'baked', 'muffins'], ['clean', 'cleaned', 'the room'],
  ['kick', 'kicked', 'the ball'], ['watch', 'watched', 'a movie'], ['help', 'helped', 'Grandpa'], ['jump', 'jumped', 'in the leaves'], ['plant', 'planted', 'seeds'],
  ['climb', 'climbed', 'the hill'], ['cook', 'cooked', 'supper'], ['visit', 'visited', 'the zoo'], ['wash', 'washed', 'the dishes'], ['pick', 'picked', 'berries'],
  ['shovel', 'shovelled', 'the snow'], ['skate', 'skated', 'on the pond'], ['carry', 'carried', 'the box'], ['stop', 'stopped', 'at the corner'], ['hop', 'hopped', 'over the log'],
];
const IRREGULAR: [string, string, string][] = [
  ['go', 'went', 'to school'], ['eat', 'ate', 'an apple'], ['run', 'ran', 'to the park'], ['see', 'saw', 'a moose'], ['make', 'made', 'a snowman'],
  ['write', 'wrote', 'a story'], ['swim', 'swam', 'in the lake'], ['ride', 'rode', 'a bike'], ['sing', 'sang', 'a song'], ['drink', 'drank', 'some milk'],
  ['find', 'found', 'a rock'], ['take', 'took', 'the bus'], ['throw', 'threw', 'the ball'], ['catch', 'caught', 'the ball'], ['build', 'built', 'a fort'],
  ['draw', 'drew', 'a horse'], ['fly', 'flew', 'a kite'], ['bring', 'brought', 'a lunch'], ['buy', 'bought', 'a toque'], ['win', 'won', 'the game'],
  ['wear', 'wore', 'mittens'], ['feed', 'fed', 'the cat'], ['drive', 'drove', 'to Banff'], ['sleep', 'slept', 'in a tent'], ['give', 'gave', 'a gift'],
];
const ONE = ['Mia', 'Liam', 'My sister', 'Our teacher', 'Noah', 'Ava'];
const MANY = ['We', 'They', 'The kids', 'My friends'];
const PAST_WORDS = ['Yesterday,', 'Last night,', 'Last week,'];
const NOW_WORDS = ['Every day,', 'Every morning,', 'On Saturdays,'];
const LATER_WORDS = ['Tomorrow,', 'Next week,', 'Later today,'];

/** Present tense for one person: runs, watches, carries, goes. */
function presentOne(v: string): string {
  if (/(s|sh|ch|x|o)$/.test(v)) return `${v}es`;
  if (/[^aeiou]y$/.test(v)) return `${v.slice(0, -1)}ies`;
  return `${v}s`;
}
/** A wrong past tense a child might write: goed, runned, catched. */
function overRegular(v: string): string {
  if (v.endsWith('e')) return `${v}d`;
  if (/[^aeiou][aeiou][bdgmnpt]$/.test(v)) return `${v}${v.slice(-1)}ed`;
  return `${v}ed`;
}

function tense(level: number, rng: Rng): Question {
  const verbs = level === 1 ? REGULAR : level === 2 ? IRREGULAR : [...REGULAR, ...IRREGULAR];
  const [base, past, rest] = pick(rng, verbs);
  const many = rng() < 0.4;
  const who = pick(rng, many ? MANY : ONE);
  const present = many ? base : presentOne(base);
  const future = `will ${base}`;
  const forms = { past, present, future };
  const lower = (w: string) => (/^(We|They|My|Our|The)\b/.test(w) ? w[0].toLowerCase() + w.slice(1) : w);
  if (level === 0) {
    const t = pick(rng, ['past', 'present', 'future'] as const);
    return {
      key: `tense-which-${who}-${base}-${t}`,
      prompt: `Is this sentence in the past, present or future? "${who} ${forms[t]} ${rest}."`,
      say: `${who} ${forms[t]} ${rest}.`,
      input: 'choice',
      choices: ['past', 'present', 'future'],
      answer: t,
      hint: 'Past already happened (walked, went). Present is happening now or every day (walks). Future has not happened yet (will walk).',
      explain: `"${forms[t]}" is ${t} tense.`,
    };
  }
  const t = level === 3 ? pick(rng, ['past', 'present', 'future'] as const) : 'past';
  const when = pick(rng, t === 'past' ? PAST_WORDS : t === 'present' ? NOW_WORDS : LATER_WORDS);
  const ans = forms[t];
  const wrong = level === 2 ? [overRegular(base), present, future, base] : [present, future, past, base, overRegular(base)];
  return {
    key: `tense-fill-${when}-${who}-${base}`,
    prompt: `Choose the verb that fits: ${when} ${lower(who)} _____ ${rest}.`,
    say: `${when} ${lower(who)} blank ${rest}.`,
    input: 'choice',
    choices: options(rng, ans, wrong),
    answer: ans,
    hint: `"${when.replace(',', '')}" tells you when it happens. ${t === 'past' ? 'It already happened.' : t === 'present' ? 'It happens again and again.' : 'It has not happened yet.'}`,
    explain: `${when} ${lower(who)} ${ans} ${rest}.`,
  };
}

// ---------- Similes ----------

const SIMILES = bank.SIMILES;
const NOT_SIMILES = bank.NOT_SIMILES;

function similes(_level: number, rng: Rng): Question {
  const right = pick(rng, SIMILES);
  return {
    key: `sim-${right}`,
    prompt: 'Which sentence has a simile?',
    input: 'choice',
    choices: options(rng, right, NOT_SIMILES),
    answer: right,
    hint: 'A simile compares two different things using "like" or "as". Careful: "I like pizza" is not a comparison.',
    explain: `"${right}" compares two things using like or as.`,
  };
}

// ---------- Skill list ----------

const OUT = 'Students investigate and demonstrate how conventions support written communication.';

export const GRAMMAR_SKILLS: Skill[] = [
  { id: 'gram.parts', subject: S, name: 'Parts of Speech', icon: '🧱', blurb: 'Nouns, verbs, adjectives and more', strand: 'Grammar', outcome: OUT, levels: ['Nouns and verbs', 'Adjectives', 'Adverbs', 'Prepositions and pronouns', 'All mixed'], generate: partsOfSpeech },
  { id: 'gram.subject', subject: S, name: 'Subject and Predicate', icon: '✂️', blurb: 'Who it is about and what they do', strand: 'Grammar', outcome: OUT, levels: ['Find the subject', 'Subject or predicate'], generate: subjectPredicate },
  { id: 'gram.agreement', subject: S, name: 'Verb Agreement', icon: '🤝', blurb: 'The dog runs, the dogs run', strand: 'Grammar', outcome: OUT, levels: ['Make it match'], generate: agreement },
  { id: 'gram.tense', subject: S, name: 'Verb Tense', icon: '⏳', blurb: 'Past, present and future', strand: 'Grammar', outcome: OUT, levels: ['Past, present or future?', 'Past tense with -ed', 'Tricky past tense', 'Pick the right tense'], generate: tense },
  { id: 'gram.conjunctions', subject: S, name: 'Joining Words', icon: '🔗', blurb: 'and, but, or, so', strand: 'Grammar', outcome: OUT, levels: ['Conjunctions'], generate: conjunctions },
  { id: 'gram.types', subject: S, name: 'Sentence Types', icon: '❓', blurb: 'Statements, questions, commands', strand: 'Capitals and punctuation', outcome: OUT, levels: ['End marks', 'Four kinds of sentences'], generate: sentenceTypes },
  { id: 'gram.capitals', subject: S, name: 'Capital Letters', icon: '🔠', blurb: 'Names, places, days and months', strand: 'Capitals and punctuation', outcome: OUT, levels: ['Pick the right one', 'Trickier choices', 'Find the missing capital'], generate: capitals },
  { id: 'gram.punctuation', subject: S, name: 'Commas, Quotes and Apostrophes', icon: '❞', blurb: 'Lists, speech and belonging', strand: 'Capitals and punctuation', outcome: OUT, levels: ['Commas in lists', 'Quotation marks', 'Apostrophes', 'Mixed'], generate: punctuation },
  { id: 'gram.similes', subject: S, name: 'Similes', icon: '🦁', blurb: 'As brave as a lion', strand: 'Word play', outcome: 'Students analyze new words and morphemes to enhance vocabulary (figurative language).', levels: ['Spot the simile'], generate: similes },
];

export { parseTagged };
