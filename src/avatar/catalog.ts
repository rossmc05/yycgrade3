// Everything a player can put on their avatar, and what it costs to unlock.

export type Slot = 'skin' | 'hair' | 'hairColor' | 'eyes' | 'mouth' | 'top' | 'topColor' | 'hat' | 'face' | 'pet' | 'bg';

export interface Look {
  skin: string;
  hair: string;
  hairColor: string;
  eyes: string;
  mouth: string;
  top: string;
  topColor: string;
  hat: string;
  face: string;
  pet: string;
  bg: string;
  number: number;
}

export interface Part {
  id: string;
  slot: Slot;
  name: string;
  /** Coins to unlock; 0 is free. */
  cost: number;
  /** Player level needed before it can be bought. */
  minLevel?: number;
  /** Colour value for colour slots. */
  color?: string;
  icon?: string;
}

const free = (slot: Slot, items: [string, string, string?][]): Part[] => items.map(([id, name, color]) => ({ id, slot, name, cost: 0, color }));

export const PARTS: Part[] = [
  ...free('skin', [['skin-1', 'Light', '#ffe0c7'], ['skin-2', 'Fair', '#f5c9a0'], ['skin-3', 'Medium', '#e0a878'], ['skin-4', 'Tan', '#c68652'], ['skin-5', 'Brown', '#8d5a36'], ['skin-6', 'Deep', '#5c3a21']]),
  ...free('hair', [['hair-short', 'Short'], ['hair-spiky', 'Spiky'], ['hair-curly', 'Curly'], ['hair-long', 'Long'], ['hair-ponytail', 'Ponytail'], ['hair-buzz', 'Buzz cut'], ['hair-none', 'No hair']]),
  { id: 'hair-mohawk', slot: 'hair', name: 'Mohawk', cost: 60 },
  { id: 'hair-afro', slot: 'hair', name: 'Big afro', cost: 60 },
  ...free('hairColor', [['hc-black', 'Black', '#1f1a17'], ['hc-brown', 'Brown', '#5b3a1e'], ['hc-blonde', 'Blonde', '#e8c35a'], ['hc-red', 'Red', '#b5471b'], ['hc-grey', 'Grey', '#a8a8a8']]),
  { id: 'hc-blue', slot: 'hairColor', name: 'Electric blue', cost: 40, color: '#2f6fed' },
  { id: 'hc-pink', slot: 'hairColor', name: 'Bubblegum', cost: 40, color: '#ec4899' },
  { id: 'hc-green', slot: 'hairColor', name: 'Slime green', cost: 40, color: '#22c55e' },
  { id: 'hc-purple', slot: 'hairColor', name: 'Galaxy purple', cost: 40, color: '#8b5cf6' },
  ...free('eyes', [['eyes-round', 'Round'], ['eyes-happy', 'Happy'], ['eyes-wink', 'Wink'], ['eyes-sleepy', 'Sleepy']]),
  { id: 'eyes-stars', slot: 'eyes', name: 'Star eyes', cost: 100 },
  ...free('mouth', [['mouth-smile', 'Smile'], ['mouth-grin', 'Big grin'], ['mouth-open', 'Wow'], ['mouth-tongue', 'Silly']]),
  ...free('top', [['top-tshirt', 'T-shirt'], ['top-hoodie', 'Hoodie']]),
  { id: 'top-jersey', slot: 'top', name: 'Hockey jersey', cost: 80 },
  { id: 'top-labcoat', slot: 'top', name: 'Lab coat', cost: 120, minLevel: 3 },
  { id: 'top-cape', slot: 'top', name: 'Superhero cape', cost: 200, minLevel: 4 },
  { id: 'top-space', slot: 'top', name: 'Space suit', cost: 300, minLevel: 5 },
  ...free('topColor', [['tc-blue', 'Blue', '#2563eb'], ['tc-red', 'Red', '#dc2626'], ['tc-green', 'Green', '#16a34a'], ['tc-orange', 'Orange', '#ea580c'], ['tc-purple', 'Purple', '#7c3aed'], ['tc-black', 'Black', '#1f2937'], ['tc-yellow', 'Yellow', '#eab308'], ['tc-teal', 'Teal', '#0d9488']]),
  { id: 'hat-none', slot: 'hat', name: 'No hat', cost: 0 },
  { id: 'hat-cap', slot: 'hat', name: 'Ball cap', cost: 40 },
  { id: 'hat-toque', slot: 'hat', name: 'Toque', cost: 60 },
  { id: 'hat-party', slot: 'hat', name: 'Party hat', cost: 50 },
  { id: 'hat-headphones', slot: 'hat', name: 'Headphones', cost: 120 },
  { id: 'hat-helmet', slot: 'hat', name: 'Hockey helmet', cost: 150 },
  { id: 'hat-tophat', slot: 'hat', name: 'Top hat', cost: 150 },
  { id: 'hat-wizard', slot: 'hat', name: 'Wizard hat', cost: 250, minLevel: 4 },
  { id: 'hat-crown', slot: 'hat', name: 'Crown', cost: 300, minLevel: 5 },
  { id: 'hat-grad', slot: 'hat', name: 'Grad cap', cost: 500, minLevel: 8 },
  { id: 'face-none', slot: 'face', name: 'Nothing', cost: 0 },
  { id: 'face-glasses', slot: 'face', name: 'Glasses', cost: 30 },
  { id: 'face-sunglasses', slot: 'face', name: 'Sunglasses', cost: 80 },
  { id: 'face-goggles', slot: 'face', name: 'Science goggles', cost: 120 },
  { id: 'face-paint', slot: 'face', name: 'Team face paint', cost: 60 },
  { id: 'pet-none', slot: 'pet', name: 'No pet', cost: 0 },
  { id: 'pet-dog', slot: 'pet', name: 'Puppy', cost: 80, icon: '🐶' },
  { id: 'pet-cat', slot: 'pet', name: 'Kitten', cost: 80, icon: '🐱' },
  { id: 'pet-bunny', slot: 'pet', name: 'Bunny', cost: 100, icon: '🐰' },
  { id: 'pet-moose', slot: 'pet', name: 'Moose', cost: 200, icon: '🫎' },
  { id: 'pet-robot', slot: 'pet', name: 'Robot', cost: 300, icon: '🤖' },
  { id: 'pet-dino', slot: 'pet', name: 'T. rex', cost: 400, icon: '🦖' },
  { id: 'pet-dragon', slot: 'pet', name: 'Dragon', cost: 600, minLevel: 5, icon: '🐉' },
  { id: 'pet-unicorn', slot: 'pet', name: 'Unicorn', cost: 800, minLevel: 7, icon: '🦄' },
  { id: 'bg-sky', slot: 'bg', name: 'Blue sky', cost: 0 },
  { id: 'bg-mountains', slot: 'bg', name: 'Rocky Mountains', cost: 120 },
  { id: 'bg-rink', slot: 'bg', name: 'Hockey rink', cost: 180 },
  { id: 'bg-ocean', slot: 'bg', name: 'Ocean', cost: 180 },
  { id: 'bg-space', slot: 'bg', name: 'Outer space', cost: 250 },
  { id: 'bg-aurora', slot: 'bg', name: 'Northern lights', cost: 450, minLevel: 4 },
];

export const SLOTS: { slot: Slot; label: string; icon: string }[] = [
  { slot: 'skin', label: 'Skin', icon: '✋' },
  { slot: 'hair', label: 'Hair', icon: '💇' },
  { slot: 'hairColor', label: 'Hair colour', icon: '🎨' },
  { slot: 'eyes', label: 'Eyes', icon: '👀' },
  { slot: 'mouth', label: 'Mouth', icon: '😄' },
  { slot: 'top', label: 'Outfit', icon: '👕' },
  { slot: 'topColor', label: 'Outfit colour', icon: '🖍️' },
  { slot: 'hat', label: 'Hats', icon: '🧢' },
  { slot: 'face', label: 'Face gear', icon: '🕶️' },
  { slot: 'pet', label: 'Pets', icon: '🐾' },
  { slot: 'bg', label: 'Background', icon: '🏔️' },
];

export const DEFAULT_LOOK: Look = {
  skin: 'skin-2', hair: 'hair-short', hairColor: 'hc-brown', eyes: 'eyes-round', mouth: 'mouth-smile', top: 'top-tshirt',
  topColor: 'tc-blue', hat: 'hat-none', face: 'face-none', pet: 'pet-none', bg: 'bg-sky', number: 9,
};

export const part = (id: string): Part | undefined => PARTS.find((p) => p.id === id);
export const colorOf = (id: string, fallback: string) => part(id)?.color ?? fallback;

/** A player's look, with old saves (emoji avatar + equipped list) carried over. */
export function lookOf(p: { look?: Look; equipped: string[] }): Look {
  if (p.look) return { ...DEFAULT_LOOK, ...p.look };
  const look = { ...DEFAULT_LOOK };
  for (const id of p.equipped) {
    const it = part(id);
    if (it) (look as unknown as Record<string, string>)[it.slot] = id;
  }
  return look;
}

export function isOwned(owned: string[], it: Part): boolean {
  return it.cost === 0 || owned.includes(it.id);
}
