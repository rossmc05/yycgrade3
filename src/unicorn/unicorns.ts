// The stable: ten unicorns. She starts with Starlight, and each new one arrives at the
// same XP steps as the ballpark's ranks, so the pacing matches Big League Brains.

export interface Unicorn {
  id: string;
  name: string;
  /** XP needed to unlock. */
  xp: number;
  /** Base colours before any shop items. */
  coat: string;
  mane: string[];
  horn: string;
  /** What she's like, read aloud when she arrives. */
  about: string;
}

export const UNICORNS: Unicorn[] = [
  { id: 'starlight', name: 'Starlight', xp: 0, coat: '#ffffff', mane: ['#f9a8d4', '#c4b5fd', '#93c5fd'], horn: '#fde68a', about: 'Starlight loves to count the stars at night.' },
  { id: 'bluebell', name: 'Bluebell', xp: 300, coat: '#dbeafe', mane: ['#60a5fa', '#3b82f6', '#a5f3fc'], horn: '#e0f2fe', about: 'Bluebell loves splashing in puddles on rainy days.' },
  { id: 'peaches', name: 'Peaches', xp: 800, coat: '#ffedd5', mane: ['#fb923c', '#fdba74', '#fde047'], horn: '#fef3c7', about: 'Peaches loves sunny days and juicy fruit.' },
  { id: 'clover', name: 'Clover', xp: 1600, coat: '#dcfce7', mane: ['#4ade80', '#22c55e', '#bef264'], horn: '#fef9c3', about: 'Clover loves to find four-leaf clovers in the meadow.' },
  { id: 'moonbeam', name: 'Moonbeam', xp: 3000, coat: '#ede9fe', mane: ['#8b5cf6', '#6366f1', '#c4b5fd'], horn: '#e5e7eb', about: 'Moonbeam glows softly under the moon.' },
  { id: 'sunny', name: 'Sunny', xp: 5000, coat: '#fef9c3', mane: ['#facc15', '#f59e0b', '#fde68a'], horn: '#fbbf24', about: 'Sunny is always smiling, just like the sun.' },
  { id: 'coral', name: 'Coral', xp: 7500, coat: '#ffe4e6', mane: ['#f43f5e', '#fb7185', '#fda4af'], horn: '#fecdd3', about: 'Coral loves to swim with the fish by the sea.' },
  { id: 'frost', name: 'Frost', xp: 10500, coat: '#ecfeff', mane: ['#67e8f9', '#e0f2fe', '#a5b4fc'], horn: '#cffafe', about: 'Frost makes snowflakes sparkle in winter.' },
  { id: 'aurora', name: 'Aurora', xp: 14000, coat: '#f5d0fe', mane: ['#22d3ee', '#a78bfa', '#f472b6'], horn: '#fae8ff', about: 'Aurora paints the night sky with dancing lights.' },
  { id: 'rainbow', name: 'Rainbow Queen', xp: 18000, coat: '#ffffff', mane: ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'], horn: '#fcd34d', about: 'The Rainbow Queen is the most magical unicorn of all!' },
];

export const unicornById = (id: string) => UNICORNS.find((u) => u.id === id);

/** Unicorns she has, by XP. */
export const unlocked = (xp: number) => UNICORNS.filter((u) => xp >= u.xp);

/** The next unicorn to arrive, and how much XP is still needed. */
export function nextUnicorn(xp: number): { unicorn: Unicorn; need: number; from: number } | undefined {
  const i = UNICORNS.findIndex((u) => xp < u.xp);
  if (i < 0) return;
  return { unicorn: UNICORNS[i], need: UNICORNS[i].xp - xp, from: UNICORNS[i - 1].xp };
}
