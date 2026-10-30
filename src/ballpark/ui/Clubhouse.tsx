// The ballpark's home screen: a stadium plaza to walk around, like the Grade 3 Quest map.

import { Icon, Sprite } from '../../art/sprite';
import { AvatarArt } from '../../avatar/AvatarArt';
import { useMusic } from '../../battle/music';
import { sfx } from '../../battle/sfx';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import { ballLookOf, ballOf, rankOf, RANKS } from '../data';
import { PLAYERS } from '../players';
import { BallBar } from './BallBar';

interface Spot { id: string; label: string; sub: string; e: string; x: number; y: number; size: number; to: string }

export function Clubhouse() {
  const { profile } = useStore();
  useMusic('ballpark');
  if (!profile) return null;
  const b = ballOf(profile);
  const r = rankOf(b.xp);
  const set = PLAYERS.filter((p) => !p.chase);
  const players = set.filter((p) => Object.keys(b.cards).some((k) => k.startsWith(`${p.id}:`))).length;
  const next = RANKS[r.index + 1];
  const spots: Spot[] = [
    { id: 'game', label: 'Play Ball', sub: 'Win to earn 2 to 3 cards', e: '🏟️', x: 50, y: 40, size: 22, to: 'game' },
    { id: 'derby', label: 'Home Run Derby', sub: b.derby.plays ? `Best ${b.derby.bestFeet} ft` : 'Earns 1 to 3 cards', e: '💥', x: 17, y: 52, size: 12, to: 'derby' },
    { id: 'binder', label: 'Card Shop', sub: `${players}/${set.length} players`, e: '🃏', x: 83, y: 52, size: 12, to: 'binder' },
    { id: 'shop', label: 'Pro Shop', sub: `🪙 ${b.coins}`, e: '🏪', x: 28, y: 82, size: 12, to: 'shop' },
    { id: 'locker', label: 'Locker Room', sub: 'Your uniform', e: '👕', x: 72, y: 82, size: 11, to: 'locker' },
  ];
  const open = (to: string) => { sfx.unlock(); sfx.coin(); go(to); };
  return (
    <main className="page ballpark club">
      <BallBar />
      <section className="map-head club-head2">
        <div>
          <strong>{profile.name}'s Sluggers</strong>
          <div className="goal-bar small"><span style={{ width: `${r.need ? (r.into / r.need) * 100 : 100}%` }} /></div>
          <small className="muted"><Icon e={RANKS[r.index].e} /> {RANKS[r.index].name}{next ? ` · ${next.xp - b.xp} XP to ${next.name}` : ''} · Record {b.record.w}-{b.record.l}{b.record.t ? `-${b.record.t}` : ''}</small>
        </div>
        <button className="btn primary" onClick={() => open('game')}>⚾ Play ball!</button>
      </section>

      <div className="plaza">
        <svg viewBox="0 0 1000 640" preserveAspectRatio="none" className="plaza-svg" aria-hidden="true">
          <defs>
            <linearGradient id="pz-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38bdf8" /><stop offset="1" stopColor="#bae6fd" /></linearGradient>
            <linearGradient id="pz-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4ade80" /><stop offset="1" stopColor="#16a34a" /></linearGradient>
            <radialGradient id="pz-plaza"><stop offset="0" stopColor="#fef3c7" /><stop offset="1" stopColor="#e7c08a" /></radialGradient>
          </defs>
          <rect width="1000" height="640" fill="url(#pz-sky)" />
          {/* the Rockies behind the stadium */}
          <path d="M0 230 L90 140 L160 200 L250 100 L340 190 L420 130 L520 210 L600 120 L690 200 L780 110 L870 190 L940 150 L1000 200 L1000 260 L0 260 Z" fill="#94a3b8" />
          <path d="M250 100 L280 130 L262 128 L250 140 L238 126 L222 128 Z M600 120 L628 148 L612 146 L600 156 L588 144 L574 146 Z M780 110 L806 136 L792 134 L780 146 L768 132 L756 134 Z" fill="#fff" />
          <rect y="240" width="1000" height="400" fill="url(#pz-grass)" />
          {Array.from({ length: 10 }, (_, k) => <rect key={k} x={k * 100} y="240" width="50" height="400" fill="rgba(255,255,255,0.05)" />)}
          {/* paths to each place */}
          <g stroke="#e7c08a" strokeWidth="34" strokeLinecap="round" fill="none">
            <path d="M500 450 L500 330" /><path d="M500 450 Q330 420 170 360" /><path d="M500 450 Q670 420 830 360" />
            <path d="M500 450 Q400 500 280 540" /><path d="M500 450 Q600 500 720 540" />
          </g>
          <g stroke="#fef3c7" strokeWidth="4" strokeDasharray="4 18" strokeLinecap="round" fill="none">
            <path d="M500 450 L500 330" /><path d="M500 450 Q330 420 170 360" /><path d="M500 450 Q670 420 830 360" />
            <path d="M500 450 Q400 500 280 540" /><path d="M500 450 Q600 500 720 540" />
          </g>
          <ellipse cx="500" cy="460" rx="120" ry="46" fill="url(#pz-plaza)" stroke="#c99a5b" strokeWidth="4" />
          <circle cx="500" cy="460" r="22" fill="#fff" stroke="#dc2626" strokeWidth="3" />
          <path d="M486 448 Q494 460 486 472 M514 448 Q506 460 514 472" stroke="#dc2626" strokeWidth="3" fill="none" />
          {/* light towers and pennants */}
          {[300, 700].map((x) => (
            <g key={x}>
              <rect x={x - 4} y="80" width="8" height="170" fill="#334155" />
              <rect x={x - 34} y="58" width="68" height="28" rx="4" fill="#334155" />
              {Array.from({ length: 6 }, (_, k) => <circle key={k} cx={x - 24 + (k % 3) * 24} cy={66 + Math.floor(k / 3) * 12} r="5" fill="#fef9c3" />)}
            </g>
          ))}
          {Array.from({ length: 9 }, (_, k) => <path key={k} d={`M ${120 + k * 95} 250 l 0 -40 l 30 10 l -30 10`} fill={['#ef4444', '#facc15', '#3b82f6', '#22c55e', '#a855f7'][k % 5]} stroke="#fff" strokeWidth="2" />)}
        </svg>
        <div className="plaza-trees" aria-hidden="true">
          {[[5, 34], [93, 34], [8, 70], [92, 70], [40, 64], [60, 64], [4, 94], [50, 95], [96, 94]].map(([x, y], i) => (
            <span key={i} style={{ left: `${x}%`, top: `${y}%` }}><Sprite e={i % 3 ? '🌳' : '🌲'} size="100%" /></span>
          ))}
        </div>
        {spots.map((s) => (
          <button key={s.id} className={`plaza-spot ${s.id === 'game' ? 'main' : ''}`} style={{ left: `${s.x}%`, top: `${s.y}%`, ['--sz' as string]: `${s.size}%` }} onClick={() => open(s.to)}>
            <span className="plaza-art"><Sprite e={s.e} size="100%" /></span>
            <span className="plaza-label"><strong>{s.label}</strong><small>{s.sub}</small></span>
          </button>
        ))}
        <div className="plaza-hero" aria-hidden="true">
          <AvatarArt look={ballLookOf(profile)} size={90} background={false} full />
        </div>
      </div>

      <details className="card how">
        <summary>How you earn XP, coins and cards</summary>
        <ul>
          <li><b>XP</b>: 10 for every right answer, 2 for trying. XP moves you up from Rookie to Hall of Famer, and every promotion gives a bonus card (Refractor or better).</li>
          <li><b>Coins</b>: hits (2 to 10), runs (2 each) and outs you pitch (2 or 3), plus 40 for a win, 20 for a tie or 15 for a loss. A derby pays 10, plus 3 a home run. A card you already have trades in for coins.</li>
          <li><b>Cards</b>: 2 for every win, or 3 for a blow-out or shutout (and big wins pull rarer cards). A Home Run Derby gives 1 card, 2 at 4 home runs and 3 at 7.</li>
        </ul>
      </details>
      <div className="row">
        <a className="btn ghost" href="./">← Back to Grade 3 Quest</a>
      </div>
    </main>
  );
}
