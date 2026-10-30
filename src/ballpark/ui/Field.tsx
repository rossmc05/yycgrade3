// The ballpark seen from behind home plate: runners on the bases, and the ball's flight for each play.

import type { ReactNode } from 'react';
import type { Bases, PlayKind } from '../game';
import { Figure } from './Figure';

const HOME = { x: 200, y: 262 };
const MOUND = { x: 200, y: 196 };
const BASE_AT = [{ x: 268, y: 196 }, { x: 200, y: 130 }, { x: 132, y: 196 }];

/** Where the ball lands for each kind of play (a few spots each, picked by the play's id). */
const LANDING: Record<PlayKind, { x: number; y: number; high: number }[]> = {
  single: [{ x: 130, y: 120, high: 40 }, { x: 205, y: 100, high: 30 }, { x: 275, y: 118, high: 40 }],
  double: [{ x: 108, y: 70, high: 60 }, { x: 292, y: 70, high: 60 }],
  triple: [{ x: 52, y: 92, high: 70 }, { x: 348, y: 92, high: 70 }],
  hr: [{ x: 96, y: -10, high: 160 }, { x: 200, y: -26, high: 180 }, { x: 304, y: -10, high: 160 }],
  ground: [{ x: 165, y: 165, high: 0 }, { x: 236, y: 165, high: 0 }, { x: 222, y: 140, high: 0 }],
  'double-play': [{ x: 182, y: 150, high: 0 }],
  fly: [{ x: 200, y: 66, high: 120 }, { x: 120, y: 90, high: 110 }, { x: 280, y: 90, high: 110 }],
  'sac-fly': [{ x: 200, y: 62, high: 120 }],
  catch: [{ x: 110, y: 80, high: 60 }, { x: 290, y: 80, high: 60 }],
  strikeout: [{ x: 200, y: 276, high: 0 }],
  foul: [{ x: 392, y: 228, high: 90 }, { x: 8, y: 228, high: 90 }],
};

export function ballPath(kind: PlayKind, id: number): string {
  const spots = LANDING[kind];
  const to = spots[id % spots.length];
  if (kind === 'strikeout') return `M ${MOUND.x} ${MOUND.y} L ${to.x} ${to.y}`;
  const cx = (HOME.x + to.x) / 2;
  const cy = Math.min(HOME.y, to.y) - to.high;
  return `M ${HOME.x} ${HOME.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}

export function Field({ bases, play, runner, children }: {
  bases: Bases;
  /** The play to animate; changing its id replays the ball. */
  play?: { id: number; kind: PlayKind };
  /** Colours of the team on base. */
  runner: string;
  /** Players drawn over the field (batter and pitcher). */
  children?: ReactNode;
}) {
  return (
    <div className="ballfield">
      <svg viewBox="0 -40 400 330" className="field-svg" aria-hidden="true">
        <defs>
          <radialGradient id="grass" cx="50%" cy="85%" r="85%">
            <stop offset="0" stopColor="#4ade80" />
            <stop offset="1" stopColor="#15803d" />
          </radialGradient>
          <pattern id="stripes" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="20" height="40" fill="rgba(255,255,255,0.06)" />
          </pattern>
        </defs>
        {/* stands and sky */}
        <rect x="0" y="-40" width="400" height="80" fill="#1e3a8a" />
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={5 + i * 10} cy={-24 + (i % 3) * 7} r="3" fill={['#f87171', '#facc15', '#60a5fa', '#f9fafb', '#a78bfa'][i % 5]} opacity="0.8" />
        ))}
        {/* outfield */}
        <path d="M 200 290 L -20 70 Q 200 -60 420 70 Z" fill="url(#grass)" />
        <path d="M 200 290 L -20 70 Q 200 -60 420 70 Z" fill="url(#stripes)" />
        <path d="M -20 70 Q 200 -60 420 70" fill="none" stroke="#1e40af" strokeWidth="8" />
        <path d="M -20 70 Q 200 -60 420 70" fill="none" stroke="#facc15" strokeWidth="2" transform="translate(0,-4)" />
        {/* infield dirt */}
        <path d="M 200 280 L 290 196 Q 270 118 200 104 Q 130 118 110 196 Z" fill="#d6a46a" />
        <path d="M 200 248 L 252 196 L 200 146 L 148 196 Z" fill="#22c55e" />
        <path d="M 200 262 L 400 70 M 200 262 L 0 70" stroke="#fff" strokeWidth="2" opacity="0.9" />
        <ellipse cx={MOUND.x} cy={MOUND.y} rx="14" ry="8" fill="#c08a50" />
        <rect x="194" y="194" width="12" height="3" fill="#fff" />
        <path d={`M ${HOME.x - 8} ${HOME.y} l 8 -6 l 8 6 l 0 6 l -16 0 Z`} fill="#fff" />
        {BASE_AT.map((b, i) => <rect key={i} x={b.x - 7} y={b.y - 7} width="14" height="14" fill="#fff" transform={`rotate(45 ${b.x} ${b.y})`} />)}
        {/* runners */}
        {bases.map((on, i) => on && (
          <g key={i} className="runner">
            <circle cx={BASE_AT[i].x} cy={BASE_AT[i].y - 16} r="9" fill={runner} stroke="#fff" strokeWidth="2" />
            <circle cx={BASE_AT[i].x} cy={BASE_AT[i].y - 28} r="6" fill="#f1c27d" stroke="#fff" strokeWidth="1" />
          </g>
        ))}
        {/* the ball */}
        {play && (
          <g key={play.id}>
            <circle r="5" fill="#fff" stroke="#dc2626" strokeWidth="1.2" className="ball">
              <animateMotion dur="0.35s" fill="freeze" path={`M ${MOUND.x} ${MOUND.y - 10} L ${HOME.x} ${HOME.y - 6}`} />
              <animateMotion begin="0.35s" dur={play.kind === 'hr' ? '1.4s' : '0.9s'} fill="freeze" path={ballPath(play.kind, play.id)} />
            </circle>
          </g>
        )}
      </svg>
      {children}
    </div>
  );
}

/** Someone standing at a spot on the field (as fractions of its width and height). */
export function OnField({ x, y, children, className = '' }: { x: number; y: number; children: ReactNode; className?: string }) {
  return <div className={`on-field ${className}`} style={{ left: `${x * 100}%`, top: `${y * 100}%` }}>{children}</div>;
}

export const SPOTS = { plate: { x: 0.44, y: 0.95 }, mound: { x: 0.5, y: 0.72 } };

export function TheirPlayer({ color, trim, pose, size }: { color: string; trim: string; pose: 'bat' | 'pitch'; size: number }) {
  return <Figure color={color} trim={trim} pose={pose} skin={pose === 'bat' ? 2 : 4} size={size} />;
}
