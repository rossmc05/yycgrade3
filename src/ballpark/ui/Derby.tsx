// Home Run Derby: ten swings, harder questions go farther. Every derby ends with a collector card.

import { useMemo, useRef, useState } from 'react';
import { Icon } from '../../art/sprite';
import { AvatarArt } from '../../avatar/AvatarArt';
import { lookOf } from '../../avatar/catalog';
import { Celebrate, FxLayer, type FxHandle } from '../../battle/fx';
import { useMusic } from '../../battle/music';
import { sfx } from '../../battle/sfx';
import { stopSpeaking } from '../../engine/speech';
import { useStore } from '../../engine/store';
import type { Question, Skill, SubjectId } from '../../engine/types';
import { go } from '../../router';
import { ballOf, payout, type Payout } from '../data';
import { DERBY_SWINGS, derbyCoins, derbyHit, derbyLuck, derbyTotal, FENCE, type DerbyHit } from '../derby';
import { SWINGS, tierLevel, type Swing } from '../game';
import { ballPerks } from '../gear';
import { ask, BALL_SUBJECTS, levelOf, planSkills, recordBall, XP_RIGHT, XP_WRONG } from '../questions';
import { Ask } from './Ask';
import { BallBar } from './BallBar';
import { CardReveal } from './Card';
import { Field, OnField, SPOTS, TheirPlayer } from './Field';

const DIFF = ['Easier', 'Your level', 'Harder', 'Hardest'];
const FEET: Record<Swing, string> = { contact: '240–345 ft', line: '305–395 ft', power: '355–440 ft', homer: '410–495 ft' };

export function Derby() {
  const [subjects, setSubjects] = useState<SubjectId[] | null>(null);
  const [round, setRound] = useState(0);
  if (!subjects) return <DerbySetup onStart={setSubjects} />;
  return <DerbyRound key={round} subjects={subjects} again={() => setRound((r) => r + 1)} />;
}

function DerbySetup({ onStart }: { onStart: (s: SubjectId[]) => void }) {
  const { profile } = useStore();
  const [subjects, setSubjects] = useState<SubjectId[]>(BALL_SUBJECTS.map((s) => s.id));
  useMusic('ballpark');
  if (!profile) return null;
  const best = ballOf(profile).derby;
  const toggle = (id: SubjectId) => setSubjects((s) => (s.includes(id) ? (s.length > 1 ? s.filter((x) => x !== id) : s) : [...s, id]));
  return (
    <main className="page ballpark">
      <BallBar back={() => go('')} />
      <section className="card center setup">
        <h1><Icon e="💥" /> Home Run Derby</h1>
        <p className="muted">Ten swings. Harder questions hit the ball farther. The fence is {FENCE} feet away. Your score is the total feet of your home runs.</p>
        <h3>Questions from</h3>
        <div className="subject-chips">
          {BALL_SUBJECTS.map((s) => (
            <button key={s.id} className={`subject-chip ${subjects.includes(s.id) ? 'on' : ''}`} style={{ ['--tile' as string]: s.color }} onClick={() => toggle(s.id)} aria-pressed={subjects.includes(s.id)}>
              <Icon e={s.icon} /> {s.name}
            </button>
          ))}
        </div>
        {best.plays > 0 && <p className="muted">Your best: {best.bestFeet} ft ({best.bestHrs} home runs). Longest: {best.longest} ft.</p>}
        <p>Every derby earns a collector card. More home runs make a rarer card likelier!</p>
        <button className="btn primary big" onClick={() => { sfx.unlock(); onStart(subjects); }}>💥 Start the derby</button>
      </section>
    </main>
  );
}

function DerbyRound({ subjects, again }: { subjects: SubjectId[]; again: () => void }) {
  const { profile, data, updateProfile } = useStore();
  const ball = ballOf(profile!);
  const perks = useMemo(() => ballPerks(ball.gearOn), []);
  const [plan] = useState(() => planSkills(profile!, subjects, 40, Math.random, Date.now()));
  const [hits, setHits] = useState<DerbyHit[]>([]);
  const [atBat, setAtBat] = useState<{ skill: Skill; level: number; clock?: number; swing: Swing; q: Question } | null>(null);
  const [last, setLast] = useState<DerbyHit | null>(null);
  const [xp, setXp] = useState(0);
  const [result, setResult] = useState<Payout | null>(null);
  const used = useRef(new Set<string>());
  const fx = useRef<FxHandle>(null);
  useMusic(result ? undefined : 'ballpark');
  if (!profile) return null;

  const n = hits.length;
  const skill = plan[n];
  const lvl = levelOf(profile, skill);
  const total = derbyTotal(hits);

  const choose = (swing: Swing, offset: number) => {
    sfx.unlock();
    setLast(null);
    const t = tierLevel(skill.levels.length, lvl, offset);
    setAtBat({ skill, level: t.level, clock: t.clock, swing, q: ask(profile, skill, t.level, used.current) });
  };

  const onAnswer = (correct: boolean, seconds: number) => {
    if (!atBat) return;
    const h = derbyHit(atBat.swing, correct, Math.random, perks);
    setLast(h);
    setXp((x) => x + (correct ? XP_RIGHT : XP_WRONG));
    const now = Date.now();
    updateProfile((p) => recordBall(p, atBat.skill, atBat.q, correct, seconds, atBat.level, now));
    if (h.hr) { sfx.special(); setTimeout(() => fx.current?.burst('confetti', 0.5, 0.15), 1000); }
    else if (h.feet) sfx.hit();
    else sfx.ouch();
  };

  const next = () => {
    stopSpeaking();
    if (!last) return;
    const all = [...hits, last];
    setHits(all);
    setAtBat(null);
    if (all.length >= DERBY_SWINGS) {
      const t = derbyTotal(all);
      const out = payout(ball, xp, derbyCoins(t), derbyLuck(t, perks), perks.coinBonus ?? 0, Math.random, Date.now());
      const d = out.ball.derby;
      const derby = { plays: d.plays + 1, bestFeet: Math.max(d.bestFeet, t.feet), bestHrs: Math.max(d.bestHrs, t.hrs), longest: Math.max(d.longest, t.longest) };
      updateProfile((p) => ({ ...p, ball: { ...out.ball, derby } }));
      setResult(out.payout);
      sfx.fanfare();
    }
  };

  if (result) {
    const best = total.feet > ball.derby.bestFeet && ball.derby.plays > 0;
    return (
      <main className="page ballpark">
        <BallBar back={() => go('')} />
        <section className="card center summary final">
          <Celebrate big={total.hrs >= 5} />
          <h1>{total.hrs} home run{total.hrs === 1 ? '' : 's'}!</h1>
          <p className="final-score"><b>{total.feet}</b> <span>total feet</span></p>
          {best && <p className="good">New personal best!</p>}
          <div className="derby-dots">{hits.map((h, i) => <span key={i} className={h.hr ? 'hr' : h.feet ? 'in' : 'miss'} title={h.feet ? `${h.feet} ft` : 'Miss'}>{h.hr ? h.feet : h.feet ? '·' : '✕'}</span>)}</div>
          <div className="loot-row">
            <div><strong>{total.longest || '—'}</strong><span>longest ft</span></div>
            <div><strong>+{result.xp}</strong><span>XP</span></div>
            <div><strong>+{result.coins}</strong><span>coins</span></div>
          </div>
          {result.rankUp && <p className="good"><Icon e="🎉" /> You were promoted to {result.rankUp}! Here's a bonus card.</p>}
          {result.pulls.map((c, i) => (
            <CardReveal key={i} player={c.player} parallel={c.parallel} serial={c.serial} isNew={c.isNew} coins={c.coins} label={i === 0 ? 'Derby collector card' : 'Promotion bonus'} />
          ))}
          <div className="row">
            <button className="btn ghost" onClick={() => go('')}>Clubhouse</button>
            <button className="btn primary" onClick={again}>Derby again</button>
          </div>
        </section>
      </main>
    );
  }

  const shown = last ?? (atBat ? null : hits.at(-1));
  return (
    <main className="page ballpark match">
      <BallBar back={() => { if (window.confirm('Leave the derby? You keep what you learned, but not the coins or the card.')) go(''); }} />
      <section className="derby-board">
        <div><small>Swing</small><b>{Math.min(n + 1, DERBY_SWINGS)}/{DERBY_SWINGS}</b></div>
        <div><small>Home runs</small><b>{total.hrs + (last?.hr ? 1 : 0)}</b></div>
        <div><small>Total feet</small><b>{total.feet + (last?.hr ? last.feet : 0)}</b></div>
        {shown && <div className="last-hit"><small>Last</small><b>{shown.feet ? `${shown.feet} ft` : 'Miss'}</b></div>}
      </section>
      <Field bases={[false, false, false]} play={last ? { id: n + 1, kind: last.hr ? 'hr' : last.feet ? (last.feet > 300 ? 'fly' : 'single') : 'strikeout' } : undefined} runner="#fff">
        <OnField {...SPOTS.mound} className="small"><TheirPlayer color="#475569" trim="#e2e8f0" pose="pitch" size={54} /></OnField>
        <OnField {...SPOTS.plate}><AvatarArt look={lookOf(profile)} size={76} background={false} full /></OnField>
        {last && last.feet > 0 && <span className={`distance ${last.hr ? 'hr' : ''}`}>{last.feet} ft{last.hr ? '!' : ''}</span>}
        <FxLayer ref={fx} />
      </Field>
      {!atBat && (
        <section className="card choose">
          <p className="at-bat">Pick your swing <span className="chip">{skill.icon} {skill.name}</span></p>
          <div className="swing-grid">
            {SWINGS.map((s, i) => {
              const t = tierLevel(skill.levels.length, lvl, s.offset);
              return (
                <button key={s.id} className={`swing s-${s.id}`} onClick={() => choose(s.id, s.offset)}>
                  <strong>{FEET[s.id]}</strong>
                  <span>{s.name}</span>
                  <small>{DIFF[i]} · {skill.levels[t.level]}{t.clock ? ` · ⏱️ ${t.clock}s` : ''}</small>
                </button>
              );
            })}
          </div>
        </section>
      )}
      {atBat && (
        <Ask key={n} q={atBat.q} skill={atBat.skill} level={atBat.level} clock={atBat.clock} readAloud={data.settings.readAloud} onAnswer={onAnswer} onNext={next} nextLabel={n + 1 >= DERBY_SWINGS ? 'Finish the derby →' : 'Next swing →'}>
          {last && <p className={`play-call ${last.hr ? 'good-call' : 'bad-call'}`}><strong>{last.hr ? `HOME RUN! ${last.feet} feet!` : last.feet ? `${last.feet} feet. ${last.feet >= 300 ? 'Caught at the wall, just short!' : 'Caught in the outfield.'}` : 'Swing and a miss!'}</strong></p>}
        </Ask>
      )}
    </main>
  );
}
