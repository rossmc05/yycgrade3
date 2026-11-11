// My Stable: every unicorn in her stall, wearing her own outfit, and the ones still to come.
// Stable decorations bought in the shop show here, and she can tap them on or off.

import { Sprite } from '../../art/sprite';
import { sfx } from '../../battle/sfx';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import { meadowOf, toggleDecor } from '../data';
import { ITEMS } from '../shop';
import { nextUnicorn, UNICORNS } from '../unicorns';
import { say } from '../voice';
import { answersToGo } from './RideEnd';
import { UnicornArt } from './UnicornArt';

export function Stable() {
  const { profile, updateProfile } = useStore();
  const m = meadowOf(profile!);
  const decor = ITEMS.filter((it) => it.slot === 'decor' && m.owned.includes(it.id));
  const shown = decor.filter((d) => m.decor.includes(d.id));
  const castle = shown.some((d) => d.id === 'decor-castle');
  const have = UNICORNS.filter((u) => m.xp >= u.xp).length;
  const next = nextUnicorn(m.xp);

  return (
    <main className={`stable ${castle ? 'castle' : ''}`}>
      <header className="page-top">
        <button className="round-btn" onClick={() => go('')} aria-label="Back to the meadow">🏠</button>
        <h1 onClick={() => void say(`Your stable. You have ${have} unicorn${have === 1 ? '' : 's'}.`)}>My Stable</h1>
        <span className="points-pill">🦄 {have}/{UNICORNS.length}</span>
      </header>

      {shown.length > 0 && (
        <div className="stable-decor" aria-hidden="true">
          {shown.filter((d) => d.id !== 'decor-castle').map((d, k) => <span key={d.id} style={{ ['--k' as string]: k }}><Sprite e={d.e!} size={54} /></span>)}
        </div>
      )}

      <section className="stalls">
        {UNICORNS.map((u) => {
          const open = m.xp >= u.xp;
          return (
            <button
              key={u.id}
              className={`stall ${open ? '' : 'locked'} ${m.rider === u.id ? 'riding' : ''}`}
              onClick={() => {
                sfx.unlock();
                if (open) { void say(`${u.name}!`, u.about); go('barn', u.id); }
                else void say(`A new unicorn is coming! Get ${answersToGo(u.xp - m.xp)} more right answers to meet them.`);
              }}
              aria-label={open ? u.name : 'A unicorn still to come'}
            >
              <UnicornArt unicorn={u} outfit={m.outfits[u.id]} mood={open ? 'happy' : 'locked'} size="100%" />
              {open ? <span className="stall-name">{u.name}</span> : next?.unicorn.id === u.id ? (
                <span className="bar" aria-hidden="true"><span style={{ width: `${Math.max(6, ((m.xp - next.from) / (u.xp - next.from)) * 100)}%` }} /></span>
              ) : <span className="stall-name">🔒</span>}
              {m.rider === u.id && <span className="riding-tag" aria-hidden="true">💖</span>}
            </button>
          );
        })}
      </section>

      {decor.length > 0 && (
        <section className="decor-picker">
          <h2>Decorate</h2>
          <div className="decor-row">
            {decor.map((d) => (
              <button key={d.id} className={`decor-btn ${m.decor.includes(d.id) ? 'on' : ''}`} aria-pressed={m.decor.includes(d.id)} aria-label={d.name}
                onClick={() => { sfx.coin(); void say(d.name); updateProfile((p) => ({ ...p, meadow: toggleDecor(meadowOf(p), d.id) })); }}>
                <Sprite e={d.e!} size={46} />
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
