import { Icon } from '../art/sprite';
import { AvatarArt } from '../avatar/AvatarArt';
import { lookOf } from '../avatar/catalog';
import { liveStreak, playerLevel } from '../engine/rewards';
import type { Profile } from '../engine/types';
import { useStore } from '../engine/store';
import { go } from '../router';
import { FullScreenButton } from './FullScreen';

export function Avatar({ profile, size = 48, background = true }: { profile: Profile; size?: number; background?: boolean }) {
  return (
    <span className="avatar" style={{ width: size, height: (size * 220) / 200 }}>
      <AvatarArt look={lookOf(profile)} size={size} background={background} />
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
          <Avatar profile={profile} size={40} />
        </button>
      )}
      <button className="level-pill" onClick={() => go('rewards')} title="Rewards">
        <span className="level-num">Lv {lvl.level}</span>
        <span className="xp-bar">
          <span style={{ width: `${(lvl.into / lvl.need) * 100}%` }} />
        </span>
      </button>
      <span className="stat" title="Coins"><Icon e="🪙" /> {profile.coins}</span>
      <span className="stat" title="Day streak"><Icon e="🔥" /> {streak}</span>
      <FullScreenButton />
    </header>
  );
}
