import type { Attempt, Question, Skill, SkillState } from './types';

/** Move up after this many right in a row, or UP_OF_FIVE of the last five, at the current level. */
export const UP_AFTER = 4;
export const UP_OF_FIVE = 4;
/** Move down after this many misses in the last four at the current level. */
export const DOWN_AFTER = 3;
export const MASTERY_WINDOW = 20;
/** Mastery needs the window spread over this many different days. */
export const MASTERY_DAYS = 3;
export const MASTERY_ACCURACY = 0.9;
/** Days between spaced reviews once a skill is mastered. */
export const REVIEW_DAYS = [1, 3, 7, 21, 60];

const DAY = 24 * 60 * 60 * 1000;

export function newSkillState(): SkillState {
  return { level: 0, upStreak: 0, downStreak: 0, history: [], reviewStep: 0, missed: [] };
}

export function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Accuracy over the most recent attempts at the top level. */
export function topLevelAccuracy(skill: Skill, s: SkillState): { accuracy: number; count: number; days: number } {
  const top = skill.levels.length - 1;
  const recent = s.history.filter((a) => a.level === top).slice(-MASTERY_WINDOW);
  const correct = recent.filter((a) => a.correct).length;
  const days = new Set(recent.map((a) => dayKey(a.t))).size;
  return { accuracy: recent.length ? correct / recent.length : 0, count: recent.length, days };
}

export function isMastered(s: SkillState): boolean {
  return s.masteredAt !== undefined;
}

export type Status = 'new' | 'practising' | 'mastered';

export function status(s: SkillState | undefined): Status {
  if (!s || s.history.length === 0) return 'new';
  return isMastered(s) ? 'mastered' : 'practising';
}

export function isReviewDue(s: SkillState | undefined, now: number): boolean {
  return !!s && isMastered(s) && s.reviewAt !== undefined && s.reviewAt <= now;
}

export interface RecordResult {
  state: SkillState;
  levelChange: -1 | 0 | 1;
  newlyMastered: boolean;
}

/**
 * Apply one answer to a skill's state. `firstTry` is false when the child
 * needed a hint; that counts as a miss for difficulty and mastery.
 * `asked` is the level the question came from when a game picked an easier or
 * harder one: an easy one right, or a hard one wrong, doesn't move the level.
 */
export function recordAnswer(skill: Skill, prev: SkillState, q: Question, firstTry: boolean, now: number, asked?: number): RecordResult {
  const key = q.key;
  const s: SkillState = { ...prev, history: [...prev.history], missed: [...prev.missed] };
  const level = asked ?? s.level;
  const attempt: Attempt = { t: now, correct: firstTry, level, key };
  s.history.push(attempt);
  if (s.history.length > 300) s.history = s.history.slice(-300);

  let levelChange: -1 | 0 | 1 = 0;
  const top = skill.levels.length - 1;
  const counts = level === s.level || (level > s.level && firstTry) || (level < s.level && !firstTry);
  if (!counts) {
    if (firstTry) s.missed = s.missed.filter((m) => m.key !== key);
    return { state: s, levelChange, newlyMastered: false };
  }

  // Results at the current level since it last changed, kept across sessions.
  const recent = [...(s.recent ?? []), firstTry].slice(-5);
  s.recent = recent;
  s.upStreak = firstTry ? s.upStreak + 1 : 0;
  s.downStreak = firstTry ? 0 : s.downStreak + 1;
  if (firstTry) {
    s.missed = s.missed.filter((m) => m.key !== key);
    const right = recent.filter(Boolean).length;
    if ((s.upStreak >= UP_AFTER || right >= UP_OF_FIVE) && s.level < top) {
      s.level += 1;
      levelChange = 1;
    }
  } else {
    if (!s.missed.some((m) => m.key === key)) s.missed.push(q);
    if (s.missed.length > 15) s.missed = s.missed.slice(-15);
    const misses = recent.slice(-4).filter((r) => !r).length;
    if (misses >= DOWN_AFTER && s.level > 0) {
      s.level -= 1;
      levelChange = -1;
    }
  }
  if (levelChange) {
    s.recent = [];
    s.upStreak = 0;
    s.downStreak = 0;
  }

  let newlyMastered = false;
  if (!isMastered(s)) {
    const { accuracy, count, days } = topLevelAccuracy(skill, s);
    if (count >= MASTERY_WINDOW && accuracy >= MASTERY_ACCURACY && days >= MASTERY_DAYS) {
      s.masteredAt = now;
      s.reviewStep = 0;
      s.reviewAt = now + REVIEW_DAYS[0] * DAY;
      newlyMastered = true;
    }
  }
  return { state: s, levelChange, newlyMastered };
}

/** After a review session: push the next review further out, or bring it closer on a weak result. */
export function finishReview(s: SkillState, accuracy: number, now: number): SkillState {
  if (!isMastered(s)) return s;
  const step = accuracy >= 0.8 ? Math.min(s.reviewStep + 1, REVIEW_DAYS.length - 1) : 0;
  return { ...s, reviewStep: step, reviewAt: now + REVIEW_DAYS[step] * DAY };
}
