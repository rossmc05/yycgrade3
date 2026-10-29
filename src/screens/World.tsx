import { Icon } from '../art/sprite';
import { AvatarArt } from '../avatar/AvatarArt';
import { useMusic } from '../battle/music';
import { palById, PALS } from '../collect/pals';
import { MapClouds, SvgSprite } from '../map/MapArt';
import { lookOf } from '../avatar/catalog';
import { TopBar } from '../components/TopBar';
import { status } from '../engine/adaptive';
import { liveStreak, playerLevel } from '../engine/rewards';
import { useStore } from '../engine/store';
import type { Profile, SubjectId } from '../engine/types';
import { go } from '../router';
import { SUBJECTS } from '../subjects';

interface Progress {
  started: Record<SubjectId, number>;
  mastered: Record<SubjectId, number>;
  typingStars: number;
  level: number;
  streak: number;
  correct: number;
  badges: number;
}

function progressOf(p: Profile): Progress {
  const started = {} as Record<SubjectId, number>;
  const mastered = {} as Record<SubjectId, number>;
  for (const s of SUBJECTS) {
    started[s.id] = s.skills.filter((k) => status(p.skills[k.id]) !== 'new').length;
    mastered[s.id] = s.skills.filter((k) => status(p.skills[k.id]) === 'mastered').length;
  }
  return {
    started,
    mastered,
    typingStars: Object.values(p.typing ?? {}).reduce((n, r) => n + r.stars, 0),
    level: playerLevel(p.xp).level,
    streak: liveStreak(p, Date.now()),
    correct: p.totalCorrect,
    badges: Object.keys(p.badges).length,
  };
}

/** Each thing in the world, how far it has grown, and how to grow it. */
export interface Feature {
  id: string;
  name: string;
  icon: string;
  stage: number;
  maxStage: number;
  next: string;
}

export function featuresOf(g: Progress): Feature[] {
  const steps = (value: number, thresholds: number[]) => thresholds.filter((t) => value >= t).length;
  const nextOf = (value: number, thresholds: number[], unit: (n: number) => string, done: string) => {
    const t = thresholds.find((x) => value < x);
    return t === undefined ? done : unit(t - value);
  };
  const plural = (n: number, w: string) => `${n} more ${w}${n === 1 ? '' : 's'}`;
  const subj = (id: SubjectId, name: string, icon: string, app: string): Feature => {
    const stage = g.started[id] > 0 ? 1 + Math.min(g.mastered[id], 5) : 0;
    return {
      id, name, icon, stage, maxStage: 6,
      next: stage === 0 ? `Practise any ${app} skill to start building` : stage < 6 ? `Master 1 more ${app} skill to add a floor` : 'Fully built!',
    };
  };
  const typingT = [1, 9, 21, 33, 45];
  const treesT = [2, 3, 4, 6, 8, 10];
  const flowersT = [25, 75, 150, 300, 500];
  return [
    subj('math', 'Math Tower', '🏰', 'Math Quest'),
    subj('spelling', 'Word Library', '📚', 'Spell Builder'),
    subj('grammar', 'Grammar Garage', '🛠️', 'Grammar Garage'),
    subj('science', 'Science Dome', '🔬', 'Science Lab'),
    { id: 'rocket', name: 'Rocket Pad', icon: '🚀', stage: steps(g.typingStars, typingT), maxStage: typingT.length, next: nextOf(g.typingStars, typingT, (n) => `Earn ${plural(n, 'typing star')}`, 'Ready for launch!') },
    { id: 'trees', name: 'Forest', icon: '🌲', stage: steps(g.level, treesT), maxStage: treesT.length, next: nextOf(g.level, treesT, () => `Reach level ${treesT.find((x) => g.level < x)} for another tree`, 'A whole forest!') },
    { id: 'flowers', name: 'Flower Garden', icon: '🌷', stage: steps(g.correct, flowersT), maxStage: flowersT.length, next: nextOf(g.correct, flowersT, (n) => `Get ${plural(n, 'answer')} right`, 'In full bloom!') },
    { id: 'pond', name: 'Duck Pond', icon: '🦆', stage: steps(g.streak, [3, 7]), maxStage: 2, next: nextOf(g.streak, [3, 7], () => `Practise ${g.streak < 3 ? 3 : 7} days in a row`, 'Ducks are home!') },
    { id: 'rink', name: 'Hockey Rink', icon: '🏒', stage: steps(g.level, [5]), maxStage: 1, next: g.level >= 5 ? 'Game on!' : 'Reach level 5' },
    { id: 'rainbow', name: 'Rainbow', icon: '🌈', stage: steps(g.badges, [5]), maxStage: 1, next: g.badges >= 5 ? 'So bright!' : plural(5 - g.badges, 'badge') },
    { id: 'dino', name: 'Dinosaur Dig', icon: '🦕', stage: g.mastered.science >= 1 ? 1 : 0, maxStage: 1, next: g.mastered.science >= 1 ? 'You found a fossil!' : 'Master a Science Lab skill' },
  ];
}

function ClassicScene({ f, profile }: { f: Record<string, Feature>; profile: Profile }) {
  const st = (id: string) => f[id]?.stage ?? 0;
  const tower = (x: number, stage: number, color: string, roof: string, label: string) => {
    if (!stage) return <g key={label}><rect x={x} y={318} width="70" height="12" rx="3" fill="#a3a3a3" opacity="0.6" /><text x={x + 35} y={312} textAnchor="middle" fontSize="11" fill="#475569">{label}</text></g>;
    const floors = stage;
    const h = 26;
    const top = 330 - floors * h;
    return (
      <g key={label}>
        {Array.from({ length: floors }, (_, i) => (
          <g key={i}>
            <rect x={x} y={330 - (i + 1) * h} width="70" height={h} fill={color} stroke="#1e293b" strokeWidth="1.5" />
            <rect x={x + 10} y={330 - (i + 1) * h + 7} width="14" height="12" fill="#fef9c3" />
            <rect x={x + 46} y={330 - (i + 1) * h + 7} width="14" height="12" fill="#fef9c3" />
          </g>
        ))}
        <polygon points={`${x - 6},${top} ${x + 76},${top} ${x + 35},${top - 30}`} fill={roof} stroke="#1e293b" strokeWidth="1.5" />
        {stage >= 6 && <><line x1={x + 35} y1={top - 30} x2={x + 35} y2={top - 56} stroke="#1e293b" strokeWidth="2" /><polygon points={`${x + 35},${top - 56} ${x + 55},${top - 49} ${x + 35},${top - 42}`} fill="#facc15" /></>}
        <rect x={x + 27} y={312} width="16" height="18" fill="#7c2d12" />
        <text x={x + 35} y={346} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b">{label}</text>
      </g>
    );
  };
  const trees = [[40, 300], [690, 296], [740, 310], [20, 330], [760, 350], [660, 340]].slice(0, st('trees'));
  const flowers = Array.from({ length: st('flowers') * 4 }, (_, i) => [455 + (i % 7) * 20 + (i % 2) * 6, 392 + Math.floor(i / 7) * 14]);
  const rocket = st('rocket');
  return (
    <svg viewBox="0 0 800 450" className="world-scene" role="img" aria-label="Your world">
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7dd3fc" /><stop offset="1" stopColor="#e0f2fe" /></linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#sky)" />
      <circle cx="720" cy="60" r="30" fill="#fde047" />
      {st('rainbow') > 0 && (
        <g fill="none" strokeWidth="10" opacity="0.8">
          {['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6'].map((c, i) => <path key={c} d={`M${120 + i * 10} 300 A ${280 - i * 10} ${200 - i * 10} 0 0 1 ${680 - i * 10} 300`} stroke={c} />)}
        </g>
      )}
      <polygon points="0,250 110,120 200,230 300,110 420,240 520,140 640,250 740,150 800,220 800,340 0,340" fill="#94a3b8" />
      <polygon points="110,120 130,150 90,148" fill="#fff" /><polygon points="300,110 322,142 280,140" fill="#fff" /><polygon points="520,140 538,166 502,164" fill="#fff" /><polygon points="740,150 756,174 724,172" fill="#fff" />
      <rect y="330" width="800" height="120" fill="#86efac" />
      <path d="M380 450 Q400 400 400 340" stroke="#d6b98c" strokeWidth="28" fill="none" />
      {trees.map(([x, y], i) => (
        <g key={i}><rect x={x - 4} y={y + 30} width="8" height="16" fill="#78350f" /><polygon points={`${x - 22},${y + 32} ${x + 22},${y + 32} ${x},${y - 14}`} fill="#15803d" /><polygon points={`${x - 16},${y + 12} ${x + 16},${y + 12} ${x},${y - 26}`} fill="#16a34a" /></g>
      ))}
      {tower(80, st('math'), '#a5b4fc', '#4f46e5', 'Math Tower')}
      {tower(180, st('spelling'), '#fbcfe8', '#db2777', 'Word Library')}
      {tower(450, st('grammar'), '#fed7aa', '#ea580c', 'Grammar Garage')}
      {st('science') > 0 ? (
        <g>
          <rect x="560" y={330 - st('science') * 12} width="90" height={st('science') * 12} fill="#bbf7d0" stroke="#1e293b" strokeWidth="1.5" />
          <path d={`M560 ${330 - st('science') * 12} A 45 40 0 0 1 650 ${330 - st('science') * 12}`} fill="#a7f3d0" stroke="#1e293b" strokeWidth="1.5" opacity="0.9" />
          <text x="605" y={322 - st('science') * 12} textAnchor="middle" fontSize="22">🔬</text>
          <text x="605" y="346" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b">Science Dome</text>
        </g>
      ) : (
        <g><rect x="570" y="318" width="70" height="12" rx="3" fill="#a3a3a3" opacity="0.6" /><text x="605" y="312" textAnchor="middle" fontSize="11" fill="#475569">Science Dome</text></g>
      )}
      <g>
        <rect x="290" y="318" width="60" height="12" fill="#64748b" />
        {rocket > 0 && (
          <g transform={`translate(320 ${318 - rocket * 4})`}>
            {rocket >= 5 && <polygon points="-10,0 10,0 0,40" fill="#f97316" transform="translate(0 0)" />}
            <path d="M-12 0 L-12 -60 Q0 -90 12 -60 L12 0Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5" />
            <circle cx="0" cy="-50" r="6" fill="#38bdf8" stroke="#1e293b" />
            <polygon points="-12,0 -22,8 -12,-18" fill="#dc2626" /><polygon points="12,0 22,8 12,-18" fill="#dc2626" />
          </g>
        )}
        <text x="320" y="346" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b">Rocket Pad</text>
      </g>
      {st('pond') > 0 && (
        <g>
          <ellipse cx="140" cy="400" rx="80" ry="26" fill="#38bdf8" />
          {st('pond') >= 2 && <><text x="110" y="404" fontSize="20">🦆</text><text x="150" y="396" fontSize="16">🦆</text></>}
        </g>
      )}
      {st('rink') > 0 && (
        <g>
          <rect x="600" y="370" width="150" height="62" rx="28" fill="#f8fafc" stroke="#dc2626" strokeWidth="3" />
          <line x1="675" y1="370" x2="675" y2="432" stroke="#dc2626" strokeWidth="3" />
          <circle cx="675" cy="401" r="12" fill="none" stroke="#2563eb" strokeWidth="2" />
          <text x="700" y="410" fontSize="18">🏒</text>
        </g>
      )}
      {st('dino') > 0 && <text x="235" y="440" fontSize="30">🦕</text>}
      {flowers.map(([x, y], i) => <text key={i} x={x} y={y} fontSize="13">{['🌷', '🌼', '🌸', '🌻'][i % 4]}</text>)}
      <g transform="translate(352 318)">
        <AvatarArt look={lookOf(profile)} size={96} background={false} />
      </g>
    </svg>
  );
}

/** What each building looks like at each stage (1 to 6). */
const BUILDS: Record<string, string[]> = {
  math: ['🏗️', '🛖', '🏠', '🏫', '🏯', '🏰'],
  spelling: ['🏗️', '⛺', '🛖', '🏠', '🏡', '🏛️'],
  grammar: ['🏗️', '🛖', '🏠', '🏪', '🏬', '🏭'],
  science: ['🏗️', '⛺', '🛖', '🏠', '🏢', '🏟️'],
};

/** Where found pals wander, in front of everything. */
const PAL_SPOTS: [number, number][] = [[250, 418], [560, 430], [60, 440], [430, 446], [720, 446], [300, 440], [520, 404], [770, 400], [20, 400], [640, 444]];

function Scene3D({ f, profile }: { f: Record<string, Feature>; profile: Profile }) {
  const st = (id: string) => f[id]?.stage ?? 0;
  const label = (x: number, text: string, done: boolean) => (
    <g>
      <rect x={x - 48} y={338} width="96" height="18" rx="9" fill={done ? '#facc15' : '#fff'} stroke="#1e1b4b" strokeWidth="2" />
      <text x={x} y={351} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e1b4b">{text}</text>
    </g>
  );
  const building = (id: string, x: number, name: string) => {
    const stage = st(id);
    const art = stage ? BUILDS[id][stage - 1] : '🚧';
    const size = stage ? 62 + stage * 13 : 44;
    return (
      <g key={id}>
        <SvgSprite e={art} x={x} y={334} s={size} />
        {stage >= 6 && <SvgSprite e="🚩" x={x + size * 0.3} y={334 - size * 0.8} s={34} shadow={false} />}
        {label(x, name, stage >= 6)}
      </g>
    );
  };
  const trees = [[40, 300, '🌲'], [700, 300, '🌳'], [748, 318, '🌲'], [18, 330, '🌳'], [780, 340, '🌲'], [660, 318, '🌲']].slice(0, st('trees')) as [number, number, string][];
  const flowers = Array.from({ length: st('flowers') * 4 }, (_, i) => [455 + (i % 7) * 22 + (i % 2) * 6, 392 + Math.floor(i / 7) * 16]);
  const rocket = st('rocket');
  const have = PALS.filter((p) => profile.pals?.[p.id] && p.id !== profile.buddy).slice(0, PAL_SPOTS.length);
  const buddy = palById(profile.buddy);
  return (
    <div className="world-frame">
      <svg viewBox="0 0 800 450" className="world-scene world-3d" role="img" aria-label="Your world">
        <defs>
          <linearGradient id="w3-sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#38bdf8" /><stop offset="1" stopColor="#e0f2fe" /></linearGradient>
          <linearGradient id="w3-grass" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#a3e635" /><stop offset="1" stopColor="#22c55e" /></linearGradient>
        </defs>
        <rect width="800" height="450" fill="url(#w3-sky)" />
        <SvgSprite e="☀️" x={720} y={100} s={80} shadow={false} />
        {st('rainbow') > 0 && <g opacity="0.85"><SvgSprite e="🌈" x={430} y={250} s={180} shadow={false} /></g>}
        <SvgSprite e="⛰️" x={110} y={300} s={190} crop={0.22} shadow={false} />
        <SvgSprite e="🏔️" x={300} y={300} s={230} crop={0.22} shadow={false} />
        <SvgSprite e="⛰️" x={520} y={300} s={170} crop={0.22} shadow={false} flip />
        <SvgSprite e="🏔️" x={700} y={300} s={200} crop={0.22} shadow={false} flip />
        <path d="M0 296 Q200 280 400 296 T800 292 V450 H0Z" fill="url(#w3-grass)" />
        <path d="M380 450 Q400 400 400 340" stroke="#fcd34d" strokeWidth="30" fill="none" strokeLinecap="round" />
        <path d="M380 450 Q400 400 400 340" stroke="#fef3c7" strokeWidth="5" fill="none" strokeDasharray="3 14" strokeLinecap="round" />
        {trees.map(([x, y, e], i) => <SvgSprite key={i} e={e} x={x} y={y + 40} s={64} flip={i % 2 === 1} />)}
        {building('math', 85, 'Math Tower')}
        {building('spelling', 190, 'Word Library')}
        {building('grammar', 480, 'Grammar Garage')}
        {building('science', 610, 'Science Dome')}
        <g>
          <ellipse cx="320" cy="332" rx="36" ry="8" fill="#64748b" />
          {rocket > 0 ? (
            <g className={rocket >= 5 ? 'rocket-ready' : ''}>
              <g transform={`rotate(-45 320 ${330 - rocket * 4 - 40})`}>
                <SvgSprite e="🚀" x={320} y={330 - rocket * 4} s={48 + rocket * 8} shadow={false} />
              </g>
            </g>
          ) : (
            <SvgSprite e="🚧" x={320} y={334} s={40} />
          )}
          {label(320, 'Rocket Pad', rocket >= 5)}
        </g>
        {st('pond') > 0 && (
          <g>
            <ellipse cx="140" cy="402" rx="84" ry="28" fill="#0284c7" />
            <ellipse cx="140" cy="398" rx="76" ry="22" fill="#38bdf8" />
            <SvgSprite e="🪷" x={100} y={404} s={30} shadow={false} />
            {st('pond') >= 2 && <><SvgSprite e="🦆" x={150} y={404} s={40} shadow={false} /><SvgSprite e="🦆" x={185} y={398} s={30} shadow={false} flip /></>}
          </g>
        )}
        {st('rink') > 0 && (
          <g>
            <rect x="600" y="372" width="150" height="62" rx="28" fill="#f8fafc" stroke="#dc2626" strokeWidth="3" />
            <line x1="675" y1="372" x2="675" y2="434" stroke="#dc2626" strokeWidth="3" />
            <circle cx="675" cy="403" r="12" fill="none" stroke="#2563eb" strokeWidth="2" />
            <SvgSprite e="🏒" x={640} y={420} s={38} shadow={false} />
            <SvgSprite e="⛸️" x={715} y={422} s={34} shadow={false} />
          </g>
        )}
        {st('dino') > 0 && <><SvgSprite e="🦕" x={250} y={400} s={70} /><SvgSprite e="🦴" x={290} y={400} s={28} shadow={false} /></>}
        {flowers.map(([x, y], i) => <SvgSprite key={i} e={['🌷', '🌼', '🌸', '🌻'][i % 4]} x={x} y={y + 8} s={22} shadow={false} />)}
        {have.map((p, i) => <SvgSprite key={p.id} e={p.e} x={PAL_SPOTS[i][0]} y={PAL_SPOTS[i][1]} s={46} flip={i % 2 === 0} className={`wander w${i % 3}`} />)}
        <g transform="translate(352 318)">
          <AvatarArt look={lookOf(profile)} size={96} background={false} />
        </g>
        {buddy && <SvgSprite e={buddy.e} x={462} y={428} s={50} className="wander w1" />}
      </svg>
      <MapClouds />
    </div>
  );
}

export function World() {
  const { profile, data } = useStore();
  useMusic('map');
  if (!profile) return null;
  const features = featuresOf(progressOf(profile));
  const byId = Object.fromEntries(features.map((x) => [x.id, x]));
  const built = features.reduce((n, x) => n + x.stage, 0);
  const total = features.reduce((n, x) => n + x.maxStage, 0);
  return (
    <main className="page">
      <TopBar back={() => go('rewards')} />
      <section className="card world">
        <h1><Icon e="🏡" /> {profile.name}'s World</h1>
        <p className="muted">Your world grows as you learn. {built} of {total} pieces built.</p>
        {data.settings.classicLook ? <ClassicScene f={byId} profile={profile} /> : <Scene3D f={byId} profile={profile} />}
      </section>
      <h2>What can I build next?</h2>
      <div className="feature-grid">
        {features.map((x) => (
          <div key={x.id} className={`feature ${x.stage >= x.maxStage ? 'done' : x.stage ? 'started' : ''}`}>
            <span className="feature-icon"><Icon e={x.icon} size="1em" /></span>
            <span className="feature-name">{x.name}</span>
            <span className="level-dots">{Array.from({ length: x.maxStage }, (_, i) => <span key={i} className={i < x.stage ? 'on' : ''} />)}</span>
            <span className="muted small">{x.next}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
