import { Icon } from '../art/sprite';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { logActivity } from '../engine/progress';
import { checkBadges } from '../engine/rewards';
import { useStore } from '../engine/store';
import { go } from '../router';
import { ALL_SKILLS } from '../subjects';
import { FINGER_NAME, KEY_ROWS, LESSONS, fingerFor, starsFor, type Lesson } from '../subjects/typing/lessons';

const touchOnly = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches && !window.matchMedia?.('(pointer: fine)').matches;

export function TypingHome() {
  const { profile } = useStore();
  if (!profile) return null;
  const results = profile.typing ?? {};
  return (
    <main className="page">
      <TopBar back={() => go('')} />
      <section className="subject-head" style={{ ['--tile' as string]: '#0891b2' }}>
        <span className="tile-icon"><Icon e="🚀" size="1em" /></span>
        <div>
          <h1>Type Rocket</h1>
          <p className="muted">Keep your fingers on the home row: left hand on A S D F, right hand on J K L ;. Feel the bumps on F and J.</p>
        </div>
      </section>
      {touchOnly && <p className="card">⌨️ Type Rocket works best with a real keyboard. Plug one in or use a laptop.</p>}
      <div className="skill-grid">
        {LESSONS.map((l, i) => {
          const r = results[l.id];
          const unlocked = i === 0 || (results[LESSONS[i - 1].id]?.stars ?? 0) >= 1;
          return (
            <button key={l.id} className={`skill-card ${r?.stars === 3 ? 'mastered' : ''}`} disabled={!unlocked} style={unlocked ? undefined : { opacity: 0.45 }} onClick={() => go('type', l.id)}>
              <span className="skill-icon"><Icon e={unlocked ? '⌨️' : '🔒'} size="1em" /></span>
              <span className="skill-name">{i + 1}. {l.name}</span>
              <span className="stars">{[1, 2, 3].map((s) => (s <= (r?.stars ?? 0) ? '⭐' : '☆')).join('')}</span>
              <span className="skill-blurb">{r ? `Best: ${r.bestWpm} words a minute, ${Math.round(r.bestAccuracy * 100)}% correct` : `Goal: ${l.targetWpm} words a minute`}</span>
            </button>
          );
        })}
      </div>
    </main>
  );
}

export function TypingLesson({ lessonId }: { lessonId: string }) {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  const [round, setRound] = useState(0);
  if (!lesson) return null;
  return <Run key={round} lesson={lesson} again={() => setRound((r) => r + 1)} />;
}

function Run({ lesson, again }: { lesson: Lesson; again: () => void }) {
  const { profile, updateProfile } = useStore();
  const text = useMemo(() => lesson.make(Math.random, profile?.spellingList ?? []), [lesson]);
  const [pos, setPos] = useState(0);
  const [errors, setErrors] = useState(0);
  const [wrongAt, setWrongAt] = useState<Set<number>>(new Set());
  const [flash, setFlash] = useState(false);
  const start = useRef<number | null>(null);
  const [result, setResult] = useState<{ wpm: number; accuracy: number; stars: number; xp: number } | null>(null);

  useEffect(() => {
    if (result) return;
    const on = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      e.preventDefault();
      if (start.current === null) start.current = Date.now();
      if (e.key === text[pos]) {
        const next = pos + 1;
        setPos(next);
        if (next === text.length) finish(errors);
      } else {
        setErrors((n) => n + 1);
        setWrongAt((s) => new Set(s).add(pos));
        setFlash(true);
        setTimeout(() => setFlash(false), 150);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  const finish = (errs: number) => {
    if (!profile) return;
    const now = Date.now();
    const minutes = Math.max((now - (start.current ?? now)) / 60000, 1 / 60);
    const wpm = Math.round(text.length / 5 / minutes);
    const accuracy = text.length / (text.length + errs);
    const stars = starsFor(lesson, wpm, accuracy);
    const xp = 10 + stars * 5;
    const prev = profile.typing?.[lesson.id];
    let p = logActivity(profile, 'typing', 5, accuracy >= 0.9 ? 5 : 0, Math.round(minutes * 60), xp, now);
    p = {
      ...p,
      typing: {
        ...p.typing,
        [lesson.id]: {
          bestWpm: Math.max(prev?.bestWpm ?? 0, wpm),
          bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy),
          stars: Math.max(prev?.stars ?? 0, stars),
          plays: (prev?.plays ?? 0) + 1,
        },
      },
    };
    p = checkBadges(p, ALL_SKILLS, now).profile;
    updateProfile(() => p);
    setResult({ wpm, accuracy, stars, xp });
  };

  const next = text[pos];
  const finger = next ? fingerFor(next) : undefined;
  const shift = next ? /[A-Z!?]/.test(next) : false;

  return (
    <main className="page">
      <TopBar back={() => go('subject', 'typing')} />
      <section className={`card typing ${flash ? 'oops' : ''}`}>
        <div className="q-head">
          <span className="chip">🚀 {lesson.name}</span>
          <span className="muted small">Goal: {lesson.targetWpm} words a minute</span>
        </div>
        {result ? (
          <div className="center summary">
            <div className="big-emoji"><Icon e={result.stars === 3 ? '🚀' : result.stars === 2 ? '🌟' : '👍'} size="1em" /></div>
            <h1>{[1, 2, 3].map((s) => (s <= result.stars ? '⭐' : '☆')).join('')}</h1>
            <p className="score">{result.wpm} words a minute · {Math.round(result.accuracy * 100)}% correct</p>
            <p className="xp-gain">+{result.xp} XP</p>
            {result.stars < 3 && (
              <p className="muted">
                {result.accuracy < 0.95 ? 'For 3 stars, aim for 95% correct. Slow down and look at the screen, not your hands.' : `For 3 stars, try for ${lesson.targetWpm} words a minute.`}
              </p>
            )}
            <div className="row">
              <button className="btn ghost" onClick={() => go('subject', 'typing')}>Lessons</button>
              <button className="btn primary" onClick={again}>Try again</button>
            </div>
          </div>
        ) : (
          <>
            <p className="type-text" aria-label={text}>
              {text.split('').map((c, i) => (
                <span key={i} className={i < pos ? (wrongAt.has(i) ? 'typed miss' : 'typed') : i === pos ? 'cursor' : ''}>
                  {c === ' ' ? ' ' : c}
                </span>
              ))}
            </p>
            <p className="finger-tip">
              {pos === 0 && start.current === null ? 'Start typing when you are ready. ' : ''}
              {next && (
                <>
                  Next: <kbd>{next === ' ' ? 'space' : next}</kbd> with your <strong>{FINGER_NAME[finger!]}</strong>
                  {shift ? ' (hold Shift with the other hand)' : ''}
                </>
              )}
            </p>
            <Keyboard next={next} />
            <p className="muted small">Mistakes: {errors}</p>
          </>
        )}
      </section>
    </main>
  );
}

function Keyboard({ next }: { next?: string }) {
  const target = next?.toLowerCase();
  const shiftKeys: Record<string, string> = { '!': '1', '?': '/' };
  const keyFor = target && shiftKeys[target] ? shiftKeys[target] : target;
  return (
    <div className="kb" aria-hidden="true">
      {KEY_ROWS.map((row, r) => (
        <div key={r} className="kb-row" style={{ paddingLeft: `${r * 18}px` }}>
          {row.split('').map((k) => (
            <span key={k} className={`kb-key f-${fingerFor(k)} ${k === keyFor ? 'next' : ''} ${k === 'f' || k === 'j' ? 'bump' : ''}`}>
              {k}
            </span>
          ))}
        </div>
      ))}
      <div className="kb-row">
        <span className={`kb-key space f-T ${next === ' ' ? 'next' : ''}`}>space</span>
      </div>
    </div>
  );
}
