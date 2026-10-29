import { Icon } from '../art/sprite';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { VisualView } from '../components/Visuals';
import { isReviewDue, newSkillState } from '../engine/adaptive';
import { applyAnswer, closeReviews, freshQuestion, planMix, planSkill, type Planned } from '../engine/progress';
import { checkBadges, type BadgeDef } from '../engine/rewards';
import { speak, stopSpeaking } from '../engine/speech';
import { useStore } from '../engine/store';
import type { Question, Skill } from '../engine/types';
import { go } from '../router';
import { ALL_SKILLS, findSkill, findSubject } from '../subjects';
import { AvatarArt } from '../avatar/AvatarArt';
import { lookOf } from '../avatar/catalog';
import { BattleStage, type StageEvent } from '../battle/BattleStage';
import { Celebrate } from '../battle/fx';
import { useMusic, type Theme } from '../battle/music';
import { MonsterArt } from '../battle/Art';
import { applyTurn, startBattle, type Battle } from '../battle/engine';
import { gearById, perksOf } from '../collect/gear';
import { DUPLICATE_COINS, palById, rollPal, type Pal } from '../collect/pals';
import { PalReveal } from '../collect/PalReveal';
import { setSound, sfx } from '../battle/sfx';
import { dailySubject, zoneFor } from '../battle/zones';

const CHEERS = ['Awesome!', 'You got it!', 'Super!', 'Nailed it!', 'Brilliant!', 'Great thinking!', 'Way to go!', 'Yes!'];

/** Strip spaces and thousands separators so "12 345" and "12345" match. */
export function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[‘’]/g, "'").replace(/[\s,]/g, '').replace(/^\$/, '').replace(/¢$/, '');
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
  const { profile, data, setData, updateProfile } = useStore();
  const subject = findSubject(subjectId);
  const pool: Skill[] = useMemo(
    () => {
      if (subjectId !== 'all') return subject?.skills ?? [];
      // The daily warm-up is one subject a day, rotating (or within the parent's focus list).
      return findSubject(dailySubject(Date.now(), data.settings.focus))?.skills ?? [];
    },
    [subjectId, subject, data.settings.focus],
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
  const [found, setFound] = useState<{ pal: Pal; isNew: boolean } | null>(null);
  const [finished, setFinished] = useState(false);
  const [showLearn, setShowLearn] = useState(() => !!single?.learn && !profile?.skills[single.id]?.history.length);

  // Battle mode: one zone per session, from the session's subject.
  const zone = data.settings.battle === false ? undefined : zoneFor(plan[0]?.skill.subject ?? 'typing');
  const [battle, setBattle] = useState<Battle>(() => startBattle(plan.length, zone?.monsters ?? ['x'], Math.random));
  const [stageEvent, setStageEvent] = useState<StageEvent | null>(null);
  const eventId = useRef(0);
  const soundOn = data.settings.sound !== false;
  // Zone music during the battle; it stops at the victory screen for the fanfare.
  useMusic(zone && !finished ? (zone.subject as Theme) : undefined);
  useEffect(() => setSound(soundOn), [soundOn]);

  const onResult = (r: 'right1' | 'wrong1' | 'right2' | 'wrong2', seconds: number) => {
    if (!zone) return;
    sfx.unlock();
    eventId.current += 1;
    if (r === 'wrong1') {
      setStageEvent({ id: eventId.current, kind: 'attack', damage: 0, heal: 0, finished: false, coins: 0, foe: battle.current });
      return;
    }
    const outcome = r === 'right1' ? 'first' : r === 'right2' ? 'block' : 'miss';
    const t = applyTurn(battle, outcome, seconds, plan.length - index, perksOf(profile?.gearOn));
    setBattle(t.battle);
    setStageEvent({ id: eventId.current, ...t.event, foe: battle.current });
  };

  const back = () => {
    stopSpeaking();
    go(...(subjectId === 'all' ? [''] : [data.settings.battle === false || subjectId === 'typing' ? 'subject' : 'zone', subjectId]));
  };

  // Generate each question when it is reached, so it uses the latest level.
  const [question, setQuestion] = useState<Question | null>(null);
  const used = useRef(new Set<string>());
  const step = plan[index];
  useEffect(() => {
    if (!step || !profile) return;
    if (step.retry) {
      setQuestion(step.retry);
      return;
    }
    const state = profile.skills[step.skill.id];
    const level = (state ?? newSkillState()).level;
    const q = freshQuestion(step.skill, state, level, Math.random, { spellingList: profile.spellingList ?? [] }, used.current);
    used.current.add(q.key);
    setQuestion(q);
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
      // Coins dropped by monsters in battle mode.
      if (zone) nextProfile = { ...nextProfile, coins: nextProfile.coins + battle.coins };
      // A pal turns up after any battle where a monster was beaten.
      const beat = battle.foes.filter((f) => f.end === 'defeated' || f.hp === 0);
      const pal = zone && beat.length ? rollPal(zone.subject, beat.some((f) => f.boss), Math.random) : undefined;
      if (pal) {
        const had = nextProfile.pals?.[pal.id] ?? 0;
        nextProfile = { ...nextProfile, pals: { ...nextProfile.pals, [pal.id]: had + 1 }, coins: nextProfile.coins + (had ? DUPLICATE_COINS : 0) };
        setFound({ pal, isNew: !had });
      }
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

  if (showLearn && single?.learn) {
    return (
      <main className="page">
        <TopBar back={back} />
        <section className="card learn">
          <h1>{single.icon} {single.name}</h1>
          <p className="muted">Let's learn a little first.</p>
          <ul>
            {single.learn.map((line) => <li key={line}>{line}</li>)}
          </ul>
          <div className="row">
            <button className="btn ghost" onClick={() => speak(single.learn!.join(' '))}>🔊 Read to me</button>
            <button className="btn primary" onClick={() => { stopSpeaking(); setShowLearn(false); }}>I'm ready!</button>
          </div>
        </section>
      </main>
    );
  }

  if (finished && zone) {
    const right = results.filter((r) => r.correct).length;
    const beaten = battle.foes.filter((f) => f.end === 'defeated');
    return (
      <main className="page">
        <TopBar back={back} />
        <section className={`card center summary victory zone-${zone.subject}`}>
          {!data.settings.classicLook && beaten.length > 0 && <Celebrate big={beaten.length === battle.foes.length} />}
          <div className="victory-hero">
            <AvatarArt look={lookOf(profile)} size={140} background={false} />
          </div>
          <h1>{beaten.length === battle.foes.length ? 'Victory!' : beaten.length ? 'Battle won!' : 'They got away!'}</h1>
          <p className="muted">{zone.name}</p>
          {found && <PalReveal pal={found.pal} isNew={found.isNew} />}
          <div className="beaten-row">
            {battle.foes.map((f, i) => (
              <div key={i} className={`beaten ${f.end}`}>
                <MonsterArt subject={zone.subject} kind={f.kind} hurt size={70} />
                <small>{f.name}</small>
                <small className={f.end === 'defeated' ? 'good' : 'muted'}>{f.end === 'defeated' ? 'Defeated' : 'Got away'}</small>
              </div>
            ))}
          </div>
          <div className="loot-row">
            <div><strong>{right}/{results.length}</strong><span>first try</span></div>
            <div><strong>+{xpEarned}</strong><span>XP</span></div>
            <div><strong>+{Math.ceil(xpEarned / 2) + battle.coins}</strong><span>coins</span></div>
            <div><strong>{battle.crits + battle.specials}</strong><span>big hits</span></div>
          </div>
          {levelUps.length > 0 && <p className="good">⬆️ Level up in {[...new Set(levelUps)].join(', ')}!</p>}
          {mastered.length > 0 && <p className="good">⭐ You mastered {mastered.join(', ')}!</p>}
          {badges.length > 0 && (
            <div className="badge-row">
              {badges.map((b) => (
                <div key={b.id} className="badge earned pop">
                  <span className="badge-icon"><Icon e={b.icon} size="1em" /></span>
                  <span>{b.name}</span>
                </div>
              ))}
            </div>
          )}
          <div className="row">
            <button className="btn ghost" onClick={back}>Done</button>
            <button className="btn primary" onClick={again}>Battle again</button>
          </div>
        </section>
      </main>
    );
  }

  if (finished) {
    const right = results.filter((r) => r.correct).length;
    return (
      <main className="page">
        <TopBar back={back} />
        <section className="card center summary">
          <div className="big-emoji"><Icon e={right === results.length ? '🏆' : right >= results.length * 0.7 ? '🌟' : '💪'} size="1em" /></div>
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
                  <span className="badge-icon"><Icon e={b.icon} size="1em" /></span>
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
      {zone && (
        <>
          <BattleStage zone={zone} battle={battle} event={stageEvent} look={lookOf(profile)} buddy={palById(profile.buddy)?.e} weapon={gearById(profile.gearOn?.weapon)?.e} />
          <button className="sound-toggle" onClick={() => setData((d) => ({ ...d, settings: { ...d.settings, sound: !soundOn } }))} aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}>
            {soundOn ? '🔊' : '🔇'}
          </button>
        </>
      )}
      {question && step && (
        <QuestionCard
          key={`${index}-${question.key}`}
          q={question}
          skill={step.skill}
          level={(profile.skills[step.skill.id] ?? newSkillState()).level}
          readAloud={data.settings.readAloud}
          onDone={onDone}
          onResult={onResult}
        />
      )}
    </main>
  );
}

function QuestionCard({ q, skill, level, readAloud, onDone, onResult }: {
  q: Question;
  skill: Skill;
  level: number;
  readAloud: boolean;
  onDone: (firstTry: boolean, solved: boolean, seconds: number) => void;
  onResult?: (r: 'right1' | 'wrong1' | 'right2' | 'wrong2', seconds: number) => void;
}) {
  const [phase, setPhase] = useState<Phase>('ask');
  const [value, setValue] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [cheer] = useState(() => CHEERS[Math.floor(Math.random() * CHEERS.length)]);
  const start = useRef(Date.now());
  const tries = useRef(0);

  const sayIt = () => speak(q.say ?? q.prompt);
  useEffect(() => {
    // Spelling questions always speak: the word is not shown on screen.
    if (readAloud || q.say) sayIt();
  }, [q, readAloud]);

  const submit = (answer: string) => {
    if (phase === 'right' || phase === 'shown') return;
    if (!normalize(answer)) return;
    tries.current += 1;
    const ok = q.input === 'choice' ? answer === q.answer : normalize(answer) === normalize(q.answer);
    const secs = (Date.now() - start.current) / 1000;
    onResult?.(ok ? (tries.current === 1 ? 'right1' : 'right2') : tries.current === 1 ? 'wrong1' : 'wrong2', secs);
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
      if (q.input === 'text') {
        if (/^[a-zA-Z' ]$/.test(e.key)) setValue((v) => (v.length < 24 ? v + e.key.toLowerCase() : v));
        else if (e.key === 'Backspace') setValue((v) => v.slice(0, -1));
        else if (e.key === 'Enter') submit(value);
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
        <button className="icon-btn" onClick={sayIt} aria-label="Read aloud">
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
            const cls = done && c === q.answer ? 'correct' : picked === c && phase !== 'ask' ? 'wrong' : '';
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

      {q.input === 'order' && q.choices && <OrderPicker q={q} done={done} phase={phase} onSubmit={submit} />}

      {(q.input === 'number' || q.input === 'text') && (
        <>
          <div className="answer-box">
            {unitBefore && <span className="unit">$</span>}
            <span className={`answer-value ${value ? '' : 'empty'} ${q.input === 'text' ? 'word' : ''}`}>{done && phase === 'shown' ? q.answer : value || '?'}</span>
            {q.unit && !unitBefore && <span className="unit">{q.unit}</span>}
          </div>
          {!done && q.input === 'number' && <Keypad value={value} setValue={setValue} onEnter={() => submit(value)} />}
          {!done && q.input === 'text' && <LetterKeys value={value} setValue={setValue} onEnter={() => submit(value)} />}
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

export function Keypad({ value, setValue, onEnter }: { value: string; setValue: (fn: (v: string) => string) => void; onEnter: () => void }) {
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

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

export function LetterKeys({ value, setValue, onEnter }: { value: string; setValue: (fn: (v: string) => string) => void; onEnter: () => void }) {
  const press = (k: string) => setValue((v) => (v.length < 24 ? v + k : v));
  return (
    <div className="letter-keys">
      {ROWS.map((row, i) => (
        <div key={i} className="letter-row">
          {i === 2 && <button className="wide" onClick={() => press("'")}>'</button>}
          {row.split('').map((k) => (
            <button key={k} onClick={() => press(k)}>{k}</button>
          ))}
          {i === 2 && <button className="wide key-back" onClick={() => setValue((v) => v.slice(0, -1))} aria-label="Delete">⌫</button>}
        </div>
      ))}
      <div className="letter-row">
        <button className="space" onClick={() => press(' ')}>space</button>
        <button className="wide key-go" onClick={onEnter} disabled={!value.trim()}>✓</button>
      </div>
    </div>
  );
}

function OrderPicker({ q, done, phase, onSubmit }: { q: Question; done: boolean; phase: Phase; onSubmit: (a: string) => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const items = q.choices ?? [];
  // After a wrong try, clear so the child can rebuild it.
  useEffect(() => {
    if (phase === 'hint') setPicked([]);
  }, [phase]);
  const shown = done ? q.answer.split(' → ') : picked;
  const tap = (c: string) => {
    const next = [...picked, c];
    setPicked(next);
    if (next.length === items.length) onSubmit(next.join(' → '));
  };
  return (
    <div className="order">
      <ol className="order-slots">
        {items.map((_, i) => (
          <li key={i} className={shown[i] ? 'filled' : ''}>{shown[i] ?? ''}</li>
        ))}
      </ol>
      {!done && (
        <>
          <div className="choices">
            {items.map((c) => (
              <button key={c} className="choice" disabled={picked.includes(c)} onClick={() => tap(c)}>{c}</button>
            ))}
          </div>
          <button className="link" onClick={() => setPicked([])} disabled={!picked.length}>Start over</button>
        </>
      )}
    </div>
  );
}
