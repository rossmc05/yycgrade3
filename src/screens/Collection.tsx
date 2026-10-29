import { Sprite } from '../art/sprite';
import { useMusic } from '../battle/music';
import { GEAR, gearById, type Gear } from '../collect/gear';
import { PALS, RARITY_NAME } from '../collect/pals';
import { TopBar } from '../components/TopBar';
import { useStore } from '../engine/store';
import { placeOf } from '../map/world';
import { go } from '../router';

const ZONES = ['math', 'spelling', 'grammar', 'science'] as const;

/** The Pal Book: every pal, found ones in colour, and a buddy to bring along. */
export function PalBook() {
  const { profile, updateProfile } = useStore();
  useMusic('map');
  if (!profile) return null;
  const have = profile.pals ?? {};
  const count = PALS.filter((p) => have[p.id]).length;
  return (
    <main className="page">
      <TopBar back={() => go('')} />
      <section className="card book-head">
        <Sprite e="📖" size={64} />
        <div>
          <h1>Pal Book</h1>
          <p className="muted">You have found {count} of {PALS.length} pals. Win battles to find more. Beating a boss finds rarer pals.</p>
          <div className="goal-bar"><span style={{ width: `${(count / PALS.length) * 100}%` }} /></div>
        </div>
      </section>
      {ZONES.map((z) => (
        <section key={z}>
          <h2>{placeOf(z)?.name}</h2>
          <div className="pal-grid">
            {PALS.filter((p) => p.zone === z).map((p) => {
              const n = have[p.id] ?? 0;
              const isBuddy = profile.buddy === p.id;
              return (
                <button
                  key={p.id}
                  className={`pal-slot ${p.rarity} ${n ? 'found' : 'missing'} ${isBuddy ? 'is-buddy' : ''}`}
                  disabled={!n}
                  onClick={() => updateProfile((pr) => ({ ...pr, buddy: isBuddy ? undefined : p.id }))}
                  aria-label={n ? `${p.name}, ${RARITY_NAME[p.rarity]}${isBuddy ? ', your buddy' : ''}` : `Not found yet, ${RARITY_NAME[p.rarity]}`}
                >
                  <Sprite e={p.e} size={64} />
                  <strong>{n ? p.name : '???'}</strong>
                  <small>{RARITY_NAME[p.rarity]}{n > 1 ? ` · ×${n}` : ''}</small>
                  {isBuddy && <span className="buddy-tag">Buddy</span>}
                </button>
              );
            })}
          </div>
        </section>
      ))}
      <p className="muted small center-text">Tap a pal you have found to make it your buddy. Your buddy follows you on the map and cheers in battle.</p>
    </main>
  );
}

/** The Gear Shop: buy a weapon and a charm with coins, then wear them into battle. */
export function GearShop() {
  const { profile, updateProfile } = useStore();
  useMusic('map');
  if (!profile) return null;
  const owned = new Set(['stick', ...(profile.gear ?? [])]);
  const on = { weapon: 'stick', ...profile.gearOn };
  const act = (g: Gear) => {
    if (owned.has(g.id)) {
      updateProfile((p) => ({ ...p, gearOn: { ...p.gearOn, [g.slot]: g.slot === 'charm' && p.gearOn?.charm === g.id ? undefined : g.id } }));
    } else if (profile.coins >= g.cost) {
      updateProfile((p) => (p.coins < g.cost ? p : { ...p, coins: p.coins - g.cost, gear: [...(p.gear ?? []), g.id], gearOn: { ...p.gearOn, [g.slot]: g.id } }));
    }
  };
  return (
    <main className="page">
      <TopBar back={() => go('')} />
      <section className="card book-head">
        <Sprite e="⚒️" size={64} />
        <div>
          <h1>Gear Shop</h1>
          <p className="muted">Spend coins on gear that helps in battle. You can wear one weapon and one charm.</p>
          <p>
            Wearing: <Sprite e={gearById(on.weapon)!.e} size={28} /> {gearById(on.weapon)!.name}
            {on.charm && <> and <Sprite e={gearById(on.charm)!.e} size={28} /> {gearById(on.charm)!.name}</>}
          </p>
        </div>
      </section>
      {(['weapon', 'charm'] as const).map((slot) => (
        <section key={slot}>
          <h2>{slot === 'weapon' ? 'Weapons' : 'Charms'}</h2>
          <div className="gear-grid">
            {GEAR.filter((g) => g.slot === slot).map((g) => {
              const has = owned.has(g.id);
              const wearing = on[slot] === g.id;
              const short = !has && profile.coins < g.cost;
              return (
                <div key={g.id} className={`gear-item ${wearing ? 'wearing' : ''}`}>
                  <Sprite e={g.e} size={64} />
                  <strong>{g.name}</strong>
                  <small>{g.does}</small>
                  <button className={`btn ${wearing ? 'ghost' : 'primary'}`} disabled={short || (wearing && slot === 'weapon')} onClick={() => act(g)}>
                    {wearing ? (slot === 'charm' ? 'Take off' : 'Wearing') : has ? 'Wear' : <>Buy <Sprite e="🪙" size={20} /> {g.cost}</>}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
