// Pro Shop gear drawn in our own style: bats, gloves, cleats, helmets and caps. No brand logos.

import type { BallGear } from '../gear';

const FINISH = {
  wood: ['#f3d19c', '#b7793a'],
  metal: ['rgba(255,255,255,0.7)', 'rgba(0,0,0,0.25)'],
  gold: ['#fff7cc', '#a16207'],
};

export function GearArt({ g, size = 96 }: { g: BallGear; size?: number }) {
  const { c1, c2, finish, guard } = g.art;
  const id = `ga-${g.id}`;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`${g.brand} ${g.name}`} className="gear-art">
      <defs>
        <linearGradient id={`${id}-sh`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={FINISH[finish ?? 'metal'][0]} />
          <stop offset="0.5" stopColor="rgba(255,255,255,0)" />
          <stop offset="1" stopColor={FINISH[finish ?? 'metal'][1]} />
        </linearGradient>
        <radialGradient id={`${id}-dome`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="rgba(255,255,255,0.65)" />
          <stop offset="0.35" stopColor="rgba(255,255,255,0)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.3)" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="90" rx="34" ry="5" fill="rgba(0,0,0,0.18)" />
      {g.slot === 'bat' && (
        <g transform="rotate(-40 50 52)">
          <rect x="4" y="47" width="6" height="12" rx="3" fill={c2} />
          <rect x="8" y="49.5" width="38" height="7" rx="3" fill={finish === 'wood' ? c1 : c2} />
          {finish !== 'wood' && [12, 18, 24, 30, 36, 42].map((x) => <line key={x} x1={x} y1="49.5" x2={x + 3} y2="56.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />)}
          <path d="M44 49.5 C54 48 58 45 66 45 L92 45 Q97 45 97 53 Q97 61 92 61 L66 61 C58 61 54 58 44 56.5 Z" fill={c1} />
          <path d="M44 49.5 C54 48 58 45 66 45 L92 45 Q97 45 97 53 Q97 61 92 61 L66 61 C58 61 54 58 44 56.5 Z" fill={`url(#${id}-sh)`} />
          {finish === 'wood' ? (
            <g stroke="#9a6430" strokeWidth="0.8" fill="none" opacity="0.6"><path d="M60 50 Q75 48 94 50" /><path d="M58 55 Q76 54 95 56" /></g>
          ) : (
            <rect x="68" y="45" width="10" height="16" fill={c2} opacity="0.9" />
          )}
          {finish === 'wood' && <rect x="70" y="47" width="12" height="4" rx="1" fill={c2} opacity="0.8" />}
        </g>
      )}
      {g.slot === 'glove' && (
        <g>
          <path d="M22 70 C14 52 16 30 26 20 C30 16 35 18 35 24 L37 44 L40 14 C41 8 49 8 49 14 L50 42 L54 12 C55 6 63 7 62 13 L61 44 L67 20 C69 14 76 16 75 22 L71 50 C76 44 84 44 84 50 C80 64 74 78 60 84 C46 88 30 84 22 70 Z" fill={c1} stroke={c2} strokeWidth="2" />
          <path d="M22 70 C14 52 16 30 26 20 C30 16 35 18 35 24 L37 44 L40 14 C41 8 49 8 49 14 L50 42 L54 12 C55 6 63 7 62 13 L61 44 L67 20 C69 14 76 16 75 22 L71 50 C76 44 84 44 84 50 C80 64 74 78 60 84 C46 88 30 84 22 70 Z" fill={`url(#${id}-dome)`} />
          <path d="M71 50 L62 46 M72 56 L63 52 M70 62 L61 58" stroke={c2} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M38 22 L39 42 M50 18 L50 40 M60 18 L59 42" stroke={c2} strokeWidth="1.5" strokeDasharray="2 3" />
          <path d="M28 76 Q46 86 62 80" stroke={c2} strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      )}
      {g.slot === 'cleats' && (
        <g>
          <path d="M10 66 C10 56 16 52 26 50 L44 44 C50 34 60 30 68 32 L74 38 C80 46 90 52 92 62 L92 70 L10 70 Z" fill={c1} stroke="#111827" strokeWidth="2" strokeLinejoin="round" />
          <path d="M10 66 C10 56 16 52 26 50 L44 44 C50 34 60 30 68 32 L74 38 C80 46 90 52 92 62 L92 70 L10 70 Z" fill={`url(#${id}-dome)`} />
          <path d="M28 62 C44 60 58 50 82 52" stroke={c2} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M48 44 L56 52 M54 40 L62 48 M60 36 L68 44" stroke={c2 === '#111827' ? '#9ca3af' : '#111827'} strokeWidth="1.6" strokeLinecap="round" />
          <rect x="8" y="68" width="86" height="7" rx="3" fill={c2} />
          {[16, 30, 46, 64, 78, 88].map((x) => <path key={x} d={`M${x - 3} 75 L${x} 82 L${x + 3} 75 Z`} fill="#9ca3af" />)}
        </g>
      )}
      {g.slot === 'helmet' && (
        <g>
          <path d="M18 64 C16 36 34 18 56 18 C76 18 88 34 88 54 L88 62 L74 62 L70 72 L50 76 C40 76 36 70 34 64 Z" fill={c1} stroke="#111827" strokeWidth="2" strokeLinejoin="round" />
          <path d="M18 64 C16 36 34 18 56 18 C76 18 88 34 88 54 L88 62 L74 62 L70 72 L50 76 C40 76 36 70 34 64 Z" fill={`url(#${id}-dome)`} />
          <path d="M80 56 L96 60 L94 64 L76 62 Z" fill={c1} stroke="#111827" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="50" cy="58" r="7" fill="#111827" opacity="0.85" />
          {[40, 52, 64].map((x) => <rect key={x} x={x} y="24" width="6" height="3" rx="1.5" fill={c2} transform={`rotate(${(x - 52) / 2} ${x} 25)`} />)}
          {guard && <path d="M44 72 C50 86 66 88 76 80 L78 74 C70 80 58 80 50 70 Z" fill={c2} stroke="#111827" strokeWidth="1.5" />}
        </g>
      )}
      {g.slot === 'cap' && (
        <g>
          <path d="M16 62 C14 36 32 22 52 22 C72 22 84 36 84 58 L84 62 Z" fill={c1} stroke="#111827" strokeWidth="2" />
          <path d="M16 62 C14 36 32 22 52 22 C72 22 84 36 84 58 L84 62 Z" fill={`url(#${id}-dome)`} />
          <path d="M52 22 L52 62 M36 26 C30 38 30 50 32 62 M68 26 C74 38 74 50 72 62" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" fill="none" />
          <circle cx="52" cy="22" r="3.5" fill={c2} stroke="#111827" strokeWidth="1" />
          <path d="M60 60 C74 58 92 60 98 68 C90 74 72 72 58 68 Z" fill={c1} stroke="#111827" strokeWidth="2" />
          {g.id === 'cap-lucky' ? (
            <g fill={c2} transform="translate(44 34)">
              <circle cx="0" cy="-4" r="4" /><circle cx="4" cy="0" r="4" /><circle cx="0" cy="4" r="4" /><circle cx="-4" cy="0" r="4" />
              <path d="M0 4 Q2 10 6 12" stroke={c2} strokeWidth="1.5" fill="none" />
            </g>
          ) : (
            <path d="M38 38 L44 32 L50 38 L56 32 L62 38" stroke={c2} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </g>
      )}
    </svg>
  );
}
