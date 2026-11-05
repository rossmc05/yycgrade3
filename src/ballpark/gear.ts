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
  /** The card at bat: its name, and the chance a right answer goes one base farther. */
  star?: { name: string; boost: number };
  /** Your ace's card: the chance a wrong answer on the mound is still an out. */
  ace?: { name: string; boost: number };
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
  /** A product photo in public/gear, shown instead of the drawing. */
  photo?: boolean;
}

export const SLOT_NAME: Record<BallSlot, string> = { bat: 'Bats', glove: 'Gloves', cleats: 'Cleats', helmet: 'Batting helmets', cap: 'Caps' };

/** Real gear names. Bats use product photos Ross supplied; the rest are drawn in our own style. Ids stay the same so saved gear keeps working. */
export const BALL_GEAR: BallGear[] = [
  { id: 'bat-wood', brand: 'Louisville Slugger', name: 'Genuine Ash', slot: 'bat', cost: 0, does: 'Your first bat.', perks: {}, art: { c1: '#d6a86a', c2: '#1f2937', finish: 'wood' }, photo: true },
  { id: 'bat-maple', brand: 'Marucci', name: 'CATX Composite', slot: 'bat', cost: 80, does: '10% of hits go one base farther. +10 ft in the Derby', perks: { extraBase: 0.1, derbyFeet: 10 }, art: { c1: '#111827', c2: '#dc2626', finish: 'metal' }, photo: true },
  { id: 'bat-alloy', brand: 'Easton', name: 'Hype Fire', slot: 'bat', cost: 220, does: '20% of hits go one base farther. +20 ft in the Derby', perks: { extraBase: 0.2, derbyFeet: 20 }, art: { c1: '#f97316', c2: '#111827', finish: 'metal' }, photo: true },
  { id: 'bat-pro', brand: 'Rawlings', name: 'Icon', slot: 'bat', cost: 450, does: '30% of hits go one base farther. +30 ft in the Derby', perks: { extraBase: 0.3, derbyFeet: 30 }, art: { c1: '#e5e7eb', c2: '#1d4ed8', finish: 'metal' }, photo: true },
  { id: 'bat-gold', brand: 'Victus', name: 'Pro Reserve Maple', slot: 'bat', cost: 800, does: '40% of hits go one base farther. +45 ft in the Derby', perks: { extraBase: 0.4, derbyFeet: 45 }, art: { c1: '#eab308', c2: '#111827', finish: 'gold' }, photo: true },
  // Top BBCOR bats from the Baseball Bat Bros rankings (top 5), plus the Soldier Tank 3 as the top bat.
  { id: 'bat-rckless', brand: 'Marucci', name: 'RCKLESS', slot: 'bat', cost: 1000, does: '42% of hits go one base farther. +50 ft in the Derby', perks: { extraBase: 0.42, derbyFeet: 50 }, art: { c1: '#111827', c2: '#a3e635', finish: 'metal' }, photo: true },
  { id: 'bat-selectpwr', brand: 'Louisville Slugger', name: 'Select PWR', slot: 'bat', cost: 1200, does: '44% of hits go one base farther. +55 ft in the Derby', perks: { extraBase: 0.44, derbyFeet: 55 }, art: { c1: '#1f2937', c2: '#facc15', finish: 'metal' }, photo: true },
  { id: 'bat-spech1', brand: 'Combat', name: 'Spec H1', slot: 'bat', cost: 1450, does: '46% of hits go one base farther. +60 ft in the Derby', perks: { extraBase: 0.46, derbyFeet: 60 }, art: { c1: '#374151', c2: '#0f172a', finish: 'metal' }, photo: true },
  { id: 'bat-atlas2', brand: 'Louisville Slugger', name: 'Atlas 2.0', slot: 'bat', cost: 1750, does: '48% of hits go one base farther. +65 ft in the Derby', perks: { extraBase: 0.48, derbyFeet: 65 }, art: { c1: '#0f172a', c2: '#e5e7eb', finish: 'metal' }, photo: true },
  { id: 'bat-speca1', brand: 'Combat', name: 'Spec A1', slot: 'bat', cost: 2100, does: '50% of hits go one base farther. +70 ft in the Derby. The #1 ranked BBCOR bat', perks: { extraBase: 0.5, derbyFeet: 70 }, art: { c1: '#f8fafc', c2: '#111827', finish: 'metal' }, photo: true },
  { id: 'bat-tank3', brand: 'Soldier', name: 'Tank 3', slot: 'bat', cost: 3000, does: '55% of hits go one base farther. +90 ft in the Derby. The best bat in the shop', perks: { extraBase: 0.55, derbyFeet: 90 }, art: { c1: '#4d5d2b', c2: '#111827', finish: 'metal' }, photo: true },
  { id: 'glove-leather', brand: 'Mizuno', name: 'Prospect Select', slot: 'glove', cost: 70, does: '10% chance your fielders catch a hit when you pitch', perks: { catchChance: 0.1 }, art: { c1: '#b45309', c2: '#78350f' } },
  { id: 'glove-gold', brand: 'Rawlings', name: 'Heart of the Hide', slot: 'glove', cost: 260, does: '20% chance your fielders catch a hit', perks: { catchChance: 0.2 }, art: { c1: '#92400e', c2: '#dc2626' } },
  { id: 'glove-platinum', brand: 'Wilson', name: 'A2K', slot: 'glove', cost: 600, does: '30% chance your fielders catch a hit', perks: { catchChance: 0.3 }, art: { c1: '#1f2937', c2: '#f59e0b' } },
  { id: 'glove-gotm-2406', brand: 'Wilson', name: 'A2K 1724 · June 2024 Glove of the Month', slot: 'glove', cost: 700, does: '32% chance your fielders catch a hit', perks: { catchChance: 0.32 }, art: { c1: '#111827', c2: '#ec4899' } },
  { id: 'glove-gotm-2501', brand: 'Wilson', name: 'A2000 1799 Pete Crow-Armstrong · Jan 2025', slot: 'glove', cost: 780, does: '33% chance your fielders catch a hit', perks: { catchChance: 0.33 }, art: { c1: '#1d4ed8', c2: '#dc2626' } },
  { id: 'glove-gotm-2503', brand: 'Wilson', name: 'A2000 1786 Sky Blue · March 2025', slot: 'glove', cost: 860, does: '34% chance your fielders catch a hit', perks: { catchChance: 0.34 }, art: { c1: '#111827', c2: '#7dd3fc' } },
  { id: 'glove-gotm-2507', brand: 'Wilson', name: 'A2000 1975 Firework · July 2025', slot: 'glove', cost: 950, does: '35% chance your fielders catch a hit', perks: { catchChance: 0.35 }, art: { c1: '#1e3a8a', c2: '#dc2626' } },
  { id: 'glove-gotm-2510', brand: 'Wilson', name: 'A2K 1720 · October 2025 Glove of the Month', slot: 'glove', cost: 1050, does: '36% chance your fielders catch a hit', perks: { catchChance: 0.36 }, art: { c1: '#7c3aed', c2: '#38bdf8' } },
  { id: 'glove-gotm-2512', brand: 'Wilson', name: 'A2000 1975 Ugly Sweater · Dec 2025', slot: 'glove', cost: 1150, does: '37% chance your fielders catch a hit', perks: { catchChance: 0.37 }, art: { c1: '#b91c1c', c2: '#15803d' } },
  { id: 'glove-gotm-2601', brand: 'Wilson', name: 'A2000 1786 Graffiti · January 2026', slot: 'glove', cost: 1250, does: '38% chance your fielders catch a hit', perks: { catchChance: 0.38 }, art: { c1: '#7e22ce', c2: '#facc15' } },
  { id: 'glove-gotm-2603', brand: 'Wilson', name: 'A2000 1975 Optic Yellow · March 2026', slot: 'glove', cost: 1400, does: '40% chance your fielders catch a hit', perks: { catchChance: 0.4 }, art: { c1: '#facc15', c2: '#22c55e' } },
  { id: 'glove-gotm-2604', brand: 'Wilson', name: 'A2000 1786 Pastel Clouds · April 2026', slot: 'glove', cost: 1550, does: '41% chance your fielders catch a hit', perks: { catchChance: 0.41 }, art: { c1: '#93c5fd', c2: '#f9a8d4' } },
  { id: 'glove-gotm-2606', brand: 'Wilson', name: 'A2000 1724 · June 2026 Glove of the Month', slot: 'glove', cost: 1700, does: '42% chance your fielders catch a hit', perks: { catchChance: 0.42 }, art: { c1: '#1e3a8a', c2: '#f472b6' } },
  { id: 'glove-gotm-2607', brand: 'Wilson', name: 'A2000 1786 Red, White and Blue · July 2026', slot: 'glove', cost: 1900, does: '44% chance your fielders catch a hit', perks: { catchChance: 0.44 }, art: { c1: '#dc2626', c2: '#1d4ed8' } },
  { id: 'glove-gotm-2610', brand: 'Wilson', name: 'A2000 1720 Cobweb · Oct 2026', slot: 'glove', cost: 2150, does: '46% chance your fielders catch a hit', perks: { catchChance: 0.46 }, art: { c1: '#111827', c2: '#f97316' } },
  { id: 'glove-gotm-2611', brand: 'Wilson', name: 'A2000 CS61 Cristopher Sanchez · Nov 2026', slot: 'glove', cost: 2500, does: '50% chance your fielders catch a hit. The best glove in the shop', perks: { catchChance: 0.5 }, art: { c1: '#111827', c2: '#dc2626' } },
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
