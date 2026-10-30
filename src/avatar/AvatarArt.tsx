import { useId } from 'react';
import { useStore } from '../engine/store';
import { Avatar3D } from './Avatar3D';
import { colorOf, part, type Look } from './catalog';

const OUTLINE = '#2b2340';

/** Darken a #rrggbb colour by a fraction, for shading. */
export function shade(hex: string, by: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c * (1 - by))));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('')}`;
}

export function Background({ id, clip }: { id: string; clip: string }) {
  const common = { clipPath: `url(#${clip})` };
  switch (id) {
    case 'bg-mountains':
      return (
        <g {...common}>
          <rect width="200" height="220" fill="#bae6fd" />
          <polygon points="0,170 50,90 90,150 130,70 200,160 200,220 0,220" fill="#64748b" />
          <polygon points="50,90 62,110 40,108" fill="#fff" />
          <polygon points="130,70 146,96 116,94" fill="#fff" />
          <rect y="170" width="200" height="50" fill="#4ade80" />
        </g>
      );
    case 'bg-rink':
      return (
        <g {...common}>
          <rect width="200" height="220" fill="#f1f5f9" />
          <rect x="97" width="6" height="220" fill="#dc2626" />
          <rect x="40" width="4" height="220" fill="#2563eb" />
          <rect x="156" width="4" height="220" fill="#2563eb" />
          <circle cx="100" cy="110" r="34" fill="none" stroke="#2563eb" strokeWidth="3" />
        </g>
      );
    case 'bg-ocean':
      return (
        <g {...common}>
          <rect width="200" height="220" fill="#7dd3fc" />
          <path d="M0 150 Q25 140 50 150 T100 150 T150 150 T200 150 V220 H0Z" fill="#0284c7" />
          <path d="M0 175 Q25 165 50 175 T100 175 T150 175 T200 175 V220 H0Z" fill="#0369a1" />
          <circle cx="165" cy="40" r="16" fill="#fde047" />
        </g>
      );
    case 'bg-space':
      return (
        <g {...common}>
          <rect width="200" height="220" fill="#1e1b4b" />
          {[[20, 30], [170, 20], [150, 70], [30, 120], [180, 140], [60, 40], [110, 15], [15, 190], [185, 200]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 ? 1.6 : 2.6} fill="#fff" />
          ))}
          <circle cx="168" cy="48" r="14" fill="#f97316" />
          <ellipse cx="168" cy="48" rx="22" ry="5" fill="none" stroke="#fdba74" strokeWidth="2" />
        </g>
      );
    case 'bg-aurora':
      return (
        <g {...common}>
          <rect width="200" height="220" fill="#0f172a" />
          <path d="M0 60 Q50 20 100 60 T200 50 V110 Q150 80 100 110 T0 100Z" fill="#22c55e" opacity="0.55" />
          <path d="M0 90 Q60 50 120 90 T200 80 V130 Q140 110 90 130 T0 120Z" fill="#a855f7" opacity="0.45" />
          <polygon points="0,200 40,160 80,190 120,150 160,185 200,165 200,220 0,220" fill="#020617" />
        </g>
      );
    default:
      return (
        <g {...common}>
          <rect width="200" height="220" fill="#c7d2fe" />
          <circle cx="160" cy="40" r="12" fill="#fff" opacity="0.8" />
          <circle cx="174" cy="42" r="9" fill="#fff" opacity="0.8" />
          <circle cx="40" cy="60" r="9" fill="#fff" opacity="0.7" />
        </g>
      );
  }
}

export function HairBack({ style, color }: { style: string; color: string }) {
  if (style === 'hair-long') return <path d="M50 92 Q48 40 100 38 Q152 40 150 92 L154 165 Q130 172 120 150 L80 150 Q70 172 46 165Z" fill={color} />;
  if (style === 'hair-ponytail') return <path d="M140 70 Q178 70 172 120 Q168 150 150 160 Q160 125 140 100Z" fill={color} />;
  if (style === 'hair-afro') return <circle cx="100" cy="78" r="62" fill={color} />;
  return null;
}

export function HairFront({ style, color }: { style: string; color: string }) {
  switch (style) {
    case 'hair-short':
    case 'hair-long':
    case 'hair-ponytail':
      return <path d="M50 96 Q46 40 100 40 Q154 40 150 96 Q146 70 120 64 Q100 74 70 64 Q54 72 50 96Z" fill={color} />;
    case 'hair-spiky':
      return <path d="M50 96 L52 58 L64 66 L70 40 L84 58 L96 32 L108 56 L122 36 L130 60 L146 48 L148 70 L150 96 Q140 72 100 68 Q60 72 50 96Z" fill={color} />;
    case 'hair-curly':
      return (
        <g fill={color}>
          {[[56, 76], [64, 58], [80, 46], [100, 42], [120, 46], [136, 58], [144, 76], [72, 62], [128, 62], [100, 56]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="14" />
          ))}
        </g>
      );
    case 'hair-buzz':
      return <path d="M54 88 Q52 46 100 46 Q148 46 146 88 Q130 66 100 64 Q70 66 54 88Z" fill={color} opacity="0.85" />;
    case 'hair-mohawk':
      return <path d="M88 64 L86 22 L100 30 L104 16 L114 30 L112 64 Q100 60 88 64Z" fill={color} />;
    case 'hair-afro':
      return <path d="M52 92 Q50 52 100 50 Q150 52 148 92 Q130 70 100 70 Q70 70 52 92Z" fill={color} />;
    default:
      return null;
  }
}

function Eyes({ style }: { style: string }) {
  const L = 82;
  const R = 118;
  const Y = 100;
  switch (style) {
    case 'eyes-happy':
      return (
        <g fill="none" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round">
          <path d={`M${L - 8} ${Y + 2} Q${L} ${Y - 8} ${L + 8} ${Y + 2}`} />
          <path d={`M${R - 8} ${Y + 2} Q${R} ${Y - 8} ${R + 8} ${Y + 2}`} />
        </g>
      );
    case 'eyes-wink':
      return (
        <g>
          <circle cx={L} cy={Y} r="7" fill={OUTLINE} />
          <circle cx={L + 2.5} cy={Y - 2.5} r="2.2" fill="#fff" />
          <path d={`M${R - 8} ${Y} L${R + 8} ${Y}`} stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case 'eyes-sleepy':
      return (
        <g fill="none" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round">
          <path d={`M${L - 8} ${Y - 2} Q${L} ${Y + 6} ${L + 8} ${Y - 2}`} />
          <path d={`M${R - 8} ${Y - 2} Q${R} ${Y + 6} ${R + 8} ${Y - 2}`} />
        </g>
      );
    case 'eyes-stars': {
      const star = (cx: number) =>
        Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * 2 * Math.PI - Math.PI / 2;
          const r = i % 2 ? 4 : 10;
          return `${cx + Math.cos(a) * r},${Y + Math.sin(a) * r}`;
        }).join(' ');
      return (
        <g fill="#facc15" stroke="#a16207" strokeWidth="1.5">
          <polygon points={star(L)} />
          <polygon points={star(R)} />
        </g>
      );
    }
    default:
      return (
        <g>
          <circle cx={L} cy={Y} r="7" fill={OUTLINE} />
          <circle cx={R} cy={Y} r="7" fill={OUTLINE} />
          <circle cx={L + 2.5} cy={Y - 2.5} r="2.2" fill="#fff" />
          <circle cx={R + 2.5} cy={Y - 2.5} r="2.2" fill="#fff" />
        </g>
      );
  }
}

export function Mouth({ style }: { style: string }) {
  switch (style) {
    case 'mouth-grin':
      return <path d="M84 120 Q100 140 116 120 Z" fill="#7f1d1d" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />;
    case 'mouth-open':
      return <ellipse cx="100" cy="126" rx="7" ry="9" fill="#7f1d1d" stroke={OUTLINE} strokeWidth="3" />;
    case 'mouth-tongue':
      return (
        <g>
          <path d="M86 122 Q100 134 114 122" fill="none" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
          <path d="M98 128 Q100 140 108 136 Q110 128 106 126Z" fill="#f472b6" stroke={OUTLINE} strokeWidth="2" />
        </g>
      );
    default:
      return <path d="M86 122 Q100 134 114 122" fill="none" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />;
  }
}

export function Top({ style, color, number }: { style: string; color: string; number: number }) {
  const dark = shade(color, 0.25);
  const body = 'M40 220 Q40 168 70 158 Q100 150 130 158 Q160 168 160 220Z';
  switch (style) {
    case 'top-hoodie':
      return (
        <g>
          <path d="M66 160 Q100 178 134 160 Q128 150 100 150 Q72 150 66 160Z" fill={dark} />
          <path d={body} fill={color} />
          <path d="M78 196 h44 v24 h-44z" fill={dark} opacity="0.6" />
          <line x1="92" y1="162" x2="90" y2="186" stroke="#fff" strokeWidth="2.5" />
          <line x1="108" y1="162" x2="110" y2="186" stroke="#fff" strokeWidth="2.5" />
        </g>
      );
    case 'top-jersey':
      return (
        <g>
          <path d={body} fill={color} />
          <rect x="40" y="196" width="120" height="8" fill="#fff" />
          <path d="M86 156 L100 170 L114 156" fill="none" stroke="#fff" strokeWidth="4" />
          <text x="100" y="194" textAnchor="middle" fontSize="22" fontWeight="900" fill="#fff" stroke={dark} strokeWidth="1">{number}</text>
        </g>
      );
    case 'top-baseball':
    case 'top-pinstripe': {
      const pin = style === 'top-pinstripe';
      const trim = pin ? color : '#fff';
      return (
        <g>
          <path d={body} fill={pin ? '#f8fafc' : color} />
          {pin && [54, 66, 78, 90, 110, 122, 134, 146].map((x) => <line key={x} x1={x} y1={x < 70 || x > 130 ? 172 : 160} x2={x} y2="220" stroke={color} strokeWidth="1.6" opacity="0.8" />)}
          <path d="M84 156 L100 172 L116 156" fill="none" stroke={trim} strokeWidth="4" />
          <path d="M100 172 V220" stroke={trim} strokeWidth="2.5" />
          {[182, 196, 210].map((y) => <circle key={y} cx="105" cy={y} r="2" fill={trim} />)}
          <text x="130" y="200" textAnchor="middle" fontSize="20" fontWeight="900" fill={pin ? color : '#fff'} stroke={pin ? '#fff' : dark} strokeWidth="1">{number}</text>
        </g>
      );
    }
    case 'top-labcoat':
      return (
        <g>
          <path d={body} fill={color} />
          <path d="M70 158 Q100 150 130 158 L118 220 L82 220Z" fill={color} />
          <path d="M40 220 Q40 168 70 158 L90 220Z M160 220 Q160 168 130 158 L110 220Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="128" y="186" width="14" height="10" rx="2" fill="#e2e8f0" />
          <line x1="132" y1="184" x2="132" y2="190" stroke="#2563eb" strokeWidth="2" />
        </g>
      );
    case 'top-cape':
      return (
        <g>
          <path d="M60 158 Q30 200 24 220 L176 220 Q170 200 140 158Z" fill="#dc2626" />
          <path d={body} fill={color} />
          <circle cx="100" cy="188" r="14" fill="#facc15" />
          <polygon points="100,177 103,185 112,185 105,190 108,198 100,193 92,198 95,190 88,185 97,185" fill="#dc2626" />
        </g>
      );
    case 'top-space':
      return (
        <g>
          <path d={body} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="82" y="178" width="36" height="24" rx="4" fill={color} />
          <circle cx="90" cy="186" r="3" fill="#ef4444" />
          <circle cx="100" cy="186" r="3" fill="#22c55e" />
          <circle cx="110" cy="186" r="3" fill="#facc15" />
          <rect x="62" y="160" width="76" height="8" rx="4" fill="#94a3b8" />
        </g>
      );
    default:
      return (
        <g>
          <path d={body} fill={color} />
          <path d="M84 156 Q100 168 116 156" fill="none" stroke={dark} strokeWidth="4" />
        </g>
      );
  }
}

export function Hat({ style, color }: { style: string; color: string }) {
  switch (style) {
    case 'hat-cap':
      return (
        <g>
          <path d="M52 78 Q52 36 100 36 Q148 36 148 78Z" fill={color} />
          <path d="M100 74 Q150 70 176 82 Q150 88 100 82Z" fill={shade(color, 0.3)} />
          <circle cx="100" cy="38" r="4" fill={shade(color, 0.3)} />
        </g>
      );
    case 'hat-backwards':
      return (
        <g>
          <path d="M52 78 Q52 36 100 36 Q148 36 148 78Z" fill={color} />
          <path d="M62 66 Q38 64 24 74 Q40 82 64 76Z" fill={shade(color, 0.3)} />
          <circle cx="100" cy="38" r="4" fill={shade(color, 0.3)} />
        </g>
      );
    case 'hat-batting':
      return (
        <g>
          <path d="M48 90 Q46 32 100 32 Q154 32 152 90Z" fill={color} />
          <path d="M100 82 Q148 78 170 88 Q148 94 100 88Z" fill={shade(color, 0.3)} />
          <path d="M48 84 Q42 116 64 122 Q74 114 70 86Z" fill={color} />
          <circle cx="58" cy="102" r="5" fill={shade(color, 0.35)} />
          <path d="M70 46 Q90 38 110 40" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.45" />
        </g>
      );
    case 'hat-toque':
      return (
        <g>
          <path d="M52 80 Q52 30 100 30 Q148 30 148 80Z" fill="#dc2626" />
          <rect x="48" y="70" width="104" height="16" rx="6" fill="#fff" />
          <circle cx="100" cy="28" r="10" fill="#fff" />
        </g>
      );
    case 'hat-party':
      return (
        <g>
          <polygon points="76,56 124,56 100,4" fill="#a855f7" />
          <path d="M84 40 L116 40 M90 26 L110 26" stroke="#facc15" strokeWidth="5" />
          <circle cx="100" cy="6" r="6" fill="#facc15" />
        </g>
      );
    case 'hat-headphones':
      return (
        <g>
          <path d="M50 96 Q48 34 100 34 Q152 34 150 96" fill="none" stroke="#1f2937" strokeWidth="8" />
          <rect x="38" y="84" width="20" height="32" rx="8" fill={color} />
          <rect x="142" y="84" width="20" height="32" rx="8" fill={color} />
        </g>
      );
    case 'hat-helmet':
      return (
        <g>
          <path d="M48 92 Q46 32 100 32 Q154 32 152 92 L140 92 Q138 60 100 58 Q62 60 60 92Z" fill={color} />
          <rect x="46" y="86" width="18" height="24" rx="6" fill={shade(color, 0.3)} />
          <rect x="136" y="86" width="18" height="24" rx="6" fill={shade(color, 0.3)} />
          <path d="M60 104 Q100 150 140 104 M70 112 L70 132 M100 116 L100 142 M130 112 L130 132" fill="none" stroke="#94a3b8" strokeWidth="3" opacity="0.8" />
        </g>
      );
    case 'hat-tophat':
      return (
        <g>
          <rect x="70" y="12" width="60" height="46" rx="4" fill="#111827" />
          <rect x="70" y="44" width="60" height="8" fill="#dc2626" />
          <rect x="54" y="54" width="92" height="10" rx="5" fill="#111827" />
        </g>
      );
    case 'hat-wizard':
      return (
        <g>
          <polygon points="58,64 142,64 108,0" fill="#4338ca" />
          <ellipse cx="100" cy="64" rx="52" ry="9" fill="#3730a3" />
          <text x="94" y="44" fontSize="16" fill="#fde047">★</text>
          <text x="108" y="26" fontSize="10" fill="#fde047">★</text>
        </g>
      );
    case 'hat-cowboy':
      return (
        <g>
          <ellipse cx="100" cy="66" rx="68" ry="12" fill="#f8fafc" />
          <path d="M66 64 Q64 26 84 24 Q100 34 116 24 Q136 26 134 64Z" fill="#f8fafc" />
          <path d="M66 58 Q100 66 134 58 L134 64 Q100 72 66 64Z" fill="#b45309" />
          <ellipse cx="100" cy="66" rx="68" ry="12" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        </g>
      );
    case 'hat-crown':
      return (
        <g>
          <polygon points="62,62 62,24 80,42 100,16 120,42 138,24 138,62" fill="#facc15" stroke="#a16207" strokeWidth="2" />
          <circle cx="100" cy="46" r="5" fill="#dc2626" />
          <circle cx="78" cy="52" r="4" fill="#2563eb" />
          <circle cx="122" cy="52" r="4" fill="#16a34a" />
        </g>
      );
    case 'hat-grad':
      return (
        <g>
          <path d="M66 62 Q66 46 100 46 Q134 46 134 62Z" fill="#111827" />
          <polygon points="40,46 100,26 160,46 100,64" fill="#111827" />
          <path d="M150 46 L156 76" stroke="#facc15" strokeWidth="3" />
          <circle cx="156" cy="78" r="4" fill="#facc15" />
        </g>
      );
    default:
      return null;
  }
}

export function FaceGear({ style, color }: { style: string; color: string }) {
  switch (style) {
    case 'face-glasses':
      return (
        <g fill="none" stroke={OUTLINE} strokeWidth="3">
          <circle cx="82" cy="100" r="13" />
          <circle cx="118" cy="100" r="13" />
          <path d="M95 100 Q100 96 105 100" />
        </g>
      );
    case 'face-sunglasses':
      return (
        <g>
          <rect x="66" y="90" width="30" height="20" rx="8" fill="#111827" />
          <rect x="104" y="90" width="30" height="20" rx="8" fill="#111827" />
          <path d="M96 98 H104" stroke="#111827" strokeWidth="4" />
          <path d="M72 95 L80 95" stroke="#fff" strokeWidth="2" opacity="0.7" />
        </g>
      );
    case 'face-goggles':
      return (
        <g>
          <path d="M52 96 H148" stroke="#475569" strokeWidth="6" />
          <rect x="64" y="86" width="72" height="28" rx="12" fill="#a5f3fc" opacity="0.75" stroke="#0e7490" strokeWidth="3" />
          <line x1="100" y1="86" x2="100" y2="114" stroke="#0e7490" strokeWidth="2" />
        </g>
      );
    case 'face-eyeblack':
      return (
        <g stroke="#111827" strokeWidth="5" strokeLinecap="round">
          <path d="M71 116 L91 116" />
          <path d="M109 116 L129 116" />
        </g>
      );
    case 'face-paint':
      return (
        <g>
          <path d="M64 112 L76 108 M64 118 L76 114" stroke={color} strokeWidth="4" strokeLinecap="round" />
          <path d="M124 108 L136 112 M124 114 L136 118" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
}

/** The hero: 3D-style art, or the original flat art in the classic look. `full` draws the whole body. */
export function AvatarArt(props: { look: Look; size?: number; background?: boolean; full?: boolean }) {
  const { data } = useStore();
  return data.settings.classicLook ? <FlatAvatar {...props} /> : <Avatar3D {...props} />;
}

function FlatAvatar({ look, size = 120, background = true }: { look: Look; size?: number; background?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const skin = colorOf(look.skin, '#f5c9a0');
  const hair = colorOf(look.hairColor, '#5b3a1e');
  const top = colorOf(look.topColor, '#2563eb');
  const pet = part(look.pet)?.icon;
  const clip = `clip-${uid}`;
  return (
    <svg viewBox="0 0 200 220" width={size} height={(size * 220) / 200} role="img" aria-label="Avatar" className="avatar-art">
      <defs>
        <clipPath id={clip}>
          <rect width="200" height="220" rx="28" />
        </clipPath>
      </defs>
      {background && <Background id={look.bg} clip={clip} />}
      <g clipPath={`url(#${clip})`}>
        <HairBack style={look.hair} color={hair} />
        <Top style={look.top} color={top} number={look.number} />
        <rect x="88" y="128" width="24" height="28" rx="8" fill={shade(skin, 0.08)} />
        <circle cx="52" cy="102" r="10" fill={skin} />
        <circle cx="148" cy="102" r="10" fill={skin} />
        <circle cx="100" cy="96" r="48" fill={skin} />
        <circle cx="72" cy="116" r="7" fill="#f87171" opacity="0.35" />
        <circle cx="128" cy="116" r="7" fill="#f87171" opacity="0.35" />
        <HairFront style={look.hat === 'hat-helmet' || look.hat === 'hat-toque' || look.hat === 'hat-batting' ? 'hair-none' : look.hair} color={hair} />
        <Eyes style={look.eyes} />
        <Mouth style={look.mouth} />
        <FaceGear style={look.face} color={top} />
        <Hat style={look.hat} color={top} />
        {pet && (
          <text x="160" y="212" fontSize="42" textAnchor="middle">
            {pet}
          </text>
        )}
      </g>
    </svg>
  );
}
