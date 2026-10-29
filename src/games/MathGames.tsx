import { useEffect, useRef, useState } from 'react';
import { Sprite } from '../art/sprite';
import { sfx } from '../battle/sfx';
import { VisualView } from '../components/Visuals';
import { newSkillState, status } from '../engine/adaptive';
import { int, pick, shuffle } from '../engine/random';
import { speak } from '../engine/speech';
import { useStore } from '../engine/store';
import type { Question } from '../engine/types';
import { Keypad, normalize } from '../screens/Play';
import { BattleStage, type StageEvent } from '../battle/BattleStage';
import { COMBO_FOR_SPECIAL, type Battle } from '../battle/engine';
import { ZONES } from '../battle/zones';
import { lookOf } from '../avatar/catalog';
import { palById } from '../collect/pals';
import { gearById } from '../collect/gear';
import type { SubjectId } from '../engine/types';
import { MATH_SKILLS } from '../subjects/math/skills';
import { GameShell, type GameProps } from './GameShell';

// ---------- Fact Race: as many facts as you can in 60 seconds ----------

type Op = '+' | '−' | '×' | '÷';

function fact(op: Op): { text: string; answer: number } {
  const r = Math.random;
  if (op === '+') { const a = int(r, 2, 20), b = int(r, 2, 20); return { text: `${a} + ${b}`, answer: a + b }; }
  if (op === '−') { const a = int(r, 10, 30), b = int(r, 1, a); return { text: `${a} − ${b}`, answer: a - b }; }
  const a = int(r, 1, 10), b = int(r, 1, 10);
  return op === '×' ? { text: `${a} × ${b}`, answer: a * b } : { text: `${a * b} ÷ ${a}`, answer: b };
}

function FactRaceRound({ end, fx, op }: GameProps & { op: Op }) {
  const { profile, data } = useStore();
  const classic = !!data.settings.classicLook;
  const ghost = profile?.games?.[`fact-race-${op}`]?.best ?? 0;
  const finish = Math.max(26, ghost + 4);
  const [streak, setStreak] = useState(0);
  const [turbo, setTurbo] = useState(0);
  const [left, setLeft] = useState(60);
  const [q, setQ] = useState(() => fact(op));
  const [value, setValue] = useState('');
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [flash, setFlash] = useState<'' | 'ok' | 'bad'>('');
  const done = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (left <= 0 && !done.current) {
      done.current = true;
      end(score, `${score} right, ${misses} missed`);
    }
  }, [left]);

  const submit = (v = value) => {
    if (!v) return;
    if (Number(v) === q.answer) {
      setScore((s) => s + 1);
      setFlash('ok');
      const st = streak + 1;
      setStreak(st);
      const x = 0.06 + Math.min(score + 1, finish) / finish * 0.86;
      if (st % 5 === 0) { setTurbo(st); fx('special', x, 0.32); sfx.special(); } else { fx('hit', x, 0.32, '#facc15'); sfx.coin(); }
    } else {
      setMisses((m) => m + 1);
      setFlash('bad');
      setStreak(0);
      sfx.ouch();
    }
    setTimeout(() => setFlash(''), 200);
    setValue('');
    setQ(fact(op));
  };

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) setValue((v) => (v.length < 4 ? v + e.key : v));
      else if (e.key === 'Backspace') setValue((v) => v.slice(0, -1));
      else if (e.key === 'Enter') submit();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  const pos = (n: number) => `${4 + (Math.min(n, finish) / finish) * 86}%`;
  return (
    <div className="center">
      <div className="race-bar">
        <span className="timer" style={{ ['--pct' as string]: `${(left / 60) * 100}%` }}>⏱️ {Math.max(left, 0)}s</span>
        {!classic && streak >= 2 && <span className="streak">🔥 {streak} in a row</span>}
        <span className="race-score">⚡ {score}</span>
      </div>
      {!classic && (
        <div className="race-track" aria-hidden="true">
          <div className="finish-line" />
          {ghost > 0 && <div className="lane"><span className="racer ghost" style={{ left: pos((ghost * (60 - left)) / 60) }}><Sprite e="🏎️" size={56} /></span><small className="lane-tag">Your best: {ghost}</small></div>}
          <div className="lane"><span key={turbo} className={`racer me ${turbo && turbo === streak ? 'turbo' : ''}`} style={{ left: pos(score) }}><Sprite e="🏎️" size={64} /></span></div>
          {turbo > 0 && turbo === streak && <div key={`t${turbo}`} className="turbo-word">TURBO!</div>}
        </div>
      )}
      <h2 className={`fact ${flash}`}>{q.text} = <span className="answer-value">{value || '?'}</span></h2>
      <Keypad value={value} setValue={setValue} onEnter={() => submit()} />
    </div>
  );
}

export function FactRace() {
  const [op, setOp] = useState<Op>('×');
  const picker = (
    <div className="op-pick" role="group" aria-label="Choose the kind of fact">
      {(['+', '−', '×', '÷'] as Op[]).map((o) => (
        <button key={o} className={o === op ? 'on' : ''} onClick={() => setOp(o)}>{o}</button>
      ))}
    </div>
  );
  return (
    <GameShell key={op} gameId={`fact-race-${op}`} subject="math" title={`Fact Race ${op}`} icon="🏎️" scoreLabel="facts" introExtra={picker}
      rules={['Answer as many facts as you can in 60 seconds.', 'Type the answer and press ✓ (or Enter).', 'Pick +, −, × or ÷. Each has its own best score.']}>
      {(p) => <FactRaceRound {...p} op={op} />}
    </GameShell>
  );
}

// ---------- Boss Battle: answer questions to defeat the monster ----------

// Each tier is a zone's boss, fought with math.
const BOSSES: { zone: SubjectId; hp: number }[] = [
  { zone: 'math', hp: 8 },
  { zone: 'spelling', hp: 10 },
  { zone: 'grammar', hp: 12 },
  { zone: 'science', hp: 14 },
];

function BossRound({ end }: GameProps) {
  const { profile } = useStore();
  const [bossIdx] = useState(() => Math.min(BOSSES.length - 1, Math.floor((profile?.games?.['boss']?.plays ?? 0) / 2)));
  const tier = BOSSES[bossIdx];
  const zone = ZONES[tier.zone]!;
  const bossName = zone.monsters[zone.monsters.length - 1];
  const [battle, setBattle] = useState<Battle>(() => ({
    foes: [{ kind: zone.monsters.length - 1, name: bossName, maxHp: tier.hp, hp: tier.hp, boss: true }],
    current: 0, combo: 0, coins: 0, crits: 0, specials: 0,
  }));
  const [event, setEvent] = useState<StageEvent | null>(null);
  const [hearts, setHearts] = useState(3);
  const [value, setValue] = useState('');
  const [answered, setAnswered] = useState(0);
  const [locked, setLocked] = useState(false);
  const eventId = useRef(0);
  // Questions come from skills he has practised, at his level, so the boss fits him.
  const pool = MATH_SKILLS.filter((s) => status(profile?.skills[s.id]) !== 'new');
  const skills = pool.length >= 2 ? pool : MATH_SKILLS.slice(4, 8);
  const nextQ = (): Question => {
    for (let i = 0; i < 20; i++) {
      const s = pick(Math.random, skills);
      const q = s.generate((profile?.skills[s.id] ?? newSkillState()).level, Math.random, { spellingList: [] });
      if (q.input === 'choice' || q.input === 'number') return q;
    }
    return MATH_SKILLS[6].generate(0, Math.random, { spellingList: [] });
  };
  const [q, setQ] = useState<Question>(nextQ);
  const asked = useRef(Date.now());

  const answer = (a: string) => {
    if (locked) return;
    const ok = q.input === 'choice' ? a === q.answer : normalize(a) === normalize(q.answer);
    setAnswered((n) => n + 1);
    const foe = battle.foes[0];
    if (ok) {
      // Three in a row is a special move; a fast answer is a critical hit.
      const combo = battle.combo + 1;
      const fast = (Date.now() - asked.current) / 1000 < 8;
      const kind = combo >= COMBO_FOR_SPECIAL ? 'special' : fast ? 'crit' : 'hit';
      const damage = Math.min(foe.hp, kind === 'hit' ? 1 : 2);
      const hp = foe.hp - damage;
      setBattle({ ...battle, combo: kind === 'special' ? 0 : combo, foes: [{ ...foe, hp, end: hp <= 0 ? 'defeated' : undefined }] });
      setEvent({ id: ++eventId.current, kind, damage, heal: 0, finished: hp <= 0, coins: 0, foe: 0 });
      if (hp <= 0) {
        setLocked(true);
        setTimeout(() => end(hearts * 5 + tier.hp, `You beat ${bossName} with ${hearts} ❤️ left!`), 1800);
        return;
      }
    } else {
      setBattle({ ...battle, combo: 0 });
      setEvent({ id: ++eventId.current, kind: 'attack', damage: 0, heal: 0, finished: false, coins: 0, foe: 0 });
      setHearts((h) => h - 1);
      speak(`The answer was ${q.answer}`);
      if (hearts - 1 <= 0) {
        setLocked(true);
        setTimeout(() => end(tier.hp - foe.hp, `${bossName} won this time. You did ${tier.hp - foe.hp} damage.`), 1400);
        return;
      }
    }
    setValue('');
    setQ(nextQ());
    asked.current = Date.now();
  };

  return (
    <div className="center boss">
      <BattleStage zone={zone} battle={battle} event={event} look={lookOf(profile!)} buddy={palById(profile?.buddy)?.e} weapon={gearById(profile?.gearOn?.weapon)?.e} />
      <div className="boss-hearts" aria-label={`${hearts} hearts left`}>
        {[0, 1, 2].map((i) => <Sprite key={i} e={i < hearts ? '❤️' : '🖤'} size={34} className={i === hearts && event?.kind === 'attack' ? 'heart-lost' : ''} />)}
        <span className="muted small">Boss {bossIdx + 1} of {BOSSES.length} · answered {answered}</span>
      </div>
      <h2 className="prompt">{q.prompt}</h2>
      {q.visual && <div className="visual-wrap"><VisualView v={q.visual} /></div>}
      {q.input === 'choice' ? (
        <div className="choices">
          {(q.choices ?? []).map((c) => <button key={c} className="choice" disabled={locked} onClick={() => answer(c)}>{c}</button>)}
        </div>
      ) : (
        <>
          <div className="answer-box">{q.unit === '$' && <span className="unit">$</span>}<span className="answer-value">{value || '?'}</span>{q.unit && q.unit !== '$' && <span className="unit">{q.unit}</span>}</div>
          <Keypad value={value} setValue={setValue} onEnter={() => value && answer(value)} />
        </>
      )}
    </div>
  );
}

export function BossBattle() {
  return (
    <GameShell gameId="boss" subject="math" title="Boss Battle" icon="⚔️" scoreLabel="points" theme="boss" rules={['Every right answer hits the boss. Fast answers are critical hits!', 'Three in a row unleashes a special move.', 'Every wrong answer costs you a heart. You have 3.', 'Play twice to meet a tougher boss!']}>
      {(p) => <BossRound {...p} />}
    </GameShell>
  );
}

// ---------- Corner Store: pay the exact amount with Canadian coins ----------

const STORE = [
  { name: 'Freezie', icon: '🧊' }, { name: 'Apple', icon: '🍎' }, { name: 'Sticker', icon: '⭐' }, { name: 'Gum', icon: '🍬' },
  { name: 'Hockey cards', icon: '🃏' }, { name: 'Juice box', icon: '🧃' }, { name: 'Pencil', icon: '✏️' }, { name: 'Cookie', icon: '🍪' },
  { name: 'Bouncy ball', icon: '🔴' }, { name: 'Comic book', icon: '📕' }, { name: 'Popsicle', icon: '🍭' }, { name: 'Toy car', icon: '🚗' },
];
const COINS: { id: string; value: number }[] = [
  { id: 'toonie', value: 200 }, { id: 'loonie', value: 100 }, { id: 'quarter', value: 25 }, { id: 'dime', value: 10 }, { id: 'nickel', value: 5 },
];

const money = (c: number) => (c >= 100 ? `$${(c / 100).toFixed(2)}` : `${c}¢`);

const CUSTOMERS = ['🧒', '👵', '👨‍🍳', '🧑‍🚒', '👮', '🧑‍🎤', '🤠', '🧑‍🚀'];

function StoreRound({ end, fx }: GameProps) {
  const { data } = useStore();
  const classic = !!data.settings.classicLook;
  const [faces] = useState(() => shuffle(Math.random, CUSTOMERS));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [paid, setPaid] = useState<string[]>([]);
  const [msg, setMsg] = useState('');
  const ROUNDS = 6;
  // Prices get bigger each round; always a multiple of 5¢ since Canada has no pennies.
  const [items] = useState(() => shuffle(Math.random, STORE).slice(0, ROUNDS).map((it, i) => ({ ...it, price: 5 * int(Math.random, i < 2 ? 3 : i < 4 ? 10 : 20, i < 2 ? 19 : i < 4 ? 50 : 99) })));
  const item = items[round];
  const total = paid.reduce((t, c) => t + COINS.find((x) => x.id === c)!.value, 0);
  const showTotal = round < 3;

  const add = (id: string) => { sfx.coin(); setPaid((p) => [...p, id]); };
  const pay = () => {
    if (total === item.price) {
      setScore((s) => s + 1);
      setMsg(`✅ Perfect! ${money(item.price)} exactly.`);
      fx('coins', 0.5, 0.3);
      sfx.fanfare();
    } else {
      sfx.ouch();
      setMsg(total > item.price ? `Too much! You gave ${money(total)}. It costs ${money(item.price)}.` : `Not enough. You gave ${money(total)}. It costs ${money(item.price)}.`);
    }
    setTimeout(() => {
      setMsg('');
      setPaid([]);
      if (round + 1 >= ROUNDS) end(score + (total === item.price ? 1 : 0), `${score + (total === item.price ? 1 : 0)} of ${ROUNDS} paid exactly`);
      else setRound((r) => r + 1);
    }, 1600);
  };

  return (
    <div className="center store">
      <p className="muted">Customer {round + 1} of {ROUNDS}</p>
      {classic ? (
        <div className="store-item"><span className="big-emoji">{item.icon}</span><div><strong>{item.name}</strong><div className="price-tag">{money(item.price)}</div></div></div>
      ) : (
        <div key={round} className="store-counter">
          <span className="customer"><Sprite e={faces[round % faces.length]} size={84} /></span>
          <span className="speech-bubble">I'd like the {item.name.toLowerCase()}, please!</span>
          <span className="store-goods"><Sprite e={item.icon} size={92} /><span className="price-tag">{money(item.price)}</span></span>
        </div>
      )}
      <p>Tap coins to pay exactly {money(item.price)}.</p>
      <div className="visual-wrap">{paid.length ? <VisualView v={{ kind: 'coins', coins: paid }} /> : <span className="muted">Your hand is empty</span>}</div>
      {showTotal && <p className="score">You have given: {money(total)}</p>}
      <div className="coin-buttons">
        {COINS.map((c) => (
          <button key={c.id} onClick={() => add(c.id)} disabled={!!msg}>
            <VisualView v={{ kind: 'coins', coins: [c.id] }} />
          </button>
        ))}
      </div>
      {msg ? <p className="feedback hint">{msg}</p> : (
        <div className="row">
          <button className="btn ghost" onClick={() => setPaid((p) => p.slice(0, -1))} disabled={!paid.length}>Take one back</button>
          <button className="btn primary" onClick={pay} disabled={!paid.length}>Pay</button>
        </div>
      )}
    </div>
  );
}

export function CornerStore() {
  return (
    <GameShell gameId="store" subject="math" title="Corner Store" icon="🏪" scoreLabel="customers" rules={['You run the till at the corner store!', 'Tap coins to make the exact price.', 'After 3 customers the total is hidden. Count it yourself!']}>
      {(p) => <StoreRound {...p} />}
    </GameShell>
  );
}
