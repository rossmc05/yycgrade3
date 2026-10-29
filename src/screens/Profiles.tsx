import { useState } from 'react';
import { AvatarArt } from '../avatar/AvatarArt';
import { DEFAULT_LOOK, PARTS, type Look, type Slot } from '../avatar/catalog';
import { Avatar } from '../components/TopBar';
import { newProfile } from '../engine/storage';
import { useStore } from '../engine/store';
import { go } from '../router';

export function Profiles() {
  const { data, setData } = useStore();
  const [adding, setAdding] = useState(data.profiles.length === 0);
  const [name, setName] = useState('');
  const [look, setLook] = useState<Look>(DEFAULT_LOOK);
  const freeParts = (slot: Slot) => PARTS.filter((x) => x.slot === slot && x.cost === 0);

  const choose = (id: string) => {
    setData((d) => ({ ...d, activeProfileId: id }));
    go('');
  };

  const create = () => {
    if (!name.trim()) return;
    const p = { ...newProfile(name.trim(), '🙂'), look };
    setData((d) => ({ ...d, profiles: [...d.profiles, p], activeProfileId: p.id }));
    go('');
  };

  return (
    <main className="page center">
      <h1 className="brand">⭐ Grade 3 Quest</h1>
      {!adding ? (
        <>
          <h2>Who's learning today?</h2>
          <div className="profile-grid">
            {data.profiles.map((p) => (
              <button key={p.id} className="profile-card" onClick={() => choose(p.id)}>
                <Avatar profile={p} size={96} />
                <span>{p.name}</span>
              </button>
            ))}
            <button className="profile-card add" onClick={() => setAdding(true)}>
              <span className="avatar" style={{ fontSize: 44, width: 72, height: 72 }}>＋</span>
              <span>New player</span>
            </button>
          </div>
        </>
      ) : (
        <div className="card narrow">
          <h2>Make your player</h2>
          <label className="field">
            <span>Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} autoFocus onKeyDown={(e) => e.key === 'Enter' && create()} />
          </label>
          <div className="maker">
            <AvatarArt look={look} size={150} />
            <div className="maker-options">
              {(['skin', 'hair', 'hairColor', 'eyes', 'topColor'] as Slot[]).map((slot) => (
                <div key={slot} className="maker-row">
                  {freeParts(slot).map((it) => (
                    <button
                      key={it.id}
                      className={`maker-pick ${look[slot as keyof Look] === it.id ? 'picked' : ''}`}
                      style={it.color ? { background: it.color } : undefined}
                      title={it.name}
                      aria-label={it.name}
                      onClick={() => setLook((l) => ({ ...l, [slot]: it.id }))}
                    >
                      {it.color ? '' : it.name}
                    </button>
                  ))}
                </div>
              ))}
              <p className="muted small">Earn coins to unlock hats, pets, outfits and more in the Avatar Studio.</p>
            </div>
          </div>
          <div className="row">
            {data.profiles.length > 0 && (
              <button className="btn ghost" onClick={() => setAdding(false)}>
                Cancel
              </button>
            )}
            <button className="btn primary" disabled={!name.trim()} onClick={create}>
              Let's go!
            </button>
          </div>
        </div>
      )}
      <button className="link" onClick={() => go('parent')}>
        Grown-ups
      </button>
    </main>
  );
}
