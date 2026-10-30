import { Icon } from '../../art/sprite';
import { FullScreenButton } from '../../components/FullScreen';
import { Avatar } from '../../components/TopBar';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import { ballOf, rankOf, RANKS } from '../data';

/** The ballpark's top bar: back, rank and XP, ballpark coins. */
export function BallBar({ back }: { back?: () => void }) {
  const { profile } = useStore();
  if (!profile) return null;
  const b = ballOf(profile);
  const r = rankOf(b.xp);
  return (
    <header className="topbar">
      {back ? (
        <button className="icon-btn" onClick={back} aria-label="Back">←</button>
      ) : (
        <button className="icon-btn" onClick={() => go('players')} aria-label="Switch player"><Avatar profile={profile} size={40} /></button>
      )}
      <span className="level-pill" title={`${b.xp} XP`}>
        <span className="level-num"><Icon e={RANKS[r.index].e} /> {RANKS[r.index].name}</span>
        <span className="xp-bar"><span style={{ width: `${r.need ? (r.into / r.need) * 100 : 100}%` }} /></span>
      </span>
      <span className="stat" title="Ballpark coins"><Icon e="🪙" /> {b.coins}</span>
      <FullScreenButton />
    </header>
  );
}
