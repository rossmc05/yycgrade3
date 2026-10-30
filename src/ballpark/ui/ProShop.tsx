import { useMusic } from '../../battle/music';
import { sfx } from '../../battle/sfx';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import { ballOf } from '../data';
import { BALL_GEAR, ballGearById, gearName, SLOT_NAME, type BallGear, type BallSlot } from '../gear';
import { BallBar } from './BallBar';
import { GearArt } from './GearArt';

const SLOTS = Object.keys(SLOT_NAME) as BallSlot[];
const TIERS = ['Starter', 'Pro', 'Elite', 'Legend', 'Hall of Fame'];
const tierOf = (g: BallGear) => {
  const list = BALL_GEAR.filter((x) => x.slot === g.slot);
  const i = list.indexOf(g);
  // The top item in each row is always the best tier there is.
  return i === list.length - 1 && i > 0 ? 'Elite' : TIERS[Math.min(i, 1)];
};

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
    <main className="page ballpark pro-shop">
      <BallBar back={() => go('')} />
      <section className="shop-front">
        <div className="shop-awning" aria-hidden="true" />
        <div className="shop-sign">
          <h1>Pro Shop</h1>
          <p>Real pro gear. Wear one of each kind and it helps you on the field.</p>
        </div>
        <div className="shop-wallet"><span>🪙</span><b>{b.coins}</b><small>coins</small></div>
        <div className="shop-loadout">
          {SLOTS.map((slot) => {
            const g = ballGearById(b.gearOn[slot]);
            return (
              <div key={slot} className={`loadout-slot ${g ? '' : 'empty'}`} title={g ? gearName(g) : `No ${SLOT_NAME[slot].toLowerCase()}`}>
                {g ? <GearArt g={g} size={44} /> : <span>+</span>}
                <small>{g ? g.brand : SLOT_NAME[slot]}</small>
              </div>
            );
          })}
        </div>
      </section>
      {SLOTS.map((slot) => (
        <section key={slot}>
          <h2 className="strand">{SLOT_NAME[slot]}</h2>
          <div className="gear-grid">
            {BALL_GEAR.filter((g) => g.slot === slot).map((g) => {
              const have = b.gear.includes(g.id);
              const on = b.gearOn[slot] === g.id;
              const short = g.cost - b.coins;
              const tier = tierOf(g);
              return (
                <div key={g.id} className={`gear-item ${on ? 'on' : ''} ${!have && short > 0 ? 'locked' : ''}`} style={{ ['--g1' as string]: g.art.c1, ['--g2' as string]: g.art.c2 }}>
                  <div className="gear-stage">
                    <span className={`gear-tier t-${tier.toLowerCase()}`}>{tier}</span>
                    {on && <span className="gear-on">✓ Using</span>}
                    <GearArt g={g} size={110} />
                  </div>
                  <div className="gear-info">
                    <small className="gear-brand">{g.brand}</small>
                    <strong>{g.name}</strong>
                    <p>{g.does}</p>
                  </div>
                  {have ? (
                    <button className={`btn ${on ? 'ghost' : 'primary'}`} onClick={() => wear(g)} disabled={on && slot === 'bat'}>{on ? (slot === 'bat' ? 'Using' : 'Take off') : 'Use'}</button>
                  ) : g.cost === 0 ? null : (
                    <>
                      <button className="btn primary buy" onClick={() => buy(g)} disabled={short > 0}>🪙 {g.cost}</button>
                      {short > 0 && <small className="gear-need">Need {short} more coins</small>}
                    </>
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
