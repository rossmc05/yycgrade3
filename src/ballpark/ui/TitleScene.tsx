// The title screen's ballpark at night: lights, a packed crowd, fireworks, and a home run on a loop.

import { Figure } from './Figure';

const CROWD = ['#f87171', '#facc15', '#60a5fa', '#f9fafb', '#a78bfa', '#34d399', '#fb923c', '#f472b6'];
// A fixed pseudo-random crowd so it looks the same every time.
const seat = (i: number) => ((i * 2654435761) >>> 0) % 1000 / 1000;

export function TitleScene() {
  const rows = Array.from({ length: 6 }, (_, r) => r);
  return (
    <div className="ball-scene" aria-hidden="true">
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" className="ball-scene-svg">
        <defs>
          <linearGradient id="ts-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#050a24" />
            <stop offset="0.6" stopColor="#1e3a8a" />
            <stop offset="1" stopColor="#3b5bdb" />
          </linearGradient>
          <radialGradient id="ts-glow">
            <stop offset="0" stopColor="#fffbe6" stopOpacity="0.95" />
            <stop offset="0.35" stopColor="#fde68a" stopOpacity="0.35" />
            <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ts-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fffbe6" stopOpacity="0.35" />
            <stop offset="1" stopColor="#fffbe6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ts-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#15803d" />
            <stop offset="1" stopColor="#4ade80" />
          </linearGradient>
          <linearGradient id="ts-dirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b7793f" />
            <stop offset="1" stopColor="#dca66a" />
          </linearGradient>
          <clipPath id="ts-field"><path d="M 0 470 Q 600 400 1200 470 L 1200 800 L 0 800 Z" /></clipPath>
        </defs>

        <rect width="1200" height="800" fill="url(#ts-sky)" />
        {Array.from({ length: 50 }, (_, i) => (
          <circle key={i} className="ts-star" cx={seat(i) * 1200} cy={seat(i + 99) * 230} r={seat(i + 7) * 1.6 + 0.6} fill="#fff" style={{ animationDelay: `${seat(i + 3) * 3}s` }} />
        ))}
        <circle cx="1040" cy="90" r="34" fill="#fef9c3" opacity="0.9" />
        <circle cx="1054" cy="80" r="30" fill="#0b1437" opacity="0.85" />

        {/* light towers with beams */}
        {[110, 360, 840, 1090].map((x, i) => (
          <g key={x}>
            <path d={`M ${x - 40} 120 L ${x - 260 + i * 120} 520 L ${x + 260 - (3 - i) * 120} 520 L ${x + 40} 120 Z`} fill="url(#ts-beam)" className="ts-beam" />
            <rect x={x - 4} y="130" width="8" height="250" fill="#1e293b" />
            <rect x={x - 42} y="98" width="84" height="34" rx="5" fill="#1e293b" />
            {Array.from({ length: 8 }, (_, k) => <circle key={k} cx={x - 33 + (k % 4) * 22} cy={107 + Math.floor(k / 4) * 15} r="6" fill="#fffbe6" />)}
            <circle cx={x} cy="115" r="120" fill="url(#ts-glow)" />
          </g>
        ))}

        {/* fireworks */}
        {[[300, 170, '#f472b6', 0], [900, 150, '#facc15', 1.3], [610, 110, '#60a5fa', 2.4]].map(([x, y, c, d]) => (
          <g key={String(x)} className="ts-firework" style={{ animationDelay: `${d}s`, transformOrigin: `${x}px ${y}px` }}>
            {Array.from({ length: 12 }, (_, k) => {
              const a = (k / 12) * Math.PI * 2;
              return <line key={k} x1={Number(x) + Math.cos(a) * 12} y1={Number(y) + Math.sin(a) * 12} x2={Number(x) + Math.cos(a) * 48} y2={Number(y) + Math.sin(a) * 48} stroke={String(c)} strokeWidth="4" strokeLinecap="round" />;
            })}
          </g>
        ))}

        {/* stands and crowd */}
        <path d="M -20 470 Q 600 230 1220 470 L 1220 520 L -20 520 Z" fill="#1e293b" />
        {rows.map((r) => (
          <path key={r} d={`M -20 ${460 - r * 30} Q 600 ${230 - r * 26} 1220 ${460 - r * 30}`} fill="none" stroke={r % 2 ? '#334155' : '#475569'} strokeWidth="26" />
        ))}
        {rows.flatMap((r) => Array.from({ length: 46 }, (_, k) => {
          const t = (k + 0.5) / 46;
          const x = -20 + t * 1240;
          const y = (1 - t) * (1 - t) * (455 - r * 30) + 2 * (1 - t) * t * (225 - r * 26) + t * t * (455 - r * 30);
          return <circle key={`${r}-${k}`} className={seat(r * 50 + k) > 0.7 ? 'ts-fan' : undefined} cx={x} cy={y} r="7" fill={CROWD[Math.floor(seat(r * 77 + k) * CROWD.length)]} style={{ animationDelay: `${seat(k + r) * 1.2}s` }} />;
        }))}
        {/* pennants */}
        {Array.from({ length: 13 }, (_, k) => {
          const x = 70 + k * 88;
          const y = 300 - Math.sin((k / 12) * Math.PI) * 120 - 40;
          return <path key={k} d={`M ${x} ${y} l 0 -34 l 26 9 l -26 9`} fill={CROWD[k % CROWD.length]} stroke="#e2e8f0" strokeWidth="2" />;
        })}

        {/* outfield wall */}
        <path d="M -20 476 Q 600 396 1220 476 L 1220 506 Q 600 426 -20 506 Z" fill="#1d4ed8" stroke="#0b1437" strokeWidth="3" />
        <path d="M -20 476 Q 600 396 1220 476" fill="none" stroke="#facc15" strokeWidth="5" />
        <text x="600" y="452" textAnchor="middle" fontSize="20" fontWeight="700" fill="#fde68a" fontFamily="Fredoka, sans-serif" letterSpacing="6">330 FT</text>

        {/* field */}
        <g clipPath="url(#ts-field)">
          <rect y="440" width="1200" height="360" fill="url(#ts-grass)" />
          {Array.from({ length: 9 }, (_, k) => <path key={k} d={`M ${600 + (k - 4) * 60} 800 L ${600 + (k - 4) * 300} 440 L ${600 + (k - 4) * 300 + 150} 440 L ${600 + (k - 4) * 60 + 30} 800 Z`} fill="rgba(255,255,255,0.05)" />)}
        </g>
        <path d="M 600 790 L 960 620 Q 780 540 600 535 Q 420 540 240 620 Z" fill="url(#ts-dirt)" />
        <path d="M 600 745 L 790 640 L 600 585 L 410 640 Z" fill="#22c55e" />
        <path d="M 600 790 L 1260 480 M 600 790 L -60 480" stroke="#fff" strokeWidth="4" opacity="0.9" />
        <ellipse cx="600" cy="645" rx="46" ry="14" fill="#c48a52" />
        {[[790, 640], [600, 585], [410, 640]].map(([x, y]) => <polygon key={x + y} points={`${x - 18},${y} ${x},${y - 8} ${x + 18},${y} ${x},${y + 8}`} fill="#fff" />)}
        <path d="M 584 772 l 16 -10 l 16 10 l 0 8 l -32 0 Z" fill="#fff" />

        <g transform="translate(555 534)" className="ts-player"><Figure color="#475569" trim="#e2e8f0" pose="pitch" skin={3} size={90} /></g>
        <g transform="translate(490 606)" className="ts-player"><Figure color="#dc2626" trim="#fde047" pose="bat" skin={1} number="3" size={150} /></g>

        {/* the ball's flight: off the bat and over the wall */}
        <g className="ts-ball">
          <circle r="9" fill="#fff" stroke="#dc2626" strokeWidth="2">
            <animateMotion dur="3.2s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.55;1" calcMode="linear" path="M 620 700 Q 900 80 1010 330" />
          </circle>
        </g>
      </svg>
    </div>
  );
}
