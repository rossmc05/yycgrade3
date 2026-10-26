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

function states(level: number, rng: Rng): Question {
  if (level === 0) return sorter(rng, 'state', (x) => `Is ${x} a solid, a liquid, or a gas?`, STATES, 'Solids keep their shape. Liquids pour. Gases spread out to fill a space.');
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
];

function waterCycle(level: number, rng: Rng): Question {
  if (level === 0) return ask(rng, 'water', pick(rng, WATER));
  return order(rng, 'cycle', 'Put the water cycle in order, starting with water in a lake.', ['evaporation', 'condensation', 'precipitation', 'collection'], 'The sun heats the water first. What happens to the vapour up high? Then what falls?', 'Water evaporates, condenses into clouds, falls as precipitation and collects again.');
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
];
const CHANGES = {
  reversible: ['melting chocolate', 'freezing juice into a popsicle', 'melting a snowman', 'folding paper', 'boiling water into steam', 'stretching a rubber band'],
  permanent: ['cooking an egg', 'baking a cake', 'burning wood', 'toasting bread', 'cutting paper', 'rusting a bike chain'],
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
];
const MACHINES: Item[] = [
  { q: 'A ramp used to roll a heavy box into a truck is a…', a: 'inclined plane', w: ['lever', 'wheel and axle', 'pulley'], hint: 'It is a sloped surface.', why: 'A ramp is an inclined plane. It lets you use less force over a longer distance.' },
  { q: 'A seesaw is a…', a: 'lever', w: ['inclined plane', 'wheel and axle', 'wedge'], hint: 'It is a bar that turns on a point.', why: 'A seesaw is a lever. It turns on a point called a fulcrum.' },
  { q: 'A wagon uses which simple machine to roll easily?', a: 'wheel and axle', w: ['lever', 'inclined plane', 'wedge'], hint: 'Look under the wagon.', why: 'Wheels on an axle make moving loads easier.' },
  { q: 'Why do people use simple machines?', a: 'to make work easier', w: ['to make work harder', 'to make noise', 'to make light'], hint: 'Think about carrying a heavy load with or without a wagon.', why: 'Simple machines reduce the effort needed to move things.' },
  { q: 'A paddle pushing a canoe through water works like a…', a: 'lever', w: ['inclined plane', 'wheel and axle'], hint: 'You hold it and it turns as you pull.', why: 'A paddle is a lever. First Nations peoples designed paddles and still use them.' },
  { q: 'An ulu is a curved knife used by Inuit. Its blade is a…', a: 'wedge', w: ['wheel and axle', 'pulley'], hint: 'A thin edge that splits or cuts.', why: 'A blade is a wedge, a kind of inclined plane.' },
  { q: 'Which uses a lever to make lifting easier?', a: 'a hockey stick lifting a puck', w: ['a slide at the park', 'a bicycle wheel', 'a hill'], hint: 'A long bar you push on at one end.', why: 'A stick works as a lever.' },
];

function forces(level: number, rng: Rng): Question {
  return ask(rng, 'force', pick(rng, level === 0 ? FORCES.slice(0, 6) : level === 1 ? FORCES : MACHINES));
}

// ---------- Living systems (3LS1) ----------

const DIETS = {
  herbivore: ['a deer', 'a moose', 'a rabbit', 'a bison', 'a cow', 'a grasshopper', 'a beaver'],
  carnivore: ['a wolf', 'a lynx', 'a hawk', 'an owl', 'a frog', 'a cougar', 'a shark'],
  omnivore: ['a black bear', 'a raccoon', 'a crow', 'a human', 'a skunk', 'a chickadee'],
};
const CHAINS = [
  ['sun', 'grass', 'grasshopper', 'frog', 'hawk'],
  ['sun', 'grass', 'rabbit', 'lynx'],
  ['sun', 'willow leaves', 'moose', 'wolf'],
  ['sun', 'algae', 'small fish', 'big fish', 'osprey'],
  ['sun', 'seeds', 'mouse', 'owl'],
  ['sun', 'berries', 'black bear'],
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
];

function earth(level: number, rng: Rng): Question {
  if (level === 2) {
    return order(rng, 'fossil', 'How does a dinosaur bone become a fossil we can see? Put the steps in order.', ['a dinosaur dies', 'mud and sand cover the bones', 'layers pile up and turn to rock', 'wind and water wear the rock away', 'a paleontologist digs it up'], 'Start with the dinosaur. What covers it? What happens over millions of years?', 'Bones are buried, layers become rock, erosion uncovers them, and paleontologists dig them up.');
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
];
const CS: Item[] = [
  { q: 'Breaking a big job into small steps is called…', a: 'decomposing', w: ['guessing', 'sleeping', 'colouring'], hint: 'You take a big problem apart into pieces.', why: 'Breaking a problem into parts is called decomposition.' },
  { q: 'A robot is told: forward 2, turn left, forward 1. Instead it turns right. What should you do?', a: 'find the step that is wrong and fix it', w: ['throw the robot away', 'start a new project', 'add more random steps'], hint: 'Debugging means finding the mistake.', why: 'Working back to find and fix a mistake is called debugging.' },
  { q: 'Can there be more than one right way to solve a problem?', a: 'yes, often', w: ['no, never', 'only in math'], hint: 'Think of different routes to school.', why: 'Creative thinking finds different ways to reach the same goal.' },
  { q: 'The Canadarm is a famous Canadian invention used…', a: 'on the space shuttle and space station', w: ['in hockey rinks', 'on farms', 'under the sea'], hint: 'It is a robot arm.', why: 'The Canadarm is a robot arm that worked in space.' },
  { q: 'Spotting that “red, blue, red, blue” repeats is called…', a: 'finding a pattern', w: ['breaking a rule', 'a mistake', 'a guess'], hint: 'Something that happens again and again.', why: 'Noticing repeats is pattern recognition.' },
  { q: 'An algorithm is…', a: 'a set of step-by-step instructions', w: ['a kind of dinosaur', 'a computer screen', 'a song'], hint: 'A recipe is one.', why: 'An algorithm is a list of steps to follow.' },
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
