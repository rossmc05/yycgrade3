import { useId, useState } from 'react';
import { useMusic } from '../../battle/music';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import { CHASE, cardKey, isOneOfOne, oneOfOneParallel, parallelOf, PARALLELS, RANK, ROOKIES, type Parallel } from '../cards';
import { ballOf, MILESTONES, MOMENT_CARDS, RANKS } from '../data';
import { playerById, PLAYERS, type Player } from '../players';
import { BallBar } from './BallBar';
import { BallCard, CardFront } from './Card';

const GROUPS = [
  { name: "Today's stars", has: (p: Player) => !p.legend && !p.rookie && !p.milestone },
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
    <main className="page ballpark binder-page">
      <BallBar back={() => go('')} />
      <section className="album-cover">
        <div className="album-title">
          <small>Collector's Album</small>
          <h1>Card Binder</h1>
        </div>
        <div className="album-count"><b>{count}</b><span>of {SET.length} players</span></div>
        <div className="album-bar"><span style={{ width: `${(count / SET.length) * 100}%` }} /></div>
        <div className="par-legend">
          {byPar.map(({ par, n }) => <span key={par.id} className={`par-chip p-${par.id}`}><i />{par.name} <b>{n}</b></span>)}
        </div>
        <p className="album-note">Each player comes in six versions, from Base to a signed Autograph. Tap a card to see every version you have.</p>
      </section>

      <section className="album-sec chase-sec">
        <div className="album-sleeves solo">
          {hasChase ? (
            <button className="binder-slot" onClick={() => { setOpen(CHASE); setView('auto'); }} aria-label="Babe Ruth chase autograph">
              <span className="mini-card"><CardFront player={CHASE} parallel="auto" serial={1} /></span>
            </button>
          ) : (
            <div className="binder-slot empty" aria-label="Chase card not found yet">
              <span className="mini-card blank gold"><StarIcon /><b>1 of 1</b><small>Chase Auto</small></span>
            </div>
          )}
        </div>
        <div>
          <SecHead name="The Chase Card" got={hasChase ? 1 : 0} of={1} />
          <p className="album-note">{hasChase ? 'You found it! A signed Babe Ruth, and the only one ever made.' : 'Somewhere out there is one signed Babe Ruth card, numbered 1 of 1. Any card you win might be it. Luck from big wins and the Lucky Cap help.'}</p>
        </div>
      </section>

      {[{ name: 'Milestone Cards', note: "Can't be pulled from a pack. Each one unlocks when you reach that rank.", list: MILESTONES },
        { name: 'Moment Cards', note: 'Do something big in a game or Derby to unlock these.', list: MOMENT_CARDS }].map((row) => (
        <section key={row.name} className="album-sec">
          <SecHead name={row.name} got={row.list.filter((m) => b.cards[cardKey(m.player, 'milestone')]).length} of={row.list.length} />
          <p className="album-note">{row.note}</p>
          <div className="album-sleeves">
            {row.list.map((m) => {
              const p = playerById(m.player)!;
              const xp = m.rank ? RANKS.find((r) => r.name === m.rank)!.xp : 0;
              return b.cards[cardKey(m.player, 'milestone')] ? (
                <button key={m.player} className="binder-slot" onClick={() => { setOpen(p); setView('milestone'); }} aria-label={`${p.name} ${m.title}`}>
                  <span className="mini-card"><CardFront player={p} parallel="milestone" serial={m.serial} /></span>
                </button>
              ) : (
                <div key={m.player} className="binder-slot empty" aria-label={m.how}>
                  <span className="mini-card blank gold"><LockIcon />{m.rank ? <><b>{m.rank}</b><small>{xp.toLocaleString()} XP</small></> : <small>{m.how}</small>}</span>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="album-sec super-sec">
        <SecHead name="Rookie Superfractors" got={ROOKIES.filter((p) => b.cards[cardKey(p.id, 'super')]).length} of={ROOKIES.length} />
        <p className="album-note">The top rookies of 2025, each in one rainbow-gold Superfractor numbered 1 of 1. Rarer than an Autograph.</p>
        <div className="album-sleeves">
          {ROOKIES.map((p) => b.cards[cardKey(p.id, 'super')] ? (
            <button key={p.id} className="binder-slot" onClick={() => { setOpen(p); setView('super'); }} aria-label={`${p.name} Superfractor`}>
              <span className="mini-card"><CardFront player={p} parallel="super" serial={1} /></span>
            </button>
          ) : (
            <div key={p.id} className="binder-slot empty" aria-label="Superfractor not found yet">
              <span className="mini-card blank prism"><SuperIcon /><b>1 of 1</b><small>{p.pos}{p.signed ? ' · Auto' : ''}</small></span>
            </div>
          ))}
        </div>
      </section>

      {GROUPS.map((g) => {
        const list = PLAYERS.filter(g.has);
        const got = list.filter((p) => owned(p).length).length;
        return (
          <section key={g.name} className="album-sec">
            <SecHead name={g.name} got={got} of={list.length} />
            <div className="album-sleeves">
              {list.map((p) => {
                const top = best(p);
                return top ? (
                  <button key={p.id} className="binder-slot" onClick={() => { setOpen(p); setView(top); }} aria-label={`${p.name}, best card ${top}`}>
                    <span className="mini-card"><CardFront player={p} parallel={top} serial={b.cards[cardKey(p.id, top)]?.serial} /></span>
                    {owned(p).length > 1 && <span className="have-n">{owned(p).length} versions</span>}
                  </button>
                ) : (
                  <div key={p.id} className="binder-slot empty" aria-label="Not collected yet">
                    <span className="mini-card blank"><b>{p.pos}</b><small>{p.city}</small></span>
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

function SecHead({ name, got, of }: { name: string; got: number; of: number }) {
  return (
    <h2 className="album-head">
      <span>{name}</span>
      <small>{got} / {of}</small>
    </h2>
  );
}

const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    <path d="M12 15v2" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
  </svg>
);

/** The Superfractor mark: a prism-foil sparkle. */
function SuperIcon() {
  const id = useId();
  return (
    <svg viewBox="0 0 40 40" width="38" height="38" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0abfc" />
          <stop offset="0.35" stopColor="#fde68a" />
          <stop offset="0.65" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <path d="M20 2 C21.5 13 27 18.5 38 20 C27 21.5 21.5 27 20 38 C18.5 27 13 21.5 2 20 C13 18.5 18.5 13 20 2 Z" fill={`url(#${id})`} stroke="#fef3c7" strokeWidth="0.8" />
      <path d="M20 8 L20 32 M8 20 L32 20" stroke="rgba(255,255,255,0.55)" strokeWidth="0.6" />
      <path d="M33 4 C33.4 6.6 34.4 7.6 37 8 C34.4 8.4 33.4 9.4 33 12 C32.6 9.4 31.6 8.4 29 8 C31.6 7.6 32.6 6.6 33 4 Z" fill="#fef3c7" />
    </svg>
  );
}
