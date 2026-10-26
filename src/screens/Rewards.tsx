import { Avatar, TopBar } from '../components/TopBar';
import { COUNT_BADGES, playerLevel, SHOP, skillBadge, STREAK_BADGES, type ShopItem } from '../engine/rewards';
import { useStore } from '../engine/store';
import { go } from '../router';
import { ALL_SKILLS } from '../subjects';

export function Rewards() {
  const { profile, updateProfile } = useStore();
  if (!profile) return null;
  const lvl = playerLevel(profile.xp);
  const allBadges = [...COUNT_BADGES, ...STREAK_BADGES, ...ALL_SKILLS.map(skillBadge)];
  const bg = SHOP.find((i) => i.slot === 'background' && profile.equipped.includes(i.id));

  const buy = (item: ShopItem) => {
    if (profile.owned.includes(item.id) || profile.coins < item.cost) return;
    updateProfile((p) => ({ ...p, coins: p.coins - item.cost, owned: [...p.owned, item.id] }));
    equip(item);
  };

  const equip = (item: ShopItem) =>
    updateProfile((p) => {
      const sameSlot = SHOP.filter((i) => i.slot === item.slot).map((i) => i.id);
      const on = p.equipped.includes(item.id);
      return { ...p, equipped: on ? p.equipped.filter((id) => id !== item.id) : [...p.equipped.filter((id) => !sameSlot.includes(id)), item.id] };
    });

  return (
    <main className="page">
      <TopBar back={() => go('')} />
      <section className={`card buddy ${bg ? `bg-${bg.id}` : ''}`}>
        <Avatar avatar={profile.avatar} equipped={profile.equipped} size={120} />
        <div>
          <h1>{profile.name}</h1>
          <p className="muted">
            Level {lvl.level} · {profile.xp} XP · {lvl.need - lvl.into} XP to level {lvl.level + 1}
          </p>
          <p className="muted">{profile.totalCorrect} answers right so far</p>
        </div>
      </section>

      <h2>Shop</h2>
      <p className="muted">You have 🪙 {profile.coins}. Earn coins by answering questions.</p>
      <div className="shop-grid">
        {SHOP.map((item) => {
          const owned = profile.owned.includes(item.id);
          const on = profile.equipped.includes(item.id);
          return (
            <button
              key={item.id}
              className={`shop-item ${owned ? 'owned' : ''} ${on ? 'on' : ''}`}
              onClick={() => (owned ? equip(item) : buy(item))}
              disabled={!owned && profile.coins < item.cost}
            >
              <span className="shop-icon">{item.icon}</span>
              <span>{item.name}</span>
              <span className="muted">{owned ? (on ? 'Wearing' : 'Tap to use') : `🪙 ${item.cost}`}</span>
            </button>
          );
        })}
      </div>

      <h2>Badges</h2>
      <div className="badge-grid">
        {allBadges.map((b) => (
          <div key={b.id} className={`badge ${profile.badges[b.id] ? 'earned' : 'locked'}`} title={b.describe}>
            <span className="badge-icon">{b.icon}</span>
            <span>{b.name}</span>
            <span className="muted small">{b.describe}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
