// Questions for the ballpark come from the same skills and learning engine as Grade 3 Quest.

import { isReviewDue, newSkillState } from '../engine/adaptive';
import { applyAnswer, closeReviews, freshQuestion, planMix } from '../engine/progress';
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
  // Each subject keeps its own place in its plan, so every subject's skills all get a turn.
  const at = groups.map(() => 0);
  for (let i = 0; out.length < count; i++) {
    // Two questions in a row from a subject, then the next subject.
    const g = Math.floor(i / 2) % groups.length;
    out.push(groups[g][at[g]++ % groups[g].length]);
  }
  return out;
}

/** The skills due for a spaced review when a game starts. */
export const dueSkills = (p: Profile, now: number) =>
  new Set(Object.keys(p.skills).filter((id) => isReviewDue(p.skills[id], now)));

/** At the end of a game or derby, pass or reschedule the reviews that were due. */
export const closeBallReviews = (p: Profile, results: { skillId: string; correct: boolean }[], wasDue: Set<string>, now: number) =>
  closeReviews(p, results, wasDue, now);


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
