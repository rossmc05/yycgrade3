import { Sprite } from '../../art/sprite';
import { useMusic } from '../../battle/music';
import { sfx } from '../../battle/sfx';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import { ballOf } from '../data';
import { BALL_GEAR, SLOT_NAME, type BallGear, type BallSlot } from '../gear';
import { BallBar } from './BallBar';

const SLOTS = Object.keys(SLOT_NAME) as BallSlot[];

/** Baseball upgrades bought with ballpark coins. Wear one of each kind. */
export function ProShop() {
  const { profile, updateProfile } = useStore();
  useMusic('ballpark');
  if (!profile) return null;
  const b = ballOf(profile);

  const buy = (g: BallGear) => {
    if (b.coins < g.cost || b.gear.includes(g.id)) return;
    sfx.coin();
    updateProfile((p) => {
      const cur = ballOf(p);
      return { ...p, ball: { ...cur, coins: cur.coins - g.cost, gear: [...cur.gear, g.id], gearOn: { ...cur.gearOn, [g.slot]: g.id } } };
    });
  };
  const wear = (g: BallGear) =>
    updateProfile((p) => {
      const cur = ballOf(p);
      const on = cur.gearOn[g.slot] === g.id;
      return { ...p, ball: { ...cur, gearOn: { ...cur.gearOn, [g.slot]: on && g.slot !== 'bat' ? undefined : g.id } } };
    });

  return (
    <main className="page ballpark">
      <BallBar back={() => go('')} />
      <section className="card book-head">
        <Sprite e="🏪" size={64} />
        <div>
          <h1>Pro Shop</h1>
          <p className="muted">Spend ballpark coins on upgrades. You can wear one of each kind. You have 🪙 {b.coins}.</p>
        </div>
      </section>
      {SLOTS.map((slot) => (
        <section key={slot}>
          <h2 className="strand">{SLOT_NAME[slot]}</h2>
          <div className="shop-grid">
            {BALL_GEAR.filter((g) => g.slot === slot).map((g) => {
              const have = b.gear.includes(g.id);
              const on = b.gearOn[slot] === g.id;
              return (
                <div key={g.id} className={`shop-item ${on ? 'on' : ''}`}>
                  <Sprite e={g.e} size={56} />
                  <strong>{g.name}</strong>
                  <small>{g.does}</small>
                  {have ? (
                    <button className={`btn ${on ? 'ghost' : 'primary'}`} onClick={() => wear(g)} disabled={on && slot === 'bat'}>{on ? (slot === 'bat' ? 'Using' : 'Take off') : 'Use'}</button>
                  ) : (
                    <button className="btn primary" onClick={() => buy(g)} disabled={b.coins < g.cost}>🪙 {g.cost}</button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
