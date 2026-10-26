import { TopBar } from '../components/TopBar';
import { dayKey, isReviewDue, status } from '../engine/adaptive';
import { useStore } from '../engine/store';
import { go } from '../router';
import { SUBJECTS } from '../subjects';
import { LESSONS } from '../subjects/typing/lessons';

export function Home() {
  const { profile, data } = useStore();
  if (!profile) return null;
  const now = Date.now();
  const today = profile.days[dayKey(now)];
  const goal = data.settings.dailyGoal;
  const done = today?.questions ?? 0;
  const pct = Math.min(100, (done / goal) * 100);
  const due = SUBJECTS.flatMap((s) => s.skills).filter((s) => isReviewDue(profile.skills[s.id], now)).length;

  return (
    <main className="page">
      <TopBar />
      <section className="hero card">
        <div>
          <h1>Hi {profile.name}!</h1>
          <p className="muted">
            {done >= goal ? 'Daily goal done. Amazing work! 🎉' : `Today's goal: ${goal} questions. You've done ${done}.`}
          </p>
          <div className="goal-bar">
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button className="btn primary big" onClick={() => go('play', 'all', 'mix')}>
          ▶ Daily warm-up{due ? ` (${due} to review)` : ''}
        </button>
      </section>

      <div className="subject-grid">
        {SUBJECTS.map((s) => {
          const mastered = s.skills.filter((k) => status(profile.skills[k.id]) === 'mastered').length;
          return (
            <button
              key={s.id}
              className={`subject-tile ${s.ready ? '' : 'soon'}`}
              style={{ ['--tile' as string]: s.color }}
              onClick={() => s.ready && go('subject', s.id)}
              disabled={!s.ready}
            >
              <span className="tile-icon">{s.icon}</span>
              <span className="tile-name">{s.name}</span>
              <span className="tile-tag">{s.tagline}</span>
              <span className="tile-meta">{!s.ready ? 'Coming soon' : s.id === 'typing' ? `${Object.values(profile.typing ?? {}).reduce((n, r) => n + r.stars, 0)} of ${LESSONS.length * 3} stars` : `${mastered} of ${s.skills.length} skills mastered`}</span>
            </button>
          );
        })}
        <button className="subject-tile" style={{ ['--tile' as string]: '#9333ea' }} onClick={() => go('arcade')}>
          <span className="tile-icon">🕹️</span>
          <span className="tile-name">Game Arcade</span>
          <span className="tile-tag">Fact races, boss battles, spelling bee and more</span>
          <span className="tile-meta">10 games</span>
        </button>
        <button className="subject-tile" style={{ ['--tile' as string]: '#0f766e' }} onClick={() => go('avatar')}>
          <span className="tile-icon">🎨</span>
          <span className="tile-name">Avatar Studio</span>
          <span className="tile-tag">Spend coins on hats, outfits and pets</span>
          <span className="tile-meta">🪙 {profile.coins} to spend</span>
        </button>
        <button className="subject-tile" style={{ ['--tile' as string]: '#65a30d' }} onClick={() => go('world')}>
          <span className="tile-icon">🏡</span>
          <span className="tile-name">My World</span>
          <span className="tile-tag">It grows every time you master a skill</span>
          <span className="tile-meta">See what you've built</span>
        </button>
        <button className="subject-tile" style={{ ['--tile' as string]: '#ca8a04' }} onClick={() => go('rewards')}>
          <span className="tile-icon">🏆</span>
          <span className="tile-name">Trophy Room</span>
          <span className="tile-tag">Badges, shop and your buddy</span>
          <span className="tile-meta">{Object.keys(profile.badges).length} badges</span>
        </button>
      </div>
    </main>
  );
}
