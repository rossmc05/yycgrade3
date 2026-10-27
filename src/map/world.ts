// The world map: where each zone sits, when it opens, and which quests inside it are open.

import { isReviewDue, status } from '../engine/adaptive';
import type { Profile, Skill, SubjectId } from '../engine/types';

export type PlaceId = 'village' | SubjectId;

export interface Place {
  id: PlaceId;
  name: string;
  /** Position on the 1000 × 640 map. */
  x: number;
  y: number;
  /** Right answers (all subjects) needed to open it. */
  unlockAt: number;
  guide?: { name: string; icon: string };
}

export const PLACES: Place[] = [
  { id: 'village', name: 'Home Village', x: 500, y: 330, unlockAt: 0 },
  { id: 'math', name: 'Math Mountains', x: 225, y: 160, unlockAt: 0, guide: { name: 'Gus the Mountain Goat', icon: '🐐' } },
  { id: 'spelling', name: 'Spelling Swamp', x: 205, y: 480, unlockAt: 0, guide: { name: 'Fern the Frog', icon: '🐸' } },
  { id: 'grammar', name: 'Grammar Garage', x: 520, y: 525, unlockAt: 10, guide: { name: 'Sprocket the Robot', icon: '🤖' } },
  { id: 'science', name: 'Science Badlands', x: 800, y: 440, unlockAt: 25, guide: { name: 'Dr. Dina the Fossil Hunter', icon: '🦕' } },
  { id: 'typing', name: 'Typing Tower', x: 790, y: 195, unlockAt: 50, guide: { name: 'Keys the Owl', icon: '🦉' } },
];

export const placeOf = (id: string) => PLACES.find((p) => p.id === id);

export function isOpen(place: Place, p: Profile): boolean {
  return p.totalCorrect >= place.unlockAt;
}

/** Waypoints from one place to another: every path runs through the village. */
export function route(from: PlaceId, to: PlaceId): PlaceId[] {
  if (from === to) return [to];
  if (from === 'village' || to === 'village') return [from, to];
  return [from, 'village', to];
}

/** The place in the arrow's direction from `from`, or undefined. */
export function neighbour(from: PlaceId, dx: number, dy: number): PlaceId | undefined {
  const a = placeOf(from)!;
  let best: { id: PlaceId; score: number } | undefined;
  for (const b of PLACES) {
    if (b.id === from) continue;
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const len = Math.hypot(vx, vy);
    const cos = (vx * dx + vy * dy) / len;
    if (cos < 0.35) continue;
    const score = cos * 1000 - len;
    if (!best || score > best.score) best = { id: b.id, score };
  }
  return best?.id;
}

export type QuestState = 'locked' | 'open' | 'review' | 'done';

export interface Quest {
  skill: Skill;
  state: QuestState;
  /** 0–3 stars: started, reached the top level, mastered. */
  stars: number;
}

/** Quests in a zone: the first three are open, and each skill that levels up opens one more. */
export function quests(skills: Skill[], p: Profile, now: number): Quest[] {
  const grown = skills.filter((s) => (p.skills[s.id]?.level ?? 0) >= 1 || status(p.skills[s.id]) === 'mastered').length;
  const open = 3 + grown;
  return skills.map((skill, i) => {
    const st = p.skills[skill.id];
    const mastered = status(st) === 'mastered';
    const top = (st?.level ?? 0) >= skill.levels.length - 1 && (st?.history.length ?? 0) > 0;
    const stars = mastered ? 3 : top ? 2 : st?.history.length ? 1 : 0;
    const state: QuestState = i >= open && !st?.history.length ? 'locked' : isReviewDue(st, now) ? 'review' : mastered ? 'done' : 'open';
    return { skill, state, stars };
  });
}

/** The guide's pick: a due review, then a quest in progress, then the next new one. */
export function recommended(list: Quest[]): Quest | undefined {
  return (
    list.find((q) => q.state === 'review') ??
    list.find((q) => q.state === 'open' && q.stars > 0) ??
    list.find((q) => q.state === 'open')
  );
}

export function guideLine(place: Place, list: Quest[]): string {
  const pick = recommended(list);
  if (!pick) return `You've cleared every quest in ${place.name}! Come back for rematches.`;
  if (pick.state === 'review') return `The monsters are back for a rematch! Try "${pick.skill.name}" to keep your skills sharp.`;
  if (pick.stars > 0) return `You're getting stronger at "${pick.skill.name}". Keep going and win a star!`;
  if (list.every((q) => q.stars === 0)) return `Welcome to ${place.name}! Monsters are blocking the trail. Start with "${pick.skill.name}".`;
  return `A new quest is open: "${pick.skill.name}". Are you ready?`;
}
