import { useEffect, useState } from 'react';
import { Sprite } from '../art/sprite';
import { sfx } from '../battle/sfx';
import { speak, stopSpeaking } from '../engine/speech';
import { useStore } from '../engine/store';
import { SCENES } from './story';

/** A story scene: one speaker at a time, with Next and Skip. */
export function Cutscene({ id, onDone }: { id: string; onDone: () => void }) {
  const { data } = useStore();
  const panels = SCENES[id] ?? [];
  const [i, setI] = useState(0);
  const p = panels[i];

  useEffect(() => {
    if (p && data.settings.readAloud) speak(p.text);
  }, [i]);
  useEffect(() => () => stopSpeaking(), []);

  const next = () => {
    sfx.unlock();
    sfx.whoosh();
    if (i + 1 >= panels.length) onDone();
    else setI(i + 1);
  };

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'Escape') onDone();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  if (!p) return null;
  const villain = p.name === 'Baron Blizzard';
  return (
    <div className={`cutscene ${villain ? 'villain' : ''}`} role="dialog" aria-label="Story">
      <div className="cut-stage" key={i}>
        <div className="cut-speaker"><Sprite e={p.who} size="100%" /></div>
        {p.with && (
          <div className="cut-props">
            {p.with.map((e, k) => <span key={k} style={{ animationDelay: `${0.2 + k * 0.12}s` }}><Sprite e={e} size="100%" /></span>)}
          </div>
        )}
      </div>
      <div className="cut-box">
        <strong>{p.name}</strong>
        <p key={i}>{p.text}</p>
        <div className="cut-actions">
          <button className="link" onClick={onDone}>Skip</button>
          <span className="cut-dots">{panels.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}</span>
          <button className="btn primary" onClick={next} autoFocus>{i + 1 >= panels.length ? "Let's go!" : 'Next ▶'}</button>
        </div>
      </div>
    </div>
  );
}
