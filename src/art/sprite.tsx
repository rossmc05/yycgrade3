// 3D art for emoji (Microsoft Fluent Emoji 3D, MIT licence), copied into public/art by scripts/copy-art.mjs.
// Anything without art falls back to the plain emoji, so nothing ever goes missing.

import { useState } from 'react';
import { useStore } from '../engine/store';
import have from './have.json';

const HAVE = new Set<string>(have);

/** The art file's name: code points in hex, dashes between, without variation selectors. */
export const artCode = (e: string) => [...e].map((c) => c.codePointAt(0)!.toString(16)).filter((c) => c !== 'fe0f').join('-');

/** The URL of an emoji's 3D art, or undefined when there is none. */
export function artUrl(e: string): string | undefined {
  const c = artCode(e);
  return HAVE.has(c) ? `./art/${c}.webp` : undefined;
}

export function Sprite({ e, size = 32, label, className = '' }: { e: string; size?: number | string; label?: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  const url = artUrl(e);
  const dim = typeof size === 'number' ? `${size}px` : size;
  if (!url || broken) {
    return (
      <span className={`sprite text ${className}`} style={{ fontSize: `calc(${dim} * 0.8)`, width: dim, height: dim }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
        {e}
      </span>
    );
  }
  return (
    <img className={`sprite ${className}`} src={url} width={typeof size === 'number' ? size : undefined} style={{ width: dim, height: dim }} alt={label ?? ''} aria-hidden={label ? undefined : true} draggable={false} onError={() => setBroken(true)} />
  );
}

/** Loads images ahead of time; resolves when all have loaded or failed. */
export function preload(urls: string[], onEach?: (done: number) => void): Promise<void> {
  let done = 0;
  return Promise.all(
    urls.map(
      (u) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = img.onerror = () => { onEach?.(++done); resolve(); };
          img.src = u;
        }),
    ),
  ).then(() => undefined);
}

/** An emoji drawn as 3D art, or as plain text in the classic look. */
export function Icon({ e, size = '1.3em', label }: { e: string; size?: number | string; label?: string }) {
  const { data } = useStore();
  if (data.settings.classicLook) return <span role={label ? 'img' : undefined} aria-label={label}>{e}</span>;
  return <Sprite e={e} size={size} label={label} className="icon" />;
}
