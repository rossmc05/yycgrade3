// A collector card: front with the player and the parallel's finish, back with ratings and a fact.

import { useState } from 'react';
import { isOneOfOne, parallelOf, printRunOf, type Parallel } from '../cards';
import { milestoneOf } from '../data';
import { RATING_NAMES, type Player } from '../players';
import { Figure } from './Figure';

const skinOf = (id: string) => [...id].reduce((n, c) => n + c.charCodeAt(0), 0);

export function CardFront({ player, parallel, serial }: { player: Player; parallel: Parallel; serial?: number }) {
  const def = parallelOf(parallel);
  const ms = parallel === 'milestone' ? milestoneOf(player.id) : undefined;
  const run = ms ? ms.serial : printRunOf(player, parallel);
  const [c1, c2] = player.colors;
  return (
    <div className={`bcard-face front p-${parallel} ${ms ? `msf-${ms.style}` : ''} ${player.chase ? 'chase' : ''} ${player.rookie ? 'rookie' : ''}`} style={{ ['--c1' as string]: c1, ['--c2' as string]: c2 }}>
      <div className="bcard-art">
        <div className="bcard-stadium" />
        <Figure color={c1} trim={c2} pose={player.role === 'pitcher' ? 'pitch' : 'bat'} skin={skinOf(player.id)} size={150} />
        {(parallel === 'relic' || ms?.style === 'dynasty') && <span className="relic-swatch" title="Game-worn jersey piece" />}
        {(parallel === 'auto' || player.signed || ms?.style === 'dynasty') && <span className="auto-sig">{player.name}</span>}
        {ms?.style === 'threads' && <span className="ms-42" title="Jersey number patch">42</span>}
        {ms?.style === 'cut' && <span className="ms-cut" title="Cut signature">{player.name}</span>}
        {ms?.style === 'logoman' && <span className="ms-logoman" title="Logo patch"><svg viewBox="0 0 40 24"><rect width="40" height="24" rx="4" fill="#1d4ed8" /><path d="M20 0h16a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H20z" fill="#dc2626" /><circle cx="22" cy="6" r="2.6" fill="#fff" /><path d="M21 9 L14 20 L17 20 L22 12 L26 20 L29 20 L23 9 Z M23 10 L33 5 L34 6.5 L24 12 Z" fill="#fff" /></svg></span>}
        {ms?.style === 'vintage' && <span className="ms-vintage-box">{player.city}</span>}
        {(parallel === 'refractor' || parallel === 'diamond' || parallel === 'super') && <span className="shine" aria-hidden="true" />}
        <span className="bcard-pos">{player.pos}</span>
        {player.canada && <span className="bcard-maple" title="Canadian connection">🍁</span>}
        {(isOneOfOne(player) || ms?.serial) && <span className="bcard-chase">1 of 1</span>}
        {player.rookie && <span className="bcard-rc">RC</span>}
      </div>
      <div className="bcard-name">
        <strong>{player.name}</strong>
        <small>{player.city}{player.legend ? ' · Legend' : player.rookie ? ' · 2025 Rookie' : ''}</small>
      </div>
      <div className="bcard-foot">
        <span className="par">{ms ? ms.title : player.chase ? 'Chase Autograph' : player.signed ? 'Superfractor Auto' : def.name}</span>
        {serial !== undefined && run && <span className="serial">{serial}/{run}</span>}
      </div>
    </div>
  );
}

export function CardBack({ player, parallel }: { player: Player; parallel: Parallel }) {
  const names = RATING_NAMES[player.role];
  return (
    <div className={`bcard-face back p-${parallel}`} style={{ ['--c1' as string]: player.colors[0], ['--c2' as string]: player.colors[1] }}>
      <strong>{player.name}</strong>
      <small>{player.pos} · {player.city}</small>
      <div className="ratings">
        {names.map((n, i) => (
          <div key={n} className="rating">
            <span>{n}</span>
            <span className="rbar"><span style={{ width: `${player.ratings[i]}%` }} /></span>
            <b>{player.ratings[i]}</b>
          </div>
        ))}
      </div>
      <p>{player.fact}</p>
      <small className="muted">{parallel === 'milestone' ? `${milestoneOf(player.id)?.rank} milestone. ${milestoneOf(player.id)?.about}` : player.chase ? 'The chase card. Signed, and only one was ever made.' : player.rookie ? `Rookie Superfractor${player.signed ? ' Autograph, signed by the player' : ''}. Swirling rainbow gold, and only one was ever made.` : parallelOf(parallel).about}</small>
    </div>
  );
}

/**
 * A card that flips over when tapped. Only one side is drawn at a time (some tablets
 * show both sides of a 3D flip at once), with a quick turn animation between them.
 */
export function BallCard({ player, parallel, serial, big }: { player: Player; parallel: Parallel; serial?: number; big?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button className={`bcard ${big ? 'big' : ''}`} onClick={() => setFlipped((f) => !f)} aria-label={`${player.name}, ${parallelOf(parallel).name} card. Tap to flip.`}>
      <span key={flipped ? 'back' : 'front'} className="bcard-inner turn">
        {flipped ? <CardBack player={player} parallel={parallel} /> : <CardFront player={player} parallel={parallel} serial={serial} />}
      </span>
    </button>
  );
}

/** Pulling a card: it spins in, then shows what it is. */
export function CardReveal({ player, parallel, serial, isNew, coins, label }: { player: Player; parallel: Parallel; serial?: number; isNew: boolean; coins: number; label?: string }) {
  const def = parallelOf(parallel);
  const ms = parallel === 'milestone' ? milestoneOf(player.id) : undefined;
  const run = ms ? ms.serial : printRunOf(player, parallel);
  return (
    <div className={`card-reveal p-${parallel}`}>
      <div className="reveal-spin"><BallCard player={player} parallel={parallel} serial={serial} /></div>
      <div className="reveal-text">
        {label && <small className="muted">{label}</small>}
        <small className="rarity">{ms ? `${ms.rank.toUpperCase()} MILESTONE · ${ms.title}` : player.chase ? 'THE CHASE CARD' : player.rookie ? (player.signed ? 'ROOKIE SUPERFRACTOR AUTO' : 'ROOKIE SUPERFRACTOR') : def.name}{run && serial ? ` · ${serial}/${run}` : ''}</small>
        <strong>{isNew ? `${player.name}!` : `${player.name} again!`}</strong>
        <p className="muted small">{isNew ? 'Added to your Card Binder. Tap the card to flip it.' : `You already had this one, so you traded it for ${coins} coins.`}</p>
      </div>
    </div>
  );
}
