// The weekly spelling challenge: every word on this week's list, read aloud in a sentence.
// Three perfect rounds before the end of test day unlock a 3-card pack.

import { useState } from 'react';
import { useMusic } from '../../battle/music';
import { sfx } from '../../battle/sfx';
import { stopSpeaking } from '../../engine/speech';
import { useStore } from '../../engine/store';
import type { Question } from '../../engine/types';
import { go } from '../../router';
import { hearAndSpell, SPELLING_SKILLS } from '../../subjects/spelling/skills';
import { ballOf, payout, type Pulled } from '../data';
import { weeklyPlayer } from '../players';
import { recordBall, XP_RIGHT, XP_WRONG } from '../questions';
import { addPerfect, canClaim, challengeOf, claimWeekly, dayLabel, isOpen, PERFECT_NEEDED, progressOf, type WeeklyChallenge } from '../weekly';
import { Ask } from './Ask';
import { BallBar } from './BallBar';
import { BallCard, CardReveal } from './Card';

const SKILL = SPELLING_SKILLS.find((s) => s.id === 'spell.words')!;
/** How the question is labelled. Answers still count for Spelling Words. */
const SHOWN = { ...SKILL, name: 'Weekly Challenge', icon: '🏆', levels: ["This week's words"] };

const shuffle = <T,>(xs: T[]) => xs.map((x) => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

export function Weekly() {
  const { profile, updateProfile } = useStore();
  const [round, setRound] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pulls, setPulls] = useState<Pulled[] | null>(null);
  useMusic('ballpark');
  if (!profile) return null;
  const c = challengeOf(profile);
  const b = ballOf(profile);
  if (!c) return null;
  const pr = progressOf(b, c);
  const open = isOpen(c, Date.now());
  const card = weeklyPlayer(c.date)!;

  if (playing) return <Round key={round} c={c} onDone={() => setPlaying(false)} />;

  const claim = () => {
    const r = claimWeekly(ballOf(profile), c, Math.random, Date.now());
    if (!r.pulls.length) return;
    sfx.fanfare();
    updateProfile((p) => ({ ...p, ball: r.ball }));
    setPulls(r.pulls);
  };

  return (
    <main className="page ballpark binder-page weekly">
      <BallBar back={() => go('')} />
      <section className="album-cover">
        <div className="album-title">
          <small>Weekly Challenge · Test day {dayLabel(c.date)}</small>
          <h1>Spelling Challenge</h1>
        </div>
        <div className="album-count"><b>{Math.min(pr.perfect, PERFECT_NEEDED)}/{PERFECT_NEEDED}</b><span>Perfect rounds</span></div>
        <div className="weekly-balls" aria-label={`${pr.perfect} of ${PERFECT_NEEDED} perfect rounds`}>
          {Array.from({ length: PERFECT_NEEDED }, (_, i) => <span key={i} className={i < pr.perfect ? 'on' : ''}>⚾</span>)}
        </div>
        <p className="album-note">
          {pr.claimed ? 'You claimed this week\'s pack. Great spelling! A new challenge comes with next week\'s list.'
            : !open ? 'This challenge closed after test day. Watch for next week\'s list!'
            : pr.perfect >= PERFECT_NEEDED ? 'Three perfect rounds! Claim your pack.'
            : `Spell all ${c.words.length} words with no mistakes, ${PERFECT_NEEDED} times, before the end of test day. Each word is read out in a sentence. ${PERFECT_NEEDED - pr.perfect} perfect round${PERFECT_NEEDED - pr.perfect === 1 ? '' : 's'} to go.`}
        </p>
        {canClaim(b, c, Date.now()) && !pulls && <button className="btn album-btn claim" onClick={claim}>Claim my 3-card pack</button>}
        {open && !pr.claimed && pr.perfect < PERFECT_NEEDED && <button className="btn album-btn" onClick={() => { sfx.unlock(); setRound((r) => r + 1); setPlaying(true); }}>Start a round</button>}
      </section>

      {pulls ? (
        <section className="album-sec">
          <h2 className="album-head"><span>Your pack</span><small>3 cards</small></h2>
          {pulls.map((p, i) => (
            <CardReveal key={i} player={p.player} parallel={p.parallel} serial={p.serial} isNew={p.isNew} coins={p.coins} label={['Card of the Week', 'Autograph or rarer', 'Refractor or better'][i]} />
          ))}
          <button className="btn album-btn" onClick={() => go('binder')}>See it in the binder</button>
        </section>
      ) : (
        <section className="album-sec weekly-prize">
          <div className="weekly-card"><BallCard player={card} parallel="weekly" /></div>
          <div>
            <h2 className="album-head"><span>The prize</span><small>{pr.claimed ? 'Claimed' : open ? `Until ${dayLabel(c.date)}` : 'Closed'}</small></h2>
            <ul className="weekly-list">
              <li><b>Card of the Week:</b> {card.name}, numbered to 25. Only for this week, and gone forever once it ends.</li>
              <li><b>An Autograph or rarer:</b> could even be a Superfractor or the Babe Ruth.</li>
              <li><b>A Refractor or better.</b></li>
            </ul>
            <p className="album-note">This week's words: {c.words.length}. Practise them in Spell Builder too.</p>
          </div>
        </section>
      )}
    </main>
  );
}

function Round({ c, onDone }: { c: WeeklyChallenge; onDone: () => void }) {
  const { profile, data, updateProfile } = useStore();
  const [qs] = useState<Question[]>(() => shuffle(c.words).map((w) => hearAndSpell(w, c.sentences?.[w], `weekly-${w}`, 'Say it slowly and spell each sound.')));
  const [i, setI] = useState(0);
  const [misses, setMisses] = useState<string[]>([]);
  const [xp, setXp] = useState(0);
  const [end, setEnd] = useState<{ perfect: boolean } | null>(null);
  if (!profile) return null;

  const onAnswer = (correct: boolean, seconds: number) => {
    const q = qs[i];
    updateProfile((p) => recordBall(p, SKILL, q, correct, seconds, 0, Date.now()));
    setXp((x) => x + (correct ? XP_RIGHT : XP_WRONG));
    if (!correct) setMisses((m) => [...m, q.answer]);
    (correct ? sfx.coin : sfx.ouch)();
  };
  const next = () => {
    stopSpeaking();
    if (i + 1 < qs.length) return setI(i + 1);
    const perfect = misses.length === 0;
    updateProfile((p) => {
      const b = ballOf(p);
      const out = payout(perfect ? addPerfect(b, c) : b, xp, 0, null, 0, Math.random, Date.now());
      return { ...p, ball: out.ball };
    });
    if (perfect) sfx.fanfare();
    setEnd({ perfect });
  };

  if (end) {
    return (
      <main className="page ballpark binder-page weekly">
        <BallBar back={onDone} />
        <section className="album-cover">
          <div className="album-title">
            <small>Round complete</small>
            <h1>{end.perfect ? 'Perfect round!' : `${qs.length - misses.length} of ${qs.length}`}</h1>
          </div>
          <p className="album-note">{end.perfect ? 'Every word right. That one counts!' : 'So close! A round only counts when every word is right. Here are the ones to practise:'}</p>
          {!end.perfect && <p className="weekly-misses">{misses.map((w) => <span key={w}>{w}</span>)}</p>}
          <button className="btn album-btn" onClick={onDone}>Back to the challenge</button>
        </section>
      </main>
    );
  }

  return (
    <main className="page ballpark weekly-round">
      <BallBar back={() => { if (window.confirm('Stop this round? It won\'t count.')) { stopSpeaking(); onDone(); } }} />
      <div className="weekly-progress"><span style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      <p className="weekly-count">Word {i + 1} of {qs.length}{misses.length ? ` · ${misses.length} missed` : ' · perfect so far'}</p>
      <Ask key={i} q={qs[i]} skill={SHOWN} level={0} readAloud={data.settings.readAloud} onAnswer={onAnswer} onNext={next} nextLabel={i + 1 < qs.length ? 'Next word →' : 'Finish the round →'} />
    </main>
  );
}
