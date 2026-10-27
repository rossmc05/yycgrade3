// Science Lab skills, from the Alberta grade 3 science program (2023):
// Matter (3M1), Energy (3E1), Living Systems (3LS1), Earth Systems (3ES1), Computer Science (3CS1).

import { options, pick, shuffle } from '../../engine/random';
import type { Question, Rng, Skill } from '../../engine/types';
import bank from '../../content/science.json';

const S = 'science' as const;

interface Item {
  q: string;
  a: string;
  w: string[];
  hint: string;
  why?: string;
}

/** Multiple-choice question from a bank item. */
function ask(rng: Rng, id: string, it: Item): Question {
  return {
    key: `${id}-${it.q}`,
    prompt: it.q,
    input: 'choice',
    choices: options(rng, it.a, it.w),
    answer: it.a,
    hint: it.hint,
    explain: it.why ?? `The answer is ${it.a}.`,
  };
}

/** Put-in-order question: the child taps the steps in the right order. */
function order(rng: Rng, id: string, prompt: string, steps: string[], hint: string, why: string): Question {
  let shown = shuffle(rng, steps);
  if (shown.join() === steps.join()) shown = [...steps].reverse();
  return { key: `${id}-${steps.join('>')}`, prompt, input: 'order', choices: shown, answer: steps.join(' → '), hint, explain: why };
}

/** Sort questions: one thing, which group does it belong to? */
function sorter(rng: Rng, id: string, prompt: (x: string) => string, groups: Record<string, string[]>, hint: string): Question {
  const group = pick(rng, Object.keys(groups));
  const thing = pick(rng, groups[group]);
  return {
    key: `${id}-${thing}`,
    prompt: prompt(thing),
    input: 'choice',
    choices: Object.keys(groups),
    answer: group,
    hint,
    explain: `${thing[0].toUpperCase() + thing.slice(1)}: ${group}.`,
  };
}

// ---------- Matter: states and changes of state (3M1.2–3M1.4) ----------

const STATES = bank.STATES;

const STATE_FACTS: Item[] = bank.STATE_FACTS as Item[];

const CHANGE_NAMES = bank.CHANGE_NAMES;

function states(level: number, rng: Rng): Question {
  if (level === 0) return sorter(rng, 'state', (x) => `Is ${x} a solid, a liquid, or a gas?`, STATES, 'Solids keep their shape. Liquids pour. Gases spread out to fill a space.');
  if (level === 1 && rng() < 0.6) return sorter(rng, 'change', (x) => `Which change of state is this: ${x}?`, CHANGE_NAMES, 'Melting: solid to liquid. Freezing: liquid to solid. Evaporation: liquid to gas. Condensation: gas to liquid.');
  if (level === 2 && rng() < 0.3) return sorter(rng, 'change', (x) => `Which change of state is this: ${x}?`, CHANGE_NAMES, 'Melting: solid to liquid. Freezing: liquid to solid. Evaporation: liquid to gas. Condensation: gas to liquid.');
  return ask(rng, 'statefact', pick(rng, level === 1 ? STATE_FACTS.slice(0, 7) : STATE_FACTS.slice(7)));
}

// ---------- Water cycle (3M1.5) ----------

const WATER: Item[] = bank.WATER as Item[];
const WATER_PARTS = WATER.filter((it) => it.q.startsWith('Which part of the water cycle'));
const WATER_FACTS = WATER.filter((it) => !WATER_PARTS.includes(it));

const CYCLE_ORDERS: [string, string[]][] = bank.CYCLE_ORDERS as [string, string[]][];

function waterCycle(level: number, rng: Rng): Question {
  if (level === 0) return ask(rng, 'water', pick(rng, WATER_FACTS));
  if (rng() < 0.15) return ask(rng, 'water', pick(rng, WATER_PARTS));
  if (rng() < 0.45) return sorter(rng, 'part', (x) => `Which part of the water cycle is this: ${x}?`, bank.CYCLE_PARTS, 'Evaporation: water rises as vapour. Condensation: vapour cools into drops. Precipitation: water falls. Collection: water gathers in rivers, lakes and the ground.');
  const [prompt, steps] = pick(rng, CYCLE_ORDERS);
  return order(rng, 'cycle', prompt, steps, 'Heat makes water evaporate. High up, vapour cools into clouds. Then it falls, and it collects again.', `${steps.join(' → ')}.`);
}

// ---------- Materials and changes (3M1.1, 3M1.6) ----------

const NATURAL: Item[] = bank.NATURAL as Item[];
const CHANGES = bank.CHANGES;

function materials(level: number, rng: Rng): Question {
  if (level === 0) {
    if (rng() < 0.45) return sorter(rng, 'np', (x) => `Is ${x} natural or processed?`, bank.NAT_PROC, 'Natural materials come straight from nature. Processed materials have been changed by people.');
    return ask(rng, 'mat', pick(rng, NATURAL));
  }
  return sorter(rng, 'chg', (x) => `Is ${x} a reversible change or a permanent change?`, CHANGES, 'Reversible means you can change it back. Permanent means you cannot undo it.');
}

// ---------- Forces and simple machines (3E1) ----------

const FORCES: Item[] = bank.FORCES as Item[];
const MACHINES: Item[] = bank.MACHINES as Item[];

const PUSH_PULL = bank.PUSH_PULL;

function forces(level: number, rng: Rng): Question {
  if (level === 0 && rng() < 0.7) return sorter(rng, 'pp', (x) => `Is ${x} a push or a pull?`, PUSH_PULL, 'A push moves something away from you. A pull brings it toward you.');
  if (level === 1 && rng() < 0.4) return sorter(rng, 'fk', (x) => `Which force is at work: ${x}?`, bank.FORCE_KIND, 'Friction rubs, gravity pulls down, magnets attract some metals, stretchy things spring back, and tight ropes have tension.');
  if (level === 2 && rng() < 0.5) return sorter(rng, 'mk', (x) => `Which simple machine is ${x}?`, bank.MACHINE_KIND, 'A lever turns on a point. A ramp is an inclined plane. A wheel turns on an axle. A pulley uses a rope over a wheel. A wedge pushes things apart.');
  return ask(rng, 'force', pick(rng, level === 0 ? FORCES.slice(0, 6) : level === 1 ? FORCES : MACHINES));
}

// ---------- Living systems (3LS1) ----------

const DIETS = bank.DIETS;
const CHAINS = bank.CHAINS;
const SENSES: Item[] = bank.SENSES as Item[];

function living(level: number, rng: Rng): Question {
  if (level === 0) return sorter(rng, 'diet', (x) => `Is ${x} a herbivore, a carnivore, or an omnivore?`, DIETS, 'Herbivores eat only plants. Carnivores eat only animals. Omnivores eat both.');
  if (level === 1) {
    const chain = pick(rng, CHAINS);
    return order(rng, 'chain', 'Build the food chain. Start with where the energy comes from.', chain, 'Energy starts with the sun. Then a plant. Then who eats the plant?', `${chain.join(' → ')}. Each one is food for the next.`);
  }
  return ask(rng, 'sense', pick(rng, SENSES));
}

// ---------- Earth systems (3ES1) ----------

const EARTH: Item[] = bank.EARTH as Item[];
const FOSSILS: Item[] = bank.FOSSILS as Item[];

const EARTH_ORDERS: [string, string[], string][] = bank.EARTH_ORDERS as [string, string[], string][];

function earth(level: number, rng: Rng): Question {
  if (level === 2) {
    if (rng() < 0.4) return ask(rng, 'earth', pick(rng, FOSSILS));
    const [prompt, steps, hint] = pick(rng, EARTH_ORDERS);
    return order(rng, 'fossil', prompt, steps, hint, `${steps.join(' → ')}.`);
  }
  if (level === 0 && rng() < 0.4) return sorter(rng, 'lc', (x) => `Is ${x} a slow change or a sudden change to the land?`, bank.LAND_CHANGE, 'Slow changes take many years. Sudden changes happen in minutes or days.');
  return ask(rng, 'earth', pick(rng, level === 0 ? EARTH : FOSSILS));
}

// ---------- Computational thinking (3CS1) ----------

const ROUTINES: [string, string[]][] = bank.ROUTINES as [string, string[]][];
const CS: Item[] = bank.CS as Item[];

function coding(level: number, rng: Rng): Question {
  if (level === 0) {
    const [task, steps] = pick(rng, ROUTINES);
    return order(rng, 'algo', `Write the instructions for “${task}”. Tap the steps in order.`, steps, 'What has to happen first? What can only happen at the end?', `${steps.join(', then ')}.`);
  }
  if (rng() < 0.35) return patternNext(rng);
  return ask(rng, 'cs', pick(rng, CS));
}

const SYMBOLS = ['🔴', '🔵', '🟡', '🟢', '⭐', '🏒', '⚽', '🍎', '🐟', '❄️'];

/** Pattern recognition: what comes next in a repeating pattern? */
function patternNext(rng: Rng): Question {
  const unit = shuffle(rng, SYMBOLS).slice(0, 2 + Math.floor(rng() * 2));
  if (unit.length === 2 && rng() < 0.5) unit.push(unit[0]); // AAB-style patterns: 🔴🔵🔴
  const shown = 2 * unit.length + Math.floor(rng() * unit.length);
  const seq = Array.from({ length: shown }, (_, i) => unit[i % unit.length]);
  const answer = unit[shown % unit.length];
  return {
    key: `pat-${seq.join('')}`,
    prompt: `What comes next? ${seq.join(' ')} …`,
    input: 'choice',
    choices: shuffle(rng, [...new Set(unit)]),
    answer,
    hint: `Find the part that repeats: ${unit.join(' ')}.`,
    explain: `The pattern repeats ${unit.join(' ')}, so next is ${answer}.`,
  };
}

// ---------- Skill list ----------

export const SCIENCE_SKILLS: Skill[] = [
  {
    id: 'sci.states', subject: S, name: 'Solids, Liquids and Gases', icon: '🧊', blurb: 'States of matter and how they change', strand: 'Matter',
    outcome: 'Matter can change state if heated or cooled; solids, liquids and gases have distinct properties.',
    learn: ['🧊 A solid keeps its own shape, like an ice cube or a hockey puck.', '🥛 A liquid takes the shape of its container, but the amount stays the same.', '💨 A gas spreads out to fill any space, like air in a balloon.', '🔥 Heating can melt a solid or evaporate a liquid. ❄️ Cooling can freeze a liquid or condense a gas.', '🌡️ Water freezes and melts at 0 °C and boils at 100 °C.'],
    levels: ['Sort it', 'Changes of state', 'Temperatures and more'], generate: states,
  },
  {
    id: 'sci.water', subject: S, name: 'The Water Cycle', icon: '🌧️', blurb: 'Evaporation, condensation, precipitation', strand: 'Matter',
    outcome: 'The water on Earth moves continuously in a cycle.',
    learn: ['☀️ The sun heats water in lakes and oceans, and it evaporates into water vapour.', '☁️ High in the sky the vapour cools and condenses into clouds.', '🌧️ Water falls as rain, snow or hail. This is precipitation.', '🏞️ It collects in rivers, lakes, oceans and the ground, and the cycle starts again.'],
    levels: ['Water facts', 'Put the cycle in order'], generate: waterCycle,
  },
  {
    id: 'sci.materials', subject: S, name: 'Materials and Changes', icon: '🧱', blurb: 'Natural, processed, reversible, permanent', strand: 'Matter',
    outcome: 'Materials can be natural or processed; changes can be reversible or permanent.',
    learn: ['🌲 Natural materials come from nature: wood, rock, wool, sand.', '🏭 Processed materials are changed by people: paper from wood, glass from sand.', '🔄 A reversible change can be undone, like melting and freezing chocolate.', '🍳 A permanent change cannot be undone, like cooking an egg or baking a cake.'],
    levels: ['Natural and processed', 'Reversible or permanent'], generate: materials,
  },
  {
    id: 'sci.forces', subject: S, name: 'Forces and Machines', icon: '🏒', blurb: 'Pushes, pulls, friction and simple machines', strand: 'Energy',
    outcome: 'Forces can affect properties and movement of objects; simple machines change the strength and direction of forces.',
    learn: ['👉 A force is a push or a pull.', '🛑 Things stay still, or keep moving, until a force acts on them.', '🧽 Friction is a force that slows things when surfaces rub. Ice has very little friction.', '🛝 Simple machines make work easier: levers, wheels and axles, and inclined planes (ramps).'],
    levels: ['Push or pull', 'Kinds of forces', 'Simple machines'], generate: forces,
  },
  {
    id: 'sci.living', subject: S, name: 'Food Chains and Animals', icon: '🦌', blurb: 'Who eats what, and how living things respond', strand: 'Living Systems',
    outcome: 'Plants and animals interact in ways represented by food chains, and sense and respond to stimuli.',
    learn: ['🌱 Herbivores eat only plants. 🐺 Carnivores eat only animals. 🐻 Omnivores eat both.', '☀️ A food chain starts with the sun, then a plant, then the animals that eat each other: sun → grass → rabbit → lynx.', '👂 Plants and animals sense and respond to light, water, food and temperature to survive.', '🦌 We protect wildlife by watching from a distance and not feeding animals.'],
    levels: ['Diets', 'Build a food chain', 'Senses and survival'], generate: living,
  },
  {
    id: 'sci.earth', subject: S, name: 'Earth and Dinosaurs', icon: '🦖', blurb: 'Changing land, glaciers, fossils and soil', strand: 'Earth Systems',
    outcome: 'Earth’s surface changes over time; its layers explain its history.',
    learn: ['⛰️ Earth’s surface changes slowly (mountains wear down, rivers move) and suddenly (landslides, floods, earthquakes).', '🧊 Glaciers in the Rockies feed Alberta rivers. Water and wind carved the badlands.', '🦴 Rock layers build up over time. Lower layers are older.', '🦖 Paleontologists dig up fossils. Alberta has amazing sites like Dinosaur Provincial Park and the Royal Tyrrell Museum.'],
    levels: ['Changing land', 'Fossils and soil', 'How fossils form'], generate: earth,
  },
  {
    id: 'sci.coding', subject: S, name: 'Think Like a Coder', icon: '🤖', blurb: 'Steps, patterns and debugging', strand: 'Computer Science',
    outcome: 'Computational thinking is a problem-solving process that uses creativity.',
    learn: ['🧩 Break a big job into small steps.', '📋 An algorithm is a list of steps in the right order.', '🔁 Look for patterns that repeat.', '🐞 If something goes wrong, go back and find the step to fix. That is debugging.'],
    levels: ['Put steps in order', 'Coding ideas'], generate: coding,
  },
];
