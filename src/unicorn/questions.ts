// Questions for a ride, from the Kindergarten skills and the shared learning engine,
// in the same way the ballpark plans its games.

import { applyAnswer, freshQuestion, planMix } from '../engine/progress';
import { isPaused, onSkills } from '../engine/topics';
import type { Profile, Question, Skill } from '../engine/types';
import { K_SUBJECTS } from '../subjects/kindergarten';

/** Skills for a ride: reviews due, skills in progress and one new skill, two at a time from each subject in turn. */
export function planRide(p: Profile, count: number, rng: () => number, now: number): Skill[] {
  const open = K_SUBJECTS.filter((s) => s.skills.some((k) => !isPaused(p, k.id)));
  const groups = (open.length ? open : K_SUBJECTS).map((s) => planMix(p, onSkills(p, s.skills), count, rng, now).map((x) => x.skill));
  const start = Math.floor(rng() * groups.length);
  const out: Skill[] = [];
  for (let i = 0; out.length < count; i++) out.push(groups[(Math.floor(i / 2) + start) % groups.length][i]);
  return out;
}

export const levelOf = (p: Profile, skill: Skill) => p.skills[skill.id]?.level ?? 0;

export function askK(p: Profile, skill: Skill, used: Set<string>): Question {
  const q = freshQuestion(skill, p.skills[skill.id], levelOf(p, skill), Math.random, { spellingList: [] }, used);
  used.add(q.key);
  return q;
}

/**
 * Record an answer in the shared learning engine (levels, mastery, reviews, the day's practice),
 * keeping Grade 3 Quest's own XP and coins as they were: the meadow pays out in its own points.
 */
export function recordK(p: Profile, skill: Skill, q: Question, firstTry: boolean, seconds: number, now: number): Profile {
  const out = applyAnswer(p, skill, q, firstTry, true, seconds, now, levelOf(p, skill));
  return { ...out.profile, xp: p.xp, coins: p.coins };
}
