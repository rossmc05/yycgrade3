// A drawn ballplayer for cards and the field: no photos, just colours and a pose.

import { useId } from 'react';
import { shade } from '../../avatar/AvatarArt';

export type Pose = 'bat' | 'pitch' | 'field';

const SKINS = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac', '#a0673e'];

/** A player in `color` (jersey and cap) with `trim`, in a batting, pitching or fielding pose. */
export function Figure({ color, trim, pose = 'bat', skin = 0, number, size = 120 }: { color: string; trim: string; pose?: Pose; skin?: number; number?: string; size?: number }) {
  const uid = useId().replace(/:/g, '');
  const s = SKINS[skin % SKINS.length];
  const pants = '#f8fafc';
  return (
    <svg viewBox="0 0 120 150" width={size} height={(size * 150) / 120} className="figure" aria-hidden="true">
      <defs>
        <linearGradient id={`j${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor={shade(color, 0.12)} />
          <stop offset="1" stopColor={shade(color, -0.18)} />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="144" rx="34" ry="5" fill="rgba(0,0,0,0.25)" />
      {/* legs */}
      {pose === 'pitch' ? (
        <>
          <path d="M52 96 L34 128 L28 140" stroke={pants} strokeWidth="12" strokeLinecap="round" fill="none" />
          <path d="M66 96 L80 118 L96 112" stroke={pants} strokeWidth="12" strokeLinecap="round" fill="none" />
          <ellipse cx="26" cy="141" rx="9" ry="4" fill="#111827" />
          <ellipse cx="99" cy="112" rx="8" ry="4" fill="#111827" transform="rotate(-20 99 112)" />
        </>
      ) : (
        <>
          <path d="M52 96 L44 120 L40 140" stroke={pants} strokeWidth="12" strokeLinecap="round" fill="none" />
          <path d="M68 96 L76 120 L82 140" stroke={pants} strokeWidth="12" strokeLinecap="round" fill="none" />
          <ellipse cx="38" cy="141" rx="9" ry="4" fill="#111827" />
          <ellipse cx="85" cy="141" rx="9" ry="4" fill="#111827" />
        </>
      )}
      <rect x="47" y="90" width="26" height="8" rx="3" fill={trim} />
      {/* body */}
      <path d="M40 52 Q60 44 80 52 L76 94 L44 94 Z" fill={`url(#j${uid})`} stroke={shade(color, -0.35)} strokeWidth="1.5" />
      <path d="M60 50 L60 94" stroke={trim} strokeWidth="1.5" opacity="0.7" />
      {number && <text x="68" y="74" fontSize="13" fontWeight="800" fill={trim} textAnchor="middle" fontFamily="Fredoka, sans-serif">{number}</text>}
      {/* arms and bat / ball */}
      {pose === 'bat' && (
        <>
          <path d="M44 58 L56 70 L70 60" stroke={s} strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M76 58 L72 64" stroke={s} strokeWidth="9" strokeLinecap="round" />
          <path d="M70 60 L98 18" stroke="#b45309" strokeWidth="7" strokeLinecap="round" />
          <path d="M70 60 L76 51" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
        </>
      )}
      {pose === 'pitch' && (
        <>
          <path d="M42 58 L24 70 L18 58" stroke={s} strokeWidth="9" strokeLinecap="round" fill="none" />
          <circle cx="18" cy="54" r="7" fill="#7c2d12" />
          <path d="M78 56 L96 40 L104 22" stroke={s} strokeWidth="9" strokeLinecap="round" fill="none" />
          <circle cx="105" cy="18" r="5" fill="#fff" stroke="#dc2626" strokeWidth="1" />
        </>
      )}
      {pose === 'field' && (
        <>
          <path d="M42 58 L30 80" stroke={s} strokeWidth="9" strokeLinecap="round" />
          <path d="M78 58 L90 80" stroke={s} strokeWidth="9" strokeLinecap="round" />
          <circle cx="92" cy="84" r="8" fill="#7c2d12" />
        </>
      )}
      {/* head and cap */}
      <rect x="54" y="40" width="12" height="10" fill={shade(s, -0.08)} />
      <circle cx="60" cy="30" r="15" fill={s} />
      <circle cx="66" cy="31" r="2" fill="#1f2937" />
      <path d="M62 37 Q66 39 70 36" stroke="#7f1d1d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M44 28 Q46 12 60 12 Q74 12 76 26 Z" fill={color} stroke={shade(color, -0.35)} strokeWidth="1.5" />
      <path d="M70 25 Q82 24 86 28 L74 29 Z" fill={shade(color, -0.25)} />
      <circle cx="60" cy="20" r="3" fill={trim} />
    </svg>
  );
}
