// Go on a Ride: ten questions, each read aloud. A right answer and her unicorn leaps a rainbow.
// A wrong answer gets a gentle "try again", the wrong picture fades, and nothing is taken away.

import { useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../../battle/sfx';
import { isReviewDue } from '../../engine/adaptive';
import { closeReviews } from '../../engine/progress';
import { useStore } from '../../engine/store';
import type { Question, Skill } from '../../engine/types';
import { go } from '../../router';
import { nameOf } from '../../subjects/kindergarten/pics';
import { bank, meadowOf, POINTS_RETRY, POINTS_RIGHT, RIDE_BONUS, RIDE_LENGTH, STAR_BONUS, STAR_LENGTH, XP_RETRY, XP_RIGHT, type Payout } from '../data';
import { askK, planRide, recordK } from '../questions';
import { unicornById, UNICORNS } from '../unicorns';
import { hush, orList, praise, say, tryAgain } from '../voice';
import { Pic } from './Pic';
import { RideEnd } from './RideEnd';
import { UnicornArt } from './UnicornArt';

type Phase = 'ask' | 'oops' | 'show' | 'yay';

/** What the voice reads for a question: the question, then the picture names. */
export function spokenQuestion(q: Question): string[] {
  const lines = [q.say ?? q.prompt];
  // Only where hearing the names is the skill (rhymes, first sounds); elsewhere it would give the answer away.
  if (q.sayChoices && q.labels) lines.push(`Is it ${orList(q.labels)}?`);
  return lines;
}

export function Ride({ mode = 'ride' }: { mode?: 'ride' | 'stars' }) {
  const { profile, updateProfile } = useStore();
  const length = mode === 'stars' ? STAR_LENGTH : RIDE_LENGTH;
  const meadow = meadowOf(profile!);
  const rider = unicornById(meadow.rider) ?? UNICORNS[0];
  const [plan] = useState(() => planRide(profile!, length, Math.random, Date.now()));
  const [wasDue] = useState(() => new Set(plan.filter((s) => isReviewDue(profile!.skills[s.id], Date.now())).map((s) => s.id)));
  const used = useRef(new Set<string>());
  const [i, setI] = useState(0);
  const [q, setQ] = useState<Question>(() => askK(profile!, plan[0], used.current));
  const [phase, setPhase] = useState<Phase>('ask');
  const [wrong, setWrong] = useState<string[]>([]);
  const [tally, setTally] = useState({ xp: 0, points: 0, firstTry: 0, run: 0, bestRun: 0 });
  const [payout, setPayout] = useState<Payout | null>(null);
  const results = useRef<{ skillId: string; correct: boolean }[]>([]);
  const started = useRef(Date.now());
  const skill: Skill = plan[i];

  const read = () => { void say(...spokenQuestion(q)); };
  useEffect(() => { if (!payout) read(); }, [q]);
  useEffect(() => () => hush(), []);

  // The latest profile, for answers that land after a timer.
  const latest = useRef(profile!);
  latest.current = profile!;

  const finish = (t: typeof tally, early = false) => {
    const banked = bank(meadowOf(latest.current), t.xp, t.points, { right: i + 1, firstTry: t.firstTry, asked: length, bestRun: t.bestRun }, early ? 0 : mode === 'stars' ? STAR_BONUS : RIDE_BONUS, !early && mode === 'ride');
    updateProfile((p) => closeReviews({ ...p, meadow: banked.meadow }, results.current, wasDue, Date.now()));
    if (early) return go('');
    setPayout(banked.payout);
  };

  const next = (t: typeof tally) => {
    if (i + 1 >= length) return finish(t);
    const n = i + 1;
    setI(n);
    setWrong([]);
    setPhase('ask');
    started.current = Date.now();
    setQ(askK(latest.current, plan[n], used.current));
  };

  const tap = (c: string) => {
    if (phase === 'yay' || wrong.includes(c)) return;
    sfx.unlock();
    if (c === q.answer) {
      const first = wrong.length === 0;
      const run = first ? tally.run + 1 : 0;
      const t = {
        xp: tally.xp + (first ? XP_RIGHT : XP_RETRY),
        points: tally.points + (first ? POINTS_RIGHT : POINTS_RETRY),
        firstTry: tally.firstTry + (first ? 1 : 0),
        run,
        bestRun: Math.max(tally.bestRun, run),
      };
      setTally(t);
      setPhase('yay');
      sfx.coin();
      results.current.push({ skillId: skill.id, correct: first });
      updateProfile((p) => recordK(p, skill, q, first, (Date.now() - started.current) / 1000, Date.now()));
      const cheer = run >= 3 && run % 3 === 0 ? `${run} in a row! ${praise()}` : praise();
      void say(cheer).then(() => setTimeout(() => next(t), 350));
      return;
    }
    // Wrong: gentle help, no penalty.
    sfx.block();
    const tried = [...wrong, c];
    setWrong(tried);
    const left = (q.choices ?? []).filter((x) => !tried.includes(x));
    if (tried.length >= 2 || left.length <= 1) {
      setPhase('show');
      const name = q.labels ? q.labels[q.choices!.indexOf(q.answer)] : q.answer;
      void say(`${q.explain}`, q.labels ? `Tap the ${name}.` : `Tap it!`);
    } else {
      setPhase('oops');
      void say(tryAgain(), q.hint);
    }
  };

  const leave = () => {
    hush();
    if (tally.xp) finish(tally, true);
    else go('');
  };

  const choices = q.choices ?? [];
  const many = useMemo(() => choices.some((c) => /^\d+×/.test(c)), [q]);

  if (payout) return <RideEnd payout={payout} mode={mode} firstTry={tally.firstTry} asked={length} />;

  return (
    <main className={`ride ${mode}`}>
      <header className="ride-top">
        <button className="round-btn" onClick={leave} aria-label="Back to the meadow">🏠</button>
        <div className="trail" aria-label={`Question ${i + 1} of ${length}`}>
          {Array.from({ length }, (_, k) => (
            <span key={k} className={`stone ${k < i || (k === i && phase === 'yay') ? 'done' : k === i ? 'now' : ''}`}>{mode === 'stars' ? '⭐' : ''}</span>
          ))}
          <span className="trail-end">{mode === 'stars' ? '🌙' : '🏰'}</span>
        </div>
        <span className="points-pill" aria-label={`${meadow.points + tally.points} stars`}>⭐ {meadow.points + tally.points}</span>
      </header>

      <section className={`ride-scene ${phase === 'yay' ? 'leap' : ''}`} aria-hidden="true">
        {mode === 'stars' ? (
          <>
            <span className="moon">🌙</span>
            {[12, 30, 48, 66, 84].map((x, k) => <span key={x} className="falling" style={{ left: `${x}%`, ['--k' as string]: k }}>⭐</span>)}
            <span className="jar" aria-hidden="true">🫙<b>{i + (phase === 'yay' ? 1 : 0)}</b></span>
          </>
        ) : <div className="scene-rainbow" />}
        <div className="ride-unicorn"><UnicornArt unicorn={rider} outfit={meadow.outfits[rider.id]} size={150} /></div>
        {phase === 'yay' && <div className="sparkles">{['✨', '⭐', '💖', '✨', '🌟'].map((s, k) => <span key={k} style={{ ['--k' as string]: k }}>{s}</span>)}</div>}
      </section>

      <section className="ask">
        <div className="ask-head">
          <button className="say-btn" onClick={read} aria-label="Hear it again">🔊</button>
          <p className="prompt">{q.prompt}</p>
        </div>
        {q.visual && (
          <div className={`k-visual ${q.visual.kind}`}>
            {q.visual.kind === 'k-groups' && q.visual.groups.map((g) => <Pic key={g} token={g} size={88} />)}
            {q.visual.kind === 'k-row' && q.visual.items.map((t, k) => <Pic key={k} token={t} size={q.visual!.kind === 'k-row' && q.visual.items.length === 1 ? 130 : 70} />)}
            {q.visual.kind === 'k-word' && <span className="k-big-word">{q.visual.text}</span>}
          </div>
        )}
        <div className={`choices n${choices.length} ${many ? 'groups' : ''}`}>
          {choices.map((c, k) => {
            const isWrong = wrong.includes(c);
            const glow = (phase === 'show' || phase === 'yay') && c === q.answer;
            return (
              <button
                key={c}
                className={`choice ${isWrong ? 'faded' : ''} ${glow ? 'glow' : ''} ${phase === 'yay' && c === q.answer ? 'right' : ''}`}
                onClick={() => tap(c)}
                disabled={isWrong}
                aria-label={q.labels?.[k] ?? c}
              >
                <Pic token={c} size={many ? 64 : 96} />
              </button>
            );
          })}
        </div>
        {phase === 'oops' && <p className="gentle">Good try! 💜 Try again.</p>}
        {phase === 'show' && <p className="gentle">Here it is! Tap the {q.labels ? q.labels[choices.indexOf(q.answer)] : nameOf(q.answer)}. ✨</p>}
      </section>
    </main>
  );
}
