import { Icon } from '../art/sprite';
import { Avatar, TopBar } from '../components/TopBar';
import { COUNT_BADGES, playerLevel, skillBadge, STREAK_BADGES } from '../engine/rewards';
import { useStore } from '../engine/store';
import { go } from '../router';
import { ALL_SKILLS } from '../subjects';

export function Rewards() {
  const { profile } = useStore();
  if (!profile) return null;
  const lvl = playerLevel(profile.xp);
  const allBadges = [...COUNT_BADGES, ...STREAK_BADGES, ...ALL_SKILLS.map(skillBadge)];

  return (
    <main className="page">
      <TopBar back={() => go('')} />
      <section className="card buddy">
        <Avatar profile={profile} size={150} />
        <div>
          <h1>{profile.name}</h1>
          <p className="muted">
            Level {lvl.level} · {profile.xp} XP · {lvl.need - lvl.into} XP to level {lvl.level + 1}
          </p>
          <p className="muted"><Icon e="🪙" /> {profile.coins} coins · {profile.totalCorrect} answers right so far</p>
          <div className="row" style={{ justifyContent: 'flex-start' }}>
            <button className="btn primary" onClick={() => go('avatar')}><Icon e="🎨" /> Avatar studio</button>
            <button className="btn ghost" onClick={() => go('world')}><Icon e="🏡" /> My world</button>
          </div>
        </div>
      </section>

      <h2>Badges</h2>
      <div className="badge-grid">
        {allBadges.map((b) => (
          <div key={b.id} className={`badge ${profile.badges[b.id] ? 'earned' : 'locked'}`} title={b.describe}>
            <span className="badge-icon"><Icon e={b.icon} size="1em" /></span>
            <span>{b.name}</span>
            <span className="muted small">{b.describe}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
