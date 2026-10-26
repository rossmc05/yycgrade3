import { useEffect, useMemo, useRef, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { VisualView } from '../components/Visuals';
import { isReviewDue, newSkillState } from '../engine/adaptive';
import { applyAnswer, closeReviews, planMix, planSkill, type Planned } from '../engine/progress';
import { checkBadges, type BadgeDef } from '../engine/rewards';
import { speak, stopSpeaking } from '../engine/speech';
import { useStore } from '../engine/store';
import type { Question, Skill } from '../engine/types';
import { go } from '../router';
import { ALL_SKILLS, SUBJECTS, findSkill, findSubject } from '../subjects';

const CHEERS = ['Awesome!', 'You got it!', 'Super!', 'Nailed it!', 'Brilliant!', 'Great thinking!', 'Way to go!', 'Yes!'];

/** Strip spaces and thousands separators so "12 345" and "12345" match. */
export function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[\s,]/g, '').replace(/^\$/, '').replace(/¢$/, '');
}

type Phase = 'ask' | 'hint' | 'right' | 'shown';

interface Result {
  skillId: string;
  correct: boolean;
}

export function Play(props: { subjectId: string; target: string }) {
  const [round, setRound] = useState(0);
  return <Session key={round} {...props} again={() => setRound((r) => r + 1)} />;
}

function Session({ subjectId, target, again }: { subjectId: string; target: string; again: () => void }) {
  const { profile, data, updateProfile } = useStore();
  const subject = findSubject(subjectId);
  const pool: Skill[] = useMemo(
    () => (subjectId === 'all' ? SUBJECTS.filter((s) => s.ready).flatMap((s) => s.skills) : subject?.skills ?? []),
    [subjectId, subject],
  );
  const single = target !== 'mix' ? findSkill(target) : undefined;
  const len = data.settings.sessionLength;

  // Plan once per session, from the profile as it was when the session started.
  const [plan] = useState<Planned[]>(() => {
    if (!profile) return [];
    return single ? planSkill(profile, single, len) : planMix(profile, pool, len, Math.random, Date.now());
  });
  const [wasDue] = useState(() => new Set(pool.filter((s) => profile && isReviewDue(profile.skills[s.id], Date.now())).map((s) => s.id)));

  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [xpEarned, setXpEarned] = useState(0);
  const [levelUps, setLevelUps] = useState<string[]>([]);
  const [mastered, setMastered] = useState<string[]>([]);
  const [badges, setBadges] = useState<BadgeDef[]>([]);
  const [finished, setFinished] = useState(false);

  const back = () => {
    stopSpeaking();
    go(...(subjectId === 'all' ? [''] : ['subject', subjectId]));
  };

  // Generate each question when it is reached, so it uses the latest level.
  const [question, setQuestion] = useState<Question | null>(null);
  const step = plan[index];
  useEffect(() => {
    if (!step || !profile) return;
    if (step.retry) {
      setQuestion(step.retry);
      return;
    }
    const level = (profile.skills[step.skill.id] ?? newSkillState()).level;
    setQuestion(step.skill.generate(level, Math.random));
  }, [index]);

  const onDone = (firstTry: boolean, solved: boolean, seconds: number) => {
    if (!question || !step || !profile) return;
    const now = Date.now();
    const outcome = applyAnswer(profile, step.skill, question, firstTry, solved, seconds, now);
    let nextProfile = outcome.profile;
    setXpEarned((x) => x + outcome.xp);
    if (outcome.levelChange === 1) setLevelUps((l) => [...l, step.skill.name]);
    if (outcome.newlyMastered) setMastered((m) => [...m, step.skill.name]);
    const all = [...results, { skillId: step.skill.id, correct: firstTry }];
    setResults(all);
    if (index + 1 >= plan.length) {
      const checked = checkBadges(closeReviews(nextProfile, all, wasDue, now), ALL_SKILLS, now);
      nextProfile = checked.profile;
      setBadges(checked.won);
      setFinished(true);
    } else {
      setIndex(index + 1);
    }
    updateProfile(() => nextProfile);
  };

  if (!profile) return null;
  if (!plan.length) {
    return (
      <main className="page">
        <TopBar back={back} />
        <p className="card">Nothing to practise here yet.</p>
      </main>
    );
  }

  if (finished) {
    const right = results.filter((r) => r.correct).length;
    return (
      <main className="page">
        <TopBar back={back} />
        <section className="card center summary">
          <div className="big-emoji">{right === results.length ? '🏆' : right >= results.length * 0.7 ? '🌟' : '💪'}</div>
          <h1>Session complete!</h1>
          <p className="score">
            {right} of {results.length} right on the first try
          </p>
          <p className="xp-gain">+{xpEarned} XP · +{Math.ceil(xpEarned / 2)} 🪙</p>
          {levelUps.length > 0 && <p className="good">⬆️ Level up in {[...new Set(levelUps)].join(', ')}!</p>}
          {mastered.length > 0 && <p className="good">⭐ You mastered {mastered.join(', ')}!</p>}
          {badges.length > 0 && (
            <div className="badge-row">
              {badges.map((b) => (
                <div key={b.id} className="badge earned pop">
                  <span className="badge-icon">{b.icon}</span>
                  <span>{b.name}</span>
                </div>
              ))}
            </div>
          )}
          <div className="row">
            <button className="btn ghost" onClick={back}>
              Done
            </button>
            <button className="btn primary" onClick={again}>
              Play again
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <TopBar back={back} />
      <div className="progress-track" aria-label={`Question ${index + 1} of ${plan.length}`}>
        {plan.map((_, i) => (
          <span key={i} className={i < results.length ? (results[i].correct ? 'ok' : 'miss') : i === index ? 'now' : ''} />
        ))}
      </div>
      {question && step && (
        <QuestionCard
          key={`${index}-${question.key}`}
          q={question}
          skill={step.skill}
          level={(profile.skills[step.skill.id] ?? newSkillState()).level}
          readAloud={data.settings.readAloud}
          onDone={onDone}
        />
      )}
    </main>
  );
}

function QuestionCard({ q, skill, level, readAloud, onDone }: {
  q: Question;
  skill: Skill;
  level: number;
  readAloud: boolean;
  onDone: (firstTry: boolean, solved: boolean, seconds: number) => void;
}) {
  const [phase, setPhase] = useState<Phase>('ask');
  const [value, setValue] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [cheer] = useState(() => CHEERS[Math.floor(Math.random() * CHEERS.length)]);
  const start = useRef(Date.now());
  const tries = useRef(0);

  useEffect(() => {
    if (readAloud) speak(q.prompt);
  }, [q, readAloud]);

  const submit = (answer: string) => {
    if (phase === 'right' || phase === 'shown') return;
    if (!normalize(answer)) return;
    tries.current += 1;
    const ok = normalize(answer) === normalize(q.answer);
    if (ok) {
      setPhase('right');
      if (readAloud) speak(cheer);
    } else if (tries.current === 1) {
      setPhase('hint');
      setValue('');
      if (readAloud) speak(`Not quite. ${q.hint}`);
    } else {
      setPhase('shown');
      if (readAloud) speak(q.explain);
    }
  };

  const next = () => onDone(tries.current === 1 && phase === 'right', phase === 'right', (Date.now() - start.current) / 1000);

  // Keyboard: digits and Enter for number questions, Enter to continue.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (phase === 'right' || phase === 'shown') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          next();
        }
        return;
      }
      if (q.input !== 'number') return;
      if (/^[0-9]$/.test(e.key)) setValue((v) => (v.length < 7 ? v + e.key : v));
      else if (e.key === 'Backspace') setValue((v) => v.slice(0, -1));
      else if (e.key === 'Enter') submit(value);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  const done = phase === 'right' || phase === 'shown';
  const unitBefore = q.unit === '$';

  return (
    <section className={`card question ${phase}`}>
      <div className="q-head">
        <span className="chip">{skill.icon} {skill.name} · {skill.levels[level]}</span>
        <button className="icon-btn" onClick={() => speak(q.prompt)} aria-label="Read aloud">
          🔊
        </button>
      </div>
      <h2 className="prompt">{q.prompt}</h2>
      {q.visual && (
        <div className="visual-wrap">
          <VisualView v={q.visual} />
        </div>
      )}

      {q.input === 'choice' && q.choices && (
        <div className={`choices ${q.choices.length <= 3 ? 'few' : ''}`}>
          {q.choices.map((c) => {
            const cls = done && normalize(c) === normalize(q.answer) ? 'correct' : picked === c && phase !== 'ask' ? 'wrong' : '';
            return (
              <button
                key={c}
                className={`choice ${cls}`}
                disabled={done || (phase === 'hint' && picked === c)}
                onClick={() => {
                  setPicked(c);
                  submit(c);
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {q.input !== 'choice' && (
        <>
          <div className="answer-box">
            {unitBefore && <span className="unit">$</span>}
            <span className={`answer-value ${value ? '' : 'empty'}`}>{done && phase === 'shown' ? q.answer : value || '?'}</span>
            {q.unit && !unitBefore && <span className="unit">{q.unit}</span>}
          </div>
          {!done && <Keypad value={value} setValue={setValue} onEnter={() => submit(value)} />}
        </>
      )}

      {phase === 'hint' && (
        <div className="feedback hint" role="status">
          <strong>Not quite. Try again!</strong>
          <p>💡 {q.hint}</p>
        </div>
      )}
      {phase === 'right' && (
        <div className="feedback right" role="status">
          <strong>✅ {cheer}</strong>
          <p>{q.explain}</p>
          <button className="btn primary" onClick={next} autoFocus>
            Next →
          </button>
        </div>
      )}
      {phase === 'shown' && (
        <div className="feedback shown" role="status">
          <strong>The answer is {q.unit === '$' ? '$' : ''}{q.answer}{q.unit && q.unit !== '$' ? ` ${q.unit}` : ''}.</strong>
          <p>{q.explain}</p>
          <p className="muted">We'll practise this one again soon.</p>
          <button className="btn primary" onClick={next} autoFocus>
            Next →
          </button>
        </div>
      )}
    </section>
  );
}

function Keypad({ value, setValue, onEnter }: { value: string; setValue: (fn: (v: string) => string) => void; onEnter: () => void }) {
  const press = (k: string) => setValue((v) => (v.length < 7 ? v + k : v));
  return (
    <div className="keypad">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
        <button key={k} onClick={() => press(k)}>
          {k}
        </button>
      ))}
      <button className="key-back" onClick={() => setValue((v) => v.slice(0, -1))} aria-label="Delete">
        ⌫
      </button>
      <button onClick={() => press('0')}>0</button>
      <button className="key-go" onClick={onEnter} disabled={!value}>
        ✓
      </button>
    </div>
  );
}
