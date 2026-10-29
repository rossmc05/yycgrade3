import { useEffect, useRef, useState } from 'react';
import { AvatarArt } from '../avatar/AvatarArt';
import { lookOf } from '../avatar/catalog';
import { dailySubject } from '../battle/zones';
import { useMusic } from '../battle/music';
import { sfx } from '../battle/sfx';
import { TopBar } from '../components/TopBar';
import { dayKey } from '../engine/adaptive';
import { useStore } from '../engine/store';
import { guideLine, isOpen, neighbour, placeOf, PLACES, quests, route, type Place, type PlaceId } from '../map/world';
import { ClassicMapArt, H, MapArt3D, MapClouds, W } from '../map/MapArt';
import { Icon, Sprite } from '../art/sprite';
import { go } from '../router';
import { palById } from '../collect/pals';
import { Cutscene } from '../story/Cutscene';
import { BOSSES, finalOpen, hasCrystal, markSeen, nextStep, STORY_ZONES, storyOf } from '../story/story';
import { findSubject } from '../subjects';

const SPEED = 0.55; // map units per millisecond

const VILLAGE_SPOTS = [
  { id: 'arcade', label: 'Arcade', icon: '🎪', x: 430, y: 285, to: () => go('arcade') },
  { id: 'avatar', label: 'Avatar Studio', icon: '🎨', x: 575, y: 280, to: () => go('avatar') },
  { id: 'rewards', label: 'Trophy Room', icon: '🏆', x: 420, y: 385, to: () => go('rewards') },
  { id: 'world', label: 'My World', icon: '🏡', x: 585, y: 385, to: () => go('world') },
  { id: 'book', label: 'Pal Book', icon: '📖', x: 655, y: 335, to: () => go('book') },
  { id: 'gear', label: 'Gear Shop', icon: '⚒️', x: 500, y: 430, to: () => go('gear') },
];

function loadAt(profileId: string): PlaceId {
  try {
    const v = localStorage.getItem(`g3-map-at-${profileId}`);
    if (v && placeOf(v)) return v as PlaceId;
  } catch {
    /* storage blocked */
  }
  return 'village';
}

function saveAt(profileId: string, at: PlaceId) {
  try {
    localStorage.setItem(`g3-map-at-${profileId}`, at);
  } catch {
    /* storage blocked */
  }
}

export function WorldMap() {
  const { profile, data, updateProfile } = useStore();
  const [at, setAt] = useState<PlaceId>(() => (profile ? loadAt(profile.id) : 'village'));
  const [pos, setPos] = useState(() => placeOf(at)!);
  const [dur, setDur] = useState(0);
  const [walking, setWalking] = useState(false);
  const [face, setFace] = useState(1);
  const [scene, setScene] = useState<string | null>(() => (profile && !storyOf(profile).seen.includes('intro') ? 'intro' : null));
  const [card, setCard] = useState<PlaceId | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useMusic('map');
  if (!profile) return null;

  const classic = !!data.settings.classicLook;
  const now = Date.now();
  const open = Object.fromEntries(PLACES.map((p) => [p.id, isOpen(p, profile)]));
  const today = dailySubject(now, data.settings.focus);
  const goal = data.settings.dailyGoal;
  const doneToday = profile.days[dayKey(now)]?.questions ?? 0;

  const walkTo = (to: PlaceId, then?: () => void) => {
    if (walking) return;
    sfx.unlock();
    const steps = route(at, to).slice(1);
    if (!steps.length) {
      then ? then() : setCard(to);
      return;
    }
    setCard(null);
    setWalking(true);
    let t = 0;
    let prev = placeOf(at)!;
    for (const id of steps) {
      const next = placeOf(id)!;
      const ms = Math.hypot(next.x - prev.x, next.y - prev.y) / SPEED;
      const dir = next.x < prev.x ? -1 : 1;
      timers.current.push(window.setTimeout(() => { setDur(ms); setPos(next); setFace(dir); }, t));
      t += ms;
      prev = next;
    }
    timers.current.push(window.setTimeout(() => {
      setWalking(false);
      setAt(to);
      saveAt(profile.id, to);
      sfx.coin();
      then ? then() : setCard(to);
    }, t + 60));
  };

  const enter = (id: PlaceId) => {
    if (!open[id]) return;
    if (id === 'village') return setCard('village');
    go(id === 'typing' ? 'subject' : 'zone', id === 'typing' ? 'typing' : id);
  };

  // Arrow keys walk to the next place in that direction; Enter goes in.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const dirs: Record<string, [number, number]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      if (dirs[e.key]) {
        e.preventDefault();
        const n = neighbour(at, ...dirs[e.key]);
        if (n) walkTo(n);
      } else if (e.key === 'Enter' && !walking) {
        enter(at);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  const cardPlace = card ? placeOf(card) : undefined;

  return (
    <main className={`page map-page ${classic ? '' : 'map-3d'}`}>
      <TopBar />
      <section className="map-head">
        <div>
          <strong>Hi {profile.name}!</strong>
          <div className="goal-bar small"><span style={{ width: `${Math.min(100, (doneToday / goal) * 100)}%` }} /></div>
          <small className="muted">{doneToday >= goal ? 'Daily goal done! 🎉' : `${doneToday} of ${goal} questions today`}</small>
        </div>
        <button className="btn primary" onClick={() => walkTo(today, () => go('play', 'all', 'mix'))}>
          <Icon e="⚔️" /> Today's quest: {placeOf(today)?.name}
        </button>
      </section>

      <StoryBar onStory={() => setScene('intro')} />
      {scene && (
        <Cutscene
          id={scene}
          onDone={() => {
            updateProfile((p) => markSeen(p, scene));
            setScene(null);
            if (scene === 'final-intro') go('play', 'all', 'final');
          }}
        />
      )}

      <div className="map-frame">
        {classic ? <ClassicMapArt open={open} today={today} /> : <MapArt3D open={open} today={today} />}
        {!classic && <MapClouds />}
        <button
          className={`map-place fortress-btn ${finalOpen(profile) ? '' : 'locked'}`}
          style={{ left: '52%', top: '25.5%' }}
          onClick={() => (finalOpen(profile) ? setScene('final-intro') : setScene(null))}
          title="Blizzard Fortress"
        >
          {finalOpen(profile) ? 'Blizzard Fortress' : '🔒 Blizzard Fortress'}
          {!finalOpen(profile) && <small>Win back all 4 crystals</small>}
        </button>
        {PLACES.map((p) => (
          <button
            key={p.id}
            className={`map-place ${open[p.id] ? '' : 'locked'} ${p.id === 'village' ? 'village' : ''} ${at === p.id && !walking ? 'here' : ''}`}
            style={{ left: `${(p.x / W) * 100}%`, top: `${((p.y + (p.id === 'village' ? -118 : 70)) / H) * 100}%` }}
            onClick={() => (at === p.id && !walking ? enter(p.id) : walkTo(p.id))}
          >
            {open[p.id] ? p.name : `🔒 ${p.name}`}
            {!open[p.id] && <small>{p.unlockAt - profile.totalCorrect} more right answers</small>}
          </button>
        ))}
        {VILLAGE_SPOTS.map((s) => (
          <button
            key={s.id}
            className="map-spot"
            style={{ left: `${(s.x / W) * 100}%`, top: `${(s.y / H) * 100}%` }}
            onClick={() => walkTo('village', s.to)}
            aria-label={s.label}
            title={s.label}
          >
            <span>{classic ? s.icon : <Sprite e={s.icon} size="100%" />}</span>
            <small>{s.label}</small>
          </button>
        ))}
        <div
          className={`map-hero ${walking ? 'walking' : ''}`}
          style={{ left: `${(pos.x / W) * 100}%`, top: `${(pos.y / H) * 100}%`, transitionDuration: `${dur}ms` }}
        >
          <div className="hero-flip" style={{ transform: `scaleX(${face})` }}>
            <AvatarArt look={lookOf(profile)} size={64} background={false} />
          </div>
          {!classic && palById(profile.buddy) && <span className="map-buddy"><Sprite e={palById(profile.buddy)!.e} size="100%" /></span>}
        </div>
        {cardPlace && <PlaceCard place={cardPlace} open={open[cardPlace.id]} onEnter={() => enter(cardPlace.id)} onClose={() => setCard(null)} />}
      </div>

      <p className="muted small center-text">Tap a place to walk there, then tap it again to go in. On a keyboard, use the arrow keys and Enter.</p>
      <div className="row"><button className="link" onClick={() => go("menu")}>Classic menu</button><button className="link" onClick={() => go("parent")}>Grown-ups</button></div>
    </main>
  );
}

function PlaceCard({ place, open, onEnter, onClose }: { place: Place; open: boolean; onEnter: () => void; onClose: () => void }) {
  const { profile } = useStore();
  if (!profile) return null;
  if (place.id === 'village') {
    return (
      <section className="card place-card" role="dialog" aria-label={place.name}>
        <strong>🏘️ Home Village</strong>
        <p>Visit the Arcade, the Avatar Studio, the Trophy Room, My World, the Pal Book or the Gear Shop. Tap a building!</p>
        <button className="btn ghost" onClick={onClose}>OK</button>
      </section>
    );
  }
  const subject = findSubject(place.id);
  const line = !open
    ? `This zone opens at ${place.unlockAt} right answers. You have ${profile.totalCorrect}. Keep battling!`
    : place.id === 'typing'
      ? 'Hoo! Climb the tower and train your fingers to type fast.'
      : guideLine(place, quests(subject?.skills ?? [], profile, Date.now()));
  return (
    <section className="card place-card" role="dialog" aria-label={place.name}>
      <div className="guide-row">
        <span className="guide-face">{place.guide && <Icon e={place.guide.icon} size="1em" />}</span>
        <div className="speech">
          <small>{place.guide?.name}</small>
          <p>{line}</p>
        </div>
      </div>
      <div className="row">
        <button className="btn ghost" onClick={onClose}>Not now</button>
        {open && <button className="btn primary" onClick={onEnter} autoFocus>Enter {place.name}</button>}
      </div>
    </section>
  );
}

/** The story so far: crystals won and what to do next. */
function StoryBar({ onStory }: { onStory: () => void }) {
  const { profile } = useStore();
  if (!profile) return null;
  const now = Date.now();
  const starsIn = (z: string) => quests(findSubject(z)?.skills ?? [], profile, now).reduce((n, q) => n + q.stars, 0);
  return (
    <section className="story-bar" aria-label="Story">
      <span className="crystals" aria-label={`${storyOf(profile).crystals.length} of 4 crystals`}>
        {STORY_ZONES.map((z) => (
          <span key={z} className={hasCrystal(profile, z) ? '' : 'off'} style={{ filter: hasCrystal(profile, z) ? BOSSES[z].crystal : undefined }} title={placeOf(z)?.name}>
            <Sprite e="💎" size={30} />
          </span>
        ))}
      </span>
      <p>{nextStep(profile, starsIn)}</p>
      <button className="btn ghost" onClick={onStory}><Icon e="📜" /> Story</button>
    </section>
  );
}
