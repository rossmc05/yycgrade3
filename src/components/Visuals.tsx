import type { ReactElement } from 'react';
import { Sprite } from '../art/sprite';
import type { Visual } from '../engine/types';

const INK = 'var(--ink)';
const ACCENT = 'var(--accent)';
const SOFT = 'var(--accent-soft)';

export function VisualView({ v }: { v: Visual }) {
  switch (v.kind) {
    case 'clock':
      return <Clock hour={v.hour} minute={v.minute} />;
    case 'array':
      return <Dots rows={v.rows} cols={v.cols} />;
    case 'groups':
      return <Groups groups={v.groups} each={v.each} />;
    case 'fraction-bar':
      return <FractionBar parts={v.parts} shaded={v.shaded} />;
    case 'fraction-compare':
      return (
        <div className="visual-stack">
          <FractionBar parts={v.a[1]} shaded={v.a[0]} label={`${v.a[0]}/${v.a[1]}`} />
          <FractionBar parts={v.b[1]} shaded={v.b[0]} label={`${v.b[0]}/${v.b[1]}`} />
        </div>
      );
    case 'coins':
      return <Coins coins={v.coins} />;
    case 'bar-graph':
      return <BarGraph title={v.title} labels={v.labels} values={v.values} step={v.step} />;
    case 'pictograph':
      return <Pictograph title={v.title} labels={v.labels} counts={v.counts} icon={v.icon} each={v.each} />;
    case 'polygon':
      return <Polygon sides={v.sides} labels={v.labels} regular={v.regular} />;
    case 'balance':
      return <Balance left={v.left} right={v.right} />;
    case 'number-line':
      return <NumberLine d={v.denominator} mark={v.mark} />;
    case 'base-ten':
      return <BaseTen h={v.hundreds} t={v.tens} o={v.ones} />;
  }
}

function Clock({ hour, minute }: { hour: number; minute: number }) {
  const r = 90;
  const mAng = (minute / 60) * 2 * Math.PI;
  const hAng = (((hour % 12) + minute / 60) / 12) * 2 * Math.PI;
  const hand = (ang: number, len: number) => ({ x2: 100 + Math.sin(ang) * len, y2: 100 - Math.cos(ang) * len });
  return (
    <svg viewBox="0 0 200 200" className="visual clock" role="img" aria-label="Analog clock">
      <circle cx="100" cy="100" r={r} fill="var(--card)" stroke={INK} strokeWidth="4" />
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * 2 * Math.PI;
        const inner = i % 5 === 0 ? 78 : 84;
        return (
          <line key={i} x1={100 + Math.sin(a) * inner} y1={100 - Math.cos(a) * inner} x2={100 + Math.sin(a) * 88} y2={100 - Math.cos(a) * 88} stroke={INK} strokeWidth={i % 5 === 0 ? 3 : 1} />
        );
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const a = (n / 12) * 2 * Math.PI;
        return (
          <text key={n} x={100 + Math.sin(a) * 64} y={100 - Math.cos(a) * 64 + 7} textAnchor="middle" fontSize="20" fontWeight="700" fill={INK}>
            {n}
          </text>
        );
      })}
      <line x1="100" y1="100" {...hand(hAng, 42)} stroke={INK} strokeWidth="8" strokeLinecap="round" />
      <line x1="100" y1="100" {...hand(mAng, 70)} stroke={ACCENT} strokeWidth="5" strokeLinecap="round" />
      <circle cx="100" cy="100" r="6" fill={INK} />
    </svg>
  );
}

function Dots({ rows, cols }: { rows: number; cols: number }) {
  const s = 26;
  return (
    <svg viewBox={`0 0 ${cols * s + 10} ${rows * s + 10}`} className="visual" style={{ maxWidth: cols * 34 }} role="img" aria-label={`${rows} rows of ${cols} dots`}>
      {Array.from({ length: rows * cols }, (_, i) => (
        <circle key={i} cx={5 + (i % cols) * s + s / 2} cy={5 + Math.floor(i / cols) * s + s / 2} r={s / 2 - 3} fill={ACCENT} />
      ))}
    </svg>
  );
}

function Groups({ groups, each }: { groups: number; each: number }) {
  return (
    <div className="groups">
      {Array.from({ length: groups }, (_, g) => (
        <div className="group" key={g}>
          {Array.from({ length: each }, (_, i) => (
            <span key={i} className="group-dot" />
          ))}
        </div>
      ))}
    </div>
  );
}

function FractionBar({ parts, shaded, label }: { parts: number; shaded: number; label?: string }) {
  const w = 300;
  const pw = w / parts;
  return (
    <svg viewBox={`0 0 ${w + 70} 50`} className="visual" role="img" aria-label={`${shaded} of ${parts} parts shaded`}>
      {Array.from({ length: parts }, (_, i) => (
        <rect key={i} x={2 + i * pw} y="5" width={pw} height="40" fill={i < shaded ? ACCENT : 'var(--card)'} stroke={INK} strokeWidth="2" />
      ))}
      {label && (
        <text x={w + 14} y="33" fontSize="20" fontWeight="700" fill={INK}>
          {label}
        </text>
      )}
    </svg>
  );
}

const COIN_STYLE: Record<string, { label: string; r: number; fill: string; bill?: boolean }> = {
  nickel: { label: '5¢', r: 26, fill: '#c0c4cc' },
  dime: { label: '10¢', r: 22, fill: '#d4d7de' },
  quarter: { label: '25¢', r: 30, fill: '#b8bcc6' },
  loonie: { label: '$1', r: 32, fill: '#e3b341' },
  toonie: { label: '$2', r: 34, fill: '#d9a93a' },
  five: { label: '$5', r: 0, fill: '#7aa7e0', bill: true },
  ten: { label: '$10', r: 0, fill: '#b48fd8', bill: true },
  twenty: { label: '$20', r: 0, fill: '#7cc48c', bill: true },
};

function Coins({ coins }: { coins: string[] }) {
  return (
    <div className="coins" role="img" aria-label={coins.join(', ')}>
      {coins.map((c, i) => {
        const st = COIN_STYLE[c];
        return st.bill ? (
          <svg key={i} viewBox="0 0 120 60" width="110" height="55">
            <rect x="2" y="2" width="116" height="56" rx="6" fill={st.fill} stroke="#333" strokeWidth="2" />
            <text x="60" y="38" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1a1a1a">
              {st.label}
            </text>
          </svg>
        ) : (
          <svg key={i} viewBox={`${36 - st.r - 2} ${36 - st.r - 2} ${st.r * 2 + 4} ${st.r * 2 + 4}`} width={(st.r * 2 + 4) * 1.6} height={(st.r * 2 + 4) * 1.6}>
            <circle cx="36" cy="36" r={st.r} fill={st.fill} stroke="#555" strokeWidth="2" />
            {c === 'loonie' && <polygon points={Array.from({ length: 11 }, (_, k) => { const a = (k / 11) * 2 * Math.PI; return `${36 + Math.sin(a) * (st.r - 2)},${36 - Math.cos(a) * (st.r - 2)}`; }).join(' ')} fill="none" stroke="#8a6a12" strokeWidth="1.5" />}
            {c === 'toonie' && <circle cx="36" cy="36" r={st.r - 11} fill="#e3b341" stroke="#8a6a12" />}
            {c === 'toonie' && <circle cx="36" cy="36" r={st.r} fill="none" stroke="#9aa0a8" strokeWidth="10" opacity="0.9" />}
            <text x="36" y="42" textAnchor="middle" fontSize={st.r > 25 ? 17 : 14} fontWeight="800" fill="#1a1a1a">
              {st.label}
            </text>
          </svg>
        );
      })}
    </div>
  );
}

function Pictograph({ title, labels, counts, icon, each }: { title: string; labels: string[]; counts: number[]; icon: string; each: number }) {
  return (
    <div className="pictograph" role="img" aria-label={`Pictograph: ${title}. Each ${icon} means ${each}.`}>
      <strong>{title}</strong>
      <table>
        <tbody>
          {labels.map((l, i) => (
            <tr key={l}>
              <th>{l}</th>
              <td>{Array.from({ length: counts[i] }, (_, k) => <Sprite key={k} e={icon} size="1.6em" />)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="picto-key">Key: <Sprite e={icon} size="1.4em" /> = {each}</p>
    </div>
  );
}

function BarGraph({ title, labels, values, step = 1 }: { title: string; labels: string[]; values: number[]; step?: number }) {
  const lines = Math.max(12, ...values.map((v) => Math.ceil(v / step)));
  const max = lines * step;
  const h = 200;
  const left = 34;
  const bw = 52;
  const gap = 22;
  const width = left + labels.length * (bw + gap) + 10;
  const y = (v: number) => 20 + h - (v / max) * h;
  return (
    <svg viewBox={`0 0 ${width} ${h + 70}`} className="visual" role="img" aria-label={`Bar graph: ${title}`}>
      <text x={width / 2} y="14" textAnchor="middle" fontSize="15" fontWeight="700" fill={INK}>
        {title}
      </text>
      {Array.from({ length: lines + 1 }, (_, k) => (
        <g key={k}>
          <line x1={left} x2={width - 6} y1={y(k * step)} y2={y(k * step)} stroke="var(--grid)" strokeWidth="1" />
          {(step > 1 || k % 2 === 0) && (
            <text x={left - 6} y={y(k * step) + 4} textAnchor="end" fontSize={step > 1 ? 10 : 12} fill={INK}>
              {k * step}
            </text>
          )}
        </g>
      ))}
      {values.map((v, i) => (
        <g key={i}>
          <rect x={left + gap / 2 + i * (bw + gap)} y={y(v)} width={bw} height={y(0) - y(v)} fill={ACCENT} rx="3" />
          <text x={left + gap / 2 + i * (bw + gap) + bw / 2} y={h + 40} textAnchor="middle" fontSize="13" fill={INK}>
            {labels[i]}
          </text>
        </g>
      ))}
      <line x1={left} x2={left} y1={y(max)} y2={y(0)} stroke={INK} strokeWidth="2" />
      <line x1={left} x2={width - 6} y1={y(0)} y2={y(0)} stroke={INK} strokeWidth="2" />
    </svg>
  );
}

/** Corner points for a polygon: regular, or a fixed irregular shape per side count. */
function polygonPoints(sides: number, regular: boolean): [number, number][] {
  if (regular) {
    return Array.from({ length: sides }, (_, i) => {
      const a = (i / sides) * 2 * Math.PI - Math.PI / 2 + (sides === 4 ? Math.PI / 4 : 0);
      return [130 + Math.cos(a) * 85, 105 + Math.sin(a) * 85];
    });
  }
  const shapes: Record<number, [number, number][]> = {
    3: [[40, 180], [220, 180], [90, 40]],
    4: [[40, 50], [220, 50], [220, 160], [40, 160]],
    5: [[60, 180], [210, 180], [230, 90], [140, 30], [40, 100]],
    6: [[50, 120], [90, 40], [190, 50], [235, 120], [180, 185], [80, 175]],
    8: [[90, 25], [170, 30], [225, 75], [215, 145], [165, 190], [95, 185], [40, 140], [45, 70]],
  };
  return shapes[sides];
}

function Polygon({ sides, labels, regular }: { sides: number; labels?: string[]; regular: boolean }) {
  const pts = polygonPoints(sides, regular);
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return (
    <svg viewBox="-30 -10 320 230" className="visual" role="img" aria-label={`${sides}-sided polygon`}>
      <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={SOFT} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {labels?.map((l, i) => {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[(i + 1) % pts.length];
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const len = Math.hypot(dx, dy) || 1;
        return (
          <text key={i} x={mx + (dx / len) * 22} y={my + (dy / len) * 22 + 6} textAnchor="middle" fontSize="17" fontWeight="700" fill={l === '▢' ? ACCENT : INK}>
            {l}
          </text>
        );
      })}
    </svg>
  );
}

function Balance({ left, right }: { left: string; right: string }) {
  return (
    <svg viewBox="0 0 320 150" className="visual" role="img" aria-label={`Balance: ${left} equals ${right}`}>
      <polygon points="160,60 140,140 180,140" fill={INK} />
      <rect x="20" y="52" width="280" height="8" rx="4" fill={INK} />
      <rect x="20" y="20" width="120" height="34" rx="8" fill={SOFT} stroke={INK} strokeWidth="2" />
      <rect x="180" y="20" width="120" height="34" rx="8" fill={SOFT} stroke={INK} strokeWidth="2" />
      <text x="80" y="44" textAnchor="middle" fontSize="18" fontWeight="700" fill={INK}>
        {left}
      </text>
      <text x="240" y="44" textAnchor="middle" fontSize="18" fontWeight="700" fill={INK}>
        {right}
      </text>
    </svg>
  );
}

function NumberLine({ d, mark }: { d: number; mark: number }) {
  const x0 = 30;
  const x1 = 330;
  const x = (i: number) => x0 + ((x1 - x0) * i) / d;
  return (
    <svg viewBox="0 0 360 90" className="visual" role="img" aria-label="Number line from 0 to 1">
      <line x1={x0} x2={x1} y1="40" y2="40" stroke={INK} strokeWidth="3" />
      {Array.from({ length: d + 1 }, (_, i) => (
        <line key={i} x1={x(i)} x2={x(i)} y1={i === 0 || i === d ? 26 : 32} y2={i === 0 || i === d ? 54 : 48} stroke={INK} strokeWidth="2" />
      ))}
      <text x={x0} y="80" textAnchor="middle" fontSize="18" fontWeight="700" fill={INK}>
        0
      </text>
      <text x={x1} y="80" textAnchor="middle" fontSize="18" fontWeight="700" fill={INK}>
        1
      </text>
      <circle cx={x(mark)} cy="40" r="9" fill={ACCENT} />
    </svg>
  );
}

function BaseTen({ h, t, o }: { h: number; t: number; o: number }) {
  const u = 7;
  const flat = 10 * u;
  let x = 4;
  const shapes: ReactElement[] = [];
  for (let i = 0; i < h; i++) {
    shapes.push(
      <g key={`h${i}`}>
        <rect x={x} y={4} width={flat} height={flat} fill={SOFT} stroke={INK} strokeWidth="1.5" />
        {Array.from({ length: 9 }, (_, k) => (
          <g key={k}>
            <line x1={x + (k + 1) * u} x2={x + (k + 1) * u} y1={4} y2={4 + flat} stroke={INK} strokeWidth="0.4" />
            <line y1={4 + (k + 1) * u} y2={4 + (k + 1) * u} x1={x} x2={x + flat} stroke={INK} strokeWidth="0.4" />
          </g>
        ))}
      </g>,
    );
    x += flat + 8;
  }
  for (let i = 0; i < t; i++) {
    shapes.push(<rect key={`t${i}`} x={x} y={4} width={u} height={flat} fill={ACCENT} stroke={INK} strokeWidth="1.5" />);
    x += u + 5;
  }
  x += 6;
  for (let i = 0; i < o; i++) {
    shapes.push(<rect key={`o${i}`} x={x + (i % 3) * (u + 4)} y={4 + flat - u - Math.floor(i / 3) * (u + 4)} width={u} height={u} fill="var(--warm)" stroke={INK} strokeWidth="1.5" />);
  }
  x += 3 * (u + 4);
  return (
    <svg viewBox={`0 0 ${x + 4} ${flat + 8}`} className="visual" role="img" aria-label={`${h} hundreds, ${t} tens, ${o} ones`}>
      {shapes}
    </svg>
  );
}
