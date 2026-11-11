// Kindergarten science, from the Alberta Kindergarten science program (2023):
// Earth systems (seasons and weather), living systems (animals) and the five senses.

import { pick, shuffle } from '../../engine/random';
import type { Question, Rng, Skill } from '../../engine/types';
import { kq, nameOf, others } from './pics';

const S = 'kscience' as const;

/** One picture question: the answer and the pictures that are wrong. */
interface Item { q: string; a: string; w: string[]; hint: string; why: string; show?: string }

function fromItems(rng: Rng, id: string, items: Item[]): Question {
  const it = pick(rng, items);
  return kq(rng, { key: `${id}-${it.q}`, prompt: it.q, answer: it.a, wrong: shuffle(rng, it.w), visual: it.show ? { kind: 'k-row', items: [it.show] } : undefined, hint: it.hint, explain: it.why });
}

// ---------- Seasons ----------

const SEASON_PIC: Record<string, string[]> = { winter: ['⛄', '🛷', '⛸️'], spring: ['🌷', '🌱', '🐣'], summer: ['🏖️', '🏊', '🍉'], fall: ['🍂', '🎃', '🍁'] };
const SEASONS = Object.keys(SEASON_PIC);
const SEASON_NEXT: Record<string, string> = { winter: 'spring', spring: 'summer', summer: 'fall', fall: 'winter' };

const SEASON_ITEMS: Item[] = [
  { q: 'It is cold and snowy. What do you wear outside?', a: '🧤', w: ['🩳', '🕶️'], hint: 'Snow is very cold. What keeps your hands warm?', why: 'Mittens keep your hands warm in winter.' },
  { q: 'It is a hot summer day. What do you wear?', a: '🩳', w: ['🧣', '🧤'], hint: 'Hot days need cool clothes.', why: 'Shorts keep you cool in summer.' },
  { q: 'It is snowing. What do you wear on your head?', a: '🧢', w: ['🩳', '🕶️'], hint: 'Keep your head warm!', why: 'A warm hat keeps your head warm in the snow.' },
  { q: 'Which one do you use in summer?', a: '🏖️', w: ['🛷', '⛸️'], hint: 'Summer is hot. Where can you play in the sand?', why: 'The beach is fun on a hot summer day.' },
  { q: 'Which one do you use in winter?', a: '🛷', w: ['🪁', '🏖️'], hint: 'Winter has snow.', why: 'You slide down snowy hills on a sled.' },
  { q: 'In fall, what happens to many leaves?', a: '🍂', w: ['🌷', '⛄'], hint: 'In fall, leaves change colour.', why: 'In fall, leaves turn colours and fall from the trees.' },
  { q: 'In spring, what starts to grow?', a: '🌱', w: ['⛄', '🍂'], hint: 'Spring is when things wake up after winter.', why: 'Plants start to grow in spring.' },
  { q: 'Which season has Halloween pumpkins?', a: '🍂', w: ['🌷', '🏖️'], hint: 'Halloween is when leaves are falling.', why: 'Halloween is in the fall.', show: '🎃' },
];

function seasons(level: number, rng: Rng): Question {
  const season = pick(rng, SEASONS);
  const pic = (s: string) => SEASON_PIC[s][0];
  if (level === 0) {
    const answer = pick(rng, SEASON_PIC[season]);
    return kq(rng, {
      key: `kseason-${season}-${answer}`,
      prompt: `Which picture shows ${season}?`,
      answer,
      wrong: others(SEASONS, season).map((s) => pick(rng, SEASON_PIC[s])),
      hint: { winter: 'Winter is cold and snowy.', spring: 'In spring, flowers grow and baby animals are born.', summer: 'Summer is hot and sunny.', fall: 'In fall, leaves turn colours and fall down.' }[season]!,
      explain: `That's ${season}!`,
    });
  }
  if (level === 2 && rng() < 0.5) {
    const next = SEASON_NEXT[season];
    return kq(rng, {
      key: `kseasonnext-${season}`,
      prompt: `It is ${season}. What season comes next?`,
      visual: { kind: 'k-row', items: [pic(season)] },
      answer: pic(next),
      wrong: others(SEASONS, next, season).map(pic),
      hint: 'The seasons go winter, spring, summer, fall, and around again.',
      explain: `After ${season} comes ${next}.`,
    });
  }
  return fromItems(rng, 'kseasonq', level === 1 ? SEASON_ITEMS.slice(0, 7) : SEASON_ITEMS);
}

// ---------- Weather ----------

const WEATHER = ['☀️', '🌧️', '❄️', '☁️', '⛈️', '🌬️'];

const WEATHER_ITEMS: Item[] = [
  { q: 'It is raining. What do you need?', a: '☂️', w: ['🕶️', '🛷'], hint: 'What keeps the rain off you?', why: 'An umbrella keeps you dry in the rain.' },
  { q: 'It is very sunny. What helps your eyes?', a: '🕶️', w: ['🧤', '☂️'], hint: 'The sun is bright!', why: 'Sunglasses protect your eyes from bright sun.' },
  { q: 'It is snowing. What can you play with?', a: '🛷', w: ['🏊', '🪁'], hint: 'Snow is fun for sliding.', why: 'A sled slides on the snow.' },
  { q: 'It is a hot sunny day. Which one cools you down?', a: '🍦', w: ['☕', '🧣'], hint: 'Something cold and yummy.', why: 'Ice cream is cold on a hot day.' },
  { q: 'Which one keeps you dry in the rain?', a: '🧥', w: ['🩳', '👒'], hint: 'You zip it up.', why: 'A rain coat keeps you dry.' },
  { q: 'What weather do you need to build a snowman?', a: '❄️', w: ['☀️', '🌧️'], hint: 'A snowman is made of snow.', why: 'You need snow to build a snowman.' },
  { q: 'What weather is best for flying a kite?', a: '🌬️', w: ['❄️', '🌧️'], hint: 'A kite needs moving air.', why: 'Wind lifts a kite up high.', show: '🪁' },
  { q: 'What do you see after the rain when the sun comes out?', a: '🌈', w: ['⛄', '🌙'], hint: 'It has lots of colours.', why: 'A rainbow can appear when the sun shines through raindrops.' },
  { q: 'There is thunder and lightning. What weather is it?', a: '⛈️', w: ['☀️', '❄️'], hint: 'Thunder is very loud and comes with dark clouds.', why: 'Thunder and lightning come with a storm.' },
  { q: 'Where should you go when there is a thunderstorm?', a: '🏠', w: ['🏖️', '🌳'], hint: 'Stay safe and dry.', why: 'Go inside a building when there is a storm.' },
];

function weather(level: number, rng: Rng): Question {
  if (level === 0) {
    const w = pick(rng, WEATHER);
    const name = { '☀️': 'sunny', '🌧️': 'rainy', '❄️': 'snowy', '☁️': 'cloudy', '⛈️': 'stormy', '🌬️': 'windy' }[w]!;
    return kq(rng, {
      key: `kweather-${w}`,
      prompt: `Which picture shows ${name} weather?`,
      answer: w,
      wrong: others(WEATHER, w),
      hint: { sunny: 'Look for the sun.', rainy: 'Look for raindrops.', snowy: 'Look for snowflakes.', cloudy: 'Look for a cloud.', stormy: 'Look for lightning.', windy: 'Look for blowing wind.' }[name]!,
      explain: `That's ${name} weather.`,
    });
  }
  return fromItems(rng, 'kweatherq', level === 1 ? WEATHER_ITEMS.slice(0, 7) : WEATHER_ITEMS);
}

// ---------- Animals ----------

const SOUNDS: [string, string][] = [['🐄', 'moo'], ['🐶', 'woof'], ['🐱', 'meow'], ['🦆', 'quack'], ['🐷', 'oink'], ['🐑', 'baa'], ['🐸', 'ribbit'], ['🐝', 'buzz'], ['🦁', 'roar'], ['🦉', 'hoot'], ['🐴', 'neigh'], ['🐓', 'cock-a-doodle-doo']];

const ANIMAL_ITEMS: Item[] = [
  { q: 'Which animal lives in the water?', a: '🐟', w: ['🐄', '🦁'], hint: 'This animal swims and has fins.', why: 'A fish lives in the water.' },
  { q: 'Which animal can fly?', a: '🐦', w: ['🐢', '🐷'], hint: 'Look for wings.', why: 'A bird uses its wings to fly.' },
  { q: 'Which animal has a shell?', a: '🐢', w: ['🐶', '🦒'], hint: 'A shell is a hard home it carries on its back.', why: 'A turtle has a hard shell.' },
  { q: 'Which animal has a very long neck?', a: '🦒', w: ['🐷', '🐸'], hint: 'It can eat leaves from tall trees.', why: 'A giraffe has a long neck.' },
  { q: 'Which animal has a trunk?', a: '🐘', w: ['🐰', '🐔'], hint: 'A trunk is a very long nose.', why: 'An elephant has a trunk.' },
  { q: 'Which animal hops?', a: '🐰', w: ['🐍', '🐟'], hint: 'It has long ears and strong back legs.', why: 'A rabbit hops.' },
  { q: 'Which animal lays eggs?', a: '🐔', w: ['🐶', '🐄'], hint: 'Eggs come from a farm bird.', why: 'Chickens lay eggs.' },
  { q: 'Which animal gives us milk?', a: '🐄', w: ['🐔', '🐸'], hint: 'This farm animal says moo.', why: 'Cows give us milk.' },
  { q: 'Which animal builds a nest?', a: '🐦', w: ['🐟', '🐘'], hint: 'Nests are up in the trees.', why: 'Birds build nests.', show: '🪺' },
  { q: 'Which animal sleeps all winter?', a: '🐻', w: ['🐔', '🐒'], hint: 'It is big and furry and sleeps in a den.', why: 'Bears sleep through the winter. That is called hibernating.' },
  { q: 'Which animal builds a dam?', a: '🦫', w: ['🐷', '🦒'], hint: 'It has big teeth and a flat tail. It is on the Canadian nickel!', why: 'Beavers build dams with sticks and mud.' },
  { q: 'Which animal has feathers?', a: '🦆', w: ['🐻', '🐸'], hint: 'Feathers are on animals that have wings.', why: 'Ducks have feathers.', show: '🪶' },
  { q: 'Which baby animal is a chick?', a: '🐣', w: ['🐰', '🐶'], hint: 'It comes out of an egg.', why: 'A chick is a baby chicken.' },
  { q: 'What do plants need to grow?', a: '☀️', w: ['🍪', '🧸'], hint: 'Plants need water and something warm and bright.', why: 'Plants need sunlight and water to grow.', show: '🌱' },
];

function animals(level: number, rng: Rng): Question {
  if (level === 0 || (level === 1 && rng() < 0.4)) {
    const [animal, sound] = pick(rng, SOUNDS);
    return kq(rng, {
      key: `ksays-${sound}`,
      prompt: `Which animal says "${sound}"?`,
      answer: animal,
      wrong: others(SOUNDS.map((s) => s[0]), animal),
      hint: `Make the sound "${sound}". Which animal is it?`,
      explain: `The ${nameOf(animal)} says ${sound}!`,
    });
  }
  return fromItems(rng, 'kanimal', level === 1 ? ANIMAL_ITEMS.slice(0, 8) : ANIMAL_ITEMS);
}

// ---------- The five senses ----------

const SENSE = { see: '👀', hear: '👂', smell: '👃', taste: '👅', touch: '✋' } as const;
type Sense = keyof typeof SENSE;
const SENSE_NAMES = Object.keys(SENSE) as Sense[];

const SENSE_THINGS: [string, Sense][] = [
  ['🌈', 'see'], ['⭐', 'see'], ['📕', 'see'], ['🥁', 'hear'], ['🔔', 'hear'], ['🎸', 'hear'], ['⏰', 'hear'],
  ['🌸', 'smell'], ['🦨', 'smell'], ['🌹', 'smell'], ['🍦', 'taste'], ['🍋', 'taste'], ['🍬', 'taste'], ['🧸', 'touch'], ['🌵', 'touch'], ['🧊', 'touch'],
];

const SENSE_ITEMS: Item[] = [
  { q: 'Which one feels soft?', a: '🧸', w: ['🌵', '🪨'], hint: 'Soft things are nice to hug.', why: 'A teddy bear feels soft.' },
  { q: 'Which one feels cold?', a: '🧊', w: ['🔥', '☕'], hint: 'Cold things come from the freezer.', why: 'Ice feels cold.' },
  { q: 'Which one feels prickly?', a: '🌵', w: ['🧸', '🪶'], hint: 'Prickly things can poke you.', why: 'A cactus is prickly.' },
  { q: 'Which one tastes sour?', a: '🍋', w: ['🍬', '🍞'], hint: 'Sour makes your face scrunch up!', why: 'A lemon tastes sour.' },
  { q: 'Which one tastes sweet?', a: '🍬', w: ['🍋', '🧅'], hint: 'Sweet like a treat.', why: 'Candy tastes sweet.' },
  { q: 'Which one smells nice?', a: '🌸', w: ['🦨', '🗑️'], hint: 'Think of a garden.', why: 'Flowers smell nice.' },
  { q: 'Which one makes a loud sound?', a: '🥁', w: ['🪶', '🧸'], hint: 'Bang bang!', why: 'A drum makes a loud sound.' },
  { q: 'Which one is very quiet?', a: '🪶', w: ['🥁', '⏰'], hint: 'It makes almost no sound at all.', why: 'A feather is very quiet.' },
];

function senses(level: number, rng: Rng): Question {
  if (level === 0) {
    const s = pick(rng, SENSE_NAMES);
    return kq(rng, {
      key: `ksense-${s}`,
      prompt: `What do you use to ${s}?`,
      answer: SENSE[s],
      wrong: others(SENSE_NAMES, s).map((x) => SENSE[x]),
      hint: 'Point to that part of your body.',
      explain: `You ${s} with your ${nameOf(SENSE[s])}.`,
    });
  }
  if (level === 1 || rng() < 0.4) {
    const [thing, s] = pick(rng, SENSE_THINGS);
    const how = { see: `see a ${nameOf(thing)}`, hear: `hear a ${nameOf(thing)}`, smell: `smell a ${nameOf(thing)}`, taste: `taste ${nameOf(thing)}`, touch: `feel a ${nameOf(thing)}` }[s];
    return kq(rng, {
      key: `ksensething-${thing}`,
      prompt: `What do you use to ${how}?`,
      visual: { kind: 'k-row', items: [thing] },
      answer: SENSE[s],
      wrong: others(SENSE_NAMES, s).map((x) => SENSE[x]),
      hint: 'Which part of your body does that?',
      explain: `You ${s} with your ${nameOf(SENSE[s])}.`,
    });
  }
  return fromItems(rng, 'ksenseq', SENSE_ITEMS);
}

const K = 'Alberta Kindergarten Science (2023)';

export const KSCIENCE_SKILLS: Skill[] = [
  { id: 'k-seasons', subject: S, name: 'Seasons', blurb: 'Winter, spring, summer, fall', strand: 'Earth Systems', outcome: `${K}: Children describe the seasons and how they change.`, icon: '🍂', levels: ['Name the season', 'What to wear', 'What comes next'], generate: seasons },
  { id: 'k-weather', subject: S, name: 'Weather', blurb: 'Sunny, rainy, snowy', strand: 'Earth Systems', outcome: `${K}: Children observe and describe daily weather.`, icon: '🌦️', levels: ['Name the weather', 'Ready for weather', 'Weather safety'], generate: weather },
  { id: 'k-animals', subject: S, name: 'Animals', blurb: 'Who says moo?', strand: 'Living Systems', outcome: `${K}: Children describe animals and what living things need.`, icon: '🐾', levels: ['Animal sounds', 'Animal bodies', 'Homes and needs'], generate: animals },
  { id: 'k-senses', subject: S, name: 'Five senses', blurb: 'See, hear, smell, taste, touch', strand: 'Living Systems', outcome: `${K}: Children use their senses to explore the world.`, icon: '👃', levels: ['Body parts', 'Which sense?', 'Soft, sour, loud'], generate: senses },
];
