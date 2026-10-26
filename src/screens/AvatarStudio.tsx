import { useState } from 'react';
import { AvatarArt } from '../avatar/AvatarArt';
import { PARTS, SLOTS, isOwned, lookOf, type Look, type Part, type Slot } from '../avatar/catalog';
import { TopBar } from '../components/TopBar';
import { playerLevel } from '../engine/rewards';
import { useStore } from '../engine/store';
import { go } from '../router';

const COLOUR_SLOTS: Slot[] = ['skin', 'hairColor', 'topColor'];

export function AvatarStudio() {
  const { profile, updateProfile } = useStore();
  const [slot, setSlot] = useState<Slot>('hair');
  const [pending, setPending] = useState<Part | null>(null);
  if (!profile) return null;
  const look = lookOf(profile);
  const level = playerLevel(profile.xp).level;

  const wear = (it: Part) => updateProfile((p) => ({ ...p, look: { ...lookOf(p), [it.slot]: it.id } }));
  const buy = (it: Part) => {
    updateProfile((p) => (p.coins < it.cost || p.owned.includes(it.id) ? p : { ...p, coins: p.coins - it.cost, owned: [...p.owned, it.id], look: { ...lookOf(p), [it.slot]: it.id } }));
    setPending(null);
  };
  const setNumber = (n: number) => updateProfile((p) => ({ ...p, look: { ...lookOf(p), number: n } }));

  const tap = (it: Part) => {
    if (isOwned(profile.owned, it)) {
      wear(it);
      setPending(null);
    } else setPending(it);
  };

  const items = PARTS.filter((p) => p.slot === slot);
  const preview: Look = pending ? { ...look, [pending.slot]: pending.id } : look;

  return (
    <main className="page">
      <TopBar back={() => go('rewards')} />
      <div className="studio">
        <section className="card studio-preview">
          <AvatarArt look={preview} size={220} />
          <h2>{profile.name}</h2>
          <p className="muted">🪙 {profile.coins} coins · Level {level}</p>
          {pending && (
            <div className="buy-box">
              <strong>{pending.name}</strong>
              {pending.minLevel && level < pending.minLevel ? (
                <p className="muted">Unlocks at level {pending.minLevel}. Keep learning!</p>
              ) : profile.coins < pending.cost ? (
                <p className="muted">Costs 🪙 {pending.cost}. You need {pending.cost - profile.coins} more coins.</p>
              ) : (
                <button className="btn primary" onClick={() => buy(pending)}>Buy for 🪙 {pending.cost}</button>
              )}
              <button className="link" onClick={() => setPending(null)}>Cancel</button>
            </div>
          )}
          {look.top === 'top-jersey' && !pending && (
            <label className="field inline">
              <span>Jersey number</span>
              <select value={look.number} onChange={(e) => setNumber(Number(e.target.value))}>
                {Array.from({ length: 99 }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}
              </select>
            </label>
          )}
        </section>

        <section className="studio-parts">
          <div className="slot-tabs" role="tablist">
            {SLOTS.map((s) => (
              <button key={s.slot} role="tab" aria-selected={s.slot === slot} className={s.slot === slot ? 'on' : ''} onClick={() => { setSlot(s.slot); setPending(null); }}>
                <span>{s.icon}</span> {s.label}
              </button>
            ))}
          </div>
          <div className={`part-grid ${COLOUR_SLOTS.includes(slot) ? 'colours' : ''}`}>
            {items.map((it) => {
              const owned = isOwned(profile.owned, it);
              const locked = !owned && !!it.minLevel && level < it.minLevel;
              const on = look[it.slot as keyof Look] === it.id;
              return (
                <button key={it.id} className={`part ${on ? 'on' : ''} ${locked ? 'locked' : ''} ${pending?.id === it.id ? 'trying' : ''}`} onClick={() => tap(it)} title={it.name}>
                  {COLOUR_SLOTS.includes(slot) ? (
                    <span className="swatch" style={{ background: it.color }} />
                  ) : (
                    <AvatarArt look={{ ...look, [it.slot]: it.id }} size={84} background={slot === 'bg'} />
                  )}
                  <span className="part-name">{it.name}</span>
                  <span className="part-price">{on ? '✓ Wearing' : owned ? 'Yours' : locked ? `🔒 Level ${it.minLevel}` : `🪙 ${it.cost}`}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
