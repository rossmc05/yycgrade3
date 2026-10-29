// A small particle engine for battle effects: sparks, stars, coins and confetti, drawn on a canvas.

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { artUrl } from '../art/sprite';
import { sfx } from './sfx';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; size: number; spin: number; angle: number;
  color?: string; img?: HTMLImageElement; gravity: number; shape: 'dot' | 'rect' | 'img' | 'ring';
}

export type BurstKind = 'hit' | 'crit' | 'special' | 'block' | 'heal' | 'poof' | 'coins' | 'confetti';

export interface FxHandle {
  /** A burst at x, y given as fractions of the layer's width and height. */
  burst: (kind: BurstKind, x: number, y: number, accent?: string) => void;
}

const images: Record<string, HTMLImageElement> = {};
function img(e: string): HTMLImageElement | undefined {
  const url = artUrl(e);
  if (!url || typeof Image === 'undefined') return undefined;
  if (!images[e]) { images[e] = new Image(); images[e].src = url; }
  return images[e];
}

const CONFETTI = ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#facc15'];
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export const FxLayer = forwardRef<FxHandle>(function FxLayer(_, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const parts = useRef<Particle[]>([]);
  const frame = useRef(0);
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const loop = () => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth, h = c.clientHeight;
    if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    parts.current = parts.current.filter((p) => p.life < p.max);
    for (const p of parts.current) {
      p.life += 1;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.x += p.vx; p.y += p.vy; p.angle += p.spin;
      const t = p.life / p.max;
      ctx.globalAlpha = t > 0.7 ? (1 - t) / 0.3 : 1;
      ctx.save();
      ctx.translate(p.x * w, p.y * h);
      ctx.rotate(p.angle);
      const s = p.size * Math.min(w, 500) / 500;
      if (p.shape === 'img' && p.img?.complete) ctx.drawImage(p.img, -s / 2, -s / 2, s, s);
      else if (p.shape === 'rect') { ctx.fillStyle = p.color!; ctx.fillRect(-s / 2, -s / 4, s, s / 2); }
      else if (p.shape === 'ring') { ctx.strokeStyle = p.color!; ctx.lineWidth = 4 * (1 - t); ctx.beginPath(); ctx.arc(0, 0, s * (0.3 + t * 1.6), 0, Math.PI * 2); ctx.stroke(); }
      else { ctx.fillStyle = p.color!; ctx.beginPath(); ctx.arc(0, 0, s / 2 * (1 - t * 0.6), 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    frame.current = parts.current.length ? requestAnimationFrame(loop) : 0;
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  useImperativeHandle(ref, () => ({
    burst(kind, x, y, accent = '#fde047') {
      if (reduced) return;
      const add = (n: number, make: () => Partial<Particle>) => {
        for (let i = 0; i < n; i++) {
          parts.current.push({ x, y, vx: 0, vy: 0, life: 0, max: 40, size: 10, spin: 0, angle: 0, gravity: 0, shape: 'dot', ...make() });
        }
      };
      const sparks = (n: number, speed: number, colors: string[]) =>
        add(n, () => { const a = rnd(0, Math.PI * 2), v = rnd(speed * 0.4, speed); return { vx: Math.cos(a) * v, vy: Math.sin(a) * v * 1.6, color: colors[Math.floor(Math.random() * colors.length)], size: rnd(6, 14), max: rnd(25, 45), gravity: 0.0006 }; });
      const stars = (n: number, e: string, speed: number, size: number) =>
        add(n, () => { const a = rnd(-Math.PI, 0), v = rnd(speed * 0.5, speed); return { vx: Math.cos(a) * v, vy: Math.sin(a) * v * 1.6, img: img(e), shape: 'img', size: rnd(size * 0.6, size), spin: rnd(-0.2, 0.2), max: rnd(40, 60), gravity: 0.0012 }; });
      const ring = (color: string, size: number) => add(1, () => ({ shape: 'ring', color, size, max: 22 }));

      if (kind === 'hit') { sparks(14, 0.012, ['#fff', accent, '#fb923c']); ring('#fff', 60); }
      if (kind === 'crit') { sparks(24, 0.018, ['#fff', '#fde047', '#f97316']); stars(5, '⭐', 0.014, 34); ring('#fde047', 90); }
      if (kind === 'special') { sparks(40, 0.024, ['#fff', '#f472b6', '#a855f7', '#fde047', accent]); stars(8, '✨', 0.018, 44); ring('#f472b6', 130); ring('#fff', 80); }
      if (kind === 'block') { sparks(12, 0.01, ['#93c5fd', '#fff', '#60a5fa']); ring('#93c5fd', 70); }
      if (kind === 'heal') sparks(10, 0.006, ['#4ade80', '#bbf7d0']);
      if (kind === 'poof') { sparks(30, 0.016, ['#e2e8f0', '#cbd5e1', '#fff', accent]); stars(4, '💥', 0.006, 70); }
      if (kind === 'coins') stars(8, '🪙', 0.014, 30);
      if (kind === 'confetti') add(70, () => ({ x: rnd(0.1, 0.9), y: -0.05, vx: rnd(-0.003, 0.003), vy: rnd(0.002, 0.008), shape: 'rect', color: CONFETTI[Math.floor(Math.random() * CONFETTI.length)], size: rnd(10, 16), spin: rnd(-0.25, 0.25), max: rnd(110, 170), gravity: 0.0002 }));
      if (!frame.current) frame.current = requestAnimationFrame(loop);
    },
  }));

  return <canvas ref={canvas} className="fx-layer" aria-hidden="true" />;
});

/** Confetti over its parent (which needs position: relative), fired once when shown. */
export function Celebrate({ big = true }: { big?: boolean }) {
  const fx = useRef<FxHandle>(null);
  useEffect(() => {
    sfx.fanfare();
    const t1 = setTimeout(() => fx.current?.burst('confetti', 0.5, 0), 150);
    const t2 = big ? setTimeout(() => fx.current?.burst('confetti', 0.5, 0), 900) : 0;
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return <FxLayer ref={fx} />;
}
