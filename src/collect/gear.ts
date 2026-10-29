// Gear: a weapon and a charm bought with coins. Each gives a small boost in battle.

export type GearSlot = 'weapon' | 'charm';

export interface Gear {
  id: string;
  name: string;
  e: string;
  slot: GearSlot;
  cost: number;
  /** What it does, for the shop. */
  does: string;
  perks: Perks;
}

export interface Perks {
  /** Damage multiplier for hits, crits and specials. */
  damage?: number;
  /** Extra coins for each monster beaten. */
  coins?: number;
  /** Monsters cannot heal when you miss. */
  noHeal?: boolean;
  /** Seconds a first-try answer may take and still be a critical hit. */
  critSeconds?: number;
}

export const GEAR: Gear[] = [
  { id: 'stick', name: 'Trusty Stick', e: '🪵', slot: 'weapon', cost: 0, does: 'Your first weapon.', perks: {} },
  { id: 'boomerang', name: 'Boomerang', e: '🪃', slot: 'weapon', cost: 60, does: '+10% damage', perks: { damage: 1.1 } },
  { id: 'dagger', name: 'Dagger', e: '🗡️', slot: 'weapon', cost: 150, does: '+20% damage', perks: { damage: 1.2 } },
  { id: 'wand', name: 'Magic Wand', e: '🪄', slot: 'weapon', cost: 300, does: '+30% damage', perks: { damage: 1.3 } },
  { id: 'hammer', name: 'Thunder Hammer', e: '🔨', slot: 'weapon', cost: 500, does: '+40% damage', perks: { damage: 1.4 } },
  { id: 'clover', name: 'Lucky Clover', e: '🍀', slot: 'charm', cost: 80, does: '+2 coins for each monster', perks: { coins: 2 } },
  { id: 'shield', name: 'Hero Shield', e: '🛡️', slot: 'charm', cost: 120, does: "Monsters can't heal when you miss", perks: { noHeal: true } },
  { id: 'stopwatch', name: 'Speed Watch', e: '⏱️', slot: 'charm', cost: 250, does: 'More time to land critical hits', perks: { critSeconds: 12 } },
  { id: 'magnet', name: 'Coin Magnet', e: '🧲', slot: 'charm', cost: 400, does: '+5 coins for each monster', perks: { coins: 5 } },
];

export const gearById = (id?: string) => GEAR.find((g) => g.id === id);

/** The boosts from the gear a player has on. */
export function perksOf(on: Partial<Record<GearSlot, string>> | undefined): Perks {
  const w = gearById(on?.weapon)?.perks ?? {};
  const c = gearById(on?.charm)?.perks ?? {};
  return { ...w, ...c };
}
