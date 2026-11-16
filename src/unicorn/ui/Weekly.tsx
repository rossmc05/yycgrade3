// The Challenge of the Week (like the ballpark's weekly challenge): one goal, read aloud,
// with a picture row that fills up as she plays, and a special prize she can only win here.

import { useEffect, useState } from 'react';
import { Sprite } from '../../art/sprite';
import { sfx } from '../../battle/sfx';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import { meadowOf, wear, type Outfit } from '../data';
import { itemById, type Slot } from '../shop';
import { unicornById, UNICORNS } from '../unicorns';
import { BONUS_POINTS, claimWeekly, prizeName, unclaimed, weekly, type ThisWeek } from '../weekly';
import { say } from '../voice';
import { ItemSwatch } from './Shop';
import { UnicornArt } from './UnicornArt';

/** The week's progress: a picture for each step when there are few, a bar when there are many. */
export function WeekRow({ w, small = false }: { w: ThisWeek; small?: boolean }) {
  const { need, e } = w.goal;
  const n = Math.min(w.state.count, need);
  const label = `${n} of ${need}`;
  if (need <= 8) {
    return (
      <span className={`week-row ${small ? 'small' : ''}`} aria-label={label}>
        {Array.from({ length: need }, (_, k) => <span key={k} className={k < n ? 'on' : ''}><Sprite e={e} size={small ? 26 : 46} /></span>)}
      </span>
    );
  }
  return (
    <span className={`week-row bar ${small ? 'small' : ''}`} aria-label={label}>
      <span className="bar"><span style={{ width: `${Math.max(4, Math.round((n / need) * 100))}%` }} /></span>
      <b>{n}/{need}</b>
    </span>
  );
}

const daysLeft = (now: number) => {
  const d = new Date(now).getDay();
  return d === 0 ? 1 : 8 - d;
};

export function Weekly() {
  const { profile, updateProfile } = useStore();
  const m = meadowOf(profile!);
  const now = Date.now();
  const w = weekly(m, now);
  const ready = unclaimed(m, now);
  const rider = unicornById(m.rider) ?? UNICORNS[0];
  const [won, setWon] = useState<string[] | null>(null);
  const prize = itemById(w.prize);
  const preview: Outfit = prize && prize.slot !== 'decor' ? { ...m.outfits[rider.id], [prize.slot]: prize.id } : m.outfits[rider.id] ?? {};
  const left = w.goal.need - Math.min(w.state.count, w.goal.need);

  const read = () => {
    if (w.state.claimed) return void say('You won this week’s prize! A new challenge comes on Monday.');
    if (ready.length) return void say('You did the challenge! Tap the present to get your prize!');
    const days = daysLeft(now);
    void say(
      `This week’s challenge: ${w.goal.say}`,
      w.state.count ? `You have done ${Math.min(w.state.count, w.goal.need)}. Just ${left} more!` : 'You can do it!',
      `The prize is the ${prizeName(w.prize)}. You can only win it here!`,
      days <= 2 ? `There ${days === 1 ? 'is 1 day' : 'are 2 days'} left this week.` : '',
    );
  };
  useEffect(() => { if (!won) read(); }, []);

  const claim = () => {
    const r = claimWeekly(meadowOf(profile!), Date.now());
    if (!r.won.length) return;
    sfx.fanfare();
    // Put a wearable prize straight on her unicorn, like a new item from the shop.
    const first = itemById(r.won.find((id) => id !== 'points'));
    const next = first ? (first.slot === 'decor' ? { ...r.meadow, decor: [...r.meadow.decor, first.id] } : wear(r.meadow, rider.id, first.slot as Slot, first.id)) : r.meadow;
    updateProfile((p) => ({ ...p, meadow: next }));
    setWon(r.won);
    void say(first ? `Hooray! You won the ${first.name}!` : `Hooray! You won ${BONUS_POINTS} stars!`, first ? (first.slot === 'decor' ? 'It’s in your stable now.' : `${rider.name} is wearing it!`) : '');
  };

  if (won) {
    const first = itemById(won.find((id) => id !== 'points'));
    const now2 = meadowOf(profile!);
    return (
      <main className="reveal">
        <div className="reveal-rays" />
        <h1>🏆 You did it!</h1>
        {first && first.slot !== 'decor' ? (
          <div className="reveal-unicorn"><UnicornArt unicorn={rider} outfit={now2.outfits[rider.id]} size={260} /></div>
        ) : first ? <Sprite e={first.e!} size={180} /> : <Sprite e="⭐" size={160} />}
        <p className="reveal-prize">You won the <b>{first ? first.name : `${BONUS_POINTS} stars`}</b>!</p>
        <div className="end-actions">
          <button className="big-btn" onClick={() => go('barn')}>🎀 Dress up</button>
          <button className="big-btn ghost" onClick={() => go('')}>🏠 Home</button>
        </div>
      </main>
    );
  }

  return (
    <main className="weekly-page">
      <header className="page-top">
        <button className="round-btn" onClick={() => go('')} aria-label="Back to the meadow">🏠</button>
        <h1 onClick={read}>Weekly Challenge</h1>
        <button className="round-btn say" onClick={read} aria-label="Hear it again">🔊</button>
      </header>

      <section className="week-card">
        <p className="week-goal" onClick={read}><Sprite e={w.goal.e} size={44} /> {w.goal.say}</p>
        <WeekRow w={w} />
        {w.state.claimed && <p className="week-note">✔ Prize won! A new challenge comes on Monday.</p>}
      </section>

      <section className="week-prize" onClick={read}>
        <div className="prize-stage">
          {prize?.slot === 'decor' ? <Sprite e={prize.e!} size={150} /> : prize ? <UnicornArt unicorn={rider} outfit={preview} size={220} className="bob" /> : <Sprite e="⭐" size={130} />}
        </div>
        <div className="prize-tag">
          {prize ? <ItemSwatch item={prize} /> : <Sprite e="⭐" size={40} />}
          <span>{prizeName(w.prize)}</span>
          <small>Only in the Weekly Challenge</small>
        </div>
      </section>

      <div className="end-actions">
        {ready.length ? (
          <button className="big-btn pulse claim" onClick={claim}>🎁 Get my prize!</button>
        ) : !w.state.claimed ? (
          <button className="big-btn" onClick={() => { sfx.unlock(); go(w.goal.kind === 'stars' ? 'stars' : 'ride', String(Date.now())); }}>{w.goal.kind === 'stars' ? '🌟 Star Catch' : '🌈 Go on a ride'}</button>
        ) : (
          <button className="big-btn ghost" onClick={() => go('')}>🏠 Home</button>
        )}
      </div>
    </main>
  );
}
