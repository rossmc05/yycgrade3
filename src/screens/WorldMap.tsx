import { useEffect, useRef, useState } from 'react';
import { AvatarArt } from '../avatar/AvatarArt';
import { lookOf } from '../avatar/catalog';
import { dailySubject } from '../battle/zones';
import { sfx } from '../battle/sfx';
import { TopBar } from '../components/TopBar';
import { dayKey } from '../engine/adaptive';
import { useStore } from '../engine/store';
import { guideLine, isOpen, neighbour, placeOf, PLACES, quests, route, type Place, type PlaceId } from '../map/world';
import { go } from '../router';
import { findSubject } from '../subjects';

const W = 1000;
const H = 640;
const SPEED = 0.55; // map units per millisecond

const VILLAGE_SPOTS = [
  { id: 'arcade', label: 'Arcade', icon: '🕹️', x: 430, y: 285, to: () => go('arcade') },
  { id: 'avatar', label: 'Avatar Studio', icon: '🎨', x: 575, y: 280, to: () => go('avatar') },
  { id: 'rewards', label: 'Trophy Room', icon: '🏆', x: 420, y: 385, to: () => go('rewards') },
  { id: 'world', label: 'My World', icon: '🏡', x: 585, y: 385, to: () => go('world') },
];

function loadAt(profileId: string): PlaceId {
  try {
    const v = localStorage.getItem(`g3-map-at-${profileId}`);
    if (v && placeOf(v)) return v as PlaceId;
  } catch {
    /* storage blocked */
  }
  return 'village';
}

function saveAt(profileId: string, at: PlaceId) {
  try {
    localStorage.setItem(`g3-map-at-${profileId}`, at);
  } catch {
    /* storage blocked */
  }
}

function MapArt({ open, today }: { open: Record<string, boolean>; today: string }) {
  return (
    <svg className="map-art" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs>
        <linearGradient id="map-grass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bbf7d0" />
          <stop offset="1" stopColor="#86efac" />
        </linearGradient>
        <filter id="map-soft"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>
      <rect width={W} height={H} fill="#7dd3fc" />
      <path d="M40 60 Q500 -10 960 60 Q1010 320 960 590 Q500 660 40 590 Q-10 320 40 60Z" fill="url(#map-grass)" stroke="#fef3c7" strokeWidth="10" />
      {/* river from the mountains to the sea */}
      <path d="M300 70 Q330 200 380 250 Q430 300 400 400 Q370 500 420 640" stroke="#38bdf8" strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M300 70 Q330 200 380 250 Q430 300 400 400 Q370 500 420 640" stroke="#bae6fd" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="10 18" className="river-flow" />
      {/* paths from the village */}
      {PLACES.filter((p) => p.id !== 'village').map((p) => (
        <path key={p.id} d={`M500 330 Q${(500 + p.x) / 2 + (p.y < 330 ? 40 : -40)} ${(330 + p.y) / 2} ${p.x} ${p.y}`} stroke="#fde68a" strokeWidth="16" fill="none" strokeLinecap="round" opacity={open[p.id] ? 1 : 0.45} />
      ))}
      {PLACES.filter((p) => p.id !== 'village').map((p) => (
        <path key={`d-${p.id}`} d={`M500 330 Q${(500 + p.x) / 2 + (p.y < 330 ? 40 : -40)} ${(330 + p.y) / 2} ${p.x} ${p.y}`} stroke="#d97706" strokeWidth="3" fill="none" strokeDasharray="2 14" strokeLinecap="round" opacity={open[p.id] ? 0.7 : 0.25} />
      ))}
      {/* trees */}
      {[[120, 300], [340, 120], [650, 90], [660, 560], [900, 300], [330, 560], [120, 120], [880, 560], [640, 240], [360, 420]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x="-4" y="6" width="8" height="14" fill="#92400e" />
          <polygon points="0,-24 18,8 -18,8" fill={i % 2 ? '#15803d' : '#16a34a'} />
          <polygon points="0,-36 13,-10 -13,-10" fill={i % 2 ? '#16a34a' : '#22c55e'} />
        </g>
      ))}
      {/* Math Mountains */}
      <g transform="translate(225 160)">
        <polygon points="-130,60 -60,-70 0,40 60,-100 140,60" fill="#64748b" stroke="#334155" strokeWidth="5" strokeLinejoin="round" />
        <polygon points="-60,-70 -42,-40 -78,-40" fill="#fff" />
        <polygon points="60,-100 84,-60 36,-60" fill="#fff" />
        <text x="10" y="35" textAnchor="middle" fontSize="26" fontWeight="900" fill="#e2e8f0">+ × ÷</text>
      </g>
      {/* Spelling Swamp */}
      <g transform="translate(205 480)">
        <ellipse rx="125" ry="60" fill="#065f46" stroke="#064e3b" strokeWidth="5" />
        <ellipse cx="-40" cy="-5" rx="26" ry="8" fill="#4ade80" />
        <ellipse cx="45" cy="15" rx="20" ry="6" fill="#4ade80" />
        {[-90, -70, 80, 100].map((x) => <g key={x}><rect x={x} y="-70" width="5" height="50" fill="#3f6212" /><ellipse cx={x + 2.5} cy="-72" rx="5" ry="13" fill="#78350f" /></g>)}
        <text x="0" y="40" textAnchor="middle" fontSize="22" fontWeight="900" fill="#a7f3d0">a b c</text>
      </g>
      {/* Grammar Garage */}
      <g transform="translate(520 530) scale(0.85)">
        <rect x="-95" y="-70" width="190" height="90" rx="8" fill="#64748b" stroke="#1e293b" strokeWidth="5" />
        <polygon points="-110,-70 0,-120 110,-70" fill="#dc2626" stroke="#1e293b" strokeWidth="5" strokeLinejoin="round" />
        <rect x="-60" y="-45" width="120" height="65" fill="#94a3b8" stroke="#1e293b" strokeWidth="4" />
        {[0, 1, 2].map((i) => <rect key={i} x="-60" y={-38 + i * 20} width="120" height="4" fill="#475569" />)}
        <circle cx="0" cy="-88" r="14" fill="#facc15" stroke="#1e293b" strokeWidth="4" />
      </g>
      {/* Science Badlands */}
      <g transform="translate(800 440)">
        <ellipse rx="140" ry="70" fill="#fdba74" stroke="#c2410c" strokeWidth="5" />
        {[[-70, 90], [-10, 120], [50, 80]].map(([x, h]) => (
          <g key={x}>
            <rect x={x} y={20 - h} width="28" height={h} rx="8" fill="#ea580c" stroke="#9a3412" strokeWidth="4" />
            <ellipse cx={x + 14} cy={20 - h} rx="22" ry="8" fill="#78350f" />
          </g>
        ))}
        <path d="M70 30 q10 -6 20 0" stroke="#fff7ed" strokeWidth="5" fill="none" />
      </g>
      {/* Typing Tower */}
      <g transform="translate(790 195)">
        <rect x="-38" y="-120" width="76" height="160" fill="#a5b4fc" stroke="#312e81" strokeWidth="5" />
        {[-100, -70, -40].map((y) => <rect key={y} x="-16" y={y} width="32" height="18" rx="4" fill="#312e81" />)}
        <polygon points="-50,-120 0,-175 50,-120" fill="#4338ca" stroke="#312e81" strokeWidth="5" strokeLinejoin="round" />
        <rect x="-60" y="30" width="120" height="16" rx="4" fill="#e0e7ff" stroke="#312e81" strokeWidth="4" />
        {[-48, -32, -16, 0, 16, 32].map((x) => <rect key={x} x={x} y="34" width="12" height="8" rx="2" fill="#6366f1" />)}
      </g>
      {/* Home Village */}
      <g transform="translate(500 330)">
        <circle r="95" fill="#fef3c7" stroke="#f59e0b" strokeWidth="5" />
        <circle r="22" fill="#38bdf8" stroke="#0284c7" strokeWidth="4" />
        <circle r="8" fill="#e0f2fe" />
      </g>
      {/* fog over closed zones */}
      {PLACES.filter((p) => !open[p.id]).map((p) => (
        <g key={`fog-${p.id}`}>
          <circle cx={p.x} cy={p.y - 20} r="135" fill="#f1f5f9" opacity="0.82" filter="url(#map-soft)" />
        </g>
      ))}
      {today && (() => {
        const t = placeOf(today);
        return t ? (
          <g transform={`translate(${t.x + 70} ${t.y - 95})`}><g className="quest-mark">
            <circle r="22" fill="#facc15" stroke="#1e293b" strokeWidth="4" />
            <text y="10" textAnchor="middle" fontSize="30" fontWeight="900" fill="#1e293b">!</text>
          </g></g>
        ) : null;
      })()}
    </svg>
  );
}

export function WorldMap() {
  const { profile, data } = useStore();
  const [at, setAt] = useState<PlaceId>(() => (profile ? loadAt(profile.id) : 'village'));
  const [pos, setPos] = useState(() => placeOf(at)!);
  const [dur, setDur] = useState(0);
  const [walking, setWalking] = useState(false);
  const [card, setCard] = useState<PlaceId | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  if (!profile) return null;

  const now = Date.now();
  const open = Object.fromEntries(PLACES.map((p) => [p.id, isOpen(p, profile)]));
  const today = dailySubject(now, data.settings.focus);
  const goal = data.settings.dailyGoal;
  const doneToday = profile.days[dayKey(now)]?.questions ?? 0;

  const walkTo = (to: PlaceId, then?: () => void) => {
    if (walking) return;
    sfx.unlock();
    const steps = route(at, to).slice(1);
    if (!steps.length) {
      then ? then() : setCard(to);
      return;
    }
    setCard(null);
    setWalking(true);
    let t = 0;
    let prev = placeOf(at)!;
    for (const id of steps) {
      const next = placeOf(id)!;
      const ms = Math.hypot(next.x - prev.x, next.y - prev.y) / SPEED;
      timers.current.push(window.setTimeout(() => { setDur(ms); setPos(next); }, t));
      t += ms;
      prev = next;
    }
    timers.current.push(window.setTimeout(() => {
      setWalking(false);
      setAt(to);
      saveAt(profile.id, to);
      sfx.coin();
      then ? then() : setCard(to);
    }, t + 60));
  };

  const enter = (id: PlaceId) => {
    if (!open[id]) return;
    if (id === 'village') return setCard('village');
    go(id === 'typing' ? 'subject' : 'zone', id === 'typing' ? 'typing' : id);
  };

  // Arrow keys walk to the next place in that direction; Enter goes in.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const dirs: Record<string, [number, number]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      if (dirs[e.key]) {
        e.preventDefault();
        const n = neighbour(at, ...dirs[e.key]);
        if (n) walkTo(n);
      } else if (e.key === 'Enter' && !walking) {
        enter(at);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  const cardPlace = card ? placeOf(card) : undefined;

  return (
    <main className="page map-page">
      <TopBar />
      <section className="map-head">
        <div>
          <strong>Hi {profile.name}!</strong>
          <div className="goal-bar small"><span style={{ width: `${Math.min(100, (doneToday / goal) * 100)}%` }} /></div>
          <small className="muted">{doneToday >= goal ? 'Daily goal done! 🎉' : `${doneToday} of ${goal} questions today`}</small>
        </div>
        <button className="btn primary" onClick={() => walkTo(today, () => go('play', 'all', 'mix'))}>
          ⚔️ Today's quest: {placeOf(today)?.name}
        </button>
      </section>

      <div className="map-frame">
        <MapArt open={open} today={today} />
        {PLACES.map((p) => (
          <button
            key={p.id}
            className={`map-place ${open[p.id] ? '' : 'locked'} ${p.id === 'village' ? 'village' : ''} ${at === p.id && !walking ? 'here' : ''}`}
            style={{ left: `${(p.x / W) * 100}%`, top: `${((p.y + (p.id === 'village' ? -118 : 70)) / H) * 100}%` }}
            onClick={() => (at === p.id && !walking ? enter(p.id) : walkTo(p.id))}
          >
            {open[p.id] ? p.name : `🔒 ${p.name}`}
            {!open[p.id] && <small>{p.unlockAt - profile.totalCorrect} more right answers</small>}
          </button>
        ))}
        {VILLAGE_SPOTS.map((s) => (
          <button
            key={s.id}
            className="map-spot"
            style={{ left: `${(s.x / W) * 100}%`, top: `${(s.y / H) * 100}%` }}
            onClick={() => walkTo('village', s.to)}
            aria-label={s.label}
            title={s.label}
          >
            <span>{s.icon}</span>
            <small>{s.label}</small>
          </button>
        ))}
        <div
          className={`map-hero ${walking ? 'walking' : ''}`}
          style={{ left: `${(pos.x / W) * 100}%`, top: `${(pos.y / H) * 100}%`, transitionDuration: `${dur}ms` }}
        >
          <AvatarArt look={lookOf(profile)} size={64} background={false} />
        </div>
        {cardPlace && <PlaceCard place={cardPlace} open={open[cardPlace.id]} onEnter={() => enter(cardPlace.id)} onClose={() => setCard(null)} />}
      </div>

      <p className="muted small center-text">Tap a place to walk there, then tap it again to go in. On a keyboard, use the arrow keys and Enter.</p>
      <div className="row"><button className="link" onClick={() => go("menu")}>Classic menu</button><button className="link" onClick={() => go("parent")}>Grown-ups</button></div>
    </main>
  );
}

function PlaceCard({ place, open, onEnter, onClose }: { place: Place; open: boolean; onEnter: () => void; onClose: () => void }) {
  const { profile } = useStore();
  if (!profile) return null;
  if (place.id === 'village') {
    return (
      <section className="card place-card" role="dialog" aria-label={place.name}>
        <strong>🏘️ Home Village</strong>
        <p>Visit the Arcade, the Avatar Studio, the Trophy Room or My World. Tap a building!</p>
        <button className="btn ghost" onClick={onClose}>OK</button>
      </section>
    );
  }
  const subject = findSubject(place.id);
  const line = !open
    ? `This zone opens at ${place.unlockAt} right answers. You have ${profile.totalCorrect}. Keep battling!`
    : place.id === 'typing'
      ? 'Hoo! Climb the tower and train your fingers to type fast.'
      : guideLine(place, quests(subject?.skills ?? [], profile, Date.now()));
  return (
    <section className="card place-card" role="dialog" aria-label={place.name}>
      <div className="guide-row">
        <span className="guide-face">{place.guide?.icon}</span>
        <div className="speech">
          <small>{place.guide?.name}</small>
          <p>{line}</p>
        </div>
      </div>
      <div className="row">
        <button className="btn ghost" onClick={onClose}>Not now</button>
        {open && <button className="btn primary" onClick={onEnter} autoFocus>Enter {place.name}</button>}
      </div>
    </section>
  );
}
