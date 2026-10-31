// Questions for the ballpark come from the same skills and learning engine as Grade 3 Quest.

import { newSkillState } from '../engine/adaptive';
import { applyAnswer, freshQuestion, planMix } from '../engine/progress';
import { isPaused, onSkills } from '../engine/topics';
import type { Profile, Question, Skill, SubjectId } from '../engine/types';
import { SUBJECTS } from '../subjects';

/** Subjects with questions (typing is practised in Type Rocket). */
export const BALL_SUBJECTS = SUBJECTS.filter((s) => s.skills.length > 0);

export function skillPool(subjects: SubjectId[]): Skill[] {
  const chosen = BALL_SUBJECTS.filter((s) => subjects.includes(s.id));
  return (chosen.length ? chosen : BALL_SUBJECTS).flatMap((s) => s.skills);
}

/**
 * The order of skills for a game: reviews due, skills in progress and one new skill,
 * from each chosen subject in turn so a mixed game really mixes.
 */
export function planSkills(p: Profile, subjects: SubjectId[], count: number, rng: () => number, now: number): Skill[] {
  const chosen = BALL_SUBJECTS.filter((s) => subjects.includes(s.id));
  const picked = chosen.length ? chosen : BALL_SUBJECTS;
  // Skip subjects whose topics are all switched off, unless that leaves nothing.
  const open = picked.filter((s) => s.skills.some((k) => !isPaused(p, k.id)));
  const groups = (open.length ? open : picked).map((s) => planMix(p, onSkills(p, s.skills), count, rng, now).map((x) => x.skill));
  const out: Skill[] = [];
  for (let i = 0; out.length < count; i++) {
    // Two questions in a row from a subject, then the next subject.
    out.push(groups[Math.floor(i / 2) % groups.length][i]);
  }
  return out;
}

/** The planned skill at `i`, or the next one after it that is still switched on. */
export function skillAt(p: Profile, plan: Skill[], i: number, not?: string): Skill {
  for (let k = 0; k < plan.length; k++) {
    const s = plan[(i + k) % plan.length];
    if (!isPaused(p, s.id) && s.id !== not) return s;
  }
  return plan[i % plan.length];
}

export const levelOf = (p: Profile, skill: Skill) => (p.skills[skill.id] ?? newSkillState()).level;

export function ask(p: Profile, skill: Skill, level: number, used: Set<string>): Question {
  const q = freshQuestion(skill, p.skills[skill.id], level, Math.random, { spellingList: p.spellingList ?? [] }, used);
  used.add(q.key);
  return q;
}

export const XP_RIGHT = 10;
export const XP_WRONG = 2;

/**
 * Record an answer in the shared learning engine (levels, mastery, reviews, the day's
 * practice and streak), keeping Grade 3 Quest's own XP and coins as they were:
 * the ballpark pays out in its own coins and XP.
 */
export function recordBall(p: Profile, skill: Skill, q: Question, correct: boolean, seconds: number, level: number, now: number): Profile {
  const out = applyAnswer(p, skill, q, correct, correct, seconds, now, level);
  return { ...out.profile, xp: p.xp, coins: p.coins };
}
