// The Sparkle Shop (like the ballpark's Pro Shop). Tap an item to hear it and see it on
// your unicorn; tap Buy to spend stars. Everything is read aloud.

import { useState } from 'react';
import { Sprite } from '../../art/sprite';
import { sfx } from '../../battle/sfx';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import { buy, meadowOf, wear, type Outfit } from '../data';
import { ITEMS, SLOT_ICON, SLOT_NAME, SLOTS, type Item, type ItemSlot, type Slot } from '../shop';
import { unicornById, UNICORNS } from '../unicorns';
import { say } from '../voice';
import { UnicornArt } from './UnicornArt';

export function Shop() {
  const { profile, updateProfile } = useStore();
  const m = meadowOf(profile!);
  const rider = unicornById(m.rider) ?? UNICORNS[0];
  const [slot, setSlot] = useState<ItemSlot>('coat');
  const [pick, setPick] = useState<Item | null>(null);
  const items = ITEMS.filter((it) => it.slot === slot);
  const preview: Outfit = pick && pick.slot !== 'decor' ? { ...m.outfits[rider.id], [pick.slot]: pick.id } : m.outfits[rider.id] ?? {};

  const choose = (it: Item) => {
    sfx.unlock();
    setPick(it);
    const owned = m.owned.includes(it.id);
    if (owned) void say(`${it.name}. You have this one!`);
    else if (m.points >= it.cost) void say(`${it.name}. It costs ${it.cost} stars. Tap buy to get it!`);
    else void say(`${it.name}. It costs ${it.cost} stars. You need ${it.cost - m.points} more stars. Go on a ride to earn more!`);
  };

  const purchase = (it: Item) => {
    const next = buy(m, it.id, it.cost);
    if (!next) return;
    sfx.fanfare();
    const worn = it.slot === 'decor' ? { ...next, decor: [...next.decor, it.id] } : wear(next, rider.id, it.slot as Slot, it.id);
    updateProfile((p) => ({ ...p, meadow: worn }));
    void say(`Yay! You got the ${it.name}!`, it.slot === 'decor' ? 'It’s in your stable now.' : `${rider.name} is wearing it!`);
  };

  return (
    <main className="shop">
      <header className="page-top">
        <button className="round-btn" onClick={() => go('')} aria-label="Back to the meadow">🏠</button>
        <h1 onClick={() => void say('The Sparkle Shop! Tap something pretty.')}>Sparkle Shop</h1>
        <span className="points-pill big">⭐ {m.points}</span>
      </header>

      <div className="shop-stage">
        {slot === 'decor' ? (
          <div className="decor-preview">{pick?.e ? <Sprite e={pick.e} size={150} /> : <Sprite e="🏡" size={150} />}</div>
        ) : (
          <UnicornArt unicorn={rider} outfit={preview} size={240} className="bob" />
        )}
        {pick && (
          <div className="pick-bar">
            <span className="pick-name">{pick.name}</span>
            {m.owned.includes(pick.id) ? (
              <span className="owned">✔ Yours</span>
            ) : (
              <button className="big-btn buy" disabled={m.points < pick.cost} onClick={() => purchase(pick)} aria-label={`Buy for ${pick.cost} stars`}>
                Buy ⭐ {pick.cost}
              </button>
            )}
          </div>
        )}
      </div>

      <nav className="slot-tabs">
        {SLOTS.map((s) => (
          <button key={s} className={`slot-tab ${slot === s ? 'on' : ''}`} onClick={() => { setSlot(s); setPick(null); void say(SLOT_NAME[s]); }} aria-label={SLOT_NAME[s]} aria-pressed={slot === s}>
            <Sprite e={SLOT_ICON[s]} size={36} />
          </button>
        ))}
      </nav>

      <section className="items">
        {items.map((it) => {
          const owned = m.owned.includes(it.id);
          const can = m.points >= it.cost;
          return (
            <button key={it.id} className={`item ${pick?.id === it.id ? 'on' : ''} ${owned ? 'owned' : can ? 'can' : 'cant'}`} onClick={() => choose(it)} aria-label={`${it.name}, ${it.cost} stars`}>
              <ItemSwatch item={it} />
              <span className="price">{owned ? '✔' : `⭐ ${it.cost}`}</span>
            </button>
          );
        })}
      </section>
    </main>
  );
}

/** A small picture of a shop item. */
export function ItemSwatch({ item }: { item: Item }) {
  if (item.e) return <Sprite e={item.e} size={52} />;
  const bg = item.colors.length > 2 ? `conic-gradient(${item.colors.join(', ')}, ${item.colors[0]})` : `linear-gradient(135deg, ${item.colors[0]} 55%, ${item.colors[1] ?? item.colors[0]})`;
  return (
    <span className="swatch" style={{ background: bg }}>
      <Sprite e={SLOT_ICON[item.slot]} size={28} />
    </span>
  );
}
