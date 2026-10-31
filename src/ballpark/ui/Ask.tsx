// One question, one try: the answer decides the play. A wrong answer shows the right one and why.

import { useEffect, useRef, useState } from 'react';
import { VisualView } from '../../components/Visuals';
import { speak } from '../../engine/speech';
import type { Question, Skill } from '../../engine/types';
import { Keypad, LetterKeys, normalize, OrderPicker, type Phase } from '../../screens/Play';

export function Ask({ q, skill, level, clock, readAloud, onAnswer, onNext, onSkip, nextLabel = 'Next →', children }: {
  q: Question;
  skill: Skill;
  level: number;
  /** Seconds to answer, for the hardest swings. */
  clock?: number;
  readAloud: boolean;
  onAnswer: (correct: boolean, seconds: number) => void;
  onNext: () => void;
  nextLabel?: string;
  /** "Haven't learned this yet": swap in a question from another topic, with no out. */
  onSkip?: () => void;
  /** Shown with the feedback, e.g. what happened on the field. */
  children?: React.ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>('ask');
  const [value, setValue] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [left, setLeft] = useState(clock ?? 0);
  const [late, setLate] = useState(false);
  const start = useRef(Date.now());
  const done = phase !== 'ask';

  useEffect(() => {
    if (readAloud || q.say) speak(q.say ?? q.prompt);
  }, [q]);

  const submit = (answer: string | null) => {
    if (done) return;
    if (answer !== null && !normalize(answer)) return;
    const ok = answer !== null && (q.input === 'choice' ? answer === q.answer : normalize(answer) === normalize(q.answer));
    setPhase(ok ? 'right' : 'shown');
    onAnswer(ok, (Date.now() - start.current) / 1000);
    if (!ok && readAloud) speak(q.explain);
  };

  // The pitch clock: when it runs out, it's a strike.
  useEffect(() => {
    if (!clock || done) return;
    const t = setInterval(() => {
      const l = clock - (Date.now() - start.current) / 1000;
      setLeft(Math.max(0, l));
      if (l <= 0) {
        setLate(true);
        submit(null);
      }
    }, 200);
    return () => clearInterval(t);
  }, [clock, done]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (done) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNext(); }
        return;
      }
      if (q.input === 'text') {
        if (/^[a-zA-Z' ]$/.test(e.key)) setValue((v) => (v.length < 24 ? v + e.key.toLowerCase() : v));
        else if (e.key === 'Backspace') setValue((v) => v.slice(0, -1));
        else if (e.key === 'Enter') submit(value);
      } else if (q.input === 'number') {
        if (/^[0-9]$/.test(e.key)) setValue((v) => (v.length < 7 ? v + e.key : v));
        else if (e.key === 'Backspace') setValue((v) => v.slice(0, -1));
        else if (e.key === 'Enter') submit(value);
      } else if (q.input === 'choice' && q.choices && /^[1-9]$/.test(e.key)) {
        const c = q.choices[Number(e.key) - 1];
        if (c) { setPicked(c); submit(c); }
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  const unitBefore = q.unit === '$';
  return (
    <section className={`card question ball-q ${phase}`}>
      <div className="q-head">
        <span className="chip">{skill.icon} {skill.name} · {skill.levels[level]}</span>
        <button className="icon-btn" onClick={() => speak(q.say ?? q.prompt)} aria-label="Read aloud">🔊</button>
      </div>
      {clock && !done && (
        <div className="pitch-clock" aria-label={`${Math.ceil(left)} seconds left`}>
          <span style={{ width: `${(left / clock) * 100}%` }} />
          <b>⏱️ {Math.ceil(left)}</b>
        </div>
      )}
      <h2 className="prompt">{q.prompt}</h2>
      {q.visual && <div className="visual-wrap"><VisualView v={q.visual} /></div>}

      {q.input === 'choice' && q.choices && (
        <div className={`choices ${q.choices.length <= 3 ? 'few' : ''}`}>
          {q.choices.map((c) => (
            <button
              key={c}
              className={`choice ${done && c === q.answer ? 'correct' : picked === c && phase === 'shown' ? 'wrong' : ''}`}
              disabled={done}
              onClick={() => { setPicked(c); submit(c); }}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      {q.input === 'order' && q.choices && <OrderPicker q={q} done={done} phase={phase} onSubmit={submit} />}
      {(q.input === 'number' || q.input === 'text') && (
        <>
          <div className="answer-box">
            {unitBefore && <span className="unit">$</span>}
            <span className={`answer-value ${value ? '' : 'empty'} ${q.input === 'text' ? 'word' : ''}`}>{phase === 'shown' ? q.answer : value || '?'}</span>
            {q.unit && !unitBefore && <span className="unit">{q.unit}</span>}
          </div>
          {!done && q.input === 'number' && <Keypad value={value} setValue={setValue} onEnter={() => submit(value)} />}
          {!done && q.input === 'text' && <LetterKeys value={value} setValue={setValue} onEnter={() => submit(value)} />}
        </>
      )}

      {!done && onSkip && (
        <button className="btn ghost skip-topic" onClick={onSkip}>🙋 Haven't learned this yet</button>
      )}
      {done && (
        <div className={`feedback ${phase === 'right' ? 'right' : 'shown'}`} role="status">
          {children}
          {phase === 'shown' && (
            <>
              <strong>{late ? 'Time ran out! ' : ''}The answer is {unitBefore ? '$' : ''}{q.answer}{q.unit && !unitBefore ? ` ${q.unit}` : ''}.</strong>
              <p>{q.explain}</p>
            </>
          )}
          <button className="btn primary" onClick={onNext} autoFocus>{nextLabel}</button>
        </div>
      )}
    </section>
  );
}
