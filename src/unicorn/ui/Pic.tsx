// Draws a Kindergarten picture token: an emoji in 3D art, a group like `4×🍓`,
// a shape like `shape:circle:red`, or a big number, letter or word.

import { Sprite } from '../../art/sprite';
import { nameOf } from '../../subjects/kindergarten/pics';

const COLOUR: Record<string, string> = { red: '#ef4444', blue: '#3b82f6', yellow: '#facc15', green: '#22c55e', purple: '#a855f7', pink: '#ec4899' };

export function ShapeArt({ shape, color = 'purple', size = 90 }: { shape: string; color?: string; size?: number }) {
  const fill = COLOUR[color] ?? color;
  const stroke = 'rgba(0,0,0,0.25)';
  const common = { fill, stroke, strokeWidth: 3, strokeLinejoin: 'round' as const };
  const body = {
    circle: <circle cx="50" cy="50" r="38" {...common} />,
    square: <rect x="14" y="14" width="72" height="72" rx="3" {...common} />,
    triangle: <polygon points="50,10 90,86 10,86" {...common} />,
    rectangle: <rect x="6" y="26" width="88" height="48" rx="3" {...common} />,
    oval: <ellipse cx="50" cy="50" rx="28" ry="40" {...common} />,
    star: <polygon points="50,6 61,38 95,38 67,58 78,91 50,71 22,91 33,58 5,38 39,38" {...common} />,
    heart: <path d="M50 88 C10 60 6 34 22 22 C34 13 46 20 50 30 C54 20 66 13 78 22 C94 34 90 60 50 88 Z" {...common} />,
  }[shape];
  return <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">{body}</svg>;
}

const isEmoji = (s: string) => /\p{Extended_Pictographic}/u.test(s);

/** A group of things to count, laid out in neat rows of five so they are easy to count. */
function Group({ n, e, size }: { n: number; e: string; size: number }) {
  const per = n > 10 ? 5 : n > 5 ? 5 : n;
  const s = n > 10 ? size * 0.42 : n > 5 ? size * 0.5 : size * 0.6;
  return (
    <span className="k-group" style={{ gridTemplateColumns: `repeat(${per}, ${s}px)` }}>
      {Array.from({ length: n }, (_, i) => <Sprite key={i} e={e} size={s} />)}
    </span>
  );
}

export function Pic({ token, size = 96 }: { token: string; size?: number }) {
  const group = token.match(/^(\d+)×(.+)$/);
  if (group) return <Group n={+group[1]} e={group[2]} size={size} />;
  const shape = token.match(/^shape:(\w+)(?::(\w+))?$/);
  if (shape) return <ShapeArt shape={shape[1]} color={shape[2]} size={size} />;
  if (token === '❓') return <span className="k-mystery" style={{ width: size, height: size }}>?</span>;
  if (isEmoji(token)) return <Sprite e={token} size={size} label={nameOf(token)} />;
  return <span className={`k-text ${token.length > 2 ? 'word' : ''}`} style={{ fontSize: token.length > 2 ? size * 0.42 : size * 0.7 }}>{token}</span>;
}
