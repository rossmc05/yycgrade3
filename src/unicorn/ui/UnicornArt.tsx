// A unicorn drawn in SVG, wearing her outfit. Every shop item changes the drawing.

import { useId } from 'react';
import { itemById, type Item } from '../shop';
import type { Outfit } from '../data';
import type { Unicorn } from '../unicorns';

/** Mix a hex colour toward black (amount > 0) or white (amount < 0). */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(amount > 0 ? c * (1 - amount) : c + (255 - c) * -amount));
  return `#${ch.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

function Star({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`;
  });
  return <polygon points={pts.join(' ')} fill={fill} />;
}

function Twinkle({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  return <path d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`} fill={fill} />;
}

function Heart({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return <path d={`M${x} ${y + s * 0.9} C${x - s * 1.6} ${y - s * 0.1} ${x - s * 0.6} ${y - s * 1.2} ${x} ${y - s * 0.35} C${x + s * 0.6} ${y - s * 1.2} ${x + s * 1.6} ${y - s * 0.1} ${x} ${y + s * 0.9}Z`} fill={fill} />;
}

function Flower({ x, y, r, petal, middle }: { x: number; y: number; r: number; petal: string; middle: string }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * r} cy={y + Math.sin((a * Math.PI) / 180) * r} r={r * 0.75} fill={petal} />
      ))}
      <circle cx={x} cy={y} r={r * 0.6} fill={middle} />
    </g>
  );
}

const MANE_POINTS: [number, number, number][] = [[160, 32, 8], [151, 35, 11], [144, 45, 11], [138, 56, 11], [133, 67, 11], [128, 78, 11], [124, 89, 10], [121, 99, 9]];

export function UnicornArt({ unicorn, outfit = {}, size = 200, mood = 'happy', className = '' }: { unicorn: Unicorn; outfit?: Outfit; size?: number | string; mood?: 'happy' | 'sleepy' | 'locked'; className?: string }) {
  const id = useId().replace(/:/g, '');
  const it = (slot: keyof Outfit): Item | undefined => itemById(outfit[slot]);
  const coatItem = it('coat');
  const maneItem = it('mane');
  const hornItem = it('horn');
  const saddle = it('saddle');
  const crown = it('crown');
  const wings = it('wings');

  const locked = mood === 'locked';
  const coat = locked ? '#cbd5e1' : coatItem?.colors[0] ?? unicorn.coat;
  const dark = shade(coat, 0.12);
  const line = locked ? '#94a3b8' : shade(coat, 0.35);
  const mane = locked ? ['#94a3b8', '#a3b1c6'] : maneItem?.colors ?? unicorn.mane;
  const horn = locked ? '#e2e8f0' : hornItem?.colors[0] ?? unicorn.horn;
  const hoof = locked ? '#94a3b8' : shade(mane[0], 0.15);
  const dim = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg className={`unicorn-art ${className}`} viewBox="0 0 220 180" style={{ width: dim, height: 'auto' }} role="img" aria-label={locked ? 'A unicorn still to come' : unicorn.name}>
      <defs>
        <linearGradient id={`horn${id}`} x1="0" y1="1" x2="0.4" y2="0">
          {hornItem?.style === 'rainbow' && !locked
            ? hornItem.colors.map((c, i) => <stop key={c} offset={i / (hornItem.colors.length - 1)} stopColor={c} />)
            : [<stop key="a" offset="0" stopColor={shade(horn, 0.15)} />, <stop key="b" offset="1" stopColor={shade(horn, -0.5)} />]}
        </linearGradient>
        <radialGradient id={`coat${id}`} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor={shade(coat, -0.4)} />
          <stop offset="1" stopColor={coat} />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="100" cy="171" rx="66" ry="6" fill="rgba(60,20,90,0.15)" />

      {/* Tail */}
      <path d="M52 100 C26 94 18 122 30 140 C38 152 30 164 18 160" stroke={mane[0]} strokeWidth="16" fill="none" strokeLinecap="round" />
      <path d="M52 106 C34 110 30 128 40 142" stroke={mane[1 % mane.length]} strokeWidth="9" fill="none" strokeLinecap="round" />
      {mane.length > 2 && <path d="M50 96 C36 92 28 104 30 116" stroke={mane[2]} strokeWidth="7" fill="none" strokeLinecap="round" />}

      {/* Far legs */}
      <rect x="72" y="116" width="13" height="46" rx="6" fill={dark} />
      <rect x="124" y="116" width="13" height="46" rx="6" fill={dark} />
      <rect x="72" y="154" width="13" height="9" rx="3" fill={shade(hoof, 0.1)} />
      <rect x="124" y="154" width="13" height="9" rx="3" fill={shade(hoof, 0.1)} />

      {/* Body */}
      <ellipse cx="100" cy="110" rx="54" ry="33" fill={`url(#coat${id})`} stroke={line} strokeWidth="1.5" />
      {!locked && coatItem?.style === 'spots' && [[78, 102, 7], [98, 120, 6], [116, 100, 5], [70, 122, 4], [124, 118, 4]].map(([x, y, r]) => <circle key={`${x}`} cx={x} cy={y} r={r} fill={coatItem.colors[1]} opacity="0.85" />)}
      {!locked && coatItem?.style === 'sparkle' && [[76, 100, 5], [96, 122, 4], [118, 104, 5], [66, 118, 3], [130, 122, 3], [104, 96, 3]].map(([x, y, r]) => <Twinkle key={`${x}`} x={x} y={y} r={r} fill={coatItem.colors[1]} />)}
      {!locked && coatItem?.style === 'stars' && [[76, 100, 5], [96, 122, 4], [118, 104, 5], [66, 118, 3], [130, 122, 3], [104, 96, 3]].map(([x, y, r]) => <Star key={`${x}`} x={x} y={y} r={r} fill={coatItem.colors[1]} />)}

      {/* Near legs */}
      <rect x="58" y="118" width="14" height="48" rx="7" fill={coat} stroke={line} strokeWidth="1.2" />
      <rect x="110" y="118" width="14" height="48" rx="7" fill={coat} stroke={line} strokeWidth="1.2" />
      <rect x="58" y="158" width="14" height="9" rx="3" fill={hoof} />
      <rect x="110" y="158" width="14" height="9" rx="3" fill={hoof} />

      {/* Neck and head */}
      <path d="M118 100 C122 72 134 52 150 42 L170 58 C158 72 152 92 148 114 Z" fill={coat} stroke={line} strokeWidth="1.2" />
      <ellipse cx="164" cy="54" rx="24" ry="18" transform="rotate(28 164 54)" fill={coat} stroke={line} strokeWidth="1.2" />
      <ellipse cx="180" cy="69" rx="14" ry="11" fill={coat} stroke={line} strokeWidth="1.2" />
      <circle cx="187" cy="68" r="1.8" fill={line} />
      <path d="M177 77 Q182 81 188 76" stroke={line} strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* Saddle */}
      {saddle && !locked && (
        <g>
          <path d="M78 82 Q102 72 126 82 L128 106 Q102 114 76 106 Z" fill={saddle.colors[0]} stroke={saddle.colors[1]} strokeWidth="3" />
          <path d="M82 80 Q102 70 122 80" stroke={shade(saddle.colors[0], 0.25)} strokeWidth="5" fill="none" strokeLinecap="round" />
          {saddle.style === 'hearts' && <Heart x={102} y={94} s={6} fill={saddle.colors[1]} />}
          {saddle.style === 'stars' && <Star x={102} y={94} r={7} fill={saddle.colors[1]} />}
          {saddle.style === 'gold' && <circle cx="102" cy="94" r="5" fill="#ec4899" stroke="#fbbf24" strokeWidth="2" />}
        </g>
      )}

      {/* Wings */}
      {wings && !locked && (
        <g>
          {(wings.style === 'rainbow' ? wings.colors.slice(0, 4) : [wings.colors[1], wings.colors[0]]).map((c, i, arr) => {
            const k = (arr.length - 1 - i) * 6;
            return <path key={c + i} d={`M98 ${86 - k * 0.2} C${78 - k} ${56 - k} ${92 - k * 0.5} ${28 - k} ${126 + k * 0.3} ${30 - k * 0.6} C114 40 124 44 112 52 C126 54 118 64 108 66 C118 70 110 80 98 86 Z`} fill={c} stroke={shade(wings.colors[0], 0.25)} strokeWidth="1" opacity={wings.style === 'rainbow' ? 1 : i ? 1 : 0.85} />;
          })}
          {wings.style === 'spots' && [[106, 46, 3.5], [114, 58, 2.5], [100, 60, 2.5]].map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} fill="#fff" opacity="0.8" />)}
          {wings.style === 'gold' && <Twinkle x={110} y={44} r={5} fill="#fff" />}
        </g>
      )}

      {/* Mane */}
      {MANE_POINTS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={mane[i % mane.length]} />)}
      {maneItem?.style === 'stars' && !locked && MANE_POINTS.filter((_, i) => i % 2).map(([x, y]) => <Star key={x} x={x - 2} y={y} r={3.5} fill={maneItem.colors[2]} />)}

      {/* Ear */}
      <path d="M152 38 L156 16 L167 35 Z" fill={coat} stroke={line} strokeWidth="1.2" />
      <path d="M155 34 L157 23 L163 34 Z" fill={locked ? '#e2e8f0' : '#fbcfe8'} />

      {/* Horn */}
      <path d="M165 36 L182 2 L174 40 Z" fill={`url(#horn${id})`} stroke={shade(horn, 0.3)} strokeWidth="1" />
      {[0.25, 0.5, 0.72].map((t) => (
        <path key={t} d={`M${165 + 9 * t} ${36 - 34 * t + 2} L${174 + 8 * t} ${40 - 38 * t - 2}`} stroke={shade(horn, 0.3)} strokeWidth="1.2" opacity="0.6" />
      ))}
      {(hornItem?.style === 'glitter' || hornItem?.style === 'gold' || hornItem?.style === 'rainbow') && !locked && (
        <g className="twinkle">
          <Twinkle x={192} y={12} r={6} fill="#fff" />
          <Twinkle x={168} y={10} r={4} fill={hornItem.style === 'gold' ? '#fde047' : '#fff'} />
          <Twinkle x={190} y={32} r={4} fill={hornItem.colors[0]} />
        </g>
      )}

      {/* Crown */}
      {crown && !locked && (crown.style === 'gold' ? (
        <g>
          <path d="M146 40 L150 26 L156 34 L162 22 L168 33 L174 26 L176 40 Q161 46 146 40 Z" fill={crown.colors[0]} stroke={shade(crown.colors[0], 0.3)} strokeWidth="1" />
          <circle cx="162" cy="36" r="3" fill={crown.colors[1]} />
        </g>
      ) : (
        <g>
          {[[146, 42], [153, 36], [170, 36], [177, 42]].map(([x, y], i) => (
            <Flower key={x} x={x} y={y} r={3.6} petal={crown.style === 'rainbow' ? crown.colors[i % crown.colors.length] : crown.colors[0]} middle={crown.style === 'rainbow' ? '#fff' : crown.colors[1]} />
          ))}
        </g>
      ))}

      {/* Face */}
      {mood === 'sleepy' ? (
        <path d="M162 53 Q167 57 172 53" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : locked ? (
        <circle cx="167" cy="53" r="3" fill="#94a3b8" />
      ) : (
        <g>
          <ellipse cx="167" cy="53" rx="5" ry="6.5" fill="#1f2937" />
          <circle cx="168.8" cy="50.6" r="2" fill="#fff" />
          <circle cx="165.5" cy="55.5" r="0.9" fill="#fff" />
          <path d="M162 47 L159 44 M164.5 46 L163 42.5 M167 46 L167 42" stroke="#1f2937" strokeWidth="1.3" strokeLinecap="round" />
        </g>
      )}
      {!locked && <circle cx="176" cy="63" r="5" fill="#f9a8d4" opacity="0.55" />}
    </svg>
  );
}
