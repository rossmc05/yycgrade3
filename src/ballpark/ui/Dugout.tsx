// The Dugout: pick your batting order and ace from the cards you own.

import { useState } from 'react';
import { AvatarArt } from '../../avatar/AvatarArt';
import { useMusic } from '../../battle/music';
import { sfx } from '../../battle/sfx';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import { parallelOf } from '../cards';
import { ballLookOf, ballOf } from '../data';
import { bestSquad, LINEUP_SIZE, roster, squadOf, teamOvr, type Squad, type TeamCard } from '../squad';
import { BallBar } from './BallBar';
import { CardFront } from './Card';

type Pick = { slot: number } | { ace: true };

export function Dugout() {
  const { profile, updateProfile } = useStore();
  const [pick, setPick] = useState<Pick | null>(null);
  useMusic('ballpark');
  if (!profile) return null;
  const b = ballOf(profile);
  const team = squadOf(b);
  const ids = team.lineup.map((c) => c.player.id);
  const save = (s: Squad) => { sfx.coin(); updateProfile((p) => ({ ...p, ball: { ...ballOf(p), squad: s } })); };
  const setLineup = (lineup: string[]) => save({ lineup, ace: team.ace?.player.id });
  const move = (i: number, by: number) => {
    const next = [...ids];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    setLineup(next);
  };
  const hitters = roster(b, 'hitter');
  const pitchers = roster(b, 'pitcher');
  const choices = pick ? ('ace' in pick ? pitchers.filter((c) => c.player.id !== team.ace?.player.id) : hitters.filter((c) => !ids.includes(c.player.id))) : [];
  const choose = (c: TeamCard | null) => {
    if (!pick) return;
    if ('ace' in pick) save({ lineup: ids, ace: c?.player.id });
    else {
      const next = [...ids];
      if (c) next[pick.slot] = c.player.id; else next.splice(pick.slot, 1);
      setLineup(next.filter(Boolean));
    }
    setPick(null);
  };

  return (
    <main className="page ballpark binder-page dugout">
      <BallBar back={() => go('')} />
      <section className="album-cover">
        <div className="album-title">
          <small>{profile.name}'s Sluggers</small>
          <h1>The Dugout</h1>
        </div>
        <div className="album-count"><b>{teamOvr(b)}</b><span>Team overall</span></div>
        <p className="album-note">Build your team from your cards. When one of your players is up, a right answer can turn into an extra base. Your ace can save a wrong answer on the mound with a strikeout. Better versions of a card rate higher.</p>
        <button className="btn album-btn" onClick={() => save(bestSquad(b))}>Use my best cards</button>
      </section>

      <section className="album-sec">
        <h2 className="album-head"><span>Batting order</span><small>{team.lineup.length + 1} / {LINEUP_SIZE + 1}</small></h2>
        <ol className="order">
          <li className="order-row you">
            <span className="order-n">1</span>
            <span className="order-card you-card"><AvatarArt look={ballLookOf(profile)} size={54} background={false} /></span>
            <span className="order-name"><strong>{profile.name}</strong><small>Leadoff · always bats first</small></span>
          </li>
          {Array.from({ length: LINEUP_SIZE }, (_, i) => {
            const c = team.lineup[i];
            return c ? (
              <li key={c.player.id} className="order-row">
                <span className="order-n">{i + 2}</span>
                <Row c={c} what="extra base" onClick={() => setPick({ slot: i })} />
                <span className="order-move">
                  <button aria-label={`Move ${c.player.name} up`} disabled={i === 0} onClick={() => move(i, -1)}>▲</button>
                  <button aria-label={`Move ${c.player.name} down`} disabled={i === team.lineup.length - 1} onClick={() => move(i, 1)}>▼</button>
                </span>
              </li>
            ) : (
              <li key={`empty-${i}`} className="order-row empty">
                <span className="order-n">{i + 2}</span>
                <button className="order-pick" onClick={() => setPick({ slot: team.lineup.length })} disabled={hitters.length <= team.lineup.length}>
                  {hitters.length > team.lineup.length ? '+ Add a hitter' : 'Win more cards to fill this spot'}
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="album-sec">
        <h2 className="album-head"><span>Your ace</span><small>Pitcher</small></h2>
        <ol className="order">
          {team.ace ? (
            <li className="order-row"><span className="order-n">P</span><Row c={team.ace} what="strikeout save" onClick={() => setPick({ ace: true })} /></li>
          ) : (
            <li className="order-row empty">
              <span className="order-n">P</span>
              <button className="order-pick" onClick={() => setPick({ ace: true })} disabled={!pitchers.length}>{pitchers.length ? '+ Pick your ace' : 'Win a pitcher card to have an ace'}</button>
            </li>
          )}
        </ol>
      </section>

      {pick && (
        <div className="card-modal" role="dialog" aria-label="Pick a player" onClick={() => setPick(null)}>
          <div className="card-modal-inner pick-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="album-head"><span>{'ace' in pick ? 'Pick your ace' : `Batting ${pick.slot + 2}${['th', 'st', 'nd', 'rd'][pick.slot + 2] ?? 'th'}`}</span><small>Best first</small></h2>
            {choices.length ? (
              <div className="pick-grid">
                {choices.map((c) => (
                  <button key={c.player.id} className="binder-slot" onClick={() => choose(c)} aria-label={`${c.player.name}, ${c.ovr} overall`}>
                    <span className="mini-card"><CardFront player={c.player} parallel={c.parallel} /></span>
                    <span className="pick-ovr">{c.ovr} OVR</span>
                  </button>
                ))}
              </div>
            ) : <p className="album-note">No other cards to pick yet. Win games to pull more!</p>}
            <div className="row">
              {(('ace' in pick && team.ace) || (!('ace' in pick) && team.lineup[pick.slot])) && <button className="btn" onClick={() => choose(null)}>Take out of the lineup</button>}
              <button className="btn" onClick={() => setPick(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Row({ c, what, onClick }: { c: TeamCard; what: string; onClick: () => void }) {
  return (
    <button className="order-main" onClick={onClick} aria-label={`${c.player.name}. Tap to change.`}>
      <span className="order-card"><span className="mini-card"><CardFront player={c.player} parallel={c.parallel} /></span></span>
      <span className="order-name"><strong>{c.player.name}</strong><small>{c.player.pos} · {parallelOf(c.parallel).name}</small></span>
      <span className="order-ovr"><b>{c.ovr}</b><small>+{Math.round(c.boost * 100)}%<em> {what}</em></small></span>
    </button>
  );
}
