// Grammar Garage skills, from the Alberta grade 3 ELAL conventions outcome (3CV1.1, 3CV1.2)
// and figurative language from vocabulary (3V1).

import { options, pick, shuffle } from '../../engine/random';
import type { Question, Rng, Skill } from '../../engine/types';

const S = 'grammar' as const;

// ---------- Parts of speech ----------

// [word|tag]: n noun, v verb, a adjective, av adverb, p preposition, pr pronoun.
const TAGGED = [
  'The [small|a] [dog|n] [ran|v] [quickly|av] [to|p] the [park|n].',
  'My [brother|n] [kicked|v] the [red|a] [ball|n] [over|p] the [fence|n].',
  '[She|pr] [skated|v] [smoothly|av] [across|p] the [frozen|a] [pond|n].',
  'The [hungry|a] [bear|n] [ate|v] [berries|n] [near|p] the [river|n].',
  'A [tall|a] [moose|n] [walked|v] [slowly|av] [through|p] the [forest|n].',
  '[We|pr] [played|v] [hockey|n] [after|p] [school|n].',
  'The [goalie|n] [stopped|v] the [puck|n] [easily|av].',
  'The [shiny|a] [bike|n] is [under|p] the [tree|n].',
  '[They|pr] [laughed|v] [loudly|av] at the [funny|a] [movie|n].',
  'The [baby|n] [slept|v] [quietly|av] [in|p] her [crib|n].',
  'My [friend|n] [found|v] a [tiny|a] [frog|n] [beside|p] the [lake|n].',
  'The [cold|a] [wind|n] [blew|v] [hard|av] [during|p] the [storm|n].',
  '[He|pr] [carefully|av] [painted|v] a [beautiful|a] [picture|n].',
  'The [brave|a] [firefighter|n] [climbed|v] [up|p] the [ladder|n].',
  'The [students|n] [read|v] [books|n] [before|p] [lunch|n].',
  'Our [team|n] [cheered|v] [happily|av] [after|p] the [game|n].',
  'The [little|a] [puppy|n] [barked|v] [loudly|av] [at|p] the [mail carrier|n].',
  '[I|pr] [quickly|av] [zipped|v] my [warm|a] [coat|n].',
  'The [old|a] [owl|n] [hooted|v] [softly|av] [in|p] the [night|n].',
  'Grandpa [slowly|av] [shovelled|v] the [deep|a] [snow|n].',
  'The [happy|a] [kids|n] [sang|v] [cheerfully|av] [on|p] the [bus|n].',
  '[She|pr] [gently|av] [patted|v] the [soft|a] [kitten|n].',
  'The [noisy|a] [crows|n] [flew|v] [above|p] the [houses|n].',
  'My [dad|n] [cooked|v] [pancakes|n] [for|p] [breakfast|n].',
  'The [sleepy|a] [cat|n] [yawned|v] [lazily|av] [by|p] the [window|n].',
  '[They|pr] [ran|v] [safely|av] [across|p] the [street|n].',
  'A [green|a] [frog|n] [hopped|v] [into|p] the [pond|n].',
  '[He|pr] [kindly|av] [shared|v] his [yummy|a] [snack|n].',
  'The [huge|a] [truck|n] [rumbled|v] [noisily|av] [down|p] the [road|n].',
  '[We|pr] [watched|v] the [bright|a] [fireworks|n] [after|p] [dark|n].',
];

const TAG_NAME: Record<string, string> = { n: 'noun', v: 'verb', a: 'adjective', av: 'adverb', p: 'preposition', pr: 'pronoun' };
const TAG_HINT: Record<string, string> = {
  n: 'A noun names a person, place, animal or thing.',
  v: 'A verb is an action word: what someone or something does.',
  a: 'An adjective describes a noun: what kind, what colour, what size.',
  av: 'An adverb describes a verb: how, when or where. Many end in -ly.',
  p: 'A preposition tells where or when: under, over, after, before, in, near.',
  pr: 'A pronoun takes the place of a noun: he, she, we, they, it.',
};

function parseTagged(t: string) {
  const words: { word: string; tag: string }[] = [];
  const plain = t.replace(/\[([^|\]]+)\|([a-z]+)\]/g, (_, w: string, tag: string) => {
    words.push({ word: w, tag });
    return w;
  });
  return { plain, words };
}

function partsOfSpeech(level: number, rng: Rng): Question {
  const tags = [['n', 'v'], ['a'], ['av'], ['p', 'pr'], ['n', 'v', 'a', 'av', 'p', 'pr']][level];
  const tag = pick(rng, tags);
  const candidates = TAGGED.map(parseTagged).filter((x) => x.words.some((w) => w.tag === tag));
  const { plain, words } = pick(rng, candidates);
  const right = pick(rng, words.filter((w) => w.tag === tag));
  const wrong = shuffle(rng, words.filter((w) => w.tag !== tag)).slice(0, 3).map((w) => w.word);
  return {
    key: `pos-${tag}-${plain}-${right.word}`,
    prompt: `Which word is a ${TAG_NAME[tag]}? "${plain}"`,
    input: 'choice',
    choices: options(rng, right.word, wrong),
    answer: right.word,
    hint: TAG_HINT[tag],
    explain: `"${right.word}" is a ${TAG_NAME[tag]}. ${TAG_HINT[tag]}`,
  };
}

// ---------- Capital letters ----------

const CAPS = [
  'On Saturday, Maya went to Banff with her dad.',
  'My cousin Liam lives in Calgary.',
  'We watched the Flames play on Friday.',
  'In July, our family drove to the Rocky Mountains.',
  'Ms. Chen read us a book about Canada.',
  'Ben and I swam in Lake Louise.',
  'The Bow River flows through Calgary.',
  'My birthday is in December.',
  'Grandma visited us from Edmonton on Sunday.',
  'Our dog Biscuit loves the snow.',
  'Next Monday, I start swimming lessons.',
  'Dr. Patel works at the Alberta Children’s Hospital.',
];

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
    const i = pick(rng, capIdx.filter((k) => k > 0).length ? capIdx.filter((k) => k > 0) : capIdx);
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

const TYPES: { s: string; type: 'statement' | 'question' | 'exclamation' | 'command'; end: string }[] = [
  { s: 'Where is my hockey stick', type: 'question', end: '?' },
  { s: 'Can we go sledding today', type: 'question', end: '?' },
  { s: 'What time does the game start', type: 'question', end: '?' },
  { s: 'Do you like pizza', type: 'question', end: '?' },
  { s: 'Why is the sky blue', type: 'question', end: '?' },
  { s: 'I have a red backpack', type: 'statement', end: '.' },
  { s: 'Moose live in Alberta', type: 'statement', end: '.' },
  { s: 'My sister is seven years old', type: 'statement', end: '.' },
  { s: 'It snowed all night', type: 'statement', end: '.' },
  { s: 'The library opens at nine', type: 'statement', end: '.' },
  { s: 'Wow, we won the championship', type: 'exclamation', end: '!' },
  { s: 'Look out, the ice is cracking', type: 'exclamation', end: '!' },
  { s: 'Hooray, it is a snow day', type: 'exclamation', end: '!' },
  { s: 'Ouch, that really hurt', type: 'exclamation', end: '!' },
  { s: 'Please close the door', type: 'command', end: '.' },
  { s: 'Put on your helmet', type: 'command', end: '.' },
  { s: 'Wash your hands before dinner', type: 'command', end: '.' },
  { s: 'Hang up your coat', type: 'command', end: '.' },
  { s: 'Do not touch the stove', type: 'command', end: '.' },
];

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

const LISTS = [
  ['a hat', 'mittens', 'a scarf'], ['apples', 'grapes', 'bananas'], ['skates', 'a helmet', 'gloves'], ['red', 'white', 'blue'],
  ['Sam', 'Ava', 'Noah'], ['pencils', 'crayons', 'markers'], ['dogs', 'cats', 'rabbits'], ['milk', 'eggs', 'bread'],
  ['a toque', 'boots', 'snow pants'], ['carrots', 'peas', 'corn'], ['a puck', 'a stick', 'a jersey'], ['glue', 'scissors', 'paper'],
  ['a moose', 'a deer', 'an elk'], ['juice', 'cookies', 'cheese'], ['a ball', 'a kite', 'a frisbee'], ['Liam', 'Maya', 'Jack'],
];
const STARTS = ['I packed', 'We bought', 'She brought', 'Mom needs', 'I saw', 'Dad found', 'We shared', 'He drew', 'They wanted'];
const QUOTES: [string, string][] = [
  ['Sam', "Let's play outside"], ['Mom', 'Dinner is ready'], ['Coach', 'Great job, team'], ['Ava', 'I found my mitten'], ['Grandpa', 'It is cold today'],
  ['Dad', 'Time for bed'], ['The teacher', 'Please line up'], ['Noah', 'I scored a goal'], ['Grandma', 'The cookies are hot'], ['Maya', 'My dog can sit'],
  ['The goalie', 'I am ready'], ['Liam', 'It is snowing'], ['The librarian', 'Return your books on Friday'], ['My sister', 'I lost a tooth'], ['The pilot', 'We will land soon'],
  ['Jack', 'I like pizza'], ['The coach', 'Skate hard'], ['Mom', 'Wear your toque'],
];
const POSSESSIVE: { s: string; right: string; wrong: string[] }[] = [
  { s: 'That is the ___ bone.', right: "dog's", wrong: ['dogs', "dogs's"] },
  { s: 'I found my ___ hat.', right: "sister's", wrong: ['sisters', "sister'"] },
  { s: 'The ___ team won the game.', right: "girls'", wrong: ["girls's", "girl's's"] },
  { s: 'We visited the ___ farm.', right: "farmer's", wrong: ['farmers', "farmer'"] },
  { s: 'All the ___ backpacks are on the hooks.', right: "students'", wrong: ["students's", 'studentses'] },
  { s: 'The ___ tail is fluffy.', right: "cat's", wrong: ['cats', "cat'"] },
  { s: 'My ___ car is blue.', right: "dad's", wrong: ['dads', "dad'"] },
  { s: 'The ___ nest was high in the tree.', right: "bird's", wrong: ['birds', "bird'"] },
  { s: 'We cheered for the ___ goal.', right: "player's", wrong: ['players', "player'"] },
  { s: 'The ___ desk had a plant on it.', right: "teacher's", wrong: ['teachers', "teacher'"] },
  { s: 'The two ___ beds are side by side.', right: "puppies'", wrong: ["puppies's", 'puppys'] },
  { s: 'Both ___ bikes were red.', right: "boys'", wrong: ["boys's", "boy's's"] },
  { s: 'The ___ antlers are huge.', right: "moose's", wrong: ['mooses', "moose'"] },
  { s: 'My ___ birthday is in June.', right: "friend's", wrong: ['friends', "friend'"] },
  { s: 'The ___ whistle was loud.', right: "coach's", wrong: ['coachs', "coaches's"] },
  { s: 'All the ___ helmets were on the bench.', right: "players'", wrong: ["players's", "player's's"] },
  { s: 'The ___ roof was covered in snow.', right: "house's", wrong: ['houses', "house'"] },
  { s: 'My two ___ rooms are upstairs.', right: "sisters'", wrong: ["sisters's", "sister's's"] },
  { s: 'The ___ hat blew away.', right: "girl's", wrong: ['girls', "girl'"] },
  { s: 'We fed the ___ ducks at the pond.', right: "park's", wrong: ['parks', "park'"] },
];

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
      hint: 'Use a comma to separate things in a list.',
      explain: right,
    };
  }
  if (kind === 'quote') {
    const [who, said] = pick(rng, QUOTES);
    const right = `${who} said, "${said}."`;
    return {
      key: `quote-${right}`,
      prompt: 'Which sentence uses quotation marks correctly?',
      input: 'choice',
      choices: options(rng, right, [`"${who} said, ${said}."`, `${who} said, ${said}.`, `${who} "said, ${said}."`]),
      answer: right,
      hint: 'Quotation marks go around the exact words someone says.',
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

const SUBJ_PRED: [string, string][] = [
  ['The tall girl', 'kicked the ball.'], ['My little brother', 'loves dinosaurs.'], ['The hockey team', 'practised on Tuesday.'],
  ['A big moose', 'crossed the road.'], ['Our teacher', 'read a funny story.'], ['The puppies', 'played in the snow.'],
  ['Grandma', 'baked cookies.'], ['The bright sun', 'melted the snowman.'], ['Five ducks', 'swam across the pond.'],
  ['The goalie', 'blocked every shot.'], ['My best friend', 'lives next door.'], ['A noisy magpie', 'sat on the fence.'],
  ['The school bus', 'arrived late today.'], ['Dad', 'shovelled the driveway.'], ['The little kitten', 'chased a ball of yarn.'],
  ['Our class', 'visited the zoo.'], ['The cold wind', 'blew all night.'], ['Three girls', 'built a snow fort.'],
  ['The firefighter', 'climbed the ladder.'], ['My cousin', 'plays the drums.'], ['The huge bear', 'ate the berries.'],
  ['The children', 'sang a song.'], ['A red balloon', 'floated into the sky.'], ['Mom', 'drove us to the rink.'],
];

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

const CONJ: { s: string; a: string }[] = [
  { s: 'I wanted to play outside, ___ it was raining.', a: 'but' },
  { s: 'Do you want apples ___ grapes?', a: 'or' },
  { s: 'I was hungry, ___ I ate a snack.', a: 'so' },
  { s: 'We skated ___ drank hot chocolate.', a: 'and' },
  { s: 'It was cold, ___ we wore our toques.', a: 'so' },
  { s: 'My dog is small, ___ he is very fast.', a: 'but' },
  { s: 'Would you like to read ___ draw?', a: 'or' },
  { s: 'Ava likes soccer ___ swimming.', a: 'and' },
  { s: 'I studied hard, ___ I did well on the test.', a: 'so' },
  { s: 'The movie was long, ___ it was fun.', a: 'but' },
  { s: 'We can walk ___ take the bus.', a: 'or' },
  { s: 'Sam brought a puck ___ a stick.', a: 'and' },
  { s: 'The road was icy, ___ Dad drove slowly.', a: 'so' },
  { s: 'Is your birthday in May ___ June?', a: 'or' },
  { s: 'I like cats, ___ my brother likes dogs.', a: 'but' },
  { s: 'We built a snowman ___ went sledding.', a: 'and' },
  { s: 'The store was closed, ___ we went home.', a: 'so' },
  { s: 'You can have milk ___ juice.', a: 'or' },
  { s: 'The puzzle was hard, ___ I finished it.', a: 'but' },
  { s: 'Maya plays piano ___ guitar.', a: 'and' },
  { s: 'My hands were cold, ___ I put on mittens.', a: 'so' },
  { s: 'Should we play tag ___ hide and seek?', a: 'or' },
  { s: 'I tried to catch the ball, ___ I missed.', a: 'but' },
  { s: 'The bell rang, ___ we went inside.', a: 'so' },
];

function conjunctions(_level: number, rng: Rng): Question {
  const c = pick(rng, CONJ);
  return {
    key: `conj-${c.s}`,
    prompt: `Choose the joining word: ${c.s.replace('___', '_____')}`,
    say: c.s.replace('___', 'blank'),
    input: 'choice',
    choices: ['and', 'but', 'or', 'so'],
    answer: c.a,
    hint: 'and adds more. but shows something different. or gives a choice. so tells what happened because of it.',
    explain: c.s.replace('___', c.a),
  };
}

// ---------- Subject-verb agreement ----------

const SUBJECTS: { s: string; many: boolean }[] = [
  { s: 'The dog', many: false }, { s: 'The dogs', many: true }, { s: 'My sister', many: false }, { s: 'We', many: true }, { s: 'They', many: true },
  { s: 'He', many: false }, { s: 'Sam and Lee', many: true }, { s: 'The team', many: false }, { s: 'My friends', many: true }, { s: 'She', many: false },
];
const VERBS: { one: string; many: string; rest: string }[] = [
  { one: 'runs', many: 'run', rest: 'around the field' }, { one: 'plays', many: 'play', rest: 'after school' }, { one: 'jumps', many: 'jump', rest: 'over the puddle' },
  { one: 'eats', many: 'eat', rest: 'lunch at noon' }, { one: 'sings', many: 'sing', rest: 'very loudly' }, { one: 'goes', many: 'go', rest: 'to the rink' },
  { one: 'watches', many: 'watch', rest: 'the game' }, { one: 'skates', many: 'skate', rest: 'on the pond' }, { one: 'was', many: 'were', rest: 'at the park' },
  { one: 'has', many: 'have', rest: 'a new ball' }, { one: 'is', many: 'are', rest: 'ready to go' },
];

function agreement(_level: number, rng: Rng): Question {
  const sub = pick(rng, SUBJECTS);
  const v = pick(rng, VERBS);
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

// ---------- Similes ----------

const SIMILES = [
  'She ran like the wind.', 'The snow was as white as a sheet.', 'He is as brave as a lion.', 'The baby slept like a log.', 'My hands were as cold as ice.', 'The puck flew like a rocket.',
  'The kitten was as soft as a cloud.', 'My brother eats like a hungry bear.', 'The lake was as smooth as glass.', 'Her eyes sparkled like stars.', 'The old man was as wise as an owl.',
  'The pillow was as light as a feather.', 'He was as busy as a bee.', 'The truck roared like a lion.', 'The rink was as slippery as a banana peel.', 'My room is as neat as a pin.',
  'The goalie moved like a cat.', 'The chinook wind felt as warm as a blanket.', 'The rock was as hard as a brick.', 'She swims like a fish.',
];
const NOT_SIMILES = [
  'She ran to the store.', 'The snow fell all night.', 'He is a brave boy.', 'The baby slept in the crib.', 'My hands were cold.', 'I like the colour blue.', 'The puck went in the net.',
  'I like playing hockey.', 'The lake was calm today.', 'My brother is hungry.', 'The kitten is very soft.', 'We would like some pie.', 'The truck was loud.', 'The rink was slippery.',
  'The goalie caught the puck.', 'My pillow is light.',
];

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
  { id: 'gram.conjunctions', subject: S, name: 'Joining Words', icon: '🔗', blurb: 'and, but, or, so', strand: 'Grammar', outcome: OUT, levels: ['Conjunctions'], generate: conjunctions },
  { id: 'gram.types', subject: S, name: 'Sentence Types', icon: '❓', blurb: 'Statements, questions, commands', strand: 'Capitals and punctuation', outcome: OUT, levels: ['End marks', 'Four kinds of sentences'], generate: sentenceTypes },
  { id: 'gram.capitals', subject: S, name: 'Capital Letters', icon: '🔠', blurb: 'Names, places, days and months', strand: 'Capitals and punctuation', outcome: OUT, levels: ['Pick the right one', 'Trickier choices', 'Find the missing capital'], generate: capitals },
  { id: 'gram.punctuation', subject: S, name: 'Commas, Quotes and Apostrophes', icon: '❞', blurb: 'Lists, speech and belonging', strand: 'Capitals and punctuation', outcome: OUT, levels: ['Commas in lists', 'Quotation marks', 'Apostrophes', 'Mixed'], generate: punctuation },
  { id: 'gram.similes', subject: S, name: 'Similes', icon: '🦁', blurb: 'As brave as a lion', strand: 'Word play', outcome: 'Students analyze new words and morphemes to enhance vocabulary (figurative language).', levels: ['Spot the simile'], generate: similes },
];

export { parseTagged };
