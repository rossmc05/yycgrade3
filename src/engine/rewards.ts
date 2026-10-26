import { dayKey, isMastered } from './adaptive';
import type { Profile, Skill } from './types';

export const XP_FIRST_TRY = 10;
export const XP_WITH_HINT = 4;

/** Level n needs 100·n XP more than level n-1, so levels slow down gently. */
export function playerLevel(xp: number): { level: number; into: number; need: number } {
  let level = 1;
  let need = 100;
  let left = xp;
  while (left >= need) {
    left -= need;
    level += 1;
    need = 100 * level;
  }
  return { level, into: left, need };
}

export interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  describe: string;
}

export const STREAK_BADGES: BadgeDef[] = [
  { id: 'streak-3', name: 'On a Roll', icon: '🔥', describe: 'Practise 3 days in a row' },
  { id: 'streak-7', name: 'Week Warrior', icon: '📅', describe: 'Practise 7 days in a row' },
  { id: 'streak-30', name: 'Unstoppable', icon: '🏆', describe: 'Practise 30 days in a row' },
];

export const COUNT_BADGES: BadgeDef[] = [
  { id: 'first-session', name: 'First Steps', icon: '👣', describe: 'Finish your first session' },
  { id: 'correct-100', name: 'Century', icon: '💯', describe: 'Get 100 answers right' },
  { id: 'correct-500', name: 'Brain Builder', icon: '🧠', describe: 'Get 500 answers right' },
  { id: 'correct-1000', name: 'Legend', icon: '🌟', describe: 'Get 1000 answers right' },
];

export function skillBadge(skill: Skill): BadgeDef {
  return { id: `mastered:${skill.id}`, name: `${skill.name} Master`, icon: skill.icon, describe: `Master ${skill.name}` };
}

/** Update streak when the child practises; returns the new profile. */
export function touchStreak(p: Profile, now: number): Profile {
  const today = dayKey(now);
  if (p.lastActiveDay === today) return p;
  const yesterday = dayKey(now - 24 * 60 * 60 * 1000);
  const streak = p.lastActiveDay === yesterday ? p.streak + 1 : 1;
  return { ...p, streak, lastActiveDay: today };
}

/** Streak shown on screen: 0 if a day was skipped. */
export function liveStreak(p: Profile, now: number): number {
  const today = dayKey(now);
  const yesterday = dayKey(now - 24 * 60 * 60 * 1000);
  return p.lastActiveDay === today || p.lastActiveDay === yesterday ? p.streak : 0;
}

/** Award any badges newly earned. Returns the profile and the badges just won. */
export function checkBadges(p: Profile, skills: Skill[], now: number): { profile: Profile; won: BadgeDef[] } {
  const won: BadgeDef[] = [];
  const badges = { ...p.badges };
  const give = (b: BadgeDef, ok: boolean) => {
    if (ok && !badges[b.id]) {
      badges[b.id] = now;
      won.push(b);
    }
  };
  give(STREAK_BADGES[0], p.streak >= 3);
  give(STREAK_BADGES[1], p.streak >= 7);
  give(STREAK_BADGES[2], p.streak >= 30);
  give(COUNT_BADGES[0], Object.keys(p.days).length > 0);
  give(COUNT_BADGES[1], p.totalCorrect >= 100);
  give(COUNT_BADGES[2], p.totalCorrect >= 500);
  give(COUNT_BADGES[3], p.totalCorrect >= 1000);
  for (const s of skills) {
    const st = p.skills[s.id];
    give(skillBadge(s), !!st && isMastered(st));
  }
  return { profile: { ...p, badges }, won };
}

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  slot: 'hat' | 'pet' | 'badge' | 'background';
}

export const SHOP: ShopItem[] = [
  { id: 'hat-cap', name: 'Ball Cap', icon: '🧢', cost: 40, slot: 'hat' },
  { id: 'hat-crown', name: 'Crown', icon: '👑', cost: 300, slot: 'hat' },
  { id: 'hat-tophat', name: 'Top Hat', icon: '🎩', cost: 150, slot: 'hat' },
  { id: 'hat-grad', name: 'Grad Cap', icon: '🎓', cost: 500, slot: 'hat' },
  { id: 'pet-dog', name: 'Puppy', icon: '🐶', cost: 80, slot: 'pet' },
  { id: 'pet-cat', name: 'Kitten', icon: '🐱', cost: 80, slot: 'pet' },
  { id: 'pet-moose', name: 'Moose', icon: '🫎', cost: 200, slot: 'pet' },
  { id: 'pet-dragon', name: 'Dragon', icon: '🐉', cost: 600, slot: 'pet' },
  { id: 'pet-dino', name: 'T. rex', icon: '🦖', cost: 400, slot: 'pet' },
  { id: 'bg-mountains', name: 'Rocky Mountains', icon: '🏔️', cost: 120, slot: 'background' },
  { id: 'bg-space', name: 'Outer Space', icon: '🌌', cost: 250, slot: 'background' },
  { id: 'bg-rink', name: 'Hockey Rink', icon: '🏒', cost: 180, slot: 'background' },
  { id: 'bg-ocean', name: 'Ocean', icon: '🌊', cost: 180, slot: 'background' },
  { id: 'bg-aurora', name: 'Northern Lights', icon: '🌠', cost: 450, slot: 'background' },
];

export const AVATARS = ['🦊', '🐻', '🐼', '🦁', '🐯', '🐸', '🐵', '🦉', '🐧', '🐙', '🦄', '🤖'];
