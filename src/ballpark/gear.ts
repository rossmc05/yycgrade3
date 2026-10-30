// Pro Shop upgrades, bought with ballpark coins. One item per slot is worn at a time.

export type BallSlot = 'bat' | 'glove' | 'cleats' | 'helmet' | 'cap';

export interface BallPerks {
  /** Chance a hit goes one base farther (singles, doubles and triples). */
  extraBase?: number;
  /** Extra feet on every Home Run Derby hit. */
  derbyFeet?: number;
  /** Chance a fielder catches a hit you gave up when pitching. */
  catchChance?: number;
  /** Chance runners take an extra base on a single. */
  speed?: number;
  /** Foul balls per game: a wrong answer at bat that gives you another pitch. */
  fouls?: number;
  /** Extra share of coins after a game or derby. */
  coinBonus?: number;
  /** Better card chances. */
  luck?: number;
}

export interface BallGear {
  id: string;
  name: string;
  e: string;
  slot: BallSlot;
  cost: number;
  does: string;
  perks: BallPerks;
}

export const SLOT_NAME: Record<BallSlot, string> = { bat: 'Bats', glove: 'Gloves', cleats: 'Cleats', helmet: 'Helmets', cap: 'Caps' };

export const BALL_GEAR: BallGear[] = [
  { id: 'bat-wood', name: 'Wooden Bat', e: '🪵', slot: 'bat', cost: 0, does: 'Your first bat.', perks: {} },
  { id: 'bat-maple', name: 'Maple Bat', e: '🏏', slot: 'bat', cost: 80, does: '10% of hits go one base farther. +10 ft in the Derby', perks: { extraBase: 0.1, derbyFeet: 10 } },
  { id: 'bat-alloy', name: 'Aluminum Slugger', e: '🏏', slot: 'bat', cost: 220, does: '20% of hits go one base farther. +20 ft in the Derby', perks: { extraBase: 0.2, derbyFeet: 20 } },
  { id: 'bat-pro', name: 'Pro Model Bat', e: '🏏', slot: 'bat', cost: 450, does: '30% of hits go one base farther. +30 ft in the Derby', perks: { extraBase: 0.3, derbyFeet: 30 } },
  { id: 'bat-gold', name: 'Golden Bat', e: '🏆', slot: 'bat', cost: 800, does: '40% of hits go one base farther. +45 ft in the Derby', perks: { extraBase: 0.4, derbyFeet: 45 } },
  { id: 'glove-leather', name: 'Leather Mitt', e: '🧤', slot: 'glove', cost: 70, does: '10% chance your fielders catch a hit when you pitch', perks: { catchChance: 0.1 } },
  { id: 'glove-gold', name: 'Gold Glove', e: '🧤', slot: 'glove', cost: 260, does: '20% chance your fielders catch a hit', perks: { catchChance: 0.2 } },
  { id: 'glove-platinum', name: 'Platinum Glove', e: '🧤', slot: 'glove', cost: 600, does: '30% chance your fielders catch a hit', perks: { catchChance: 0.3 } },
  { id: 'cleats-speed', name: 'Speed Cleats', e: '👟', slot: 'cleats', cost: 90, does: 'Your runners take an extra base on 35% of singles', perks: { speed: 0.35 } },
  { id: 'cleats-lightning', name: 'Lightning Cleats', e: '⚡', slot: 'cleats', cost: 320, does: 'Your runners take an extra base on 70% of singles', perks: { speed: 0.7 } },
  { id: 'helmet', name: 'Batting Helmet', e: '🛡️', slot: 'helmet', cost: 120, does: '1 foul ball a game: a wrong answer at bat gets another pitch', perks: { fouls: 1 } },
  { id: 'helmet-pro', name: 'Pro Helmet', e: '🛡️', slot: 'helmet', cost: 380, does: '2 foul balls a game', perks: { fouls: 2 } },
  { id: 'cap-rally', name: 'Rally Cap', e: '🧢', slot: 'cap', cost: 150, does: '+10% coins after every game and derby', perks: { coinBonus: 0.1 } },
  { id: 'cap-lucky', name: 'Lucky Cap', e: '🍀', slot: 'cap', cost: 500, does: '+25% coins and better card pulls', perks: { coinBonus: 0.25, luck: 1 } },
];

export const ballGearById = (id?: string) => BALL_GEAR.find((g) => g.id === id);

export function ballPerks(on: Partial<Record<BallSlot, string>> | undefined): BallPerks {
  return Object.values(on ?? {}).reduce<BallPerks>((acc, id) => ({ ...acc, ...ballGearById(id)?.perks }), {});
}
