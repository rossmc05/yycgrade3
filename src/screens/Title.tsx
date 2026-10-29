import { useEffect, useState } from 'react';
import have from '../art/have.json';
import { preload, Sprite } from '../art/sprite';
import { sfx } from '../battle/sfx';
import { canFullScreen, toggleFullScreen } from '../components/FullScreen';

/** The title screen: loads the art (with a progress bar), then waits for Play. */
export function Title({ onStart }: { onStart: () => void }) {
  const [done, setDone] = useState(0);
  const [ready, setReady] = useState(false);
  const total = have.length;

  useEffect(() => {
    let live = true;
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const min = new Promise((r) => setTimeout(r, 700));
    Promise.all([preload(have.map((c) => `./art/${c}.webp`), (n) => live && setDone(n)), fonts, min]).then(() => live && setReady(true));
    return () => { live = false; };
  }, []);

  const start = (full: boolean) => {
    sfx.unlock();
    sfx.coin();
    if (full) toggleFullScreen();
    onStart();
  };

  useEffect(() => {
    if (!ready) return;
    const on = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(false); } };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  return (
    <main className="title-screen">
      <div className="title-sky" aria-hidden="true">
        {[0, 1, 2].map((i) => <Sprite key={i} e="☁️" size={140 - i * 25} className={`drift d${i}`} />)}
      </div>
      <div className="title-scene" aria-hidden="true">
        <Sprite e="🏔️" size="min(30vw, 260px)" className="t-mtn" />
        <Sprite e="🏰" size="min(22vw, 190px)" className="t-castle" />
        <Sprite e="🌋" size="min(18vw, 150px)" className="t-volcano" />
        <Sprite e="🐉" size="min(20vw, 170px)" className="t-dragon" />
        <Sprite e="🌲" size="min(10vw, 90px)" className="t-tree1" />
        <Sprite e="🌳" size="min(11vw, 100px)" className="t-tree2" />
      </div>
      <div className="title-logo">
        <h1><span>Grade 3</span> Quest</h1>
        <p>A Calgary learning adventure</p>
      </div>
      <div className="title-actions">
        {ready ? (
          <>
            <button className="btn primary big pulse" onClick={() => start(false)} autoFocus>
              ▶ Play
            </button>
            {canFullScreen() && (
              <button className="btn ghost" onClick={() => start(true)}>
                ⛶ Play full screen
              </button>
            )}
          </>
        ) : (
          <div className="loader" role="progressbar" aria-label="Loading" aria-valuenow={Math.round((done / total) * 100)} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${(done / total) * 100}%` }} />
            <small>Loading the adventure…</small>
          </div>
        )}
      </div>
    </main>
  );
}
