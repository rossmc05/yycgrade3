// The Locker Room: the ballpark look. Same face and hair as Grade 3 Quest, with a baseball uniform.

import { AvatarArt } from '../../avatar/AvatarArt';
import { BALL_PARTS, type Part } from '../../avatar/catalog';
import { useMusic } from '../../battle/music';
import { sfx } from '../../battle/sfx';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import type { Profile } from '../../engine/types';
import { ballLookOf, ballOf, type BallLook } from '../data';
import { BallBar } from './BallBar';

const SECTIONS: { slot: keyof BallLook; label: string }[] = [
  { slot: 'top', label: 'Jersey' },
  { slot: 'topColor', label: 'Team colour' },
  { slot: 'hat', label: 'Headwear' },
  { slot: 'face', label: 'Face' },
  { slot: 'shoes', label: 'Cleats' },
];

/** Just the uniform parts of the current ballpark look, to save. */
function uniform(p: Profile): BallLook {
  const l = ballLookOf(p);
  return { top: l.top, topColor: l.topColor, hat: l.hat, face: l.face, shoes: l.shoes, number: l.number };
}

export function LockerRoom() {
  const { profile, updateProfile } = useStore();
  useMusic('ballpark');
  if (!profile) return null;
  const b = ballOf(profile);
  const look = ballLookOf(profile);
  const owns = (it: Part) => it.cost === 0 || b.outfits.includes(it.id);

  const set = (patch: Partial<BallLook>) => updateProfile((p) => {
    const cur = ballOf(p);
    return { ...p, ball: { ...cur, look: { ...uniform(p), ...patch } } };
  });
  const pick = (it: Part) => {
    const slot = it.slot as keyof BallLook;
    if (owns(it)) return set({ [slot]: it.id });
    if (b.coins < it.cost) return;
    sfx.coin();
    updateProfile((p) => {
      const cur = ballOf(p);
      return { ...p, ball: { ...cur, coins: cur.coins - it.cost, outfits: [...cur.outfits, it.id], look: { ...uniform(p), [slot]: it.id } } };
    });
  };
  const number = (n: number) => set({ number: (n + 100) % 100 });

  return (
    <main className="page ballpark">
      <BallBar back={() => go('')} />
      <section className="card locker">
        <div className="locker-preview">
          <AvatarArt look={ballLookOf(profile)} size={170} background={false} full />
          <strong>{profile.name}</strong>
          <div className="number-pick" aria-label="Jersey number">
            <button className="btn ghost" onClick={() => number(look.number - 1)} aria-label="Lower number">−</button>
            <span>#{look.number}</span>
            <button className="btn ghost" onClick={() => number(look.number + 1)} aria-label="Higher number">+</button>
          </div>
          <p className="muted small">Your face and hair come from your Grade 3 Quest avatar.</p>
        </div>
        <div className="locker-parts">
          <h1>Locker Room</h1>
          {SECTIONS.map(({ slot, label }) => (
            <section key={slot}>
              <h3>{label}</h3>
              <div className={slot === 'topColor' ? 'swatches' : 'part-row'}>
                {BALL_PARTS.filter((it) => it.slot === slot).map((it) => {
                  const on = look[slot] === it.id;
                  const have = owns(it);
                  return slot === 'topColor' ? (
                    <button key={it.id} className={`swatch ${on ? 'on' : ''}`} style={{ background: it.color }} onClick={() => pick(it)} aria-label={it.name} title={it.name} aria-pressed={on} />
                  ) : (
                    <button key={it.id} className={`part-btn ${on ? 'on' : ''}`} onClick={() => pick(it)} disabled={!have && b.coins < it.cost} aria-pressed={on}>
                      {it.name}
                      {!have && <small>🪙 {it.cost}</small>}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
