// Spell Builder skills, from the Alberta grade 3 ELAL outcomes for phonics (3P1),
// vocabulary and morphology (3V1) and spelling conventions (3CV1). Canadian spelling throughout.

import { int, options, pick, shuffle } from '../../engine/random';
import type { GenContext, Question, Rng, Skill } from '../../engine/types';

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

const PLURALS: { one: string; many: string; rule: number }[] = [
  // 0: add s or es
  ...[['box', 'boxes'], ['bus', 'buses'], ['dish', 'dishes'], ['watch', 'watches'], ['fox', 'foxes'], ['glass', 'glasses'], ['brush', 'brushes'], ['lunch', 'lunches'], ['dog', 'dogs'], ['book', 'books'], ['bench', 'benches'], ['dress', 'dresses'], ['puck', 'pucks'], ['wish', 'wishes']].map(([one, many]) => ({ one, many, rule: 0 })),
  // 1: y changes to i, add es; vowel + y just adds s
  ...[['pony', 'ponies'], ['baby', 'babies'], ['city', 'cities'], ['story', 'stories'], ['puppy', 'puppies'], ['family', 'families'], ['berry', 'berries'], ['party', 'parties'], ['cherry', 'cherries'], ['bunny', 'bunnies'], ['day', 'days'], ['boy', 'boys'], ['key', 'keys'], ['toy', 'toys'], ['monkey', 'monkeys']].map(([one, many]) => ({ one, many, rule: 1 })),
  // 2: f or fe changes to v, add es
  ...[['leaf', 'leaves'], ['wolf', 'wolves'], ['knife', 'knives'], ['life', 'lives'], ['half', 'halves'], ['calf', 'calves'], ['shelf', 'shelves'], ['loaf', 'loaves'], ['wife', 'wives'], ['thief', 'thieves'], ['elf', 'elves'], ['scarf', 'scarves']].map(([one, many]) => ({ one, many, rule: 2 })),
  // 3: irregular, or the same as one
  ...[['moose', 'moose'], ['deer', 'deer'], ['sheep', 'sheep'], ['fish', 'fish'], ['person', 'people'], ['child', 'children'], ['mouse', 'mice'], ['tooth', 'teeth'], ['foot', 'feet'], ['goose', 'geese'], ['man', 'men'], ['woman', 'women'], ['bison', 'bison']].map(([one, many]) => ({ one, many, rule: 3 })),
];

const PLURAL_HINTS = [
  'Most words add s. Words ending in s, x, sh or ch add es.',
  'If a consonant comes before the y, change y to i and add es. If a vowel comes before the y, just add s.',
  'For many words ending in f or fe, change the f to v and add es.',
  'Some words change in a special way, and some stay the same: one moose, two moose.',
];

function plurals(level: number, rng: Rng): Question {
  const rule = level < 4 ? level : int(rng, 0, 3);
  const w = pick(rng, PLURALS.filter((p) => p.rule === rule));
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

const ENDINGS: { base: string; ing: string; ed: string; rule: number }[] = [
  ...[['jump', 'jumping', 'jumped'], ['play', 'playing', 'played'], ['help', 'helping', 'helped'], ['look', 'looking', 'looked'], ['kick', 'kicking', 'kicked'], ['rain', 'raining', 'rained'], ['pass', 'passing', 'passed'], ['melt', 'melting', 'melted'], ['walk', 'walking', 'walked'], ['talk', 'talking', 'talked'], ['paint', 'painting', 'painted'], ['cook', 'cooking', 'cooked'], ['call', 'calling', 'called'], ['push', 'pushing', 'pushed'], ['fix', 'fixing', 'fixed'], ['snow', 'snowing', 'snowed'], ['climb', 'climbing', 'climbed'], ['count', 'counting', 'counted'], ['shout', 'shouting', 'shouted']].map(([base, ing, ed]) => ({ base, ing, ed, rule: 0 })),
  ...[['bake', 'baking', 'baked'], ['smile', 'smiling', 'smiled'], ['hope', 'hoping', 'hoped'], ['skate', 'skating', 'skated'], ['dance', 'dancing', 'danced'], ['slide', 'sliding', 'slid'], ['shine', 'shining', 'shone'], ['race', 'racing', 'raced'], ['score', 'scoring', 'scored'], ['share', 'sharing', 'shared'], ['wave', 'waving', 'waved'], ['joke', 'joking', 'joked']].map(([base, ing, ed]) => ({ base, ing, ed, rule: 1 })),
  ...[['hop', 'hopping', 'hopped'], ['stop', 'stopping', 'stopped'], ['clap', 'clapping', 'clapped'], ['plan', 'planning', 'planned'], ['skip', 'skipping', 'skipped'], ['drop', 'dropping', 'dropped'], ['hug', 'hugging', 'hugged'], ['jog', 'jogging', 'jogged'], ['shop', 'shopping', 'shopped'], ['nod', 'nodding', 'nodded'], ['trip', 'tripping', 'tripped'], ['grab', 'grabbing', 'grabbed']].map(([base, ing, ed]) => ({ base, ing, ed, rule: 2 })),
];

const ENDING_HINTS = [
  'Just add the ending to the word.',
  'When a word ends in a silent e, drop the e before adding ing or ed.',
  'Short vowel, one consonant at the end? Double the last letter before adding ing or ed.',
];

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

const CONTRACTIONS: [string, string][] = [
  ['do not', "don't"], ['can not', "can't"], ['is not', "isn't"], ['I am', "I'm"], ['you are', "you're"], ['it is', "it's"], ['we will', "we'll"],
  ['they are', "they're"], ['she is', "she's"], ['he will', "he'll"], ['did not', "didn't"], ['was not', "wasn't"], ['I have', "I've"], ['we are', "we're"],
  ['let us', "let's"], ['would not', "wouldn't"], ['could not', "couldn't"], ['I will', "I'll"], ['have not', "haven't"], ['are not', "aren't"],
  ['does not', "doesn't"], ['will not', "won't"], ['you will', "you'll"], ['should not', "shouldn't"],
];

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

const PREFIX_MEANING: Record<string, string> = { re: 'again', un: 'not', dis: 'not or the opposite', mis: 'wrongly', sub: 'under', super: 'above or extra', non: 'not', in: 'not' };
const PREFIX_WORDS: { word: string; prefix: string; base: string; meaning: string }[] = [
  { word: 'reread', prefix: 're', base: 'read', meaning: 'read again' },
  { word: 'rewrite', prefix: 're', base: 'write', meaning: 'write again' },
  { word: 'replay', prefix: 're', base: 'play', meaning: 'play again' },
  { word: 'refill', prefix: 're', base: 'fill', meaning: 'fill again' },
  { word: 'unhappy', prefix: 'un', base: 'happy', meaning: 'not happy' },
  { word: 'unlock', prefix: 'un', base: 'lock', meaning: 'the opposite of lock' },
  { word: 'unkind', prefix: 'un', base: 'kind', meaning: 'not kind' },
  { word: 'unsafe', prefix: 'un', base: 'safe', meaning: 'not safe' },
  { word: 'dislike', prefix: 'dis', base: 'like', meaning: 'the opposite of like' },
  { word: 'disagree', prefix: 'dis', base: 'agree', meaning: 'not agree' },
  { word: 'disappear', prefix: 'dis', base: 'appear', meaning: 'the opposite of appear' },
  { word: 'misspell', prefix: 'mis', base: 'spell', meaning: 'spell wrongly' },
  { word: 'misplace', prefix: 'mis', base: 'place', meaning: 'put in the wrong place' },
  { word: 'misbehave', prefix: 'mis', base: 'behave', meaning: 'behave badly' },
  { word: 'subway', prefix: 'sub', base: 'way', meaning: 'a train that runs under the ground' },
  { word: 'submarine', prefix: 'sub', base: 'marine', meaning: 'a boat that goes under the sea' },
  { word: 'superhero', prefix: 'super', base: 'hero', meaning: 'a hero with extra powers' },
  { word: 'superstar', prefix: 'super', base: 'star', meaning: 'a very big star' },
  { word: 'nonstop', prefix: 'non', base: 'stop', meaning: 'without stopping' },
  { word: 'nonfiction', prefix: 'non', base: 'fiction', meaning: 'not made up' },
  { word: 'incorrect', prefix: 'in', base: 'correct', meaning: 'not correct' },
  { word: 'incomplete', prefix: 'in', base: 'complete', meaning: 'not complete' },
];

function prefixes(level: number, rng: Rng): Question {
  const sets = [['re', 'un'], ['re', 'un', 'dis', 'mis'], Object.keys(PREFIX_MEANING), Object.keys(PREFIX_MEANING)];
  const w = pick(rng, PREFIX_WORDS.filter((p) => sets[Math.min(level, 3)].includes(p.prefix)));
  const hint = `The prefix "${w.prefix}-" means "${PREFIX_MEANING[w.prefix]}".`;
  if (level === 3) {
    return { ...hearAndSpell(w.word, undefined, `pre-spell-${w.word}`, hint), prompt: `🔊 Spell the word that means "${w.meaning}".` };
  }
  if (rng() < 0.5) {
    const others = shuffle(rng, PREFIX_WORDS.filter((p) => p.meaning !== w.meaning)).slice(0, 3).map((p) => p.meaning);
    return { key: `pre-mean-${w.word}`, prompt: `What does "${w.word}" mean?`, input: 'choice', choices: options(rng, w.meaning, others), answer: w.meaning, hint, explain: `${w.prefix} + ${w.base} = ${w.word}, which means ${w.meaning}.` };
  }
  const choices = options(rng, w.prefix, sets[Math.min(level, 3)].filter((p) => !PREFIX_WORDS.some((x) => x.word === p + w.base)));
  return { key: `pre-add-${w.word}`, prompt: `Which prefix makes a word that means "${w.meaning}"? ___${w.base}`, input: 'choice', choices, answer: w.prefix, hint, explain: `${w.prefix} + ${w.base} = ${w.word}.` };
}

const PEOPLE: { base: string; word: string; doing: string }[] = [
  { base: 'teach', word: 'teacher', doing: 'teaches' }, { base: 'paint', word: 'painter', doing: 'paints' }, { base: 'farm', word: 'farmer', doing: 'farms' },
  { base: 'play', word: 'player', doing: 'plays a sport' }, { base: 'bake', word: 'baker', doing: 'bakes bread' }, { base: 'sing', word: 'singer', doing: 'sings' },
  { base: 'act', word: 'actor', doing: 'acts in plays and movies' }, { base: 'sail', word: 'sailor', doing: 'sails ships' }, { base: 'visit', word: 'visitor', doing: 'visits' },
  { base: 'invent', word: 'inventor', doing: 'invents things' }, { base: 'art', word: 'artist', doing: 'makes art' }, { base: 'piano', word: 'pianist', doing: 'plays the piano' },
  { base: 'cycle', word: 'cyclist', doing: 'rides a bike' },
  { base: 'build', word: 'builder', doing: 'builds houses' }, { base: 'drive', word: 'driver', doing: 'drives a bus' }, { base: 'read', word: 'reader', doing: 'reads books' },
  { base: 'write', word: 'writer', doing: 'writes stories' }, { base: 'garden', word: 'gardener', doing: 'grows a garden' }, { base: 'dance', word: 'dancer', doing: 'dances' },
  { base: 'ski', word: 'skier', doing: 'skis down mountains' }, { base: 'help', word: 'helper', doing: 'helps' }, { base: 'lead', word: 'leader', doing: 'leads a group' },
  { base: 'climb', word: 'climber', doing: 'climbs rocks' }, { base: 'speak', word: 'speaker', doing: 'speaks to a crowd' }, { base: 'own', word: 'owner', doing: 'owns a store' },
  { base: 'edit', word: 'editor', doing: 'fixes and checks writing' }, { base: 'direct', word: 'director', doing: 'directs a movie' }, { base: 'guitar', word: 'guitarist', doing: 'plays the guitar' },
  { base: 'tour', word: 'tourist', doing: 'tours a new place' },
];
const LY: [string, string][] = [['quick', 'quickly'], ['slow', 'slowly'], ['loud', 'loudly'], ['soft', 'softly'], ['brave', 'bravely'], ['careful', 'carefully'], ['sad', 'sadly'], ['kind', 'kindly'], ['quiet', 'quietly'], ['safe', 'safely'], ['proud', 'proudly'], ['neat', 'neatly'], ['sweet', 'sweetly'], ['bright', 'brightly'], ['calm', 'calmly'], ['glad', 'gladly'], ['warm', 'warmly'], ['nice', 'nicely'], ['wild', 'wildly'], ['fair', 'fairly'], ['silent', 'silently'], ['clear', 'clearly'], ['bad', 'badly']];

function suffixes(level: number, rng: Rng): Question {
  if (level === 0 || (level === 3 && rng() < 0.4)) {
    const [base, word] = pick(rng, LY);
    return { key: `suf-ly-${word}`, prompt: `Add -ly: ${base} + ly = ______`, input: 'text', answer: word, hint: 'Adding -ly tells how something is done: quick → quickly.', explain: `${base} + ly = ${word}.` };
  }
  const stem = (x: { base: string }) => x.base.replace(/e$/, '');
  const pool = level === 1 ? PEOPLE.filter((x) => x.word.endsWith('er')) : level === 2 ? PEOPLE.filter((x) => x.word.startsWith(stem(x))) : PEOPLE;
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
  return { key: `suf-type-${p.word}`, prompt: `A person who ${p.doing} is a ______.`, input: 'text', answer: p.word, hint: 'Add -er, -or or -ist to name a person who does something.', explain: `${p.base} → ${p.word}.` };
}

// ---------- Compound words (3V1.2, 3CV1.5) ----------

const COMPOUNDS: [string, string][] = [
  ['sun', 'flower'], ['rain', 'bow'], ['snow', 'man'], ['foot', 'ball'], ['butter', 'fly'], ['pan', 'cake'], ['cup', 'cake'], ['tooth', 'brush'], ['back', 'pack'],
  ['play', 'ground'], ['bed', 'room'], ['fire', 'fly'], ['star', 'fish'], ['home', 'work'], ['base', 'ball'], ['sand', 'box'], ['gold', 'fish'], ['snow', 'ball'],
  ['sail', 'boat'], ['sun', 'shine'], ['every', 'one'], ['some', 'thing'], ['air', 'plane'], ['week', 'end'], ['pop', 'corn'],
];

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

const SILENT: { word: string; letter: string; sentence: string }[] = [
  { word: 'know', letter: 'k', sentence: 'I know the answer.' }, { word: 'knee', letter: 'k', sentence: 'I bumped my knee.' },
  { word: 'knife', letter: 'k', sentence: 'Use a knife to cut the bread.' }, { word: 'knock', letter: 'k', sentence: 'Please knock on the door.' },
  { word: 'write', letter: 'w', sentence: 'I can write my name.' }, { word: 'wrong', letter: 'w', sentence: 'That answer is wrong.' },
  { word: 'wrap', letter: 'w', sentence: 'We wrap the present.' }, { word: 'wrist', letter: 'w', sentence: 'My watch is on my wrist.' },
  { word: 'lamb', letter: 'b', sentence: 'The lamb is soft.' }, { word: 'thumb', letter: 'b', sentence: 'I hurt my thumb.' },
  { word: 'climb', letter: 'b', sentence: 'We climb the hill.' }, { word: 'comb', letter: 'b', sentence: 'Comb your hair.' },
  { word: 'sign', letter: 'g', sentence: 'Stop at the stop sign.' }, { word: 'gnome', letter: 'g', sentence: 'The garden gnome has a red hat.' },
  { word: 'listen', letter: 't', sentence: 'Listen to the music.' }, { word: 'castle', letter: 't', sentence: 'The king lives in a castle.' },
  { word: 'hour', letter: 'h', sentence: 'The game lasts one hour.' }, { word: 'ghost', letter: 'h', sentence: 'The ghost said boo.' },
];
const SOUNDS: { word: string; sentence: string; hint: string }[] = [
  { word: 'phone', sentence: 'My phone is ringing.', hint: 'The f sound is spelled ph.' },
  { word: 'laugh', sentence: 'The joke made me laugh.', hint: 'The f sound at the end is spelled gh.' },
  { word: 'night', sentence: 'The stars come out at night.', hint: 'The long i sound is spelled igh.' },
  { word: 'light', sentence: 'Turn on the light.', hint: 'The long i sound is spelled igh.' },
  { word: 'school', sentence: 'We walk to school.', hint: 'The k sound is spelled ch.' },
  { word: 'whale', sentence: 'A whale swims in the ocean.', hint: 'It starts with wh.' },
  { word: 'shrink', sentence: 'Wool can shrink in hot water.', hint: 'It starts with three letters: s-h-r.' },
  { word: 'splash', sentence: 'The kids splash in the pool.', hint: 'It starts with spl and ends with sh.' },
  { word: 'strong', sentence: 'The bridge is very strong.', hint: 'It starts with str and ends with ng.' },
  { word: 'graph', sentence: 'We made a bar graph.', hint: 'The f sound is spelled ph.' },
  { word: 'dolphin', sentence: 'A dolphin jumped out of the water.', hint: 'The f sound in the middle is spelled ph.' },
  { word: 'elephant', sentence: 'The elephant has a long trunk.', hint: 'The f sound is spelled ph.' },
  { word: 'tough', sentence: 'The goalie is tough.', hint: 'The f sound at the end is spelled gh.' },
  { word: 'high', sentence: 'The kite flew high in the sky.', hint: 'The long i sound is spelled igh.' },
  { word: 'bright', sentence: 'The sun is bright today.', hint: 'The long i sound is spelled igh.' },
  { word: 'right', sentence: 'Turn right at the corner.', hint: 'The long i sound is spelled igh.' },
  { word: 'street', sentence: 'We live on a quiet street.', hint: 'It starts with str.' },
  { word: 'string', sentence: 'Tie the string to the kite.', hint: 'It starts with str and ends with ng.' },
  { word: 'split', sentence: 'We split the cookie in half.', hint: 'It starts with spl.' },
  { word: 'stripe', sentence: 'The flag has a red stripe.', hint: 'It starts with str and ends with a silent e.' },
  { word: 'whisper', sentence: 'Please whisper in the library.', hint: 'It starts with wh.' },
  { word: 'chorus', sentence: 'We sang the chorus together.', hint: 'The k sound is spelled ch.' },
];

function silent(level: number, rng: Rng): Question {
  if (level === 0) {
    const w = pick(rng, SILENT);
    const letters = [...new Set(w.word.split(''))];
    return { key: `sil-which-${w.word}`, prompt: `Which letter is silent in "${w.word}"?`, input: 'choice', choices: options(rng, w.letter, letters), answer: w.letter, hint: 'Say the word slowly. Which letter do you not hear? Look at the start or the end.', explain: `In "${w.word}" the ${w.letter} is silent.` };
  }
  if (level === 1) {
    const w = pick(rng, SILENT);
    return hearAndSpell(w.word, w.sentence, `sil-spell-${w.word}`, `This word has a silent ${w.letter}.`);
  }
  const w = pick(rng, SOUNDS);
  return hearAndSpell(w.word, w.sentence, `snd-spell-${w.word}`, w.hint);
}

// ---------- Homophones (3V1) ----------

const HOMOPHONES: { s: string; a: string; c: string[] }[] = [
  { s: 'I can ___ the birds singing.', a: 'hear', c: ['hear', 'here'] },
  { s: 'Come over ___ and sit with me.', a: 'here', c: ['hear', 'here'] },
  { s: 'The kids put on ___ skates.', a: 'their', c: ['their', 'there', "they're"] },
  { s: 'Put the box over ___.', a: 'there', c: ['their', 'there', "they're"] },
  { s: '___ going to the rink after school.', a: "They're", c: ['Their', 'There', "They're"] },
  { s: 'I have ___ sisters.', a: 'two', c: ['to', 'too', 'two'] },
  { s: 'We are going ___ the park.', a: 'to', c: ['to', 'too', 'two'] },
  { s: 'Can I come ___?', a: 'too', c: ['to', 'too', 'two'] },
  { s: 'Is this ___ backpack?', a: 'your', c: ['your', "you're"] },
  { s: '___ my best friend.', a: "You're", c: ['Your', "You're"] },
  { s: 'The dog wagged ___ tail.', a: 'its', c: ['its', "it's"] },
  { s: '___ cold outside today.', a: "It's", c: ['Its', "It's"] },
  { s: 'We saw a whale in the ___.', a: 'sea', c: ['see', 'sea'] },
  { s: 'I can ___ the mountains from here.', a: 'see', c: ['see', 'sea'] },
  { s: 'Please ___ your name on the line.', a: 'write', c: ['right', 'write'] },
  { s: 'Turn ___ at the corner.', a: 'right', c: ['right', 'write'] },
  { s: 'I ___ the answer!', a: 'knew', c: ['knew', 'new'] },
  { s: 'I got ___ skates for my birthday.', a: 'new', c: ['knew', 'new'] },
  { s: 'The wind ___ my hat away.', a: 'blew', c: ['blue', 'blew'] },
  { s: 'The sky is ___.', a: 'blue', c: ['blue', 'blew'] },
  { s: 'I ___ two pancakes.', a: 'ate', c: ['ate', 'eight'] },
  { s: 'A spider has ___ legs.', a: 'eight', c: ['ate', 'eight'] },
  { s: 'We need ___ to bake the bread.', a: 'flour', c: ['flower', 'flour'] },
  { s: 'The ___ shines in the day.', a: 'sun', c: ['son', 'sun'] },
  { s: 'Our team ___ the game!', a: 'won', c: ['one', 'won'] },
  { s: 'I want to ___ a new book.', a: 'buy', c: ['by', 'buy', 'bye'] },
  { s: 'I ate a juicy ___.', a: 'pear', c: ['pair', 'pear'] },
  { s: 'I need a ___ of socks.', a: 'pair', c: ['pair', 'pear'] },
  { s: "Let's ___ at the library.", a: 'meet', c: ['meat', 'meet'] },
  { s: 'There are seven days in a ___.', a: 'week', c: ['weak', 'week'] },
  { s: 'She ___ her bike to school.', a: 'rode', c: ['road', 'rode', 'rowed'] },
  { s: 'The ___ was covered in snow.', a: 'road', c: ['road', 'rode', 'rowed'] },
  { s: 'We ___ the canoe across the lake.', a: 'rowed', c: ['road', 'rode', 'rowed'] },
  { s: 'Wave good___ to Grandma.', a: 'bye', c: ['by', 'buy', 'bye'] },
  { s: 'The cat sat ___ the door.', a: 'by', c: ['by', 'buy', 'bye'] },
  { s: 'I have ___ many toys in my room.', a: 'too', c: ['to', 'too', 'two'] },
  { s: 'Pass the puck ___ me.', a: 'to', c: ['to', 'too', 'two'] },
  { s: 'We scored ___ goals.', a: 'two', c: ['to', 'too', 'two'] },
  { s: '___ dog is very friendly.', a: 'Their', c: ['Their', 'There', "They're"] },
  { s: 'Look over ___!', a: 'there', c: ['their', 'there', "they're"] },
  { s: 'I think ___ late for the bus.', a: "they're", c: ['their', 'there', "they're"] },
  { s: 'The twins lost ___ mittens.', a: 'their', c: ['their', 'there', "they're"] },
  { s: 'I have ___ quarters.', a: 'four', c: ['for', 'four'] },
  { s: 'This present is ___ you.', a: 'for', c: ['for', 'four'] },
];

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

const SYN: [string, string][] = [['big', 'large'], ['small', 'tiny'], ['happy', 'glad'], ['fast', 'quick'], ['cold', 'chilly'], ['begin', 'start'], ['shout', 'yell'], ['smart', 'clever'], ['scared', 'afraid'], ['funny', 'silly'], ['pretty', 'beautiful'], ['finish', 'end'], ['angry', 'mad'], ['look', 'see']];
const ANT: [string, string][] = [['hot', 'cold'], ['up', 'down'], ['empty', 'full'], ['early', 'late'], ['quiet', 'loud'], ['open', 'shut'], ['win', 'lose'], ['push', 'pull'], ['above', 'below'], ['day', 'night'], ['heavy', 'light'], ['wet', 'dry'], ['first', 'last'], ['happy', 'sad'], ['fast', 'slow']];

function synonyms(level: number, rng: Rng): Question {
  const anti = level === 1 || (level === 2 && rng() < 0.5);
  const list = anti ? ANT : SYN;
  const [a, b] = pick(rng, list);
  const [w, ans] = rng() < 0.5 ? [a, b] : [b, a];
  const others = shuffle(rng, [...SYN, ...ANT].flat().filter((x) => x !== w && x !== ans)).slice(0, 6);
  // Keep the other word of each pair out so there is only one right answer.
  const pairs = [...SYN, ...ANT].filter(([x, y]) => x === w || y === w).flat();
  const kind = anti ? 'antonym (opposite)' : 'synonym (means the same)';
  return {
    key: `syn-${anti ? 'a' : 's'}-${w}`,
    prompt: `Which word is an ${kind} of "${w}"?`,
    input: 'choice',
    choices: options(rng, ans, others.filter((o) => !pairs.includes(o))),
    answer: ans,
    hint: anti ? 'An antonym means the opposite.' : 'A synonym means the same or almost the same.',
    explain: `"${ans}" is an ${anti ? 'antonym' : 'synonym'} of "${w}".`,
  };
}

// ---------- Abbreviations (3CV1.5) ----------

const ABBR: [string, string][] = [['Mister', 'Mr.'], ['Doctor', 'Dr.'], ['Street', 'St.'], ['Road', 'Rd.'], ['Avenue', 'Ave.'], ['Alberta', 'AB'], ['Monday', 'Mon.'], ['Friday', 'Fri.'], ['centimetre', 'cm'], ['metre', 'm'], ['minute', 'min'], ['January', 'Jan.'], ['Saturday', 'Sat.'], ['Drive', 'Dr.']];

function abbreviations(_level: number, rng: Rng): Question {
  const [long, short] = pick(rng, ABBR);
  const others = ABBR.filter((x) => x[1] !== short).map((x) => x[1]);
  return { key: `abbr-${long}`, prompt: `What is the short form (abbreviation) of "${long}"?`, input: 'choice', choices: options(rng, short, others), answer: short, hint: 'Abbreviations are short ways to write words. Many use the first letters and end with a period.', explain: `${long} → ${short}` };
}

// ---------- Word lists ----------

/** Grade 3 words with sentences. Canadian spellings (colour, favourite, neighbour). */
export const GRADE3_WORDS: [string, string][] = [
  ['because', 'I stayed inside because it was raining.'], ['friend', 'My friend came over to play.'], ['people', 'Lots of people came to the game.'],
  ['again', 'Can we play that again?'], ['before', 'Wash your hands before lunch.'], ['after', 'We have hockey after school.'],
  ['every', 'I read every night.'], ['should', 'You should wear a helmet.'], ['would', 'I would like a snack.'], ['could', 'Could you help me?'],
  ['thought', 'I thought it was Monday.'], ['through', 'The puck went through the goalie.'], ['different', 'Each snowflake is different.'],
  ['family', 'My family went camping.'], ['favourite', 'Blue is my favourite colour.'], ['colour', 'What colour is your jersey?'],
  ['neighbour', 'Our neighbour has a big dog.'], ['beautiful', 'The mountains are beautiful.'], ['answer', 'I know the answer.'],
  ['minute', 'Wait one minute.'], ['morning', 'I eat breakfast in the morning.'], ['believe', 'I believe in you.'], ['enough', 'Do we have enough chairs?'],
  ['animal', 'A moose is a large animal.'], ['country', 'Canada is a big country.'], ['picture', 'I drew a picture.'], ['together', 'We worked together.'],
  ['weather', 'The weather is cold today.'], ['winter', 'We skate in the winter.'], ['important', 'Sleep is important.'], ['question', 'Ask a question.'],
['caught', 'The goalie caught the puck.'], ['brought', 'I brought my lunch.'], ['always', 'I always brush my teeth.'],
  ['wear', 'Wear your mittens outside.'], ['great', 'You did a great job.'], ['busy', 'The store is busy today.'], ['heard', 'I heard a loud noise.'],
];

function wordList(level: number, rng: Rng, ctx: GenContext): Question {
  const mine = ctx.spellingList.map((w) => w.trim().toLowerCase()).filter((w) => /^[a-z' ]+$/.test(w));
  if (mine.length && (level === 0 || rng() < 0.7)) {
    const w = pick(rng, mine);
    return hearAndSpell(w, undefined, `list-${w}`, 'This word is on your spelling list. Say it slowly and spell each sound.');
  }
  const [w, s] = pick(rng, level === 0 ? GRADE3_WORDS.slice(0, 40) : GRADE3_WORDS);
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
  { id: 'spell.silent', subject: S, name: 'Silent Letters and Tricky Sounds', icon: '🤫', blurb: 'know, write, lamb, phone', strand: 'Phonics', outcome: OUT_PHON, levels: ['Find the silent letter', 'Spell silent-letter words', 'ph, gh, igh, str, spl'], generate: silent },
];
