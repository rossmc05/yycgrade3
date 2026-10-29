// The story: Baron Blizzard froze the four Chinook Crystals that keep the land warm,
// and gave one to the boss of each zone. Win them back, then face the Baron in his fortress.

import type { Profile } from '../engine/types';

export type Zone4 = 'math' | 'spelling' | 'grammar' | 'science';
export const STORY_ZONES: Zone4[] = ['math', 'spelling', 'grammar', 'science'];

/** Stars needed in a zone before its boss will fight. */
export const BOSS_STARS = 8;

export interface Boss {
  name: string;
  e: string;
  filter: string;
  /** Colour of this zone's crystal. */
  crystal: string;
}

export const BOSSES: Record<Zone4, Boss> = {
  math: { name: 'The Frost Colossus', e: '🗿', filter: 'sepia(1) hue-rotate(170deg) saturate(2.5) brightness(1.1)', crystal: 'hue-rotate(0deg)' },
  spelling: { name: 'Inky the Word Squid', e: '🦑', filter: 'hue-rotate(200deg) saturate(1.4)', crystal: 'hue-rotate(-80deg)' },
  grammar: { name: 'Mega Mech X', e: '🤖', filter: 'sepia(0.6) hue-rotate(-30deg) saturate(2.5)', crystal: 'hue-rotate(160deg)' },
  science: { name: 'Rex the Restless', e: '🦖', filter: 'sepia(1) saturate(1.3) hue-rotate(-25deg)', crystal: 'hue-rotate(120deg) saturate(1.5)' },
};

export const FINAL: Boss = { name: 'Baron Blizzard', e: '☃️', filter: 'drop-shadow(0 0 18px #7dd3fc)', crystal: '' };

export interface StoryState {
  crystals: Zone4[];
  /** Cutscenes already watched. */
  seen: string[];
  /** When the Baron was beaten. */
  champion?: number;
}

export const storyOf = (p: Profile): StoryState => ({ crystals: [], seen: [], ...p.story });
export const hasCrystal = (p: Profile, z: string) => storyOf(p).crystals.includes(z as Zone4);
export const finalOpen = (p: Profile) => STORY_ZONES.every((z) => hasCrystal(p, z));

export function winCrystal(p: Profile, z: Zone4): Profile {
  const s = storyOf(p);
  return s.crystals.includes(z) ? p : { ...p, story: { ...s, crystals: [...s.crystals, z] } };
}

export function markSeen(p: Profile, id: string): Profile {
  const s = storyOf(p);
  return s.seen.includes(id) ? p : { ...p, story: { ...s, seen: [...s.seen, id] } };
}

/** What to do next, for the story tracker on the map. */
export function nextStep(p: Profile, starsIn: (z: Zone4) => number): string {
  const s = storyOf(p);
  if (s.champion) return 'You beat Baron Blizzard! The Chinook wind blows warm again.';
  if (finalOpen(p)) return 'All four crystals are back! Storm the Blizzard Fortress.';
  const ready = STORY_ZONES.find((z) => !s.crystals.includes(z) && starsIn(z) >= BOSS_STARS);
  if (ready) return `${BOSSES[ready].name} is ready to fight! Win back a crystal.`;
  const close = STORY_ZONES.filter((z) => !s.crystals.includes(z)).sort((a, b) => starsIn(b) - starsIn(a))[0];
  return `Earn ${BOSS_STARS - starsIn(close)} more stars in a zone to face its boss.`;
}

// ---------- Cutscenes ----------

export interface Panel {
  who: string;
  name: string;
  text: string;
  /** Extra art shown beside the speaker. */
  with?: string[];
}

const CHINOOK = { who: '🌬️', name: 'Chinook the Warm Wind' };
const BARON = { who: '☃️', name: 'Baron Blizzard' };

export const SCENES: Record<string, Panel[]> = {
  intro: [
    { ...CHINOOK, text: 'Hello, hero! I am Chinook, the warm wind that blows over the mountains.', with: ['🏔️'] },
    { ...CHINOOK, text: 'Four Chinook Crystals keep our land bright and warm. But last night, they were stolen!', with: ['💎', '💎', '💎', '💎'] },
    { ...BARON, text: 'Ho ho HO! The crystals are MINE. Now it will be winter FOREVER!', with: ['❄️', '🥶'] },
    { ...CHINOOK, text: 'Baron Blizzard gave one crystal to the boss of each zone. Win battles to earn stars. When you have 8 stars in a zone, its boss will fight you!', with: ['⭐'] },
    { ...CHINOOK, text: 'Win back all four crystals, then we can face the Baron in his Blizzard Fortress. Good luck!', with: ['🏰'] },
  ],
  'boss-math': [
    { who: '🗿', name: 'The Frost Colossus', text: 'Numbers freeze when I stomp! You will never take the blue crystal!', with: ['💎'] },
    { ...CHINOOK, text: 'Every right answer is a hit. Get most of them right to win!' },
  ],
  'boss-spelling': [
    { who: '🦑', name: 'Inky the Word Squid', text: 'I splashed ink on every word in the swamp! Spell them if you can!', with: ['💎'] },
    { ...CHINOOK, text: 'Every right answer is a hit. Get most of them right to win!' },
  ],
  'boss-grammar': [
    { who: '🤖', name: 'Mega Mech X', text: 'BEEP. SENTENCES. SCRAMBLED. YOU. CANNOT. FIX. THEM.', with: ['💎'] },
    { ...CHINOOK, text: 'Every right answer is a hit. Get most of them right to win!' },
  ],
  'boss-science': [
    { who: '🦖', name: 'Rex the Restless', text: 'ROAR! I have guarded this crystal since the age of the dinosaurs!', with: ['💎'] },
    { ...CHINOOK, text: 'Every right answer is a hit. Get most of them right to win!' },
  ],
  crystal: [
    { ...CHINOOK, text: 'You won back a Chinook Crystal! Feel that? The air is getting warmer.', with: ['💎', '☀️'] },
  ],
  'final-intro': [
    { ...CHINOOK, text: 'All four crystals are glowing. Their light has melted the gate of the Blizzard Fortress!', with: ['💎', '💎', '💎', '💎'] },
    { ...BARON, text: 'You again?! Fine. Answer my questions from EVERY zone. Math! Spelling! Grammar! Science! You will never get them all!', with: ['❄️'] },
    { ...CHINOOK, text: 'This is it, hero. Use everything you have learned!' },
  ],
  ending: [
    { ...BARON, text: 'Nooo! I am... melting...', with: ['💧'] },
    { ...CHINOOK, text: 'You did it! The Chinook wind blows warm again, and the whole land is bright.', with: ['☀️', '🌈'] },
    { ...CHINOOK, text: 'You are a true Grade 3 Champion! Keep training to master every skill and fill your Pal Book.', with: ['🏆'] },
  ],
};
