import { useState } from 'react';
import { Avatar } from '../components/TopBar';
import { AVATARS } from '../engine/rewards';
import { newProfile } from '../engine/storage';
import { useStore } from '../engine/store';
import { go } from '../router';

export function Profiles() {
  const { data, setData } = useStore();
  const [adding, setAdding] = useState(data.profiles.length === 0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  const choose = (id: string) => {
    setData((d) => ({ ...d, activeProfileId: id }));
    go('');
  };

  const create = () => {
    if (!name.trim()) return;
    const p = newProfile(name.trim(), avatar);
    setData((d) => ({ ...d, profiles: [...d.profiles, p], activeProfileId: p.id }));
    go('');
  };

  return (
    <main className="page center">
      <h1 className="brand">⭐ Grade 3 Studio</h1>
      {!adding ? (
        <>
          <h2>Who's learning today?</h2>
          <div className="profile-grid">
            {data.profiles.map((p) => (
              <button key={p.id} className="profile-card" onClick={() => choose(p.id)}>
                <Avatar avatar={p.avatar} equipped={p.equipped} size={72} />
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
          <p className="muted">Pick a buddy</p>
          <div className="avatar-picker">
            {AVATARS.map((a) => (
              <button key={a} className={a === avatar ? 'picked' : ''} onClick={() => setAvatar(a)} aria-label={a}>
                {a}
              </button>
            ))}
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
