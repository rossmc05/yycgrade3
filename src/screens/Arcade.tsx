import { Icon } from '../art/sprite';
import { TopBar } from '../components/TopBar';
import { GAMES } from '../games/registry';
import { useStore } from '../engine/store';
import { go } from '../router';
import { SUBJECTS } from '../subjects';

export function Arcade({ subject }: { subject?: string }) {
  const { profile } = useStore();
  if (!profile) return null;
  const subjects = SUBJECTS.filter((s) => GAMES.some((g) => g.subject === s.id) && (!subject || s.id === subject));
  return (
    <main className="page">
      <TopBar back={() => go('')} />
      <section className="subject-head" style={{ ['--tile' as string]: '#9333ea' }}>
        <span className="tile-icon"><Icon e="🕹️" size="1em" /></span>
        <div>
          <h1>Game Arcade</h1>
          <p className="muted">Every game earns XP and coins. Try to beat your best!</p>
        </div>
      </section>
      {subjects.map((s) => (
        <section key={s.id}>
          <h2 className="strand"><Icon e={s.icon} /> {s.name}</h2>
          <div className="skill-grid">
            {GAMES.filter((g) => g.subject === s.id).map((g) => {
              const best = Math.max(0, ...g.scoreKeys.map((k) => profile.games?.[k]?.best ?? 0));
              const plays = g.scoreKeys.reduce((n, k) => n + (profile.games?.[k]?.plays ?? 0), 0);
              return (
                <button key={g.id} className="skill-card" onClick={() => go('game', g.id)}>
                  <span className="skill-icon"><Icon e={g.icon} size="1em" /></span>
                  <span className="skill-name">{g.name}</span>
                  <span className="skill-blurb">{g.blurb}</span>
                  <span className="chip">{plays ? `Best: ${best}` : 'New!'}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}

export function GameScreen({ id }: { id: string }) {
  const g = GAMES.find((x) => x.id === id);
  if (!g) return null;
  const C = g.component;
  return <C />;
}
