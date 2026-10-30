import { useState } from 'react';
import { useMusic } from '../../battle/music';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import { cardKey, PARALLELS, RANK, type Parallel } from '../cards';
import { ballOf } from '../data';
import { PLAYERS, type Player } from '../players';
import { BallBar } from './BallBar';
import { BallCard, CardFront } from './Card';

const canadian = (p: Player) => p.city === 'Toronto' || p.city === 'Montreal' || !!p.canada;
const GROUPS = [
  { name: 'Toronto, Montreal and Canada', has: canadian },
  { name: "Today's stars", has: (p: Player) => !canadian(p) && !p.legend },
  { name: 'Legends', has: (p: Player) => !canadian(p) && !!p.legend },
];

/** Every player, with the best parallel of each you have. Tap one to see all your versions of it. */
export function Binder() {
  const { profile } = useStore();
  const [open, setOpen] = useState<Player | null>(null);
  const [view, setView] = useState<Parallel | null>(null);
  useMusic('ballpark');
  if (!profile) return null;
  const b = ballOf(profile);
  const owned = (p: Player) => PARALLELS.filter((par) => b.cards[cardKey(p.id, par.id)]).map((par) => par.id);
  const best = (p: Player) => owned(p).sort((x, y) => RANK[y] - RANK[x])[0];
  const count = PLAYERS.filter((p) => owned(p).length).length;
  const byPar = PARALLELS.map((par) => ({ par, n: PLAYERS.filter((p) => b.cards[cardKey(p.id, par.id)]).length }));

  return (
    <main className="page ballpark">
      <BallBar back={() => go('')} />
      <section className="card book-head">
        <div>
          <h1>Card Binder</h1>
          <p className="muted">{count} of {PLAYERS.length} players collected. Each player comes in six versions, from Base to a signed Autograph.</p>
          <div className="goal-bar"><span style={{ width: `${(count / PLAYERS.length) * 100}%` }} /></div>
          <div className="par-legend">
            {byPar.map(({ par, n }) => <span key={par.id} className={`par-chip p-${par.id}`}>{par.name} <b>{n}</b></span>)}
          </div>
        </div>
      </section>
      {GROUPS.map((g) => {
        const list = PLAYERS.filter(g.has);
        const got = list.filter((p) => owned(p).length).length;
        return (
          <section key={g.name}>
            <h2 className="strand">{g.name} <small>{got}/{list.length}</small></h2>
            <div className="binder-grid">
              {list.map((p) => {
                const top = best(p);
                return top ? (
                  <button key={p.id} className="binder-slot" onClick={() => { setOpen(p); setView(top); }} aria-label={`${p.name}, best card ${top}`}>
                    <span className="mini-card"><CardFront player={p} parallel={top} serial={b.cards[cardKey(p.id, top)]?.serial} /></span>
                    {owned(p).length > 1 && <span className="have-n">{owned(p).length} kinds</span>}
                  </button>
                ) : (
                  <div key={p.id} className="binder-slot empty" aria-label="Not collected yet">
                    <span className="mini-card blank"><span>?</span><small>{p.pos} · {p.city}</small></span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      {open && view && (
        <div className="card-modal" role="dialog" aria-label={open.name} onClick={() => setOpen(null)}>
          <div className="card-modal-inner" onClick={(e) => e.stopPropagation()}>
            <BallCard key={view} player={open} parallel={view} serial={b.cards[cardKey(open.id, view)]?.serial} big />
            <div className="par-legend">
              {PARALLELS.map((par) => {
                const c = b.cards[cardKey(open.id, par.id)];
                return (
                  <button key={par.id} className={`par-chip p-${par.id} ${view === par.id ? 'sel' : ''}`} disabled={!c} onClick={() => setView(par.id)}>
                    {par.name}{c ? (c.count > 1 ? ` ×${c.count}` : '') : ' 🔒'}
                  </button>
                );
              })}
            </div>
            <p className="muted small">Tap the card to flip it.</p>
            <button className="btn ghost" onClick={() => setOpen(null)}>Close</button>
          </div>
        </div>
      )}
    </main>
  );
}
