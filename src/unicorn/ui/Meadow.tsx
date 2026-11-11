// Rainbow Meadow, the hub (like the ballpark's Clubhouse): tap a place to go there.

import { sfx } from '../../battle/sfx';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import { meadowOf } from '../data';
import { unicornById, unlocked, UNICORNS } from '../unicorns';
import { say } from '../voice';
import { NextUnicornBar } from './RideEnd';
import { UnicornArt } from './UnicornArt';
import { Sprite } from '../../art/sprite';

interface Spot { id: string; label: string; speak: string; e: string; to: string; big?: boolean }

const SPOTS: Spot[] = [
  { id: 'ride', label: 'Go on a Ride', speak: 'Let’s go on a ride!', e: '🌈', to: 'ride', big: true },
  { id: 'stable', label: 'My Stable', speak: 'Your stable!', e: '🏡', to: 'stable' },
  { id: 'shop', label: 'Sparkle Shop', speak: 'The Sparkle Shop!', e: '🛍️', to: 'shop' },
  { id: 'barn', label: 'Dress Up', speak: 'Time to dress up!', e: '🎀', to: 'barn' },
  { id: 'stars', label: 'Star Catch', speak: 'Star catch! Catch the falling stars.', e: '🌟', to: 'stars' },
];

export function Meadow() {
  const { profile } = useStore();
  const m = meadowOf(profile!);
  const rider = unicornById(m.rider) ?? UNICORNS[0];
  const friends = unlocked(m.xp).filter((u) => u.id !== rider.id).slice(0, 3);

  const open = (s: Spot) => {
    sfx.unlock();
    sfx.coin();
    void say(s.speak);
    go(s.to);
  };

  return (
    <main className="meadow">
      <div className="sky" aria-hidden="true">
        <span className="cloud c1" /><span className="cloud c2" /><span className="cloud c3" />
        <div className="big-rainbow" />
        <div className="hill h1" /><div className="hill h2" />
      </div>

      <header className="meadow-top">
        <button className="rider-chip" onClick={() => go('riders')} aria-label="Change who is playing">
          <Sprite e="🦄" size={30} /> {profile!.name}
        </button>
        <span className="points-pill big" aria-label={`${m.points} stars`}>⭐ {m.points}</span>
      </header>

      <section className="meadow-hero" onClick={() => void say(`Hi ${profile!.name}! I'm ${rider.name}. Let's go on a ride!`)}>
        <div className="friends" aria-hidden="true">
          {friends.map((u, k) => <div key={u.id} className={`friend f${k}`}><UnicornArt unicorn={u} outfit={m.outfits[u.id]} size={90} /></div>)}
        </div>
        <div className="hero-unicorn bob"><UnicornArt unicorn={rider} outfit={m.outfits[rider.id]} size={230} /></div>
      </section>

      <NextUnicornBar xp={m.xp} />

      <nav className="spots">
        {SPOTS.map((s) => (
          <button key={s.id} className={`spot ${s.big ? 'big' : ''} spot-${s.id}`} onClick={() => open(s)}>
            <Sprite e={s.e} size={s.big ? 76 : 56} />
            <span>{s.label}</span>
          </button>
        ))}
      </nav>
      <a className="grownups" href="./#/parent">Grown-ups</a>
    </main>
  );
}
