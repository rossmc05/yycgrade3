// Pals: creatures found after battles and kept in the Pal Book. One may follow the hero as a buddy.

import type { SubjectId } from '../engine/types';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Pal {
  id: string;
  name: string;
  e: string;
  zone: SubjectId;
  rarity: Rarity;
}

const P = (zone: SubjectId, list: [string, string, Rarity][]): Pal[] =>
  list.map(([e, name, rarity]) => ({ id: `${zone}-${name.toLowerCase().replace(/[^a-z]+/g, '-')}`, name, e, zone, rarity }));

export const PALS: Pal[] = [
  ...P('math', [
    ['🐿️', 'Chip the Chipmunk', 'common'], ['🐐', 'Mountain Goat', 'common'], ['🐏', 'Bighorn Ram', 'common'], ['🦌', 'Elk', 'rare'],
    ['🦅', 'Golden Eagle', 'rare'], ['🐻', 'Grizzly Bear', 'epic'], ['🐺', 'Grey Wolf', 'epic'], ['🫎', 'King Moose', 'legendary'],
  ]),
  ...P('spelling', [
    ['🐸', 'Leopard Frog', 'common'], ['🦆', 'Mallard Duck', 'common'], ['🐌', 'Pond Snail', 'common'], ['🐢', 'Painted Turtle', 'rare'],
    ['🪿', 'Canada Goose', 'rare'], ['🦫', 'Busy Beaver', 'epic'], ['🦦', 'River Otter', 'epic'], ['🐊', 'Swamp Croc', 'legendary'],
  ]),
  ...P('grammar', [
    ['🐁', 'Garage Mouse', 'common'], ['🐈', 'Shop Cat', 'common'], ['🕷️', 'Corner Spider', 'common'], ['🦝', 'Sneaky Raccoon', 'rare'],
    ['🐕', 'Junkyard Pup', 'rare'], ['🦊', 'Red Fox', 'epic'], ['🦔', 'Bolt the Hedgehog', 'epic'], ['🦄', 'Chrome Unicorn', 'legendary'],
  ]),
  ...P('science', [
    ['🦎', 'Short-horned Lizard', 'common'], ['🐇', 'Jackrabbit', 'common'], ['🦂', 'Badlands Scorpion', 'common'], ['🦡', 'Badger', 'rare'],
    ['🦕', 'Baby Long-neck', 'rare'], ['🦬', 'Plains Bison', 'epic'], ['🦖', 'Little Rex', 'epic'], ['🐉', 'Hoodoo Dragon', 'legendary'],
  ]),
];

export const palById = (id?: string) => PALS.find((p) => p.id === id);

export const RARITY_NAME: Record<Rarity, string> = { common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };

/** Coins given instead when a pal is found again. */
export const DUPLICATE_COINS = 5;

/** The pal found after a battle. Beating the boss makes rarer pals more likely. */
export function rollPal(zone: SubjectId, bossBeaten: boolean, rng: () => number): Pal | undefined {
  const pool = PALS.filter((p) => p.zone === zone);
  if (!pool.length) return undefined;
  const weights: Record<Rarity, number> = bossBeaten ? { common: 45, rare: 32, epic: 17, legendary: 6 } : { common: 62, rare: 27, epic: 9, legendary: 2 };
  let r = rng() * 100;
  let rarity: Rarity = 'common';
  for (const k of ['common', 'rare', 'epic', 'legendary'] as Rarity[]) {
    if (r < weights[k]) { rarity = k; break; }
    r -= weights[k];
  }
  const tier = pool.filter((p) => p.rarity === rarity);
  return tier[Math.floor(rng() * tier.length)];
}
