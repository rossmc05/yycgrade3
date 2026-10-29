import { Icon, Sprite } from '../art/sprite';
import { TopBar } from '../components/TopBar';
import { GAMES, MEDAL_ICON, medalFor } from '../games/registry';
import { useStore } from '../engine/store';
import { go } from '../router';
import { SUBJECTS } from '../subjects';

export function Arcade({ subject }: { subject?: string }) {
  const { profile, data } = useStore();
  if (!profile) return null;
  const classic = !!data.settings.classicLook;
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
          <div className={classic ? 'skill-grid' : 'cabinets'}>
            {GAMES.filter((g) => g.subject === s.id).map((g) => {
              const best = Math.max(0, ...g.scoreKeys.map((k) => profile.games?.[k]?.best ?? 0));
              const plays = g.scoreKeys.reduce((n, k) => n + (profile.games?.[k]?.plays ?? 0), 0);
              const medal = medalFor(best, g.medals);
              if (!classic) return (
                <button key={g.id} className="cabinet" style={{ ['--cab' as string]: g.color }} onClick={() => go('game', g.id)}>
                  <span className="cab-screen"><Sprite e={g.icon} size={84} /></span>
                  <span className="cab-name">{g.name}</span>
                  <span className="cab-blurb">{g.blurb}</span>
                  <span className="cab-foot">
                    {plays ? <>Best {best}</> : <span className="cab-new">New!</span>}
                    <span className="cab-medals">{(['bronze', 'silver', 'gold'] as const).map((m, i) => <Sprite key={m} e={MEDAL_ICON[m]} size={26} className={medal && i <= ['bronze', 'silver', 'gold'].indexOf(medal) ? '' : 'dim'} />)}</span>
                  </span>
                </button>
              );
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
