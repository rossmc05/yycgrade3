import { useState } from 'react';
import { useMusic } from '../../battle/music';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import { CHASE, cardKey, isOneOfOne, oneOfOneParallel, parallelOf, PARALLELS, RANK, ROOKIES, type Parallel } from '../cards';
import { ballOf, MILESTONES, RANKS } from '../data';
import { playerById, PLAYERS, type Player } from '../players';
import { BallBar } from './BallBar';
import { BallCard, CardFront } from './Card';

const GROUPS = [
  { name: "Today's stars", has: (p: Player) => !p.legend && !p.rookie },
  { name: 'Legends', has: (p: Player) => !!p.legend && !p.chase && !p.milestone },
];
const SET = PLAYERS.filter((p) => !isOneOfOne(p) && !p.milestone);

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
  const count = SET.filter((p) => owned(p).length).length;
  const hasChase = !!b.cards[cardKey(CHASE.id, 'auto')];
  const byPar = PARALLELS.map((par) => ({ par, n: SET.filter((p) => b.cards[cardKey(p.id, par.id)]).length }));

  return (
    <main className="page ballpark">
      <BallBar back={() => go('')} />
      <section className="card book-head">
        <div>
          <h1>Card Binder</h1>
          <p className="muted">{count} of {SET.length} players collected. Each player comes in six versions, from Base to a signed Autograph.</p>
          <div className="goal-bar"><span style={{ width: `${(count / SET.length) * 100}%` }} /></div>
          <div className="par-legend">
            {byPar.map(({ par, n }) => <span key={par.id} className={`par-chip p-${par.id}`}>{par.name} <b>{n}</b></span>)}
          </div>
        </div>
      </section>
      <section className="chase-row">
        {hasChase ? (
          <button className="binder-slot chase" onClick={() => { setOpen(CHASE); setView('auto'); }} aria-label="Babe Ruth chase autograph">
            <span className="mini-card"><CardFront player={CHASE} parallel="auto" serial={1} /></span>
          </button>
        ) : (
          <div className="binder-slot empty chase" aria-label="Chase card not found yet">
            <span className="mini-card blank"><span>⭐</span><small>1 of 1</small></span>
          </div>
        )}
        <div>
          <h2 className="strand">The chase card</h2>
          <p className="muted small">{hasChase ? 'You found it! A signed Babe Ruth, and the only one ever made.' : 'Somewhere out there is one signed Babe Ruth card, numbered 1 of 1. Any card you win might be it. Luck from big wins and the Lucky Cap help.'}</p>
        </div>
      </section>
      <section className="chase-row super-row milestone-row">
        <div>
          <h2 className="strand">Milestone cards <small>{MILESTONES.filter((m) => b.cards[cardKey(m.player, 'milestone')]).length}/{MILESTONES.length}</small></h2>
          <p className="muted small">Can't be pulled from a pack. Each one unlocks when you reach that rank.</p>
          <div className="super-slots">
            {MILESTONES.map((m) => {
              const p = playerById(m.player)!;
              const xp = RANKS.find((r) => r.name === m.rank)!.xp;
              return b.cards[cardKey(m.player, 'milestone')] ? (
                <button key={m.player} className="binder-slot" onClick={() => { setOpen(p); setView('milestone'); }} aria-label={`${p.name} ${m.title}`}>
                  <span className="mini-card"><CardFront player={p} parallel="milestone" serial={m.serial} /></span>
                </button>
              ) : (
                <div key={m.player} className="binder-slot empty" aria-label={`Unlocks at ${m.rank}`}>
                  <span className="mini-card blank"><span>🔒</span><small>{m.rank} · {xp.toLocaleString()} XP</small></span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="chase-row super-row">
        <div>
          <h2 className="strand">Rookie Superfractors <small>{ROOKIES.filter((p) => b.cards[cardKey(p.id, 'super')]).length}/{ROOKIES.length}</small></h2>
          <p className="muted small">The top rookies of 2025, each in one rainbow-gold Superfractor numbered 1 of 1. Rarer than an Autograph.</p>
          <div className="super-slots">
            {ROOKIES.map((p) => b.cards[cardKey(p.id, 'super')] ? (
              <button key={p.id} className="binder-slot super" onClick={() => { setOpen(p); setView('super'); }} aria-label={`${p.name} Superfractor`}>
                <span className="mini-card"><CardFront player={p} parallel="super" serial={1} /></span>
              </button>
            ) : (
              <div key={p.id} className="binder-slot empty super" aria-label="Superfractor not found yet">
                <span className="mini-card blank"><span>🌈</span><small>{p.pos} · 1 of 1</small></span>
              </div>
            ))}
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
              {(view === 'milestone' ? [parallelOf('milestone')] : isOneOfOne(open) ? [parallelOf(oneOfOneParallel(open))] : PARALLELS).map((par) => {
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
