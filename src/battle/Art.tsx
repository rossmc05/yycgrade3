import { useId } from 'react';
import type { SubjectId } from '../engine/types';

const INK = '#2b2340';

// ---------- Zone scenery ----------

export function SceneArt({ subject }: { subject: SubjectId }) {
  const uid = useId().replace(/:/g, '');
  const sky = `sky-${uid}`;
  const common = (
    <defs>
      <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
        {subject === 'math' && (<><stop offset="0" stopColor="#7dd3fc" /><stop offset="1" stopColor="#e0f2fe" /></>)}
        {subject === 'spelling' && (<><stop offset="0" stopColor="#4c1d95" /><stop offset="1" stopColor="#a78bfa" /></>)}
        {subject === 'grammar' && (<><stop offset="0" stopColor="#334155" /><stop offset="1" stopColor="#64748b" /></>)}
        {subject === 'science' && (<><stop offset="0" stopColor="#fb923c" /><stop offset="1" stopColor="#fde68a" /></>)}
      </linearGradient>
    </defs>
  );
  return (
    <svg className="scene-art" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {common}
      <rect width="400" height="220" fill={`url(#${sky})`} />
      {subject === 'math' && (
        <g>
          <circle cx="330" cy="40" r="18" fill="#fef08a" />
          <polygon points="0,170 70,60 130,150 200,40 280,150 340,80 400,150 400,220 0,220" fill="#64748b" />
          <polygon points="70,60 86,86 54,86" fill="#fff" />
          <polygon points="200,40 222,72 178,72" fill="#fff" />
          <polygon points="340,80 356,104 324,104" fill="#fff" />
          <polygon points="0,190 90,130 180,180 260,140 400,190 400,220 0,220" fill="#475569" />
          {[40, 120, 300, 370].map((x) => <polygon key={x} points={`${x},190 ${x + 10},160 ${x + 20},190`} fill="#166534" />)}
          <rect y="188" width="400" height="32" fill="#86efac" />
          <text x="150" y="110" fontSize="16" fill="#ffffff66" fontWeight="900">+ − × ÷</text>
        </g>
      )}
      {subject === 'spelling' && (
        <g>
          <circle cx="60" cy="40" r="14" fill="#fef9c3" />
          {[30, 90, 160, 250, 330, 380].map((x, i) => <circle key={x} cx={x} cy={20 + (i % 3) * 18} r="1.6" fill="#fff" />)}
          <path d="M0 150 Q60 120 120 150 T240 150 T400 140 V220 H0Z" fill="#14532d" />
          {[20, 70, 140, 300, 360].map((x) => (
            <g key={x}>
              <rect x={x} y="110" width="4" height="60" fill="#3f6212" />
              <ellipse cx={x + 2} cy="108" rx="4" ry="12" fill="#78350f" />
            </g>
          ))}
          <ellipse cx="200" cy="198" rx="230" ry="30" fill="#065f46" />
          <ellipse cx="120" cy="196" rx="24" ry="6" fill="#22c55e" />
          <ellipse cx="300" cy="202" rx="20" ry="5" fill="#22c55e" />
          {[100, 230, 330].map((x) => <circle key={x} className="swamp-bubble" cx={x} cy="200" r="4" fill="#a7f3d0" opacity="0.7" />)}
          <text x="230" y="90" fontSize="18" fill="#ffffff55" fontWeight="900">a b c</text>
        </g>
      )}
      {subject === 'grammar' && (
        <g>
          <rect x="0" y="20" width="400" height="10" fill="#1e293b" />
          {[40, 140, 240, 340].map((x) => <rect key={x} x={x} y="30" width="40" height="8" fill="#fde047" opacity="0.8" />)}
          <rect x="20" y="70" width="120" height="100" rx="6" fill="#475569" stroke="#1e293b" strokeWidth="4" />
          {[0, 1, 2].map((i) => <rect key={i} x="20" y={90 + i * 26} width="120" height="4" fill="#334155" />)}
          <rect x="290" y="80" width="90" height="90" fill="#7f1d1d" stroke="#1e293b" strokeWidth="4" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x="296" y={86 + i * 21} width="78" height="15" rx="3" fill="#991b1b" />)}
          <g fill="#94a3b8" stroke="#1e293b" strokeWidth="3">
            <circle cx="200" cy="80" r="22" />
            <circle cx="236" cy="104" r="14" />
          </g>
          <circle cx="200" cy="80" r="8" fill="#1e293b" />
          <circle cx="236" cy="104" r="5" fill="#1e293b" />
          <rect y="180" width="400" height="40" fill="#1f2937" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={i * 56} y="182" width="28" height="6" fill="#facc15" transform={`skewX(-30)`} />)}
        </g>
      )}
      {subject === 'science' && (
        <g>
          <circle cx="320" cy="60" r="26" fill="#fff7ed" opacity="0.9" />
          <polygon points="0,180 40,110 70,170 110,90 150,170 180,120 220,180" fill="#c2410c" />
          {[[60, 100], [260, 110], [330, 95]].map(([x, h]) => (
            <g key={x}>
              <rect x={x} y={180 - h} width="22" height={h} rx="6" fill="#ea580c" />
              {[0.25, 0.5, 0.75].map((f) => <rect key={f} x={x} y={180 - h * f} width="22" height="4" fill="#9a3412" />)}
              <ellipse cx={x + 11} cy={180 - h} rx="18" ry="7" fill="#78350f" />
            </g>
          ))}
          <rect y="176" width="400" height="44" fill="#fdba74" />
          <path d="M150 200 q10 -6 20 0 q10 6 20 0" stroke="#fff7ed" strokeWidth="4" fill="none" />
          <g fill="#fff7ed" opacity="0.8">
            <rect x="200" y="196" width="26" height="5" rx="2" />
            <circle cx="198" cy="198" r="4" />
            <circle cx="228" cy="198" r="4" />
          </g>
        </g>
      )}
    </svg>
  );
}

// ---------- Monsters ----------

function Eyes({ cx, cy, gap, r, hurt, glow = '#fff' }: { cx: number; cy: number; gap: number; r: number; hurt: boolean; glow?: string }) {
  if (hurt) {
    return (
      <g stroke={INK} strokeWidth="4" strokeLinecap="round">
        {[-1, 1].map((s) => (
          <g key={s}>
            <line x1={cx + s * gap - r * 0.7} y1={cy - r * 0.7} x2={cx + s * gap + r * 0.7} y2={cy + r * 0.7} />
            <line x1={cx + s * gap + r * 0.7} y1={cy - r * 0.7} x2={cx + s * gap - r * 0.7} y2={cy + r * 0.7} />
          </g>
        ))}
      </g>
    );
  }
  return (
    <g>
      {[-1, 1].map((s) => (
        <g key={s}>
          <circle cx={cx + s * gap} cy={cy} r={r} fill={glow} stroke={INK} strokeWidth="3" />
          <circle cx={cx + s * gap - 2} cy={cy + 1} r={r * 0.45} fill={INK} />
          <circle cx={cx + s * gap - 3.5} cy={cy - 1.5} r={r * 0.15} fill="#fff" />
          <line x1={cx + s * gap - r} y1={cy - r - (s === -1 ? 6 : 2)} x2={cx + s * gap + r} y2={cy - r - (s === -1 ? 2 : 6)} stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

function Crown({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon points="-26,0 -26,-22 -13,-10 0,-28 13,-10 26,-22 26,0" fill="#facc15" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="0" cy="-10" r="4" fill="#ef4444" />
    </g>
  );
}

const GOLEM = ['#a8a29e', '#bae6fd', '#86efac', '#78716c'];
const SLIME = ['#4ade80', '#c084fc', '#38bdf8', '#f472b6'];
const BOT = ['#fb923c', '#60a5fa', '#a3e635', '#e11d48'];
const FOSSIL = ['#fde68a', '#fcd34d', '#fef3c7', '#e7e5e4'];

function Golem({ kind, hurt }: { kind: number; hurt: boolean }) {
  const c = GOLEM[kind];
  return (
    <g>
      <polygon points="30,70 20,120 40,128 50,80" fill={c} stroke={INK} strokeWidth="4" strokeLinejoin="round" className="limb-l" />
      <polygon points="130,70 140,120 120,128 110,80" fill={c} stroke={INK} strokeWidth="4" strokeLinejoin="round" className="limb-r" />
      <polygon points="45,40 80,22 118,40 128,100 110,140 50,140 32,100" fill={c} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <polygon points="60,110 70,100 85,112 98,102 104,116" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M70 128 l6 -10 6 10" stroke="#00000033" strokeWidth="3" fill="none" />
      {kind === 1 && [52, 72, 92, 112].map((x) => <polygon key={x} points={`${x - 5},42 ${x + 5},42 ${x},56`} fill="#e0f2fe" stroke={INK} strokeWidth="2" />)}
      {kind === 2 && <path d="M46 42 Q80 10 118 42 Q100 34 80 40 Q60 34 46 42Z" fill="#22c55e" stroke={INK} strokeWidth="3" />}
      <Eyes cx={80} cy={72} gap={18} r={10} hurt={hurt} glow={kind === 3 ? '#fde047' : '#fff'} />
      {kind === 3 && <Crown x={80} y={26} />}
    </g>
  );
}

function Slime({ kind, hurt }: { kind: number; hurt: boolean }) {
  const c = SLIME[kind];
  return (
    <g>
      <path d="M20 140 Q14 80 50 52 Q80 26 110 52 Q146 80 140 140 Q120 148 100 140 Q80 150 60 140 Q40 148 20 140Z" fill={c} stroke={INK} strokeWidth="4" strokeLinejoin="round" className="wobble" />
      <ellipse cx="56" cy="64" rx="12" ry="7" fill="#ffffff88" transform="rotate(-30 56 64)" />
      {kind === 1 && [40, 120, 100].map((x, i) => <circle key={x} cx={x} cy={110 - i * 12} r="6" fill="#ffffff55" stroke={INK} strokeWidth="2" />)}
      {kind === 2 && <path d="M60 140 q4 14 0 20 M110 140 q3 10 0 16" stroke={c} strokeWidth="8" strokeLinecap="round" />}
      <Eyes cx={80} cy={88} gap={20} r={12} hurt={hurt} />
      <path d={hurt ? 'M64 120 q16 -8 32 0' : 'M62 114 q18 14 36 0'} stroke={INK} strokeWidth="4" fill={hurt ? 'none' : '#7f1d1d'} strokeLinecap="round" />
      {kind === 3 && (<><Crown x={80} y={46} /><circle cx="122" cy="54" r="9" fill="#fb7185" stroke={INK} strokeWidth="2" /></>)}
    </g>
  );
}

function Bot({ kind, hurt }: { kind: number; hurt: boolean }) {
  const c = BOT[kind];
  return (
    <g>
      <line x1="80" y1="30" x2="80" y2="12" stroke={INK} strokeWidth="4" />
      <circle cx="80" cy="10" r="6" fill={hurt ? '#ef4444' : '#fde047'} stroke={INK} strokeWidth="3" className="blink" />
      <rect x="22" y="80" width="18" height="44" rx="8" fill={c} stroke={INK} strokeWidth="4" className="limb-l" />
      <rect x="120" y="80" width="18" height="44" rx="8" fill={c} stroke={INK} strokeWidth="4" className="limb-r" />
      <rect x="36" y="30" width="88" height="70" rx="14" fill={c} stroke={INK} strokeWidth="4" />
      <rect x="46" y="42" width="68" height="44" rx="8" fill="#0f172a" />
      <rect x="50" y="102" width="60" height="38" rx="8" fill={c} stroke={INK} strokeWidth="4" />
      {[60, 80, 100].map((x) => <circle key={x} cx={x} cy="121" r="5" fill="#0f172a" />)}
      {hurt ? (
        <Eyes cx={80} cy={62} gap={16} r={7} hurt />
      ) : (
        <g fill="#22d3ee">
          <rect x="56" y="54" width="16" height="12" rx="3" />
          <rect x="88" y="54" width="16" height="12" rx="3" />
          <rect x="64" y="74" width="32" height="4" rx="2" />
        </g>
      )}
      {kind === 1 && <circle cx="124" cy="36" r="12" fill="#94a3b8" stroke={INK} strokeWidth="3" strokeDasharray="5 3" />}
      {kind === 2 && <path d="M40 140 l10 8 l-10 8 l10 8" stroke={INK} strokeWidth="4" fill="none" />}
      {kind === 3 && <Crown x={80} y={30} />}
    </g>
  );
}

function Fossil({ kind, hurt }: { kind: number; hurt: boolean }) {
  const c = FOSSIL[kind];
  return (
    <g>
      {kind === 2 && (
        <g fill={c} stroke={INK} strokeWidth="4" strokeLinejoin="round" className="flap">
          <polygon points="60,80 0,50 20,100" />
          <polygon points="100,80 160,50 140,100" />
        </g>
      )}
      <path d="M40 140 L44 110 M116 140 L112 110" stroke={INK} strokeWidth="10" strokeLinecap="round" />
      <path d="M40 140 L44 110 M116 140 L112 110" stroke={c} strokeWidth="5" strokeLinecap="round" />
      <path d="M130 110 Q156 120 150 140" stroke={INK} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M130 110 Q156 120 150 140" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="80" cy="104" rx="52" ry="34" fill={c} stroke={INK} strokeWidth="4" />
      {[60, 80, 100].map((x) => <path key={x} d={`M${x} 76 q4 28 0 56`} stroke="#a16207" strokeWidth="3" fill="none" opacity="0.6" />)}
      {kind === 1 && <path d="M28 54 Q50 20 80 30 L60 70Z" fill="#fbbf24" stroke={INK} strokeWidth="3" />}
      <path d="M30 80 Q20 46 56 40 Q84 36 92 60 Q96 84 70 88 Q44 92 30 80Z" fill={c} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      {kind === 1 && <path d="M40 46 l-6 -18 M60 42 l2 -20" stroke={INK} strokeWidth="5" strokeLinecap="round" />}
      <path d={`M34 74 L${hurt ? 80 : 86} 76`} stroke={INK} strokeWidth="3" />
      {[40, 52, 64, 76].map((x) => <polygon key={x} points={`${x},74 ${x + 5},74 ${x + 2.5},81`} fill="#fff" stroke={INK} strokeWidth="1.5" />)}
      <Eyes cx={58} cy={56} gap={11} r={7} hurt={hurt} glow={kind === 3 ? '#fca5a5' : '#fff'} />
      {kind === 3 && <Crown x={60} y={40} />}
    </g>
  );
}

export function MonsterArt({ subject, kind, hurt = false, size = 160 }: { subject: SubjectId; kind: number; hurt?: boolean; size?: number }) {
  return (
    <svg className="monster-art" width={size} height={size} viewBox="0 0 160 165" aria-hidden="true">
      <ellipse cx="80" cy="150" rx="56" ry="9" fill="#00000033" />
      {subject === 'math' && <Golem kind={kind} hurt={hurt} />}
      {subject === 'spelling' && <Slime kind={kind} hurt={hurt} />}
      {subject === 'grammar' && <Bot kind={kind} hurt={hurt} />}
      {subject === 'science' && <Fossil kind={kind} hurt={hurt} />}
    </svg>
  );
}
