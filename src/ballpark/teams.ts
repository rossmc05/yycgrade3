// Made-up Alberta teams to play against.

export interface Team {
  name: string;
  short: string;
  colors: [string, string];
  /** Team overall, for season standings. */
  ovr: number;
}

export const OPPONENTS: Team[] = [
  { name: 'Banff Bighorns', short: 'BAN', colors: ['#7c2d12', '#fbbf24'], ovr: 74 },
  { name: 'Red Deer Rockets', short: 'RDR', colors: ['#b91c1c', '#e5e7eb'], ovr: 80 },
  { name: 'Lethbridge Gophers', short: 'LET', colors: ['#854d0e', '#fde68a'], ovr: 71 },
  { name: 'Medicine Hat Mustangs', short: 'MED', colors: ['#1e3a8a', '#f97316'], ovr: 77 },
  { name: 'Drumheller Dinos', short: 'DRU', colors: ['#166534', '#a3e635'], ovr: 83 },
  { name: 'Canmore Coyotes', short: 'CAN', colors: ['#334155', '#38bdf8'], ovr: 76 },
  { name: 'Okotoks Owls', short: 'OKO', colors: ['#581c87', '#facc15'], ovr: 72 },
  { name: 'Jasper Grizzlies', short: 'JAS', colors: ['#0f172a', '#ef4444'], ovr: 86 },
];
