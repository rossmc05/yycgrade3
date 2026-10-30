// Big League Brains: the baseball app. Same players, questions and learning records as Grade 3 Quest.

import { useEffect, useState } from 'react';
import { Sprite } from '../art/sprite';
import { sfx } from '../battle/sfx';
import { canFullScreen, toggleFullScreen } from '../components/FullScreen';
import { Avatar } from '../components/TopBar';
import { useStore } from '../engine/store';
import { go, useRoute } from '../router';
import { Binder } from './ui/Binder';
import { Clubhouse } from './ui/Clubhouse';
import { Derby } from './ui/Derby';
import { PlayBall } from './ui/PlayBall';
import { ProShop } from './ui/ProShop';

const SEEN = 'g3-ballpark-started';

export function BallApp() {
  const { profile } = useStore();
  const [page] = useRoute();
  const [started, setStarted] = useState(() => {
    try { return sessionStorage.getItem(SEEN) === '1'; } catch { return false; }
  });

  useEffect(() => {
    document.body.classList.add('game', 'ballpark-body');
  }, []);

  if (!started) return <BallTitle onStart={() => { try { sessionStorage.setItem(SEEN, '1'); } catch { /* blocked */ } setStarted(true); }} />;
  if (!profile || page === 'players') return <PickPlayer />;
  if (page === 'game') return <PlayBall />;
  if (page === 'derby') return <Derby />;
  if (page === 'binder') return <Binder />;
  if (page === 'shop') return <ProShop />;
  return <Clubhouse />;
}

function BallTitle({ onStart }: { onStart: () => void }) {
  const start = (full: boolean) => {
    sfx.unlock();
    sfx.coin();
    if (full) toggleFullScreen();
    onStart();
  };
  useEffect(() => {
    const on = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(false); } };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });
  return (
    <main className="title-screen ball-title">
      <div className="ball-lights" aria-hidden="true">{[0, 1, 2, 3].map((i) => <span key={i} />)}</div>
      <div className="title-scene" aria-hidden="true">
        <Sprite e="🏟️" size="min(46vw, 380px)" className="t-stadium" />
        <Sprite e="⚾" size="min(14vw, 110px)" className="t-ball" />
      </div>
      <div className="title-logo">
        <h1><span>Big League</span> Brains</h1>
        <p>Answer right, hit it out of the park!</p>
      </div>
      <div className="title-actions">
        <button className="btn primary big pulse" onClick={() => start(false)} autoFocus>⚾ Play ball</button>
        {canFullScreen() && <button className="btn ghost" onClick={() => start(true)}>⛶ Play full screen</button>}
        <a className="link" href="./">← Grade 3 Quest</a>
      </div>
    </main>
  );
}

/** Pick who is playing. New players are made in Grade 3 Quest, so both apps share them. */
function PickPlayer() {
  const { data, setData } = useStore();
  return (
    <main className="page center ballpark">
      <h1>Who's up to bat?</h1>
      <div className="profile-grid">
        {data.profiles.map((p) => (
          <button key={p.id} className="profile-card" onClick={() => { setData((d) => ({ ...d, activeProfileId: p.id })); go(''); }}>
            <Avatar profile={p} size={90} />
            <span>{p.name}</span>
          </button>
        ))}
      </div>
      {!data.profiles.length && <p className="muted">Make a player in Grade 3 Quest first. Your player, progress and questions are shared.</p>}
      <a className="btn ghost" href="./">← Grade 3 Quest</a>
    </main>
  );
}
