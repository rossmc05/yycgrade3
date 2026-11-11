// The Sparkle Shop. Items are bought once with points; then any unicorn can wear them.
// Each unicorn keeps its own outfit. Stable decorations are shared by the whole stable.
// Prices follow the ballpark's Pro Shop curve: something after the first ride, big goals later.

export type Slot = 'coat' | 'mane' | 'horn' | 'saddle' | 'crown' | 'wings';
export type ItemSlot = Slot | 'decor';

export interface Item {
  id: string;
  name: string;
  slot: ItemSlot;
  cost: number;
  /** Colours for the drawing. For a mane, the colours of its curls. */
  colors: string[];
  /** Extra look: sparkly coats, glitter horns, rainbow wings. */
  style?: 'plain' | 'sparkle' | 'spots' | 'glitter' | 'rainbow' | 'gold' | 'flowers' | 'stars' | 'hearts';
  /** For decorations: the picture shown in the stable. */
  e?: string;
}

export const SLOT_NAME: Record<ItemSlot, string> = { coat: 'Colours', mane: 'Manes', horn: 'Horn sparkles', saddle: 'Saddles', crown: 'Flower crowns', wings: 'Wings', decor: 'Stable' };
export const SLOT_ICON: Record<ItemSlot, string> = { coat: '🎨', mane: '💇', horn: '✨', saddle: '🎀', crown: '🌸', wings: '🪽', decor: '🏡' };
export const SLOTS: ItemSlot[] = ['coat', 'mane', 'crown', 'saddle', 'horn', 'wings', 'decor'];

export const ITEMS: Item[] = [
  // Coat colours: cheap, so she can buy one after her first ride.
  { id: 'coat-pink', name: 'Bubblegum pink', slot: 'coat', cost: 40, colors: ['#fbcfe8'] },
  { id: 'coat-lilac', name: 'Lilac', slot: 'coat', cost: 40, colors: ['#e9d5ff'] },
  { id: 'coat-mint', name: 'Mint', slot: 'coat', cost: 50, colors: ['#bbf7d0'] },
  { id: 'coat-sky', name: 'Sky blue', slot: 'coat', cost: 50, colors: ['#bae6fd'] },
  { id: 'coat-lemon', name: 'Lemon', slot: 'coat', cost: 60, colors: ['#fef08a'] },
  { id: 'coat-spots', name: 'Pink spots', slot: 'coat', cost: 180, colors: ['#ffffff', '#f9a8d4'], style: 'spots' },
  { id: 'coat-sparkle', name: 'Sparkle coat', slot: 'coat', cost: 350, colors: ['#fdf4ff', '#facc15'], style: 'sparkle' },
  { id: 'coat-galaxy', name: 'Galaxy coat', slot: 'coat', cost: 900, colors: ['#4c1d95', '#fde047'], style: 'stars' },
  { id: 'coat-glitter', name: 'Glitter gold', slot: 'coat', cost: 1500, colors: ['#fde68a', '#ffffff'], style: 'sparkle' },
  // Flower crowns
  { id: 'crown-daisy', name: 'Daisy crown', slot: 'crown', cost: 60, colors: ['#ffffff', '#facc15'] },
  { id: 'crown-rose', name: 'Rose crown', slot: 'crown', cost: 90, colors: ['#f43f5e', '#fde047'] },
  { id: 'crown-violet', name: 'Violet crown', slot: 'crown', cost: 120, colors: ['#8b5cf6', '#fde047'] },
  { id: 'crown-rainbow', name: 'Rainbow flowers', slot: 'crown', cost: 300, colors: ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'], style: 'rainbow' },
  { id: 'crown-tiara', name: 'Gold tiara', slot: 'crown', cost: 700, colors: ['#fbbf24', '#ec4899'], style: 'gold' },
  // Saddles
  { id: 'saddle-red', name: 'Cherry saddle', slot: 'saddle', cost: 80, colors: ['#ef4444', '#fde68a'] },
  { id: 'saddle-blue', name: 'Ocean saddle', slot: 'saddle', cost: 80, colors: ['#3b82f6', '#e0f2fe'] },
  { id: 'saddle-hearts', name: 'Heart saddle', slot: 'saddle', cost: 200, colors: ['#ec4899', '#ffffff'], style: 'hearts' },
  { id: 'saddle-stars', name: 'Star saddle', slot: 'saddle', cost: 260, colors: ['#6366f1', '#fde047'], style: 'stars' },
  { id: 'saddle-royal', name: 'Royal saddle', slot: 'saddle', cost: 650, colors: ['#7c3aed', '#fbbf24'], style: 'gold' },
  // Manes
  { id: 'mane-cotton', name: 'Cotton candy', slot: 'mane', cost: 150, colors: ['#f9a8d4', '#a5f3fc', '#f9a8d4'] },
  { id: 'mane-sunset', name: 'Sunset', slot: 'mane', cost: 180, colors: ['#f97316', '#ec4899', '#facc15'] },
  { id: 'mane-ocean', name: 'Ocean waves', slot: 'mane', cost: 200, colors: ['#0ea5e9', '#22d3ee', '#6366f1'] },
  { id: 'mane-berry', name: 'Berry', slot: 'mane', cost: 220, colors: ['#be185d', '#a21caf', '#f472b6'] },
  { id: 'mane-rainbow', name: 'Rainbow mane', slot: 'mane', cost: 400, colors: ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'], style: 'rainbow' },
  { id: 'mane-star', name: 'Starry night', slot: 'mane', cost: 600, colors: ['#1e1b4b', '#4338ca', '#fde047'], style: 'stars' },
  // Horn sparkles
  { id: 'horn-pink', name: 'Pink sparkle', slot: 'horn', cost: 150, colors: ['#f9a8d4'], style: 'glitter' },
  { id: 'horn-silver', name: 'Silver shine', slot: 'horn', cost: 200, colors: ['#e5e7eb'], style: 'glitter' },
  { id: 'horn-gold', name: 'Golden horn', slot: 'horn', cost: 350, colors: ['#fbbf24'], style: 'gold' },
  { id: 'horn-rainbow', name: 'Rainbow horn', slot: 'horn', cost: 500, colors: ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#a855f7'], style: 'rainbow' },
  // Wings: the big goals
  { id: 'wings-white', name: 'Feather wings', slot: 'wings', cost: 600, colors: ['#ffffff', '#e0e7ff'] },
  { id: 'wings-pink', name: 'Pink wings', slot: 'wings', cost: 800, colors: ['#fbcfe8', '#f472b6'] },
  { id: 'wings-butterfly', name: 'Butterfly wings', slot: 'wings', cost: 1000, colors: ['#a78bfa', '#f472b6'], style: 'spots' },
  { id: 'wings-rainbow', name: 'Rainbow wings', slot: 'wings', cost: 1300, colors: ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'], style: 'rainbow' },
  { id: 'wings-gold', name: 'Golden wings', slot: 'wings', cost: 1500, colors: ['#fde68a', '#f59e0b'], style: 'gold' },
  // Stable decorations, shown in the stable for every unicorn
  { id: 'decor-flowers', name: 'Flower pots', slot: 'decor', cost: 70, colors: [], e: '🌷' },
  { id: 'decor-balloons', name: 'Balloons', slot: 'decor', cost: 100, colors: [], e: '🎈' },
  { id: 'decor-hay', name: 'Hay bale', slot: 'decor', cost: 100, colors: [], e: '🌾' },
  { id: 'decor-apples', name: 'Apple basket', slot: 'decor', cost: 120, colors: [], e: '🍎' },
  { id: 'decor-bunny', name: 'Bunny friend', slot: 'decor', cost: 200, colors: [], e: '🐰' },
  { id: 'decor-lights', name: 'Fairy lights', slot: 'decor', cost: 250, colors: [], e: '✨' },
  { id: 'decor-butterflies', name: 'Butterflies', slot: 'decor', cost: 300, colors: [], e: '🦋' },
  { id: 'decor-rainbow', name: 'Rainbow', slot: 'decor', cost: 450, colors: [], e: '🌈' },
  { id: 'decor-fountain', name: 'Fountain', slot: 'decor', cost: 600, colors: [], e: '⛲' },
  { id: 'decor-castle', name: 'Castle stable', slot: 'decor', cost: 1500, colors: [], e: '🏰' },
];

export const itemById = (id?: string) => ITEMS.find((i) => i.id === id);
