// Unicorn Meadow: the Kindergarten app. Same players, save and parent dashboard as
// Grade 3 Quest and Big League Brains; its own points, unicorns and outfits.

import { useEffect, useState } from 'react';
import { Sprite } from '../art/sprite';
import { sfx } from '../battle/sfx';
import { canFullScreen, toggleFullScreen } from '../components/FullScreen';
import { useStore } from '../engine/store';
import { newProfile } from '../engine/storage';
import { go, useRoute } from '../router';
import { Barn } from './ui/Barn';
import { Meadow } from './ui/Meadow';
import { Ride } from './ui/Ride';
import { Shop } from './ui/Shop';
import { Stable } from './ui/Stable';
import { UnicornArt } from './ui/UnicornArt';
import { UNICORNS } from './unicorns';
import { say } from './voice';

const SEEN = 'k-meadow-started';

export function UnicornApp() {
  const { profile } = useStore();
  const [page, a] = useRoute();
  const [started, setStarted] = useState(() => {
    try { return sessionStorage.getItem(SEEN) === '1'; } catch { return false; }
  });

  useEffect(() => { document.body.classList.add('meadow-body'); }, []);

  if (!started) return <Title onStart={() => { try { sessionStorage.setItem(SEEN, '1'); } catch { /* blocked */ } setStarted(true); }} />;
  if (!profile || page === 'riders') return <PickRider />;
  if (page === 'ride') return <Ride key={a ?? 'ride'} />;
  if (page === 'stars') return <Ride key={a ?? 'stars'} mode="stars" />;
  if (page === 'stable') return <Stable />;
  if (page === 'shop') return <Shop />;
  if (page === 'barn') return <Barn key={a} start={a} />;
  return <Meadow />;
}

function Title({ onStart }: { onStart: () => void }) {
  const start = (full: boolean) => {
    sfx.unlock();
    sfx.coin();
    if (full) toggleFullScreen();
    void say('Welcome to Unicorn Meadow!');
    onStart();
  };
  return (
    <main className="title">
      <div className="sky" aria-hidden="true">
        <span className="cloud c1" /><span className="cloud c2" /><span className="cloud c3" />
        <div className="big-rainbow" />
        <div className="hill h1" /><div className="hill h2" />
      </div>
      <h1 className="logo"><span>Unicorn</span> Meadow</h1>
      <div className="title-unicorn bob"><UnicornArt unicorn={UNICORNS[0]} outfit={{ crown: 'crown-daisy' }} size={260} /></div>
      <div className="title-actions">
        <button className="big-btn pulse" onClick={() => start(false)} autoFocus>▶ Play</button>
        {canFullScreen() && <button className="big-btn ghost small" onClick={() => start(true)}>⛶ Full screen</button>}
      </div>
    </main>
  );
}

/** Who's riding? Players are shared with Grade 3 Quest, and a grown-up can add one here. */
function PickRider() {
  const { data, setData } = useStore();
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(data.profiles.length === 0);
  useEffect(() => { void say('Who is riding today?'); }, []);
  const pickId = (id: string) => { sfx.coin(); setData((d) => ({ ...d, activeProfileId: id })); go(''); };
  const add = () => {
    const n = name.trim();
    if (!n) return;
    const p = newProfile(n, '🦄');
    setData((d) => ({ ...d, profiles: [...d.profiles, p], activeProfileId: p.id }));
    go('');
  };
  return (
    <main className="riders">
      <h1>Who’s riding?</h1>
      <div className="rider-grid">
        {data.profiles.map((p) => (
          <button key={p.id} className="rider-card" onClick={() => pickId(p.id)}>
            <Sprite e={p.meadow ? '🦄' : p.avatar || '🙂'} size={80} />
            <span>{p.name}</span>
          </button>
        ))}
        {!adding && (
          <button className="rider-card add" onClick={() => setAdding(true)} aria-label="Add a rider">
            <span className="plus">＋</span>
            <span>New rider</span>
          </button>
        )}
      </div>
      {adding && (
        <form className="add-rider" onSubmit={(e) => { e.preventDefault(); add(); }}>
          <label htmlFor="rider-name">Grown-ups: type her name</label>
          <input id="rider-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} autoComplete="off" placeholder="Name" />
          <button className="big-btn" type="submit" disabled={!name.trim()}>🦄 Start</button>
        </form>
      )}
      <a className="grownups" href="./">Grade 3 Quest</a>
    </main>
  );
}
