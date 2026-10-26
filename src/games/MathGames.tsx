import { useEffect, useRef, useState } from 'react';
import { VisualView } from '../components/Visuals';
import { newSkillState, status } from '../engine/adaptive';
import { int, pick, shuffle } from '../engine/random';
import { speak } from '../engine/speech';
import { useStore } from '../engine/store';
import type { Question } from '../engine/types';
import { Keypad, normalize } from '../screens/Play';
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

function FactRaceRound({ end, op }: GameProps & { op: Op }) {
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
    } else {
      setMisses((m) => m + 1);
      setFlash('bad');
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

  return (
    <div className="center">
      <div className="race-bar">
        <span className="timer" style={{ ['--pct' as string]: `${(left / 60) * 100}%` }}>⏱️ {Math.max(left, 0)}s</span>
        <span className="race-score">⚡ {score}</span>
      </div>
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

const BOSSES = [
  { name: 'Gloop the Slime', icon: '🟢', hp: 8 },
  { name: 'Count Fangula', icon: '🧛', hp: 10 },
  { name: 'Robo-Rex', icon: '🤖', hp: 12 },
  { name: 'The Number Dragon', icon: '🐲', hp: 14 },
];

function BossRound({ end }: GameProps) {
  const { profile } = useStore();
  const [bossIdx] = useState(() => Math.min(BOSSES.length - 1, Math.floor((profile?.games?.['boss']?.plays ?? 0) / 2)));
  const boss = BOSSES[bossIdx];
  const [hp, setHp] = useState(boss.hp);
  const [hearts, setHearts] = useState(3);
  const [hit, setHit] = useState<'' | 'boss' | 'me'>('');
  const [value, setValue] = useState('');
  const [answered, setAnswered] = useState(0);
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

  const answer = (a: string) => {
    const ok = q.input === 'choice' ? a === q.answer : normalize(a) === normalize(q.answer);
    setAnswered((n) => n + 1);
    if (ok) {
      setHp((h) => h - 1);
      setHit('boss');
      if (hp - 1 <= 0) {
        setTimeout(() => end(hearts * 5 + boss.hp, `You beat ${boss.name} with ${hearts} ❤️ left!`), 600);
        return;
      }
    } else {
      setHearts((h) => h - 1);
      setHit('me');
      speak(`The answer was ${q.answer}`);
      if (hearts - 1 <= 0) {
        setTimeout(() => end(boss.hp - hp, `${boss.name} won this time. You hit it ${boss.hp - hp} times.`), 900);
        return;
      }
    }
    setTimeout(() => setHit(''), 500);
    setValue('');
    setQ(nextQ());
  };

  return (
    <div className="center boss">
      <div className="boss-top">
        <div className={`boss-face ${hit === 'boss' ? 'ouch' : ''}`}>{boss.icon}</div>
        <div className="boss-info">
          <strong>{boss.name}</strong>
          <div className="hp"><span style={{ width: `${(hp / boss.hp) * 100}%` }} /></div>
          <span className={`hearts ${hit === 'me' ? 'ouch' : ''}`}>{'❤️'.repeat(Math.max(hearts, 0))}{'🖤'.repeat(3 - Math.max(hearts, 0))}</span>
        </div>
      </div>
      <h2 className="prompt">{q.prompt}</h2>
      {q.visual && <div className="visual-wrap"><VisualView v={q.visual} /></div>}
      {q.input === 'choice' ? (
        <div className="choices">
          {(q.choices ?? []).map((c) => <button key={c} className="choice" onClick={() => answer(c)}>{c}</button>)}
        </div>
      ) : (
        <>
          <div className="answer-box">{q.unit === '$' && <span className="unit">$</span>}<span className="answer-value">{value || '?'}</span>{q.unit && q.unit !== '$' && <span className="unit">{q.unit}</span>}</div>
          <Keypad value={value} setValue={setValue} onEnter={() => value && answer(value)} />
        </>
      )}
      <p className="muted small">Questions answered: {answered}</p>
    </div>
  );
}

export function BossBattle() {
  return (
    <GameShell gameId="boss" subject="math" title="Boss Battle" icon="⚔️" scoreLabel="points" rules={['Every right answer hits the boss.', 'Every wrong answer costs you a heart. You have 3.', 'Questions come from the math skills you have practised.', 'Beat a boss twice to meet a tougher one!']}>
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

function StoreRound({ end }: GameProps) {
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

  const add = (id: string) => setPaid((p) => [...p, id]);
  const pay = () => {
    if (total === item.price) {
      setScore((s) => s + 1);
      setMsg(`✅ Perfect! ${money(item.price)} exactly.`);
    } else {
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
      <div className="store-item"><span className="big-emoji">{item.icon}</span><div><strong>{item.name}</strong><div className="price-tag">{money(item.price)}</div></div></div>
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
