// The hero in a soft 3D style to match the game art: shaded parts, glossy eyes, and an
// optional full body (arms, legs and shoes) for battles, the map and My World.

import { useId } from 'react';
import { artUrl } from '../art/sprite';
import { Background, FaceGear, HairBack, HairFront, Hat, Mouth, shade, Top } from './AvatarArt';
import { colorOf, part, type Look } from './catalog';

/** Lighten a #rrggbb colour toward white. */
function tint(hex: string, by: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(c + (255 - c) * by);
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('')}`;
}

function Eyes3D({ style, iris, uid }: { style: string; iris: string; uid: string }) {
  const L = 81;
  const R = 119;
  const Y = 100;
  const line = { fill: 'none', stroke: '#2b2340', strokeWidth: 4.5, strokeLinecap: 'round' as const };
  if (style === 'eyes-happy') {
    return <g {...line}><path d={`M${L - 9} ${Y + 3} Q${L} ${Y - 9} ${L + 9} ${Y + 3}`} /><path d={`M${R - 9} ${Y + 3} Q${R} ${Y - 9} ${R + 9} ${Y + 3}`} /></g>;
  }
  if (style === 'eyes-sleepy') {
    return <g {...line}><path d={`M${L - 9} ${Y - 1} Q${L} ${Y + 7} ${L + 9} ${Y - 1}`} /><path d={`M${R - 9} ${Y - 1} Q${R} ${Y + 7} ${R + 9} ${Y - 1}`} /></g>;
  }
  if (style === 'eyes-stars') {
    const star = (cx: number) =>
      Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * 2 * Math.PI - Math.PI / 2;
        const r = i % 2 ? 5 : 12;
        return `${cx + Math.cos(a) * r},${Y + Math.sin(a) * r}`;
      }).join(' ');
    return <g fill="#facc15" filter={`url(#gloss-${uid})`}><polygon points={star(L)} /><polygon points={star(R)} /></g>;
  }
  const eye = (cx: number, wink = false) =>
    wink ? (
      <path d={`M${cx - 9} ${Y} Q${cx} ${Y + 5} ${cx + 9} ${Y}`} {...line} />
    ) : (
      <g className="blink" style={{ transformOrigin: `${cx}px ${Y}px` }}>
        <ellipse cx={cx} cy={Y} rx="10" ry="12" fill="#fff" />
        <ellipse cx={cx + 1} cy={Y + 2} rx="7.5" ry="9" fill={`url(#iris-${uid})`} />
        <circle cx={cx + 1} cy={Y + 3} r="4" fill="#111827" />
        <circle cx={cx + 4} cy={Y - 2} r="3" fill="#fff" />
        <circle cx={cx - 2} cy={Y + 6} r="1.4" fill="#fff" opacity="0.8" />
      </g>
    );
  return (
    <g>
      <defs>
        <radialGradient id={`iris-${uid}`} cx="0.5" cy="0.7" r="0.6">
          <stop offset="0" stopColor={tint(iris, 0.35)} />
          <stop offset="1" stopColor={shade(iris, 0.25)} />
        </radialGradient>
      </defs>
      {eye(L)}
      {eye(R, style === 'eyes-wink')}
    </g>
  );
}

function Legs({ pants, shoes }: { pants: string; shoes: string }) {
  const shoe = (x: number) => {
    switch (shoes) {
      case 'shoes-boots':
        return <path d={`M${x - 16} 292 h30 v-26 h-26 z M${x - 18} 290 h36 v10 h-36z`} fill="#78350f" />;
      case 'shoes-cowboy':
        return <path d={`M${x - 12} 264 h22 v26 q14 0 16 10 h-40 z`} fill="#92400e" />;
      case 'shoes-skates':
        return (
          <g>
            <path d={`M${x - 14} 266 h26 v22 h-30 q-2 -12 4 -22z`} fill="#111827" />
            <rect x={x - 20} y={290} width="38" height="4" rx="2" fill="#cbd5e1" />
            <path d={`M${x - 16} 288 v4 M${x + 12} 288 v4`} stroke="#94a3b8" strokeWidth="3" />
          </g>
        );
      case 'shoes-rocket':
        return (
          <g>
            <path d={`M${x - 15} 266 h28 v24 h-30z`} fill="#e5e7eb" />
            <rect x={x - 16} y={282} width="30" height="8" fill="#dc2626" />
            <path d={`M${x - 8} 292 l7 14 l7 -14z`} fill="#f97316" className="flame" />
          </g>
        );
      default:
        return (
          <g>
            <path d={`M${x - 18} 290 q0 -16 14 -20 h16 v20z`} fill="#f8fafc" />
            <rect x={x - 18} y={286} width="34" height="6" rx="3" fill="#dc2626" />
          </g>
        );
    }
  };
  return (
    <g>
      <path d="M62 210 h76 l-4 64 h-28 l-6 -40 l-6 40 h-28z" fill={pants} />
      <path d="M100 222 v12" stroke={shade(pants, 0.3)} strokeWidth="3" />
      {shoe(80)}
      {shoe(122)}
    </g>
  );
}

function Arms({ sleeve, skin, cape }: { sleeve: string; skin: string; cape: boolean }) {
  return (
    <g>
      <path d="M56 172 Q42 198 46 230" stroke={cape ? '#dc2626' : sleeve} strokeWidth="22" strokeLinecap="round" fill="none" />
      <path d="M144 172 Q158 198 154 230" stroke={cape ? '#dc2626' : sleeve} strokeWidth="22" strokeLinecap="round" fill="none" />
      <circle cx="46" cy="236" r="11" fill={skin} />
      <circle cx="154" cy="236" r="11" fill={skin} />
    </g>
  );
}

export function Avatar3D({ look, size = 120, background = true, full = false }: { look: Look; size?: number; background?: boolean; full?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const skin = colorOf(look.skin, '#f5c9a0');
  const hair = colorOf(look.hairColor, '#5b3a1e');
  const top = colorOf(look.topColor, '#2563eb');
  const iris = colorOf(look.eyeColor, '#5b3a1e');
  const pet = part(look.pet)?.icon;
  const petUrl = pet ? artUrl(pet) : undefined;
  const H = full ? 310 : 220;
  const clip = `clip3-${uid}`;
  const soft = `url(#soft-${uid})`;
  const sleeve = look.top === 'top-space' ? '#f1f5f9' : look.top === 'top-labcoat' ? '#f8fafc' : top;
  return (
    <svg viewBox={`0 0 200 ${H}`} width={size} height={(size * H) / 200} role="img" aria-label="Avatar" className={`avatar-art avatar-3d ${full ? 'full' : ''}`}>
      <defs>
        <clipPath id={clip}>{full ? <rect width="200" height={H} /> : <rect width="200" height="220" rx="28" />}</clipPath>
        {/* Soft plastic shading for each part: a highlight from the top left and shade underneath. */}
        <filter id={`soft-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="blur" />
          <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.55" specularExponent="16" lightingColor="#ffffff" result="spec">
            <fePointLight x="40" y="-40" z="140" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="shine" />
          <feOffset in="SourceAlpha" dx="0" dy="-7" result="up" />
          <feGaussianBlur in="up" stdDeviation="6" result="upBlur" />
          <feComposite in="SourceAlpha" in2="upBlur" operator="out" result="rim" />
          <feFlood floodColor="#1e1b4b" floodOpacity="0.22" />
          <feComposite in2="rim" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="shadow" />
            <feMergeNode in="shine" />
          </feMerge>
        </filter>
        <filter id={`gloss-${uid}`}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b" />
          <feSpecularLighting in="b" surfaceScale="3" specularConstant="0.9" specularExponent="20" lightingColor="#fff" result="s">
            <fePointLight x="60" y="40" z="80" />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="g" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="g" /></feMerge>
        </filter>
        <radialGradient id={`cheek-${uid}`}>
          <stop offset="0" stopColor="#fb7185" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fb7185" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a5b4fc" />
          <stop offset="1" stopColor="#e0e7ff" />
        </linearGradient>
      </defs>
      {background && !full && <Background id={look.bg} clip={clip} />}
      <g clipPath={`url(#${clip})`}>
        <g className={full ? 'breathe' : ''}>
          {full && <ellipse cx="100" cy="300" rx="62" ry="8" fill="#000" opacity="0.18" />}
          <g filter={soft}><HairBack style={look.hair} color={hair} /></g>
          {full && <g filter={soft}><Legs pants={look.top === 'top-space' ? '#e5e7eb' : '#1e3a8a'} shoes={look.shoes} /></g>}
          {full && look.top === 'top-cape' && <path d="M60 158 Q30 230 26 280 L174 280 Q170 230 140 158Z" fill="#b91c1c" />}
          {full && <g filter={soft}><Arms sleeve={sleeve} skin={skin} cape={false} /></g>}
          <g filter={soft} transform={full ? 'translate(100 0) scale(0.86 1) translate(-100 0)' : undefined}><Top style={look.top} color={top} number={look.number} /></g>
          <rect x="88" y="128" width="24" height="28" rx="8" fill={shade(skin, 0.12)} />
          <g filter={soft}>
            <circle cx="52" cy="102" r="10" fill={skin} />
            <circle cx="148" cy="102" r="10" fill={skin} />
            <ellipse cx="100" cy="97" rx="50" ry="48" fill={skin} />
          </g>
          <ellipse cx="70" cy="118" rx="11" ry="8" fill={`url(#cheek-${uid})`} />
          <ellipse cx="130" cy="118" rx="11" ry="8" fill={`url(#cheek-${uid})`} />
          <g filter={soft}><HairFront style={look.hat === 'hat-helmet' || look.hat === 'hat-toque' || look.hat === 'hat-cowboy' ? 'hair-none' : look.hair} color={hair} /></g>
          <Eyes3D style={look.eyes} iris={iris} uid={uid} />
          <ellipse cx="100" cy="112" rx="4" ry="3" fill={shade(skin, 0.15)} opacity="0.6" />
          <Mouth style={look.mouth} />
          <FaceGear style={look.face} color={top} />
          <g filter={soft}><Hat style={look.hat} color={top} /></g>
        </g>
        {pet && (petUrl ? (
          <image href={petUrl} x={full ? 140 : 132} y={full ? 236 : 168} width={full ? 60 : 54} height={full ? 60 : 54} className="pet-bob" />
        ) : (
          <text x="160" y={full ? 300 : 212} fontSize="42" textAnchor="middle">{pet}</text>
        ))}
      </g>
    </svg>
  );
}
