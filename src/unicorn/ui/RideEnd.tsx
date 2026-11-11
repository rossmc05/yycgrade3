// The end of a ride: a treasure chest of stars, how close the next unicorn is,
// then a celebration for any unicorn or Moment that arrived.

import { useEffect, useState } from 'react';
import { sfx } from '../../battle/sfx';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import { meadowOf, MOMENTS, XP_RIGHT, type Payout } from '../data';
import { itemById } from '../shop';
import { nextUnicorn, unicornById, UNICORNS } from '../unicorns';
import { say } from '../voice';
import { UnicornArt } from './UnicornArt';

/** How many more right answers until the next unicorn, for a child who counts in answers, not XP. */
export const answersToGo = (need: number) => Math.ceil(need / XP_RIGHT);

export function NextUnicornBar({ xp }: { xp: number }) {
  const next = nextUnicorn(xp);
  if (!next) return <p className="next-bar done">🌈 Every unicorn is in your stable!</p>;
  const pct = Math.round(((xp - next.from) / (next.unicorn.xp - next.from)) * 100);
  return (
    <div className="next-bar" aria-label={`${answersToGo(next.need)} more right answers until a new unicorn`}>
      <UnicornArt unicorn={next.unicorn} mood="locked" size={64} />
      <div className="bar"><span style={{ width: `${Math.max(4, pct)}%` }} /></div>
      <span className="bar-count" aria-hidden="true">🎁</span>
    </div>
  );
}

export function RideEnd({ payout, mode, firstTry, asked }: { payout: Payout; mode: 'ride' | 'stars'; firstTry: number; asked: number }) {
  const { profile } = useStore();
  const m = meadowOf(profile!);
  const [step, setStep] = useState<'chest' | number>('chest');
  const arrivals = [...payout.arrived.map((id) => ({ kind: 'unicorn' as const, id })), ...payout.moments.map((id) => ({ kind: 'moment' as const, id }))];

  useEffect(() => {
    sfx.fanfare();
    const next = nextUnicorn(m.xp);
    const togo = next ? ` Just ${answersToGo(next.need)} more right answers until a new unicorn friend!` : '';
    void say(`Hooray! You finished your ${mode === 'stars' ? 'star catch' : 'ride'}! You got ${firstTry} right on the first try, and earned ${payout.points} stars.`, arrivals.length ? 'And there’s a surprise!' : togo);
  }, []);

  const showNext = () => {
    sfx.unlock();
    const n = step === 'chest' ? 0 : step + 1;
    if (n < arrivals.length) {
      setStep(n);
      const a = arrivals[n];
      sfx.special();
      if (a.kind === 'unicorn') {
        const u = unicornById(a.id)!;
        void say(`A new unicorn has come to your stable! Say hello to ${u.name}!`, u.about);
      } else {
        const mo = MOMENTS.find((x) => x.id === a.id)!;
        void say(`${mo.name}! You earned a special prize: the ${itemById(mo.item)?.name}!`);
      }
    } else go('');
  };

  if (step !== 'chest') {
    const a = arrivals[step];
    if (a.kind === 'unicorn') {
      const u = unicornById(a.id) ?? UNICORNS[0];
      return (
        <main className="reveal">
          <div className="reveal-rays" />
          <h1>New unicorn!</h1>
          <div className="reveal-unicorn"><UnicornArt unicorn={u} size={260} /></div>
          <h2>{u.name}</h2>
          <button className="big-btn" onClick={showNext}>💖 Hello, {u.name}!</button>
        </main>
      );
    }
    const mo = MOMENTS.find((x) => x.id === a.id)!;
    return (
      <main className="reveal">
        <div className="reveal-rays" />
        <h1>{mo.e} {mo.name}!</h1>
        <p className="reveal-prize">You won the <b>{itemById(mo.item)?.name}</b>!</p>
        <button className="big-btn" onClick={showNext}>🎁 Yay!</button>
      </main>
    );
  }

  return (
    <main className="ride-end">
      <div className="chest" aria-hidden="true">🎁</div>
      <h1>You did it!</h1>
      <p className="earned">
        <span>⭐ +{payout.points}</span>
      </p>
      <div className="stars-row" aria-label={`${firstTry} of ${asked} right on the first try`}>
        {Array.from({ length: asked }, (_, k) => <span key={k} className={k < firstTry ? 'lit' : ''}>⭐</span>)}
      </div>
      <NextUnicornBar xp={m.xp} />
      <div className="end-actions">
        {arrivals.length ? (
          <button className="big-btn pulse" onClick={showNext}>🎉 Surprise!</button>
        ) : (
          <>
            <button className="big-btn" onClick={() => { sfx.unlock(); go(mode === 'stars' ? 'stars' : 'ride', String(Date.now())); }}>🦄 Again!</button>
            <button className="big-btn ghost" onClick={() => go('')}>🏠 Home</button>
          </>
        )}
      </div>
    </main>
  );
}
