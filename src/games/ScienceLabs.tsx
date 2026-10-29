import { useEffect, useState } from 'react';
import { Icon } from '../art/sprite';
import { sfx } from '../battle/sfx';
import { GameShell, type GameProps } from './GameShell';

// ---------- Water Lab: heat and cool water to see changes of state ----------

interface Task { id: string; text: string; check: (t: number, prev: number) => boolean }

const WATER_TASKS: Task[] = [
  { id: 'freeze', text: 'Freeze the water into ice', check: (t, p) => t < 0 && p >= 0 },
  { id: 'melt', text: 'Melt the ice back into water', check: (t, p) => t > 0 && p <= 0 },
  { id: 'boil', text: 'Boil the water so it turns into steam', check: (t) => t >= 100 },
  { id: 'zero', text: 'Find the exact temperature where water freezes and melts', check: (t) => t === 0 },
  { id: 'cool', text: 'Cool the steam back into liquid water (condensation)', check: (t, p) => t < 100 && p >= 100 },
  { id: 'room', text: 'Set it to room temperature (about 20 °C)', check: (t) => t >= 18 && t <= 22 },
];

function stateAt(t: number): 'solid' | 'liquid' | 'gas' {
  return t <= 0 ? (t < 0 ? 'solid' : 'liquid') : t >= 100 ? 'gas' : 'liquid';
}

function WaterRound({ end, fx }: GameProps) {
  const [temp, setTemp] = useState(20);
  const [done, setDone] = useState<string[]>([]);
  const [note, setNote] = useState('Move the slider to heat or cool the water.');
  const state = stateAt(temp);

  const change = (t: number) => {
    setTemp(t);
    const newly = WATER_TASKS.filter((x) => !done.includes(x.id) && x.check(t, temp));
    if (newly.length) {
      setDone((d) => [...d, ...newly.map((x) => x.id)]);
      setNote(`✅ ${newly[0].text}!`);
      sfx.special();
      fx('crit', 0.3, 0.25);
    } else if (stateAt(t) !== stateAt(temp)) {
      setNote(stateAt(t) === 'solid' ? '❄️ Freezing! Liquid water turned into solid ice.' : stateAt(t) === 'gas' ? '♨️ Boiling! Water evaporates into steam, a gas.' : stateAt(temp) === 'solid' ? '💧 Melting! Ice turned into liquid water.' : '🌫️ Condensing! Steam cooled into liquid water.');
    }
  };

  useEffect(() => {
    if (done.length === WATER_TASKS.length) setTimeout(() => end(WATER_TASKS.length, 'All experiments done!'), 1200);
  }, [done.length]);

  const fill = temp < 0 ? '#bae6fd' : temp >= 100 ? '#e2e8f0' : '#38bdf8';
  return (
    <div className="lab">
      <div className="lab-stage">
        <svg viewBox="0 0 260 260" className="beaker" role="img" aria-label={`Water at ${temp} degrees: ${state}`}>
          {state === 'gas' && [0, 1, 2, 3, 4].map((i) => <circle key={i} className="steam" cx={90 + i * 20} cy={60} r={10 + (i % 2) * 4} fill="#cbd5e1" style={{ animationDelay: `${i * 0.25}s` }} />)}
          <path d="M60 80 L60 220 Q60 240 80 240 L180 240 Q200 240 200 220 L200 80" fill="none" stroke="#334155" strokeWidth="5" />
          {state === 'solid' ? (
            <g>
              <rect x="64" y="150" width="132" height="86" rx="6" fill="#e0f2fe" />
              {[[80, 160], [130, 170], [100, 196], [150, 200]].map(([x, y], i) => <rect key={i} x={x} y={y} width="32" height="28" rx="4" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="2" />)}
            </g>
          ) : (
            <rect x="64" y={state === 'gas' ? 210 : 150} width="132" height={state === 'gas' ? 26 : 86} rx="6" fill={fill} opacity="0.85" />
          )}
          {state === 'liquid' && temp > 70 && [0, 1, 2].map((i) => <circle key={i} className="bubble" cx={90 + i * 35} cy={225} r="5" fill="#fff" style={{ animationDelay: `${i * 0.3}s` }} />)}
          <rect x="70" y="244" width="120" height="10" rx="4" fill={temp > 40 ? '#f97316' : temp < 0 ? '#60a5fa' : '#94a3b8'} />
        </svg>
        <div className="thermo">
          <div className="thermo-tube"><span style={{ height: `${((temp + 30) / 160) * 100}%`, background: temp < 0 ? '#3b82f6' : temp >= 100 ? '#dc2626' : '#f97316' }} /></div>
          <strong>{temp} °C</strong>
          <span className={`chip ${state}`}>{state === 'solid' ? '🧊 Solid' : state === 'liquid' ? '💧 Liquid' : '💨 Gas'}</span>
        </div>
      </div>
      <input className="temp-slider" type="range" min={-30} max={130} value={temp} onChange={(e) => change(Number(e.target.value))} aria-label="Temperature" />
      <div className="row"><button className="btn ghost" onClick={() => change(Math.max(-30, temp - 1))}>❄️ −1 °C</button><button className="btn ghost" onClick={() => change(Math.min(130, temp + 1))}>🔥 +1 °C</button></div>
      <p className="feedback hint">{note}</p>
      <ul className="tasks">
        {WATER_TASKS.map((t) => <li key={t.id} className={done.includes(t.id) ? 'done' : ''}>{done.includes(t.id) ? '✅' : '⬜'} {t.text}</li>)}
      </ul>
      <button className="link" onClick={() => end(done.length, `${done.length} of ${WATER_TASKS.length} experiments done`)}>Finish now</button>
    </div>
  );
}

export function WaterLab() {
  return (
    <GameShell gameId="water-lab" subject="science" title="Water Lab" icon="🧪" scoreLabel="experiments" rules={['Heat and cool water to see it change state.', 'Watch the thermometer: water freezes at 0 °C and boils at 100 °C.', 'Finish every experiment on the list.']}>
      {(p) => <WaterRound {...p} />}
    </GameShell>
  );
}

// ---------- Puck Slide: how friction and force change motion ----------

const SURFACES = [
  { id: 'ice', name: 'Ice', icon: '🧊', friction: 0.05, color: '#e0f2fe' },
  { id: 'wood', name: 'Gym floor', icon: '🪵', friction: 0.25, color: '#fcd34d' },
  { id: 'carpet', name: 'Carpet', icon: '🟥', friction: 0.55, color: '#fca5a5' },
  { id: 'grass', name: 'Grass', icon: '🌱', friction: 0.8, color: '#86efac' },
];

/** Distance in metres a puck slides for a given push strength (1-5) and surface. */
export function slideDistance(push: number, friction: number): number {
  return Math.round(((push * push * 1.2) / (friction * 9.8)) * 10) / 10;
}

const CHALLENGES = [
  { id: 'far', text: 'Make the puck slide more than 30 m', check: (d: number) => d > 30 },
  { id: 'short', text: 'Make the puck stop in less than 1 m', check: (d: number) => d < 1 },
  { id: 'target', text: 'Land the puck between 4 m and 6 m', check: (d: number) => d >= 4 && d <= 6 },
];

function SlideRound({ end, fx }: GameProps) {
  const [surface, setSurface] = useState(SURFACES[0]);
  const [push, setPush] = useState(2);
  const [predict, setPredict] = useState<string | null>(null);
  const [result, setResult] = useState<{ d: number; s: string } | null>(null);
  const [results, setResults] = useState<{ surface: string; push: number; d: number }[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [anim, setAnim] = useState(0);
  const [predictScore, setPredictScore] = useState(0);
  const askPredict = results.length >= 1 && results.length % 3 === 1 && !predict;

  const go = () => {
    const d = slideDistance(push, surface.friction);
    setResult({ d, s: surface.name });
    setAnim((a) => a + 1);
    setResults((r) => [...r, { surface: surface.name, push, d }]);
    const newly = CHALLENGES.filter((c) => !done.includes(c.id) && c.check(d)).map((c) => c.id);
    if (predict) {
      const last = results[results.length - 1];
      const farther = d > last.d;
      if ((predict === 'farther') === farther) setPredictScore((p) => p + 1);
    }
    setPredict(null);
    sfx.whoosh();
    if (newly.length) {
      setDone((x) => [...x, ...newly]);
      setTimeout(() => { sfx.special(); fx('special', 0.04 + (Math.min(d, 40) / 40) * 0.88, 0.1); }, 900);
    }
  };

  useEffect(() => {
    if (done.length === CHALLENGES.length) setTimeout(() => end(CHALLENGES.length + predictScore, `All challenges done, ${predictScore} good predictions`), 1500);
  }, [done.length]);

  const max = 40;
  const pos = result ? Math.min(result.d, max) / max : 0;
  return (
    <div className="lab">
      <div className="rink-track" style={{ background: surface.color }}>
        <span className="stick"><Icon e="🏒" size="1.6em" /></span>
        <span className="rink-goal"><Icon e="🥅" size="2.2em" /></span>
        <span key={anim} className="puck-dot" style={{ ['--to' as string]: `${pos * 88}%`, ['--dur' as string]: `${0.6 + pos * 1.6}s` }} />
        {[10, 20, 30, 40].map((m) => <span key={m} className="mark" style={{ left: `${4 + (m / max) * 88}%` }}>{m} m</span>)}
      </div>
      {result && <p className="score">The puck slid {result.d} m on {result.s.toLowerCase()}.</p>}
      <div className="lab-controls">
        <div>
          <strong>Surface</strong>
          <div className="row" style={{ justifyContent: 'flex-start' }}>
            {SURFACES.map((s) => <button key={s.id} className={`btn ${s.id === surface.id ? 'primary' : 'ghost'}`} onClick={() => setSurface(s)}>{s.icon} {s.name}</button>)}
          </div>
        </div>
        <label>
          <strong>Push strength: {['', 'tiny tap', 'soft', 'medium', 'hard', 'slapshot!'][push]}</strong>
          <input type="range" min={1} max={5} value={push} onChange={(e) => setPush(Number(e.target.value))} />
        </label>
      </div>
      {askPredict ? (
        <div className="feedback hint center">
          <p>🤔 Predict first! With {surface.name.toLowerCase()} and a {['', 'tiny tap', 'soft', 'medium', 'hard', 'slapshot'][push]} push, will the puck go farther or shorter than last time ({results[results.length - 1].d} m)?</p>
          <div className="row"><button className="btn ghost" onClick={() => setPredict('farther')}>Farther</button><button className="btn ghost" onClick={() => setPredict('shorter')}>Shorter</button></div>
        </div>
      ) : (
        <div className="row"><button className="btn primary big" onClick={go}>🏒 Shoot!</button></div>
      )}
      <ul className="tasks">
        {CHALLENGES.map((c) => <li key={c.id} className={done.includes(c.id) ? 'done' : ''}>{done.includes(c.id) ? '✅' : '⬜'} {c.text}</li>)}
      </ul>
      <p className="muted small">Friction is the force that slows the puck. Smooth surfaces have less friction. A bigger push is a stronger force.</p>
      {results.length > 0 && (
        <table className="skills-table">
          <thead><tr><th>Try</th><th>Surface</th><th>Push</th><th>Distance (m)</th></tr></thead>
          <tbody>{results.slice(-6).map((r, i) => <tr key={i}><td>{results.length - Math.min(results.length, 6) + i + 1}</td><td>{r.surface}</td><td>{r.push}</td><td>{r.d}</td></tr>)}</tbody>
        </table>
      )}
    </div>
  );
}

export function PuckSlide() {
  return (
    <GameShell gameId="puck-slide" subject="science" title="Puck Slide" icon="🏒" scoreLabel="points" rules={['Shoot a puck on different surfaces.', 'Change how hard you push and see how far it goes.', 'Make predictions and finish the challenges.']}>
      {(p) => <SlideRound {...p} />}
    </GameShell>
  );
}
