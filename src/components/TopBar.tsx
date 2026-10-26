import { liveStreak, playerLevel, SHOP } from '../engine/rewards';
import { useStore } from '../engine/store';
import { go } from '../router';

export function Avatar({ avatar, equipped, size = 48 }: { avatar: string; equipped: string[]; size?: number }) {
  const hat = SHOP.find((i) => i.slot === 'hat' && equipped.includes(i.id));
  const pet = SHOP.find((i) => i.slot === 'pet' && equipped.includes(i.id));
  return (
    <span className="avatar" style={{ fontSize: size * 0.7, width: size, height: size }}>
      {hat && <span className="avatar-hat">{hat.icon}</span>}
      {avatar}
      {pet && <span className="avatar-pet">{pet.icon}</span>}
    </span>
  );
}

export function TopBar({ back }: { back?: () => void }) {
  const { profile } = useStore();
  if (!profile) return null;
  const lvl = playerLevel(profile.xp);
  const streak = liveStreak(profile, Date.now());
  return (
    <header className="topbar">
      {back ? (
        <button className="icon-btn" onClick={back} aria-label="Back">
          ←
        </button>
      ) : (
        <button className="icon-btn" onClick={() => go('profiles')} aria-label="Switch player">
          <Avatar avatar={profile.avatar} equipped={profile.equipped} size={40} />
        </button>
      )}
      <button className="level-pill" onClick={() => go('rewards')} title="Rewards">
        <span className="level-num">Lv {lvl.level}</span>
        <span className="xp-bar">
          <span style={{ width: `${(lvl.into / lvl.need) * 100}%` }} />
        </span>
      </button>
      <span className="stat" title="Coins">🪙 {profile.coins}</span>
      <span className="stat" title="Day streak">🔥 {streak}</span>
    </header>
  );
}
