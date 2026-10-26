// Science Lab skills, from the Alberta grade 3 science program (2023):
// Matter (3M1), Energy (3E1), Living Systems (3LS1), Earth Systems (3ES1), Computer Science (3CS1).

import { options, pick, shuffle } from '../../engine/random';
import type { Question, Rng, Skill } from '../../engine/types';

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

const STATES = {
  solid: ['an ice cube', 'a rock', 'a hockey puck', 'a pencil', 'a frozen pond', 'a wooden block', 'a snowflake'],
  liquid: ['milk', 'apple juice', 'rain', 'melted butter', 'lake water', 'maple syrup', 'soup'],
  gas: ['steam from a kettle', 'the air in a balloon', 'water vapour', 'the bubbles in pop', 'your breath'],
};

const STATE_FACTS: Item[] = [
  { q: 'Which state of matter keeps its own shape?', a: 'solid', w: ['liquid', 'gas'], hint: 'Think of an ice cube versus water.', why: 'A solid has a definite shape and volume.' },
  { q: 'Which state of matter takes the shape of its container but keeps the same amount (volume)?', a: 'liquid', w: ['solid', 'gas'], hint: 'Pour juice from a tall glass into a bowl.', why: 'A liquid has a definite volume but takes the shape of its container.' },
  { q: 'Which state of matter spreads out to fill any container?', a: 'gas', w: ['solid', 'liquid'], hint: 'Think about the air in a room.', why: 'A gas has no definite shape or volume. It expands to fill its container.' },
  { q: 'When ice turns into water, it is called…', a: 'melting', w: ['freezing', 'evaporation', 'condensation'], hint: 'Ice cream does this on a hot day.', why: 'Solid to liquid is melting.' },
  { q: 'When water turns into ice, it is called…', a: 'freezing', w: ['melting', 'evaporation', 'condensation'], hint: 'It happens to ponds in an Alberta winter.', why: 'Liquid to solid is freezing.' },
  { q: 'When a puddle dries up in the sun, the water is…', a: 'evaporating', w: ['freezing', 'melting', 'condensing'], hint: 'The water turns into a gas and goes into the air.', why: 'Liquid to gas is evaporation.' },
  { q: 'Water drops form on the outside of a cold glass. This is…', a: 'condensation', w: ['melting', 'freezing', 'evaporation'], hint: 'Water vapour in the air touches something cold.', why: 'Gas to liquid is condensation.' },
  { q: 'At what temperature does water freeze?', a: '0 °C', w: ['10 °C', '50 °C', '100 °C'], hint: 'It is the same temperature at which ice melts.', why: 'Water freezes and melts at 0 °C.' },
  { q: 'At what temperature does water boil?', a: '100 °C', w: ['0 °C', '50 °C', '200 °C'], hint: 'It is much hotter than a hot bath.', why: 'Water boils at 100 °C.' },
  { q: 'Is the melting point of a substance the same as its freezing point?', a: 'Yes, they are the same', w: ['No, melting is always hotter', 'No, freezing is always hotter'], hint: 'Ice melts at 0 °C. Water freezes at…?', why: 'Melting and freezing happen at the same temperature.' },
  { q: 'What do we need to add to make ice melt?', a: 'heat', w: ['cold', 'salt only', 'darkness'], hint: 'Put an ice cube in your warm hand.', why: 'Heating makes solids melt; cooling makes liquids freeze.' },
  { q: 'Does matter take up space and have weight?', a: 'Yes, all matter does', w: ['Only solids do', 'Only liquids do', 'No, matter has no weight'], hint: 'Even air takes up space: think of a balloon.', why: 'All matter takes up space and has weight.' },
];

const CHANGE_NAMES = {
  melting: ['a popsicle dripping on a hot day', 'butter softening in a hot pan', 'a snowman shrinking in a chinook', 'chocolate going runny in your pocket', 'icicles dripping in the spring sun', 'a crayon left on a hot car seat'],
  freezing: ['a puddle turning to ice overnight', 'juice in the freezer becoming a popsicle', 'the outdoor rink getting hard in January', 'water in a dog bowl going solid outside', 'a lake getting ice on top in winter', 'ice cube trays in the freezer'],
  evaporation: ['wet hair drying in the sun', 'a puddle disappearing on a sunny day', 'laundry drying on a clothesline', 'water boiling away from a pot', 'a wet sidewalk drying after rain', 'paint water drying up in a cup'],
  condensation: ['a foggy bathroom mirror after a shower', 'drops on the outside of a cold glass of milk', 'dew on the grass in the morning', 'your breath fogging a car window', 'drops forming on the lid of a pot', 'a cold can of pop getting wet on the outside'],
};

function states(level: number, rng: Rng): Question {
  if (level === 0) return sorter(rng, 'state', (x) => `Is ${x} a solid, a liquid, or a gas?`, STATES, 'Solids keep their shape. Liquids pour. Gases spread out to fill a space.');
  if (level === 1 && rng() < 0.6) return sorter(rng, 'change', (x) => `Which change of state is this: ${x}?`, CHANGE_NAMES, 'Melting: solid to liquid. Freezing: liquid to solid. Evaporation: liquid to gas. Condensation: gas to liquid.');
  return ask(rng, 'statefact', pick(rng, level === 1 ? STATE_FACTS.slice(0, 7) : STATE_FACTS));
}

// ---------- Water cycle (3M1.5) ----------

const WATER: Item[] = [
  { q: 'What makes water evaporate from lakes and oceans?', a: 'heat from the sun', w: ['the moon', 'fish', 'cold wind'], hint: 'What warms the Earth?', why: 'The sun heats water and it evaporates into water vapour.' },
  { q: 'Clouds are made of…', a: 'tiny drops of water or ice', w: ['cotton', 'smoke', 'dust only'], hint: 'Water vapour cools and condenses high in the sky.', why: 'Clouds form when water vapour condenses into tiny drops.' },
  { q: 'Rain, snow and hail are all kinds of…', a: 'precipitation', w: ['evaporation', 'condensation', 'erosion'], hint: 'It is water falling from clouds.', why: 'Water falling from clouds is precipitation.' },
  { q: 'Where does water go after it falls as rain?', a: 'into rivers, lakes, oceans and the ground', w: ['back to the moon', 'it disappears forever', 'into the clouds right away'], hint: 'Think about puddles and rivers after a storm.', why: 'Water collects on land and in bodies of water, then the cycle repeats.' },
  { q: 'In an Alberta winter, many lakes…', a: 'freeze on top', w: ['boil', 'disappear', 'turn into gas'], hint: 'People skate on them.', why: 'In winter many water surfaces freeze, and in spring they thaw.' },
  { q: 'Is it safe to walk on a lake in early spring when the ice is melting?', a: 'No, thin ice can break', w: ['Yes, ice is always safe', 'Only if it is sunny'], hint: 'Ice gets thinner as it melts.', why: 'Melting ice is thin and dangerous. Stay off it.' },
  { q: 'What is water vapour?', a: 'water as an invisible gas', w: ['a kind of ice', 'dirty water', 'a kind of cloud you can touch'], hint: 'It is in the air all around us, but we cannot see it.', why: 'Water vapour is water in its gas state.' },
  { q: 'Snow in the Rocky Mountains melts in spring. Where does that water go?', a: 'into streams and rivers like the Bow', w: ['into space', 'it stays frozen forever', 'it turns into rock'], hint: 'Water flows downhill.', why: 'Meltwater runs into streams and rivers, and the cycle keeps going.' },
  { q: 'Why does a puddle dry up faster on a hot day than a cool day?', a: 'heat makes water evaporate faster', w: ['cold makes water disappear', 'puddles are scared of the sun', 'the ground drinks it all'], hint: 'What does the sun add?', why: 'More heat means faster evaporation.' },
  { q: 'Is the water you drink today the same water that has been on Earth for a very long time?', a: 'yes, water keeps cycling around', w: ['no, new water is made every day', 'no, water is made in factories'], hint: 'That is why it is called a cycle.', why: 'Earth’s water moves round and round in the water cycle.' },
  { q: 'Hail is…', a: 'balls of ice that fall from storm clouds', w: ['frozen rocks', 'a kind of fog', 'water vapour'], hint: 'Calgary gets lots of it in summer storms.', why: 'Hail is precipitation made of ice.' },
  { q: 'Fog is like…', a: 'a cloud near the ground', w: ['smoke from a fire', 'falling snow', 'steam from a kettle only'], hint: 'You can walk through it.', why: 'Fog is tiny water drops floating near the ground, just like a low cloud.' },
  { q: 'Why does snow fall in winter instead of rain?', a: 'it is cold enough for the water to freeze', w: ['clouds are bigger in winter', 'rain is lazy in winter', 'the sun makes snow'], hint: 'What temperature does water freeze at?', why: 'Below 0 °C, precipitation falls as snow.' },
  { q: 'Which part of the water cycle makes clouds?', a: 'condensation', w: ['evaporation', 'precipitation', 'collection'], hint: 'Vapour cools and turns back into tiny drops.', why: 'Condensation turns water vapour into the drops that make clouds.' },
  { q: 'Which part of the water cycle is rain falling?', a: 'precipitation', w: ['evaporation', 'condensation', 'collection'], hint: 'Water falls from the clouds.', why: 'Rain, snow and hail are precipitation.' },
  { q: 'Which part of the water cycle is a lake drying up in the sun?', a: 'evaporation', w: ['condensation', 'precipitation', 'collection'], hint: 'Liquid water turns into a gas.', why: 'Evaporation turns liquid water into water vapour.' },
  { q: 'Which part of the water cycle is rain running into a river?', a: 'collection', w: ['evaporation', 'condensation', 'precipitation'], hint: 'Water gathers together again.', why: 'Water collecting in rivers, lakes and oceans is collection.' },
  { q: 'Why should we keep rivers and lakes clean?', a: 'all living things need clean water', w: ['so they look shiny', 'it does not matter', 'so fish get bored'], hint: 'Who drinks the water?', why: 'People, plants and animals all depend on clean water.' },
];

const CYCLE_ORDERS: [string, string[]][] = [
  ['Put the water cycle in order, starting with water in a lake.', ['evaporation', 'condensation', 'precipitation', 'collection']],
  ['Put the water cycle in order, starting with a cloud.', ['condensation', 'precipitation', 'collection', 'evaporation']],
  ['Put the water cycle in order, starting with rain falling.', ['precipitation', 'collection', 'evaporation', 'condensation']],
  ['Put the steps in order, starting with the sun warming a lake.', ['the sun warms the lake', 'water vapour rises into the air', 'the vapour cools and makes clouds', 'rain falls from the clouds', 'the rain flows back into the lake']],
  ['Put the steps in order to follow snow from the mountains.', ['snow falls on the Rockies', 'the snow melts in spring', 'meltwater flows into the Bow River', 'the sun warms the river water', 'water vapour rises and makes clouds']],
  ['A puddle on the playground. Put what happens in order.', ['rain makes a puddle', 'the sun heats the puddle', 'the water evaporates', 'the vapour forms a cloud', 'it rains again']],
];

function waterCycle(level: number, rng: Rng): Question {
  if (level === 0) return ask(rng, 'water', pick(rng, WATER.slice(0, 13)));
  if (rng() < 0.4) return ask(rng, 'water', pick(rng, WATER.slice(13)));
  const [prompt, steps] = pick(rng, CYCLE_ORDERS);
  return order(rng, 'cycle', prompt, steps, 'Heat makes water evaporate. High up, vapour cools into clouds. Then it falls, and it collects again.', `${steps.join(' → ')}.`);
}

// ---------- Materials and changes (3M1.1, 3M1.6) ----------

const NATURAL: Item[] = [
  { q: 'Paper is made from which natural material?', a: 'trees (wood)', w: ['rocks', 'sand', 'oil'], hint: 'Paper mills use logs.', why: 'Paper is processed from wood.' },
  { q: 'Glass is made from which natural material?', a: 'sand', w: ['trees', 'wool', 'clay'], hint: 'You find lots of it at the beach.', why: 'Glass is made by melting sand.' },
  { q: 'A wool sweater comes from…', a: 'sheep', w: ['cotton plants', 'rocks', 'trees'], hint: 'Which animal grows a fleece?', why: 'Wool is processed from sheep fleece.' },
  { q: 'Cheese is processed from…', a: 'milk', w: ['wheat', 'eggs', 'apples'], hint: 'It comes from cows, goats or sheep.', why: 'Cheese is made from milk.' },
  { q: 'Bricks are made from…', a: 'clay', w: ['wool', 'sand only', 'wood'], hint: 'It is a kind of soft earth that gets baked hard.', why: 'Bricks are baked clay.' },
  { q: 'Bread is made from…', a: 'wheat', w: ['milk', 'clay', 'cotton'], hint: 'Alberta farmers grow a lot of it.', why: 'Flour for bread comes from wheat.' },
  { q: 'Which of these is a natural material?', a: 'a rock', w: ['a plastic cup', 'a glass window', 'a nylon rope'], hint: 'Natural materials are found in nature, not made in a factory.', why: 'A rock is natural. The others are processed.' },
  { q: 'Which of these is a processed material?', a: 'plastic', w: ['wood', 'stone', 'leaves'], hint: 'Processed materials are changed by people and are not found in nature.', why: 'Plastic is made in factories, so it is processed.' },
  { q: 'A leather baseball glove is made from…', a: 'animal skin', w: ['plastic', 'rocks', 'paper'], hint: 'Leather comes from cows.', why: 'Leather is processed from animal hides.' },
  { q: 'A cotton T-shirt comes from…', a: 'a plant', w: ['an animal', 'a rock', 'oil'], hint: 'Cotton grows in fluffy balls on a bush.', why: 'Cotton is a natural fibre from the cotton plant.' },
  { q: 'Which of these is a natural material?', a: 'wool', w: ['plastic', 'nylon', 'rubber bands from a store'], hint: 'It grows on an animal.', why: 'Wool is natural. It comes from sheep.' },
  { q: 'A metal spoon is made from metal that was dug out of…', a: 'rocks in the ground', w: ['trees', 'the ocean only', 'clouds'], hint: 'Miners dig for it.', why: 'Metals come from ores, which are rocks.' },
  { q: 'Why do we make some materials, like plastic?', a: 'to get properties we need, like waterproof and light', w: ['because nature has no materials', 'to make things heavier', 'for no reason'], hint: 'Think of a raincoat or a water bottle.', why: 'People process materials to give them useful properties.' },
  { q: 'Which material would be best for a window?', a: 'glass, because you can see through it', w: ['wood, because it is strong', 'wool, because it is soft', 'clay, because it is brown'], hint: 'A window needs to let light in.', why: 'Glass is transparent, so it is good for windows.' },
  { q: 'Which material would be best for a winter mitten?', a: 'wool, because it is warm', w: ['glass, because it is clear', 'metal, because it is shiny', 'paper, because it is thin'], hint: 'Mittens need to keep your hands warm.', why: 'Wool keeps heat in.' },
  { q: 'Which is a way to reuse a material?', a: 'using a glass jar to hold crayons', w: ['throwing the jar in the garbage', 'breaking the jar', 'burying the jar'], hint: 'Give it a new job.', why: 'Reusing gives materials a second life.' },
  { q: 'Recycling paper means…', a: 'making it into new paper', w: ['burning it', 'eating it', 'painting it'], hint: 'It goes in the blue bin.', why: 'Recycled paper is processed into new paper products.' },
  { q: 'Maple syrup is processed from…', a: 'sap from maple trees', w: ['honey from bees', 'milk', 'sugar beets only'], hint: 'People tap trees in early spring.', why: 'Sap is boiled down to make maple syrup.' },
];
const CHANGES = {
  reversible: ['melting chocolate', 'freezing juice into a popsicle', 'melting a snowman', 'folding paper', 'boiling water into steam', 'stretching a rubber band', 'squishing play dough into a ball', 'mixing marbles and sand', 'melting candle wax', 'blowing up a balloon', 'freezing a lake', 'dissolving sugar in water and letting it dry'],
  permanent: ['cooking an egg', 'baking a cake', 'burning wood', 'toasting bread', 'cutting paper', 'rusting a bike chain', 'baking clay in a kiln', 'popping popcorn', 'frying a pancake', 'striking a match', 'a banana going brown', 'grinding wheat into flour'],
};

function materials(level: number, rng: Rng): Question {
  if (level === 0) return ask(rng, 'mat', pick(rng, NATURAL));
  return sorter(rng, 'chg', (x) => `Is ${x} a reversible change or a permanent change?`, CHANGES, 'Reversible means you can change it back. Permanent means you cannot undo it.');
}

// ---------- Forces and simple machines (3E1) ----------

const FORCES: Item[] = [
  { q: 'A force is a…', a: 'push or a pull', w: ['kind of light', 'kind of sound', 'colour'], hint: 'Think about what you do to open a door.', why: 'A force is a push or a pull.' },
  { q: 'You kick a soccer ball. What kind of force is that?', a: 'a push', w: ['a pull', 'no force'], hint: 'Your foot moves the ball away from you.', why: 'Kicking pushes the ball away.' },
  { q: 'You open a drawer toward you. What kind of force is that?', a: 'a pull', w: ['a push', 'no force'], hint: 'The drawer comes toward you.', why: 'Pulling brings something toward you.' },
  { q: 'Why is it hard to slide a box across a carpet?', a: 'friction', w: ['magnetism', 'light', 'tension'], hint: 'It is the force between two surfaces rubbing.', why: 'Friction slows things that rub together.' },
  { q: 'Why does a puck slide farther on ice than on grass?', a: 'ice has less friction', w: ['ice has more friction', 'grass is colder', 'pucks like ice'], hint: 'Smooth, slippery surfaces have less of something.', why: 'Ice is smooth, so there is less friction to slow the puck.' },
  { q: 'A puck is sitting still on the ice. What will make it move?', a: 'a force, like a hit from a stick', w: ['nothing, it moves by itself', 'waiting a long time', 'looking at it'], hint: 'Objects stay still until a force acts on them.', why: 'Objects stay still or keep moving until a force acts on them.' },
  { q: 'Pulling on a rope in tug of war makes what kind of force in the rope?', a: 'tension', w: ['friction', 'elastic', 'gravity'], hint: 'The rope is pulled tight from both ends.', why: 'A pulled rope or string has tension.' },
  { q: 'A stretched slingshot band pushing back is what kind of force?', a: 'elastic force', w: ['friction', 'tension only', 'light'], hint: 'Things like springs and rubber bands bounce back.', why: 'Springs and rubber bands make elastic forces.' },
  { q: 'What can a force do to a moving object?', a: 'all of these', w: ['only speed it up', 'only stop it', 'only turn it'], hint: 'Think of a goalie, a stick and a boot.', why: 'Forces can speed things up, slow or stop them, or change their direction.' },
  { q: 'Squeezing play dough shows that a force can change an object’s…', a: 'shape', w: ['colour', 'smell', 'name'], hint: 'What happens to the dough?', why: 'Forces can change the shape or size of objects.' },
  { q: 'What force pulls a ball back down after you throw it up?', a: 'gravity', w: ['friction', 'tension', 'elastic force'], hint: 'It pulls everything toward the ground.', why: 'Gravity pulls objects toward Earth.' },
  { q: 'Sand on an icy sidewalk helps you not slip because it adds…', a: 'friction', w: ['gravity', 'tension', 'light'], hint: 'Rough surfaces grip better.', why: 'Sand makes the surface rougher, so there is more friction.' },
  { q: 'A goalie stops a moving puck. The force changed the puck’s…', a: 'motion', w: ['colour', 'weight', 'smell'], hint: 'It was moving, now it is not.', why: 'Forces can stop moving objects.' },
  { q: 'A magnet pulls a paper clip without touching it. This force is…', a: 'magnetism', w: ['friction', 'tension', 'elastic force'], hint: 'Fridge magnets use it.', why: 'Magnets can push or pull some metals without touching them.' },
  { q: 'A trampoline bouncing you up is an example of…', a: 'elastic force', w: ['friction', 'magnetism', 'tension'], hint: 'It stretches and springs back.', why: 'Stretchy things push back with elastic force.' },
  { q: 'Why do skis have smooth, waxed bottoms?', a: 'to lower friction so they glide', w: ['to make them heavier', 'to add friction', 'to make them colourful'], hint: 'Smooth surfaces slide easily.', why: 'Wax makes the skis smoother, which lowers friction.' },
  { q: 'Pulling a kite string tight on a windy day makes…', a: 'tension in the string', w: ['friction in the string', 'magnetism', 'gravity in the kite'], hint: 'The string is pulled from both ends.', why: 'A tight string or rope has tension.' },
  { q: 'Which would need the biggest push to move?', a: 'a full wagon of rocks', w: ['an empty wagon', 'a feather', 'a beach ball'], hint: 'Heavier things need more force.', why: 'Heavier objects need a bigger force to move.' },
];
const MACHINES: Item[] = [
  { q: 'A ramp used to roll a heavy box into a truck is a…', a: 'inclined plane', w: ['lever', 'wheel and axle', 'pulley'], hint: 'It is a sloped surface.', why: 'A ramp is an inclined plane. It lets you use less force over a longer distance.' },
  { q: 'A seesaw is a…', a: 'lever', w: ['inclined plane', 'wheel and axle', 'wedge'], hint: 'It is a bar that turns on a point.', why: 'A seesaw is a lever. It turns on a point called a fulcrum.' },
  { q: 'A wagon uses which simple machine to roll easily?', a: 'wheel and axle', w: ['lever', 'inclined plane', 'wedge'], hint: 'Look under the wagon.', why: 'Wheels on an axle make moving loads easier.' },
  { q: 'Why do people use simple machines?', a: 'to make work easier', w: ['to make work harder', 'to make noise', 'to make light'], hint: 'Think about carrying a heavy load with or without a wagon.', why: 'Simple machines reduce the effort needed to move things.' },
  { q: 'A paddle pushing a canoe through water works like a…', a: 'lever', w: ['inclined plane', 'wheel and axle'], hint: 'You hold it and it turns as you pull.', why: 'A paddle is a lever. First Nations peoples designed paddles and still use them.' },
  { q: 'An ulu is a curved knife used by Inuit. Its blade is a…', a: 'wedge', w: ['wheel and axle', 'pulley'], hint: 'A thin edge that splits or cuts.', why: 'A blade is a wedge, a kind of inclined plane.' },
  { q: 'Which uses a lever to make lifting easier?', a: 'a hockey stick lifting a puck', w: ['a slide at the park', 'a bicycle wheel', 'a hill'], hint: 'A long bar you push on at one end.', why: 'A stick works as a lever.' },
  { q: 'A wheelchair ramp is a…', a: 'inclined plane', w: ['lever', 'pulley', 'wedge'], hint: 'It slopes up to the door.', why: 'A ramp is an inclined plane.' },
  { q: 'A doorknob turning a latch is a…', a: 'wheel and axle', w: ['lever', 'inclined plane', 'wedge'], hint: 'A round handle turns a rod.', why: 'A doorknob is a wheel and axle.' },
  { q: 'An axe splitting firewood uses a…', a: 'wedge', w: ['pulley', 'wheel and axle', 'lever'], hint: 'A thin edge pushes the wood apart.', why: 'An axe head is a wedge.' },
  { q: 'Raising a flag up a flagpole uses a…', a: 'pulley', w: ['wedge', 'inclined plane', 'lever'], hint: 'A rope goes over a wheel at the top.', why: 'A pulley lets you pull down to lift something up.' },
  { q: 'A playground slide is a kind of…', a: 'inclined plane', w: ['lever', 'pulley', 'wheel and axle'], hint: 'It is a slope.', why: 'A slide is a sloped surface, an inclined plane.' },
  { q: 'A shovel lifting snow works as a…', a: 'lever', w: ['wedge', 'pulley', 'inclined plane'], hint: 'You push down on the handle to lift the blade.', why: 'A shovel is a lever.' },
  { q: 'A bike’s wheels and the rod through the middle are a…', a: 'wheel and axle', w: ['lever', 'wedge', 'pulley'], hint: 'The wheel turns around a rod.', why: 'That is a wheel and axle.' },
  { q: 'Is it easier to push a heavy wagon up a long gentle ramp or a short steep one?', a: 'a long gentle ramp', w: ['a short steep ramp', 'they are the same'], hint: 'A gentle slope needs less force, but you go farther.', why: 'A longer, gentler inclined plane needs less force.' },
];

const PUSH_PULL = {
  'a push': ['kicking a soccer ball', 'shooting a puck', 'pressing an elevator button', 'closing a door', 'pushing a stroller', 'throwing a snowball', 'bowling a ball', 'squishing a marshmallow', 'pedalling a bike', 'shovelling snow off a driveway', 'typing on a keyboard'],
  'a pull': ['opening a drawer', 'tugging a rope in tug of war', 'pulling a toboggan up a hill', 'zipping up your coat', 'pulling weeds in the garden', 'opening a fridge door', 'reeling in a fish', 'lifting a backpack off the floor', 'pulling on your boots', 'a dog walking you on a leash', 'pulling a wagon'],
};

function forces(level: number, rng: Rng): Question {
  if (level === 0 && rng() < 0.7) return sorter(rng, 'pp', (x) => `Is ${x} a push or a pull?`, PUSH_PULL, 'A push moves something away from you. A pull brings it toward you.');
  return ask(rng, 'force', pick(rng, level === 0 ? FORCES.slice(0, 6) : level === 1 ? FORCES : MACHINES));
}

// ---------- Living systems (3LS1) ----------

const DIETS = {
  herbivore: ['a deer', 'a moose', 'a rabbit', 'a bison', 'a cow', 'a grasshopper', 'a beaver', 'a horse', 'an elk', 'a bighorn sheep', 'a caterpillar', 'a porcupine'],
  carnivore: ['a wolf', 'a lynx', 'a hawk', 'an owl', 'a frog', 'a cougar', 'a shark', 'a bald eagle', 'a snake', 'a polar bear', 'a spider', 'a weasel'],
  omnivore: ['a black bear', 'a raccoon', 'a crow', 'a human', 'a skunk', 'a chickadee', 'a grizzly bear', 'a coyote', 'a magpie', 'a pig', 'a chicken', 'a fox'],
};
const CHAINS = [
  ['sun', 'grass', 'grasshopper', 'frog', 'hawk'],
  ['sun', 'grass', 'rabbit', 'lynx'],
  ['sun', 'willow leaves', 'moose', 'wolf'],
  ['sun', 'algae', 'small fish', 'big fish', 'osprey'],
  ['sun', 'seeds', 'mouse', 'owl'],
  ['sun', 'berries', 'black bear'],
  ['sun', 'clover', 'gopher', 'badger'],
  ['sun', 'grass', 'bison', 'wolf'],
  ['sun', 'flowers', 'bee', 'bird'],
  ['sun', 'leaves', 'caterpillar', 'robin', 'hawk'],
  ['sun', 'pine seeds', 'squirrel', 'owl'],
  ['sun', 'water plants', 'duck', 'fox'],
  ['sun', 'grass', 'deer', 'cougar'],
  ['sun', 'carrot', 'rabbit', 'coyote'],
  ['sun', 'lettuce', 'snail', 'frog'],
  ['sun', 'wheat', 'mouse', 'snake', 'hawk'],
];
const SENSES: Item[] = [
  { q: 'A plant on a windowsill bends toward the window. It is responding to…', a: 'light', w: ['music', 'colour', 'wind'], hint: 'Plants need it to make food.', why: 'Plants grow toward light.' },
  { q: 'A deer lifts its head and runs when it hears a twig snap. It used its sense of…', a: 'hearing', w: ['taste', 'touch', 'smell'], hint: 'A snapping sound.', why: 'Animals use their senses to detect predators.' },
  { q: 'Why do many birds fly south in the fall?', a: 'to find food and warmer weather', w: ['to visit friends', 'because they are bored', 'to see the ocean'], hint: 'Winter in Alberta is cold and food is hard to find.', why: 'Migration is a response to temperature and food.' },
  { q: 'A bear eats a lot in the fall and then sleeps most of the winter. This helps it…', a: 'survive when food is scarce', w: ['grow taller', 'learn to fly', 'change colour'], hint: 'There are few berries in winter.', why: 'Animals respond to the seasons to survive.' },
  { q: 'A wilted plant stands up again after it is watered. It responded to…', a: 'water', w: ['noise', 'darkness', 'wind'], hint: 'What did the plant get?', why: 'Plants respond to water.' },
  { q: 'Which helps protect wild animals?', a: 'watching from a distance and not feeding them', w: ['chasing them for a photo', 'feeding them snacks', 'taking their eggs'], hint: 'How can we keep animals wild and safe?', why: 'Watching quietly from a distance is respectful and safe.' },
  { q: 'Why are there wildlife crossings over highways near Banff?', a: 'so animals can cross safely', w: ['for cars to park', 'so people can fish', 'to block the view'], hint: 'Animals need to move between habitats.', why: 'Wildlife crossings protect animals and drivers.' },
  { q: 'If all the grass disappeared, what would happen to the rabbits?', a: 'they would have less food', w: ['nothing would change', 'they would get bigger', 'they would eat rocks'], hint: 'Plants and animals depend on each other.', why: 'Animals depend on plants and other animals for food.' },
  { q: 'A snowshoe hare turns white in winter. This helps it…', a: 'hide in the snow', w: ['stay cool', 'swim faster', 'find friends'], hint: 'Predators are looking for it.', why: 'White fur is camouflage in the snow.' },
  { q: 'A dog sniffs the ground to find a treat. It is using its sense of…', a: 'smell', w: ['sight', 'taste', 'hearing'], hint: 'It uses its nose.', why: 'Dogs have an amazing sense of smell.' },
  { q: 'You pull your hand away from a hot stove. You are responding to…', a: 'heat', w: ['light', 'sound', 'colour'], hint: 'Your skin feels it.', why: 'Your sense of touch detects heat and keeps you safe.' },
  { q: 'Sunflowers turn to face the sun. They respond to…', a: 'light', w: ['music', 'wind', 'cold'], hint: 'What does the sun give?', why: 'Plants respond to light.' },
  { q: 'A plant’s roots grow down toward…', a: 'water in the soil', w: ['the sky', 'the moon', 'the wind'], hint: 'Roots drink.', why: 'Roots grow toward water.' },
  { q: 'Why do some animals, like gophers, hibernate?', a: 'to save energy when there is little food', w: ['because they are lazy', 'to grow wings', 'to stay awake'], hint: 'Winter is long and food is scarce.', why: 'Hibernation saves energy through winter.' },
  { q: 'Bees visit flowers because they…', a: 'get nectar and pollen for food', w: ['like the colours only', 'are lost', 'want to sleep'], hint: 'Flowers give them something.', why: 'Bees feed on nectar and pollen and help plants make seeds.' },
  { q: 'A turtle pulls into its shell when it is touched. This helps it…', a: 'stay safe from danger', w: ['get warmer', 'find food', 'run faster'], hint: 'The shell is like armour.', why: 'Hiding in its shell protects the turtle.' },
];

function living(level: number, rng: Rng): Question {
  if (level === 0) return sorter(rng, 'diet', (x) => `Is ${x} a herbivore, a carnivore, or an omnivore?`, DIETS, 'Herbivores eat only plants. Carnivores eat only animals. Omnivores eat both.');
  if (level === 1) {
    const chain = pick(rng, CHAINS);
    return order(rng, 'chain', 'Build the food chain. Start with where the energy comes from.', chain, 'Energy starts with the sun. Then a plant. Then who eats the plant?', `${chain.join(' → ')}. Each one is food for the next.`);
  }
  return ask(rng, 'sense', pick(rng, SENSES));
}

// ---------- Earth systems (3ES1) ----------

const EARTH: Item[] = [
  { q: 'Which change to Earth’s surface happens very slowly?', a: 'a mountain wearing down', w: ['an earthquake', 'a landslide', 'a volcano erupting'], hint: 'It takes thousands of years.', why: 'Wind, water and ice wear mountains down very slowly.' },
  { q: 'Which change to Earth’s surface happens suddenly?', a: 'a landslide', w: ['a river slowly changing course', 'a glacier moving', 'a mountain wearing down'], hint: 'It can happen in minutes.', why: 'Landslides, floods and earthquakes change the land quickly.' },
  { q: 'Many of Alberta’s big rivers, like the Bow River, get water from…', a: 'melting glaciers in the Rockies', w: ['the ocean', 'underground volcanoes', 'rain only'], hint: 'Rivers of ice high in the mountains.', why: 'Glacier meltwater feeds many Alberta rivers.' },
  { q: 'The badlands near Drumheller were shaped mostly by…', a: 'water and wind', w: ['people with shovels', 'dinosaurs walking', 'volcanoes'], hint: 'Rain and wind wear away soft rock over a long time.', why: 'Water and wind carved the badlands.' },
  { q: 'A glacier is…', a: 'a huge, slow-moving river of ice', w: ['a type of rock', 'a fast river', 'a cloud on a mountain'], hint: 'You can see some in the Rocky Mountains.', why: 'Glaciers are large masses of ice that move slowly.' },
  { q: 'Which is a way people change Earth’s surface?', a: 'building roads and farms', w: ['breathing', 'reading books', 'sleeping'], hint: 'Think about what we build on land.', why: 'Building, farming and mining all change the land.' },
  { q: 'Mountain pine beetles change forests by…', a: 'killing many pine trees', w: ['planting new trees', 'making trees taller', 'turning trees blue'], hint: 'They are tiny insects that live in trees.', why: 'Mountain pine beetles can kill large areas of forest.' },
  { q: 'Which is a way to take care of the land?', a: 'picking up litter', w: ['dumping garbage in rivers', 'cutting down every tree', 'driving over plants'], hint: 'Stewardship means caring for the Earth.', why: 'Picking up litter and planting trees help care for the land.' },
  { q: 'Wearing away of rock and soil by water, wind or ice is called…', a: 'erosion', w: ['evaporation', 'hibernation', 'friction'], hint: 'It starts with “e” and takes the land away bit by bit.', why: 'Erosion carries rock and soil away.' },
  { q: 'A big flood can change the land…', a: 'quickly, in a few days', w: ['only over millions of years', 'never'], hint: 'Calgary had a big flood in 2013.', why: 'Floods are sudden changes to the land.' },
  { q: 'Over a very long time, a river can carve…', a: 'a deep valley or canyon', w: ['a mountain on top of itself', 'a glacier', 'a volcano'], hint: 'Water keeps wearing away the rock.', why: 'Rivers slowly cut valleys and canyons.' },
  { q: 'Hoodoos in the badlands are…', a: 'tall rock pillars shaped by erosion', w: ['old buildings', 'dinosaur nests', 'tree stumps'], hint: 'They have a hard rock “cap” on top.', why: 'Hoodoos form when soft rock wears away around a harder cap.' },
  { q: 'Which is a sudden change to the land?', a: 'an earthquake', w: ['a glacier melting', 'a river bending', 'wind wearing a rock'], hint: 'It happens in seconds.', why: 'Earthquakes change the land suddenly.' },
  { q: 'Planting trees on a hillside helps…', a: 'roots hold the soil so it does not wash away', w: ['make the hill taller', 'make the soil hot', 'scare away rain'], hint: 'Roots are like nets.', why: 'Plant roots help stop erosion.' },
];
const FOSSILS: Item[] = [
  { q: 'A scientist who studies fossils is called a…', a: 'paleontologist', w: ['dentist', 'astronaut', 'meteorologist'], hint: 'It starts with “paleo”, which means old.', why: 'Paleontologists study fossils.' },
  { q: 'How do we know dinosaurs lived in Alberta long ago?', a: 'their fossil bones were found here', w: ['someone saw one last year', 'from a cartoon', 'we do not know'], hint: 'What do paleontologists dig up?', why: 'Fossilized bones show dinosaurs lived here millions of years ago.' },
  { q: 'Rock layers lower down in the ground are usually…', a: 'older', w: ['newer', 'the same age', 'made of ice'], hint: 'Layers pile up on top of each other over time.', why: 'Lower layers formed first, so they are older.' },
  { q: 'Long ago, the area that is now Alberta had…', a: 'warm forests and an inland sea', w: ['only ice', 'big cities', 'no plants'], hint: 'Many dinosaur fossils come from swampy, warm places.', why: 'Alberta was once warm, with forests and an inland sea.' },
  { q: 'Which famous Alberta museum is full of dinosaur fossils?', a: 'the Royal Tyrrell Museum', w: ['the Calgary Tower', 'West Edmonton Mall', 'the Saddledome'], hint: 'It is in Drumheller.', why: 'The Royal Tyrrell Museum in Drumheller has one of the biggest dinosaur collections.' },
  { q: 'Dinosaur Provincial Park is special because it is a…', a: 'UNESCO World Heritage Site', w: ['hockey arena', 'shopping centre', 'zoo'], hint: 'It is protected for the whole world.', why: 'It is a UNESCO World Heritage Site with many fossils.' },
  { q: 'Soil is made of…', a: 'rock bits, living and dead things, air and water', w: ['only sand', 'only water', 'plastic'], hint: 'Look closely at a handful from the garden.', why: 'Soil has rock particles, organisms, air and water.' },
  { q: 'How do earthworms change soil?', a: 'they dig tunnels that let in air and water', w: ['they turn it to rock', 'they make it colder', 'they paint it'], hint: 'Worms wiggle through the dirt.', why: 'Worm tunnels mix soil and let air and water in.' },
  { q: 'A dinosaur footprint in rock is a kind of…', a: 'fossil', w: ['painting', 'map', 'crystal'], hint: 'It is a trace of life from long ago.', why: 'Footprints, bones, shells and leaf prints can all be fossils.' },
  { q: 'Which is NOT a fossil?', a: 'a plastic toy dinosaur', w: ['a shell print in rock', 'a dinosaur bone turned to stone', 'a leaf print in rock'], hint: 'Fossils are real remains of living things.', why: 'Fossils come from real plants and animals.' },
  { q: 'Why do paleontologists dig very carefully with small brushes?', a: 'so the fossils do not break', w: ['because they are slow', 'to make it take longer', 'because shovels are not allowed'], hint: 'Fossils can be fragile.', why: 'Careful digging protects fossils.' },
  { q: 'Ammolite, a shiny gem from southern Alberta, comes from…', a: 'fossil shells of sea animals', w: ['volcanoes', 'melted glass', 'tree sap'], hint: 'Alberta was once under a sea.', why: 'Ammolite forms from fossil ammonite shells.' },
  { q: 'Which soil holds water best for growing plants?', a: 'soil with lots of dead leaves and plants mixed in', w: ['pure sand', 'small rocks only', 'concrete'], hint: 'Rotting leaves act like a sponge.', why: 'Soil rich in organic matter holds water well.' },
  { q: 'If you find a fossil in a park, what should you do?', a: 'leave it, take a photo and tell a ranger', w: ['take it home', 'break it open', 'throw it in the river'], hint: 'In Alberta, fossils belong to everyone.', why: 'Fossils are protected so scientists can study them.' },
];

const EARTH_ORDERS: [string, string[], string][] = [
  ['How does a dinosaur bone become a fossil we can see? Put the steps in order.', ['a dinosaur dies', 'mud and sand cover the bones', 'layers pile up and turn to rock', 'wind and water wear the rock away', 'a paleontologist digs it up'], 'Start with the dinosaur. What covers it? What happens over millions of years?'],
  ['How does a seashell become a fossil? Put the steps in order.', ['a sea animal dies', 'its shell sinks to the sea floor', 'sand and mud bury the shell', 'the layers slowly turn to rock', 'the shell’s shape is left in stone'], 'Start in the sea. What happens to the shell after it sinks?'],
  ['A paleontologist finds a fossil. Put the steps in order.', ['spot a bone in the rock', 'brush the dirt away carefully', 'wrap it in plaster to protect it', 'carry it to the museum lab', 'clean and study it'], 'First you find it. What do you do before moving it?'],
  ['How does soil form? Put the steps in order.', ['a big rock sits in the open', 'rain, ice and wind crack the rock', 'the rock breaks into tiny bits', 'dead plants and leaves mix in', 'worms mix it into rich soil'], 'Start with rock. How does it get broken up?'],
  ['How does a river make a valley? Put the steps in order.', ['rain and melting snow fill a stream', 'the water flows downhill', 'the water carries away bits of rock', 'over many years the stream cuts deeper', 'a valley forms'], 'Start with the water. What does flowing water do to the rock?'],
  ['Rock layers in the badlands: put them from oldest to newest.', ['the bottom layer', 'the middle layer', 'the top layer'], 'Layers pile up one on top of another.'],
];

function earth(level: number, rng: Rng): Question {
  if (level === 2) {
    if (rng() < 0.4) return ask(rng, 'earth', pick(rng, FOSSILS));
    const [prompt, steps, hint] = pick(rng, EARTH_ORDERS);
    return order(rng, 'fossil', prompt, steps, hint, `${steps.join(' → ')}.`);
  }
  return ask(rng, 'earth', pick(rng, level === 0 ? EARTH : FOSSILS));
}

// ---------- Computational thinking (3CS1) ----------

const ROUTINES: [string, string[]][] = [
  ['Brush your teeth', ['get your toothbrush', 'put on toothpaste', 'brush all your teeth', 'rinse your mouth']],
  ['Make a peanut butter sandwich', ['take out two slices of bread', 'spread peanut butter on one slice', 'put the other slice on top', 'cut it in half']],
  ['Wash your hands', ['turn on the water', 'rub on some soap', 'scrub for 20 seconds', 'rinse and dry your hands']],
  ['Plant a seed', ['dig a small hole', 'drop in the seed', 'cover it with soil', 'water it']],
  ['Mail a letter', ['write the letter', 'put it in an envelope', 'add a stamp', 'put it in the mailbox']],
  ['Get ready for hockey', ['put on your base layer', 'put on your shin pads and socks', 'lace up your skates', 'put on your helmet']],
  ['Build a snowman', ['roll a big snowball for the bottom', 'roll a middle snowball and stack it', 'add a small head on top', 'give it a carrot nose']],
  ['Make a bowl of cereal', ['get a bowl and spoon', 'pour in the cereal', 'pour in the milk', 'eat it up']],
  ['Cross the street safely', ['stop at the curb', 'look left, right and left again', 'wait until it is clear', 'walk across']],
  ['Feed the dog', ['get the dog bowl', 'scoop in the food', 'put the bowl on the floor', 'fill the water dish']],
  ['Go tobogganing', ['put on your snow pants and boots', 'carry the toboggan up the hill', 'sit on the toboggan', 'slide down']],
  ['Read a library book', ['find a book on the shelf', 'check it out at the desk', 'read it at home', 'return it on time']],
  ['Water a plant', ['fill the watering can', 'carry it to the plant', 'pour water on the soil', 'put the can away']],
  ['Make a phone call to Grandma', ['pick up the phone', 'dial her number', 'wait for her to answer', 'say hello']],
];
const CS: Item[] = [
  { q: 'Breaking a big job into small steps is called…', a: 'decomposing', w: ['guessing', 'sleeping', 'colouring'], hint: 'You take a big problem apart into pieces.', why: 'Breaking a problem into parts is called decomposition.' },
  { q: 'A robot is told: forward 2, turn left, forward 1. Instead it turns right. What should you do?', a: 'find the step that is wrong and fix it', w: ['throw the robot away', 'start a new project', 'add more random steps'], hint: 'Debugging means finding the mistake.', why: 'Working back to find and fix a mistake is called debugging.' },
  { q: 'Can there be more than one right way to solve a problem?', a: 'yes, often', w: ['no, never', 'only in math'], hint: 'Think of different routes to school.', why: 'Creative thinking finds different ways to reach the same goal.' },
  { q: 'The Canadarm is a famous Canadian invention used…', a: 'on the space shuttle and space station', w: ['in hockey rinks', 'on farms', 'under the sea'], hint: 'It is a robot arm.', why: 'The Canadarm is a robot arm that worked in space.' },
  { q: 'Spotting that “red, blue, red, blue” repeats is called…', a: 'finding a pattern', w: ['breaking a rule', 'a mistake', 'a guess'], hint: 'Something that happens again and again.', why: 'Noticing repeats is pattern recognition.' },
  { q: 'An algorithm is…', a: 'a set of step-by-step instructions', w: ['a kind of dinosaur', 'a computer screen', 'a song'], hint: 'A recipe is one.', why: 'An algorithm is a list of steps to follow.' },
  { q: 'A recipe says “bake, then mix, then pour”. What is wrong?', a: 'the steps are in the wrong order', w: ['nothing is wrong', 'it has too many steps', 'it needs more ovens'], hint: 'Can you bake something before you mix it?', why: 'Order matters in an algorithm. You must mix and pour before baking.' },
  { q: 'Instead of writing “clap, clap, clap, clap”, a coder could write…', a: 'repeat 4 times: clap', w: ['clap once', 'stop', 'clap forever'], hint: 'A loop repeats steps.', why: 'A loop repeats steps so you do not write them again and again.' },
  { q: '“If it is raining, take an umbrella.” This kind of instruction is a…', a: 'condition (an if)', w: ['loop', 'mistake', 'pattern'], hint: 'It only happens IF something is true.', why: 'A condition decides what to do based on what is true.' },
  { q: 'A robot must get from the door to the desk. Why test the steps before running them for real?', a: 'to find mistakes early', w: ['to waste time', 'robots like tests', 'there is no reason'], hint: 'Fixing a mistake early is easier.', why: 'Testing helps find bugs before they cause problems.' },
  { q: 'What comes next in the pattern: square, circle, square, circle, …?', a: 'square', w: ['circle', 'triangle', 'star'], hint: 'Look at what repeats.', why: 'The pattern repeats square, circle.' },
  { q: 'Which is an example of decomposing a problem?', a: 'cleaning your room one corner at a time', w: ['ignoring the mess', 'cleaning with your eyes closed', 'buying a new room'], hint: 'Break a big job into small parts.', why: 'Breaking a big job into smaller parts is decomposition.' },
  { q: 'Your friend’s steps to draw a house forgot the roof. Fixing it is called…', a: 'debugging', w: ['decomposing', 'looping', 'erasing everything'], hint: 'Finding and fixing a mistake.', why: 'Debugging is finding and fixing errors.' },
  { q: 'Who can be a coder?', a: 'anyone who practises', w: ['only grown-ups', 'only robots', 'only people with a computer at home'], hint: 'You are learning right now!', why: 'Anyone can learn to code with practice.' },
];

function coding(level: number, rng: Rng): Question {
  if (level === 0) {
    const [task, steps] = pick(rng, ROUTINES);
    return order(rng, 'algo', `Write the instructions for “${task}”. Tap the steps in order.`, steps, 'What has to happen first? What can only happen at the end?', `${steps.join(', then ')}.`);
  }
  return ask(rng, 'cs', pick(rng, CS));
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
