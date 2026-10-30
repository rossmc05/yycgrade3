import { dayKey, finishReview, isReviewDue, newSkillState, recordAnswer, status } from './adaptive';
import { XP_FIRST_TRY, XP_WITH_HINT, touchStreak } from './rewards';
import type { GenContext, Profile, Question, Rng, Skill, SkillState } from './types';

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
export function applyAnswer(p: Profile, skill: Skill, q: Question, firstTry: boolean, solved: boolean, seconds: number, now: number, asked?: number): AnswerOutcome {
  const prev = p.skills[skill.id] ?? newSkillState();
  const { state, levelChange, newlyMastered } = recordAnswer(skill, prev, q, firstTry, now, asked);
  const xp = firstTry ? XP_FIRST_TRY : solved ? XP_WITH_HINT : 1;
  const key = dayKey(now);
  const day = p.days[key] ?? { questions: 0, correct: 0, seconds: 0, bySubject: {} };
  const nextDay = {
    questions: day.questions + 1,
    correct: day.correct + (firstTry ? 1 : 0),
    seconds: day.seconds + Math.min(seconds, 120),
    bySubject: { ...day.bySubject, [skill.subject]: (day.bySubject[skill.subject] ?? 0) + 1 },
    secondsBySubject: { ...day.secondsBySubject, [skill.subject]: (day.secondsBySubject?.[skill.subject] ?? 0) + Math.min(seconds, 120) },
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
 * Plan a mixed warm-up around a few skills, so each gets enough practice to move:
 * due reviews first, then the skills in progress that waited longest, then one new skill
 * from the subject with the fewest started. Questions come in pairs of the same skill.
 */
export function planMix(p: Profile, skills: Skill[], count: number, rng: Rng, now: number): Planned[] {
  const last = (s: Skill) => p.skills[s.id]?.history.at(-1)?.t ?? 0;
  const due = skills.filter((s) => isReviewDue(p.skills[s.id], now)).sort((a, b) => (p.skills[a.id].reviewAt ?? 0) - (p.skills[b.id].reviewAt ?? 0));
  const practising = skills.filter((s) => status(p.skills[s.id]) === 'practising').sort((a, b) => last(a) - last(b));
  const started = (subject: string) => skills.filter((s) => s.subject === subject && status(p.skills[s.id]) !== 'new').length;
  const fresh = skills.filter((s) => status(p.skills[s.id]) === 'new').sort((a, b) => started(a.subject) - started(b.subject));
  const target = Math.max(1, Math.min(4, Math.round(count / 3)));
  const chosen: Skill[] = [...due.slice(0, 2)];
  for (const s of practising) if (chosen.length < target - (fresh.length ? 1 : 0)) chosen.push(s);
  if (fresh.length) chosen.push(fresh[0]);
  const newSubject = (s: Skill) => !chosen.some((c) => c.subject === s.subject);
  for (const s of [...practising, ...fresh.filter(newSubject), ...fresh, ...skills]) {
    if (chosen.length < target && !chosen.includes(s) && (practising.includes(s) || !fresh.includes(s) || newSubject(s) || chosen.length + 1 === target)) chosen.push(s);
  }
  for (const s of skills) if (chosen.length < target && !chosen.includes(s)) chosen.push(s);
  const order = rng() < 0.5 ? chosen : [...chosen].reverse();
  const out: Planned[] = [];
  for (let i = 0; out.length < count; i++) {
    const s = order[Math.floor(i / 2) % order.length];
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
          secondsBySubject: { ...day.secondsBySubject, [subject]: (day.secondsBySubject?.[subject] ?? 0) + seconds },
        },
      },
    },
    now,
  );
}

/** Record a finished arcade game: XP, coins, time, and the best score. */
export function finishGame(p: Profile, gameId: string, subject: Skill['subject'], score: number, seconds: number, now: number): { profile: Profile; xp: number; best: boolean } {
  const xp = Math.min(60, 8 + Math.round(score));
  const prev = p.games?.[gameId];
  const best = !prev || score > prev.best;
  const logged = logActivity(p, subject, 0, 0, Math.round(seconds), xp, now);
  return {
    profile: { ...logged, games: { ...logged.games, [gameId]: { best: Math.max(prev?.best ?? 0, score), plays: (prev?.plays ?? 0) + 1 } } },
    xp,
    best,
  };
}

/**
 * Generate a question the child hasn't seen lately: not in this session, and not
 * among the skill's last 40 answers (across days). Falls back gracefully on small banks.
 */
export function freshQuestion(skill: Skill, state: SkillState | undefined, level: number, rng: Rng, ctx: GenContext, used: Set<string>): Question {
  const lately = new Set((state?.history ?? []).slice(-40).map((a) => a.key));
  let q = skill.generate(level, rng, ctx);
  for (let tries = 0; tries < 40 && (used.has(q.key) || lately.has(q.key)); tries++) q = skill.generate(level, rng, ctx);
  for (let tries = 0; tries < 20 && used.has(q.key); tries++) q = skill.generate(level, rng, ctx);
  return q;
}
