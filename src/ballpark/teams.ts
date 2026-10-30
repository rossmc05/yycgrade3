// Made-up Alberta teams to play against.

export interface Team {
  name: string;
  short: string;
  colors: [string, string];
}

export const OPPONENTS: Team[] = [
  { name: 'Banff Bighorns', short: 'BAN', colors: ['#7c2d12', '#fbbf24'] },
  { name: 'Red Deer Rockets', short: 'RDR', colors: ['#b91c1c', '#e5e7eb'] },
  { name: 'Lethbridge Gophers', short: 'LET', colors: ['#854d0e', '#fde68a'] },
  { name: 'Medicine Hat Mustangs', short: 'MED', colors: ['#1e3a8a', '#f97316'] },
  { name: 'Drumheller Dinos', short: 'DRU', colors: ['#166534', '#a3e635'] },
  { name: 'Canmore Coyotes', short: 'CAN', colors: ['#334155', '#38bdf8'] },
  { name: 'Okotoks Owls', short: 'OKO', colors: ['#581c87', '#facc15'] },
  { name: 'Jasper Grizzlies', short: 'JAS', colors: ['#0f172a', '#ef4444'] },
];
