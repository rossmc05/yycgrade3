// World map scenery: the 3D-art map, and the classic flat map kept as a fallback.

import { artUrl } from '../art/sprite';
import { PLACES, placeOf } from './world';

export const W = 1000;
export const H = 640;

export type Bit = { e: string; x: number; y: number; s: number; flip?: boolean; shadow?: boolean; /** Share of the art's bottom to cut off. */ crop?: number };

/** Scenery sprites: x is the centre, y is where the sprite stands, s is its size. */
const SCENERY: Bit[] = [
  // Math Mountains
  { e: '⛰️', x: 150, y: 205, s: 150, crop: 0.2 },
  { e: '🏔️', x: 240, y: 190, s: 190, crop: 0.2 },
  { e: '⛰️', x: 330, y: 200, s: 120, flip: true, crop: 0.2 },
  { e: '🐐', x: 300, y: 222, s: 44, flip: true },
  // Spelling Swamp
  { e: '🛖', x: 160, y: 470, s: 90 },
  { e: '🌾', x: 100, y: 500, s: 56 },
  { e: '🌾', x: 300, y: 492, s: 50, flip: true },
  { e: '🍄', x: 255, y: 478, s: 46 },
  { e: '🐊', x: 225, y: 530, s: 64, shadow: false },
  // Grammar Garage
  { e: '🏭', x: 520, y: 540, s: 130 },
  { e: '⚙️', x: 445, y: 548, s: 44 },
  { e: '🚧', x: 600, y: 552, s: 50 },
  // Science Badlands
  { e: '🌋', x: 815, y: 455, s: 160 },
  { e: '🌵', x: 720, y: 470, s: 64 },
  { e: '🌵', x: 905, y: 482, s: 54, flip: true },
  { e: '🦴', x: 760, y: 505, s: 40, shadow: false },
  { e: '🪨', x: 880, y: 515, s: 42 },
  // Typing Tower
  { e: '🏰', x: 790, y: 225, s: 160 },
  { e: '🦉', x: 860, y: 222, s: 44, flip: true },
  // Home Village
  { e: '⛲', x: 500, y: 350, s: 70 },
  // Trees and flowers
  ...[[90, 330], [110, 130], [345, 105], [640, 95], [700, 120], [920, 320], [890, 600], [660, 590], [345, 595], [380, 420], [630, 250], [950, 160], [60, 420]].map(
    ([x, y], i): Bit => ({ e: i % 3 ? '🌲' : '🌳', x, y, s: i % 2 ? 54 : 64, flip: i % 2 === 1 }),
  ),
  ...[[420, 445], [600, 430], [690, 330], [300, 330], [560, 170], [470, 190]].map(([x, y], i): Bit => ({ e: '🌼', x, y, s: 26, flip: i % 2 === 1, shadow: false })),
];

/** A soft patch of ground under each zone. */
const GROUND: Record<string, { rx: number; ry: number; fill: string; dy?: number }> = {
  math: { rx: 170, ry: 70, fill: '#65a30d', dy: 30 },
  spelling: { rx: 140, ry: 68, fill: '#3f8f7a', dy: 15 },
  grammar: { rx: 130, ry: 46, fill: '#9ca3af', dy: 20 },
  science: { rx: 150, ry: 76, fill: '#fdba74', dy: 30 },
  typing: { rx: 100, ry: 40, fill: '#c7d2fe', dy: 25 },
  village: { rx: 120, ry: 78, fill: '#fde68a', dy: 10 },
};

const pathD = (x: number, y: number) => `M500 330 Q${(500 + x) / 2 + (y < 330 ? 40 : -40)} ${(330 + y) / 2} ${x} ${y}`;

export function SvgSprite({ e, x, y, s, flip, shadow = true, crop = 0, className }: Bit & { className?: string }) {
  const url = artUrl(e);
  const h = s * (1 - crop);
  return (
    <g className={className}>
      {shadow && <ellipse cx={x} cy={y - s * 0.04} rx={s * 0.42} ry={s * 0.1} fill="#14532d" opacity="0.28" />}
      {url ? (
        <svg x={x - s / 2} y={y - h} width={s} height={h} viewBox={`0 0 ${s} ${h}`} overflow="hidden">
          <image href={url} width={s} height={s} transform={flip ? `translate(${s} 0) scale(-1 1)` : undefined} />
        </svg>
      ) : (
        <text x={x} y={y - s * 0.1} fontSize={s * 0.8} textAnchor="middle">{e}</text>
      )}
    </g>
  );
}

export function MapArt3D({ open, today }: { open: Record<string, boolean>; today: string }) {
  const island = 'M40 60 Q500 -10 960 60 Q1010 320 960 590 Q500 660 40 590 Q-10 320 40 60Z';
  const quest = placeOf(today);
  return (
    <svg className="map-art map-art-3d" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs>
        <radialGradient id="m3-sea" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0369a1" />
        </radialGradient>
        <linearGradient id="m3-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a3e635" />
          <stop offset="1" stopColor="#4ade80" />
        </linearGradient>
        <filter id="m3-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10" /></filter>
        <filter id="m3-fog" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22" /></filter>
        <pattern id="m3-waves" width="80" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 q10 -8 20 0 t20 0" stroke="#bae6fd" strokeWidth="3" fill="none" opacity="0.45" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#m3-sea)" />
      <rect width={W} height={H} fill="url(#m3-waves)" className="sea-waves" />
      {/* the island: surf, cliff, sand and grass for depth */}
      <path d={island} fill="none" stroke="#e0f2fe" strokeWidth="34" opacity="0.5" className="surf" />
      <path d={island} transform="translate(0 18)" fill="#92400e" />
      <path d={island} transform="translate(0 9)" fill="#b45309" />
      <path d={island} fill="#fde68a" />
      <path d={island} fill="url(#m3-grass)" transform="translate(500 320) scale(0.965) translate(-500 -320)" />
      {/* ground under each zone */}
      {PLACES.map((p) => {
        const g = GROUND[p.id];
        return <ellipse key={p.id} cx={p.x} cy={p.y + (g.dy ?? 0)} rx={g.rx} ry={g.ry} fill={g.fill} filter="url(#m3-soft)" opacity="0.9" />;
      })}
      <ellipse cx="205" cy="510" rx="95" ry="32" fill="#0f766e" opacity="0.85" />
      <ellipse cx="205" cy="506" rx="80" ry="24" fill="#14b8a6" opacity="0.6" />
      {/* river from the mountains to the sea */}
      <path d="M300 70 Q330 200 380 250 Q430 300 400 400 Q370 500 420 640" stroke="#0284c7" strokeWidth="24" fill="none" strokeLinecap="round" />
      <path d="M300 70 Q330 200 380 250 Q430 300 400 400 Q370 500 420 640" stroke="#38bdf8" strokeWidth="16" fill="none" strokeLinecap="round" />
      <path d="M300 70 Q330 200 380 250 Q430 300 400 400 Q370 500 420 640" stroke="#e0f2fe" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="10 22" className="river-flow" />
      {/* dirt paths from the village */}
      {PLACES.filter((p) => p.id !== 'village').map((p) => (
        <g key={p.id} opacity={open[p.id] ? 1 : 0.5}>
          <path d={pathD(p.x, p.y)} stroke="#a16207" strokeWidth="24" fill="none" strokeLinecap="round" transform="translate(0 3)" />
          <path d={pathD(p.x, p.y)} stroke="#fcd34d" strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d={pathD(p.x, p.y)} stroke="#fef3c7" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="3 16" />
        </g>
      ))}
      {/* village square */}
      <ellipse cx="500" cy="336" rx="80" ry="44" fill="#e7d3a8" stroke="#c4a76a" strokeWidth="4" />
      {/* scenery, back to front */}
      {[...SCENERY].sort((a, b) => a.y - b.y).map((b, i) => <SvgSprite key={i} {...b} />)}
      {/* clouds over closed zones */}
      {PLACES.filter((p) => !open[p.id]).map((p) => (
        <g key={`fog-${p.id}`} className="fog">
          <ellipse cx={p.x} cy={p.y - 10} rx="150" ry="110" fill="#f8fafc" opacity="0.92" filter="url(#m3-fog)" />
          {[[-70, -30, 120], [40, -60, 140], [-10, 30, 130], [80, 20, 110]].map(([dx, dy, s], i) => (
            <SvgSprite key={i} e="☁️" x={p.x + dx} y={p.y + dy + s / 2} s={s} shadow={false} />
          ))}
        </g>
      ))}
      {quest && (
        <g transform={`translate(${quest.x + 75} ${quest.y - 105})`}>
          <g className="quest-mark">
            <SvgSprite e="❗" x={0} y={28} s={56} shadow={false} />
          </g>
        </g>
      )}
    </svg>
  );
}

/** Clouds drifting over the map, above everything (they never catch taps). */
export function MapClouds() {
  return (
    <div className="map-clouds" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <img key={i} src={artUrl('☁️')} alt="" className={`drift d${i}`} draggable={false} />
      ))}
    </div>
  );
}

// ---------- The classic flat map (Settings → Classic look) ----------

export function ClassicMapArt({ open, today }: { open: Record<string, boolean>; today: string }) {
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

