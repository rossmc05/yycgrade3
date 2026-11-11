// The Dress-up Barn (like the ballpark's Locker Room): pick a unicorn and put on the
// items she owns. Each unicorn keeps its own outfit.

import { useState } from 'react';
import { Sprite } from '../../art/sprite';
import { sfx } from '../../battle/sfx';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import { meadowOf, wear } from '../data';
import { ITEMS, SLOT_ICON, SLOT_NAME, type Slot } from '../shop';
import { unicornById, unlocked } from '../unicorns';
import { say } from '../voice';
import { ItemSwatch } from './Shop';
import { UnicornArt } from './UnicornArt';

const WEAR_SLOTS: Slot[] = ['coat', 'mane', 'crown', 'saddle', 'horn', 'wings'];

export function Barn({ start }: { start?: string }) {
  const { profile, updateProfile } = useStore();
  const m = meadowOf(profile!);
  const mine = unlocked(m.xp);
  const [who, setWho] = useState(() => (start && mine.some((u) => u.id === start) ? start : m.rider));
  const [slot, setSlot] = useState<Slot>('coat');
  const u = unicornById(who) ?? mine[0];
  const outfit = m.outfits[u.id] ?? {};
  const items = ITEMS.filter((it) => it.slot === slot && m.owned.includes(it.id));

  return (
    <main className="barn">
      <header className="page-top">
        <button className="round-btn" onClick={() => go('')} aria-label="Back to the meadow">🏠</button>
        <h1 onClick={() => void say(`Dress up ${u.name}!`)}>Dress Up</h1>
        <button className="round-btn" onClick={() => go('shop')} aria-label="Sparkle Shop">🛍️</button>
      </header>

      <div className="barn-pick">
        {mine.map((x) => (
          <button key={x.id} className={`mini ${x.id === u.id ? 'on' : ''}`} onClick={() => { sfx.unlock(); setWho(x.id); void say(x.name); }} aria-label={x.name} aria-pressed={x.id === u.id}>
            <UnicornArt unicorn={x} outfit={m.outfits[x.id]} size={64} />
          </button>
        ))}
      </div>

      <div className="barn-stage">
        <UnicornArt unicorn={u} outfit={outfit} size={250} className="bob" />
        <p className="barn-name">{u.name}</p>
        {m.rider === u.id ? (
          <span className="riding-pill">💖 Riding</span>
        ) : (
          <button className="big-btn ghost" onClick={() => { sfx.coin(); updateProfile((p) => ({ ...p, meadow: { ...meadowOf(p), rider: u.id } })); void say(`You're riding ${u.name}!`); }}>💖 Ride {u.name}</button>
        )}
      </div>

      <nav className="slot-tabs">
        {WEAR_SLOTS.map((s) => (
          <button key={s} className={`slot-tab ${slot === s ? 'on' : ''}`} onClick={() => { setSlot(s); void say(SLOT_NAME[s]); }} aria-label={SLOT_NAME[s]} aria-pressed={slot === s}>
            <Sprite e={SLOT_ICON[s]} size={36} />
          </button>
        ))}
      </nav>

      <section className="items">
        {items.length === 0 && (
          <button className="item empty" onClick={() => { void say('Nothing here yet. Visit the Sparkle Shop!'); go('shop'); }}>
            <Sprite e="🛍️" size={44} /><span className="price">Shop</span>
          </button>
        )}
        {items.map((it) => (
          <button key={it.id} className={`item ${outfit[slot] === it.id ? 'on' : ''}`} aria-pressed={outfit[slot] === it.id} aria-label={it.name}
            onClick={() => { sfx.coin(); const off = outfit[slot] === it.id; void say(off ? `Took off the ${it.name}.` : `${it.name}!`); updateProfile((p) => ({ ...p, meadow: wear(meadowOf(p), u.id, slot, it.id) })); }}>
            <ItemSwatch item={it} />
            {outfit[slot] === it.id && <span className="price">✔</span>}
          </button>
        ))}
      </section>
    </main>
  );
}
