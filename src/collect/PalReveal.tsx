import { Sprite } from '../art/sprite';
import { DUPLICATE_COINS, RARITY_NAME, type Pal } from './pals';

/** The pal found after a battle, shown on the victory screen. */
export function PalReveal({ pal, isNew }: { pal: Pal; isNew: boolean }) {
  return (
    <div className={`pal-reveal ${pal.rarity}`}>
      <div className="pal-card">
        <span className="pal-shine" aria-hidden="true" />
        <Sprite e={pal.e} size={96} label={pal.name} />
        {isNew && <span className="pal-new">NEW!</span>}
      </div>
      <div>
        <small className="rarity">{RARITY_NAME[pal.rarity]} pal</small>
        <strong>{isNew ? `You found ${pal.name}!` : `${pal.name} again!`}</strong>
        <p className="muted small">{isNew ? 'It joined your Pal Book.' : `+${DUPLICATE_COINS} coins for a pal you already have.`}</p>
      </div>
    </div>
  );
}
