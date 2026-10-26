import { dayKey, finishReview, isReviewDue, newSkillState, recordAnswer, status } from './adaptive';
import { XP_FIRST_TRY, XP_WITH_HINT, touchStreak } from './rewards';
import type { Profile, Question, Rng, Skill } from './types';

export interface AnswerOutcome {
  profile: Profile;
  xp: number;
  levelChange: -1 | 0 | 1;
  newlyMastered: boolean;
}

/**
 * Apply one finished question to the profile.
 * firstTry: right with no hint. solved: right on the second try, after the hint.
 */
export function applyAnswer(p: Profile, skill: Skill, q: Question, firstTry: boolean, solved: boolean, seconds: number, now: number): AnswerOutcome {
  const prev = p.skills[skill.id] ?? newSkillState();
  const { state, levelChange, newlyMastered } = recordAnswer(skill, prev, q, firstTry, now);
  const xp = firstTry ? XP_FIRST_TRY : solved ? XP_WITH_HINT : 1;
  const key = dayKey(now);
  const day = p.days[key] ?? { questions: 0, correct: 0, seconds: 0, bySubject: {} };
  const nextDay = {
    questions: day.questions + 1,
    correct: day.correct + (firstTry ? 1 : 0),
    seconds: day.seconds + Math.min(seconds, 120),
    bySubject: { ...day.bySubject, [skill.subject]: (day.bySubject[skill.subject] ?? 0) + 1 },
  };
  const profile = touchStreak(
    {
      ...p,
      xp: p.xp + xp,
      coins: p.coins + Math.ceil(xp / 2),
      totalCorrect: p.totalCorrect + (firstTry ? 1 : 0),
      skills: { ...p.skills, [skill.id]: state },
      days: { ...p.days, [key]: nextDay },
    },
    now,
  );
  return { profile, xp, levelChange, newlyMastered };
}

/** Push spaced reviews forward for skills that were reviewed in a session. */
export function closeReviews(p: Profile, results: { skillId: string; correct: boolean }[], wasDue: Set<string>, now: number): Profile {
  const skills = { ...p.skills };
  for (const id of wasDue) {
    const mine = results.filter((r) => r.skillId === id);
    if (!mine.length || !skills[id]) continue;
    skills[id] = finishReview(skills[id], mine.filter((r) => r.correct).length / mine.length, now);
  }
  return { ...p, skills };
}

export interface Planned {
  skill: Skill;
  /** A missed item to retry, or undefined to generate a fresh one. */
  retry?: Question;
}

/**
 * Plan a mixed warm-up: due reviews first, then skills in progress, then new ones,
 * spread so the same skill doesn't come twice in a row when avoidable.
 */
export function planMix(p: Profile, skills: Skill[], count: number, rng: Rng, now: number): Planned[] {
  const due = skills.filter((s) => isReviewDue(p.skills[s.id], now));
  const practising = skills.filter((s) => status(p.skills[s.id]) === 'practising');
  const fresh = skills.filter((s) => status(p.skills[s.id]) === 'new');
  const pool = [...due, ...due, ...practising, ...practising, ...fresh.slice(0, 2)];
  const source = pool.length ? pool : skills;
  const out: Planned[] = [];
  for (let i = 0; i < count; i++) {
    let s = source[Math.floor(rng() * source.length)];
    if (out.length && out[out.length - 1].skill.id === s.id && source.length > 1) {
      s = source[(source.indexOf(s) + 1) % source.length];
    }
    out.push({ skill: s });
  }
  return out;
}

/** Plan a single-skill session: retry up to two missed items, then fresh ones. */
export function planSkill(p: Profile, skill: Skill, count: number): Planned[] {
  const missed = p.skills[skill.id]?.missed ?? [];
  const retries = missed.slice(0, 2).map((q) => ({ skill, retry: q }));
  const fresh = Array.from({ length: count - retries.length }, () => ({ skill }));
  // Put retries in the middle so the session starts with a fresh question.
  return [...fresh.slice(0, 2), ...retries, ...fresh.slice(2)];
}

/** Log non-question practice (such as a typing lesson) toward the day's goal and XP. */
export function logActivity(p: Profile, subject: Skill['subject'], questions: number, correct: number, seconds: number, xp: number, now: number): Profile {
  const key = dayKey(now);
  const day = p.days[key] ?? { questions: 0, correct: 0, seconds: 0, bySubject: {} };
  return touchStreak(
    {
      ...p,
      xp: p.xp + xp,
      coins: p.coins + Math.ceil(xp / 2),
      days: {
        ...p.days,
        [key]: {
          questions: day.questions + questions,
          correct: day.correct + correct,
          seconds: day.seconds + seconds,
          bySubject: { ...day.bySubject, [subject]: (day.bySubject[subject] ?? 0) + questions },
        },
      },
    },
    now,
  );
}
