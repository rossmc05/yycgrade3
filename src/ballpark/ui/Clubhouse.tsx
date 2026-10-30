import { Icon, Sprite } from '../../art/sprite';
import { AvatarArt } from '../../avatar/AvatarArt';
import { lookOf } from '../../avatar/catalog';
import { useMusic } from '../../battle/music';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import { ballOf, rankOf, RANKS } from '../data';
import { PLAYERS } from '../players';
import { BallBar } from './BallBar';

/** The ballpark's home screen. */
export function Clubhouse() {
  const { profile } = useStore();
  useMusic('ballpark');
  if (!profile) return null;
  const b = ballOf(profile);
  const r = rankOf(b.xp);
  const players = new Set(Object.keys(b.cards).map((k) => k.split(':')[0])).size;
  const cards = Object.values(b.cards).reduce((n, c) => n + c.count, 0);
  const next = RANKS[r.index + 1];
  return (
    <main className="page ballpark">
      <BallBar />
      <section className="card club-head">
        <AvatarArt look={lookOf(profile)} size={110} background={false} full />
        <div>
          <h1>{profile.name}'s Sluggers</h1>
          <p className="muted">
            <Icon e={RANKS[r.index].e} /> {RANKS[r.index].name} · {b.xp} XP{next ? ` · ${next.xp - b.xp} XP to ${next.name}` : ''}
          </p>
          <p className="record">Record: <b>{b.record.w}</b> W · <b>{b.record.l}</b> L{b.record.t ? <> · <b>{b.record.t}</b> T</> : null}</p>
        </div>
      </section>
      <div className="club-grid">
        <button className="club-tile play" onClick={() => go('game')}>
          <Sprite e="⚾" size={72} />
          <strong>Play Ball</strong>
          <span>A full game. Win to earn a card.</span>
        </button>
        <button className="club-tile derby" onClick={() => go('derby')}>
          <Sprite e="💥" size={72} />
          <strong>Home Run Derby</strong>
          <span>{b.derby.plays ? `Best ${b.derby.bestFeet} ft` : 'Ten swings. Always earns a card.'}</span>
        </button>
        <button className="club-tile binder" onClick={() => go('binder')}>
          <Sprite e="🃏" size={72} />
          <strong>Card Binder</strong>
          <span>{players} of {PLAYERS.length} players · {cards} cards</span>
        </button>
        <button className="club-tile shop" onClick={() => go('shop')}>
          <Sprite e="🏪" size={72} />
          <strong>Pro Shop</strong>
          <span><Icon e="🪙" /> {b.coins} to spend on bats, gloves and more</span>
        </button>
      </div>
      <section className="card how">
        <h2>How you earn</h2>
        <ul>
          <li><b>XP</b>: 10 for every right answer, 2 for trying. XP moves you up from Rookie to Hall of Famer, and every promotion gives a bonus card (Refractor or better).</li>
          <li><b>Coins</b>: hits (2 to 10), runs (2 each) and outs you pitch (2 or 3), plus 40 for a win, 20 for a tie or 15 for a loss. A derby pays 10, plus 3 a home run. A card you already have trades in for coins.</li>
          <li><b>Cards</b>: one for every win (blow-outs and shutouts pull better cards), and one after every Home Run Derby.</li>
        </ul>
      </section>
      <div className="row">
        <a className="btn ghost" href="./">← Back to Grade 3 Quest</a>
      </div>
    </main>
  );
}
