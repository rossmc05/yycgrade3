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

export interface GearArt {
  /** Main colour. */
  c1: string;
  /** Trim colour. */
  c2: string;
  /** Wood grain, shiny metal, or gold. */
  finish?: 'wood' | 'metal' | 'gold';
  /** Helmet with a jaw guard. */
  guard?: boolean;
}

export interface BallGear {
  id: string;
  brand: string;
  name: string;
  slot: BallSlot;
  cost: number;
  does: string;
  perks: BallPerks;
  art: GearArt;
}

export const SLOT_NAME: Record<BallSlot, string> = { bat: 'Bats', glove: 'Gloves', cleats: 'Cleats', helmet: 'Batting helmets', cap: 'Caps' };

/** Real gear names, drawn in our own style with no logos. Ids stay the same so saved gear keeps working. */
export const BALL_GEAR: BallGear[] = [
  { id: 'bat-wood', brand: 'Louisville Slugger', name: 'Genuine Ash', slot: 'bat', cost: 0, does: 'Your first bat.', perks: {}, art: { c1: '#d6a86a', c2: '#1f2937', finish: 'wood' } },
  { id: 'bat-maple', brand: 'Marucci', name: 'CATX Composite', slot: 'bat', cost: 80, does: '10% of hits go one base farther. +10 ft in the Derby', perks: { extraBase: 0.1, derbyFeet: 10 }, art: { c1: '#111827', c2: '#dc2626', finish: 'metal' } },
  { id: 'bat-alloy', brand: 'Easton', name: 'Hype Fire', slot: 'bat', cost: 220, does: '20% of hits go one base farther. +20 ft in the Derby', perks: { extraBase: 0.2, derbyFeet: 20 }, art: { c1: '#f97316', c2: '#111827', finish: 'metal' } },
  { id: 'bat-pro', brand: 'Rawlings', name: 'Icon', slot: 'bat', cost: 450, does: '30% of hits go one base farther. +30 ft in the Derby', perks: { extraBase: 0.3, derbyFeet: 30 }, art: { c1: '#e5e7eb', c2: '#1d4ed8', finish: 'metal' } },
  { id: 'bat-gold', brand: 'Victus', name: 'Pro Reserve Maple', slot: 'bat', cost: 800, does: '40% of hits go one base farther. +45 ft in the Derby', perks: { extraBase: 0.4, derbyFeet: 45 }, art: { c1: '#eab308', c2: '#111827', finish: 'gold' } },
  { id: 'glove-leather', brand: 'Mizuno', name: 'Prospect Select', slot: 'glove', cost: 70, does: '10% chance your fielders catch a hit when you pitch', perks: { catchChance: 0.1 }, art: { c1: '#b45309', c2: '#78350f' } },
  { id: 'glove-gold', brand: 'Rawlings', name: 'Heart of the Hide', slot: 'glove', cost: 260, does: '20% chance your fielders catch a hit', perks: { catchChance: 0.2 }, art: { c1: '#92400e', c2: '#dc2626' } },
  { id: 'glove-platinum', brand: 'Wilson', name: 'A2K', slot: 'glove', cost: 600, does: '30% chance your fielders catch a hit', perks: { catchChance: 0.3 }, art: { c1: '#1f2937', c2: '#f59e0b' } },
  { id: 'cleats-speed', brand: 'Nike', name: 'Alpha Huarache Elite', slot: 'cleats', cost: 90, does: 'Your runners take an extra base on 35% of singles', perks: { speed: 0.35 }, art: { c1: '#f8fafc', c2: '#111827' } },
  { id: 'cleats-adizero', brand: 'Adidas', name: 'Adizero Afterburner', slot: 'cleats', cost: 200, does: 'Your runners take an extra base on 50% of singles', perks: { speed: 0.5 }, art: { c1: '#111827', c2: '#22d3ee' } },
  { id: 'cleats-lightning', brand: 'New Balance', name: 'FuelCell Ohtani', slot: 'cleats', cost: 320, does: 'Your runners take an extra base on 70% of singles', perks: { speed: 0.7 }, art: { c1: '#f8fafc', c2: '#1d4ed8' } },
  { id: 'helmet', brand: 'Easton', name: 'Pro X', slot: 'helmet', cost: 120, does: '1 foul ball a game: a wrong answer at bat gets another pitch', perks: { fouls: 1 }, art: { c1: '#1e3a8a', c2: '#cbd5e1' } },
  { id: 'helmet-evo', brand: 'EvoShield', name: 'XVT 2.0', slot: 'helmet', cost: 250, does: '2 foul balls a game', perks: { fouls: 2 }, art: { c1: '#111827', c2: '#9ca3af', guard: true } },
  { id: 'helmet-pro', brand: 'Rawlings', name: 'Mach Ice', slot: 'helmet', cost: 380, does: '3 foul balls a game', perks: { fouls: 3 }, art: { c1: '#b91c1c', c2: '#e5e7eb', guard: true } },
  { id: 'cap-rally', brand: 'New Era', name: '9FORTY Rally Cap', slot: 'cap', cost: 150, does: '+10% coins after every game and derby', perks: { coinBonus: 0.1 }, art: { c1: '#1d4ed8', c2: '#f8fafc' } },
  { id: 'cap-lucky', brand: 'New Era', name: '59FIFTY Lucky Cap', slot: 'cap', cost: 500, does: '+25% coins and better card pulls', perks: { coinBonus: 0.25, luck: 1 }, art: { c1: '#15803d', c2: '#facc15' } },
];

/** Full name for messages, e.g. "Easton Hype Fire". */
export const gearName = (g: BallGear) => `${g.brand} ${g.name}`;

export const ballGearById = (id?: string) => BALL_GEAR.find((g) => g.id === id);

export function ballPerks(on: Partial<Record<BallSlot, string>> | undefined): BallPerks {
  return Object.values(on ?? {}).reduce<BallPerks>((acc, id) => ({ ...acc, ...ballGearById(id)?.perks }), {});
}
