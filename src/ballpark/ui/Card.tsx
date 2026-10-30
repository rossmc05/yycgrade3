// A collector card: front with the player and the parallel's finish, back with ratings and a fact.

import { useState } from 'react';
import { parallelOf, type Parallel } from '../cards';
import { RATING_NAMES, type Player } from '../players';
import { Figure } from './Figure';

const skinOf = (id: string) => [...id].reduce((n, c) => n + c.charCodeAt(0), 0);

export function CardFront({ player, parallel, serial }: { player: Player; parallel: Parallel; serial?: number }) {
  const def = parallelOf(parallel);
  const [c1, c2] = player.colors;
  return (
    <div className={`bcard-face front p-${parallel}`} style={{ ['--c1' as string]: c1, ['--c2' as string]: c2 }}>
      <div className="bcard-art">
        <div className="bcard-stadium" />
        <Figure color={c1} trim={c2} pose={player.role === 'pitcher' ? 'pitch' : 'bat'} skin={skinOf(player.id)} size={150} />
        {parallel === 'relic' && <span className="relic-swatch" title="Game-worn jersey piece" />}
        {parallel === 'auto' && <span className="auto-sig">{player.name}</span>}
        {(parallel === 'refractor' || parallel === 'diamond') && <span className="shine" aria-hidden="true" />}
        <span className="bcard-pos">{player.pos}</span>
        {player.canada && <span className="bcard-maple" title="Canadian connection">🍁</span>}
      </div>
      <div className="bcard-name">
        <strong>{player.name}</strong>
        <small>{player.city}{player.legend ? ' · Legend' : ''}</small>
      </div>
      <div className="bcard-foot">
        <span className="par">{def.name}</span>
        {serial !== undefined && def.printRun && <span className="serial">{serial}/{def.printRun}</span>}
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
      <small className="muted">{parallelOf(parallel).about}</small>
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
  return (
    <div className={`card-reveal p-${parallel}`}>
      <div className="reveal-spin"><BallCard player={player} parallel={parallel} serial={serial} /></div>
      <div className="reveal-text">
        {label && <small className="muted">{label}</small>}
        <small className="rarity">{def.name}{def.printRun && serial ? ` · ${serial}/${def.printRun}` : ''}</small>
        <strong>{isNew ? `${player.name}!` : `${player.name} again!`}</strong>
        <p className="muted small">{isNew ? 'Added to your Card Binder. Tap the card to flip it.' : `You already had this one, so you traded it for ${coins} coins.`}</p>
      </div>
    </div>
  );
}
