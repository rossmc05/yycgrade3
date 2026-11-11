// Pictures for Kindergarten questions, and the words read aloud for each one.
// A picture token is an emoji, `4×🍓` for a group of four, or `shape:circle:red` for a drawn shape.

import { options } from '../../engine/random';
import type { Question, Rng, Visual } from '../../engine/types';

/** Spoken names for every emoji a Kindergarten question can show. */
export const NAMES: Record<string, string> = {
  // Things to count
  '🍎': 'apple', '🍓': 'strawberry', '🍌': 'banana', '🍇': 'grapes', '🍊': 'orange', '🍐': 'pear', '🍒': 'cherries', '🥕': 'carrot',
  '⭐': 'star', '🌸': 'flower', '🦋': 'butterfly', '🐞': 'ladybug', '🎈': 'balloon', '🧁': 'cupcake', '🍪': 'cookie', '🐟': 'fish',
  '🦄': 'unicorn', '🌈': 'rainbow', '💎': 'gem', '🐣': 'chick', '🍄': 'mushroom', '🐚': 'shell', '🌙': 'moon', '❤️': 'heart',
  '💜': 'purple heart', '💙': 'blue heart', '💛': 'yellow heart', '💚': 'green heart', '🔴': 'red circle', '🔵': 'blue circle', '🟡': 'yellow circle', '🟢': 'green circle',
  // Animals
  '🐶': 'dog', '🐱': 'cat', '🐄': 'cow', '🐷': 'pig', '🐑': 'sheep', '🐔': 'chicken', '🦆': 'duck', '🐴': 'horse', '🐸': 'frog', '🐝': 'bee',
  '🐻': 'bear', '🦉': 'owl', '🐭': 'mouse', '🐍': 'snake', '🐢': 'turtle', '🐰': 'rabbit', '🦁': 'lion', '🐘': 'elephant', '🐒': 'monkey', '🦒': 'giraffe',
  '🐦': 'bird', '🐳': 'whale', '🦊': 'fox', '🦌': 'deer', '🐿️': 'squirrel', '🦫': 'beaver', '🐧': 'penguin', '🐐': 'goat', '🦇': 'bat', '🐛': 'bug',
  '🐙': 'octopus', '🦀': 'crab', '🐪': 'camel', '🐕': 'dog', '🐈': 'cat', '🐓': 'rooster', '🐜': 'ant', '🦈': 'shark',
  // Things
  '🚗': 'car', '🚌': 'bus', '🚲': 'bike', '✈️': 'airplane', '🚂': 'train', '⛵': 'boat', '🚀': 'rocket', '🚜': 'tractor',
  '👕': 'shirt', '👖': 'pants', '🧦': 'socks', '👟': 'shoe', '🧢': 'cap', '🧤': 'mittens', '🧣': 'scarf', '🧥': 'coat', '🩳': 'shorts', '👒': 'sun hat',
  '🎩': 'hat', '🔑': 'key', '🌳': 'tree', '🫙': 'jar', '🎂': 'cake', '🍽️': 'dish', '🏠': 'house', '🥄': 'spoon', '🪑': 'chair', '💍': 'ring',
  '🕰️': 'clock', '🪨': 'rock', '🧸': 'teddy bear', '🌵': 'cactus', '🔥': 'fire', '🧊': 'ice', '🍦': 'ice cream', '🪶': 'feather', '🧽': 'sponge',
  '⚽': 'ball', '🛏️': 'bed', '📕': 'book', '🎸': 'guitar', '🥁': 'drum', '🔔': 'bell', '🍋': 'lemon', '🧂': 'salt', '🍬': 'candy', '🧅': 'onion',
  '🌻': 'sunflower', '🌹': 'rose', '🧄': 'garlic', '🗑️': 'garbage can', '🦨': 'skunk', '🍕': 'pizza', '🍞': 'bread', '🥚': 'egg', '🍯': 'honey',
  '🪁': 'kite', '🦷': 'tooth', '🎁': 'present', '🪵': 'log', '👑': 'crown', '🥛': 'milk', '☕': 'cup', '🧈': 'butter', '🍉': 'watermelon', '🥧': 'pie',
  '🧱': 'brick', '🛁': 'bathtub', '🖍️': 'crayon', '✂️': 'scissors', '🎨': 'paint', '🕯️': 'candle', '🪣': 'bucket', '⏰': 'alarm clock',
  '🔨': 'hammer', '🧲': 'magnet', '🪀': 'yo-yo', '🍔': 'hamburger', '🌽': 'corn', '🥦': 'broccoli', '🍗': 'drumstick', '🥒': 'cucumber',
  // The five senses
  '👀': 'eyes', '👂': 'ear', '👃': 'nose', '👅': 'tongue', '✋': 'hand',
  // Weather and seasons
  '☀️': 'sun', '🌧️': 'rainy', '❄️': 'snowy', '⛈️': 'stormy', '☁️': 'cloudy', '🌬️': 'windy', '🌨️': 'snowing',
  '⛄': 'snowman', '🏖️': 'beach', '🍂': 'falling leaves', '🌷': 'spring flowers', '☂️': 'umbrella', '🕶️': 'sunglasses', '⛸️': 'skates', '🛷': 'sled',
  '🏊': 'swimmer', '🎃': 'pumpkin', '🌱': 'sprout', '🍁': 'maple leaf', '🌊': 'water', '🏔️': 'mountain', '🕳️': 'hole', '🪺': 'nest', '🌾': 'field',
};

/** The spoken name of a picture token. */
export function nameOf(token: string): string {
  const group = token.match(/^(\d+)×(.+)$/);
  if (group) return `${group[1]} ${plural(nameOf(group[2]), +group[1])}`;
  const shape = token.match(/^shape:(\w+)(?::(\w+))?$/);
  if (shape) return shape[2] ? `${shape[2]} ${shape[1]}` : shape[1];
  return NAMES[token] ?? token;
}

/** "apple" -> "apples". Good enough for the words used here. */
export function plural(word: string, n = 2): string {
  if (n === 1) return word;
  if (/(sheep|fish|grapes|cherries|deer|pants|socks|shorts|mittens|eyes|scissors|teddy bear)$/.test(word)) return word;
  if (/(ch|sh|s|x)$/.test(word)) return `${word}es`;
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  if (word === 'mouse') return 'mice';
  return `${word}s`;
}

/**
 * A Kindergarten picture question: 2 or 3 big choices, read aloud with their names.
 * `say` is what the voice reads; the prompt is the same words, shown for grown-ups.
 */
export function kq(rng: Rng, o: { key: string; prompt: string; answer: string; wrong: string[]; visual?: Visual; hint: string; explain?: string; count?: number; say?: string }): Question {
  const choices = options(rng, o.answer, o.wrong, o.count ?? 3);
  return {
    key: o.key,
    prompt: o.prompt,
    say: o.say,
    visual: o.visual,
    input: 'choice',
    choices,
    labels: choices.map(nameOf),
    answer: o.answer,
    hint: o.hint,
    explain: o.explain ?? `It's the ${nameOf(o.answer)}.`,
  };
}

/** A few items from a list, not counting the ones to leave out. */
export function others<T>(list: readonly T[], ...leave: T[]): T[] {
  return list.filter((x) => !leave.includes(x));
}
