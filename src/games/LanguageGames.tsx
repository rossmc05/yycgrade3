import { useEffect, useRef, useState } from 'react';
import { Sprite } from '../art/sprite';
import { FxLayer, type FxHandle } from '../battle/fx';
import { sfx } from '../battle/sfx';
import { pick, shuffle } from '../engine/random';
import { speak } from '../engine/speech';
import { useStore } from '../engine/store';
import { LetterKeys, normalize } from '../screens/Play';
import { AvatarArt } from '../avatar/AvatarArt';
import { lookOf } from '../avatar/catalog';
import { parseTagged } from '../subjects/grammar/skills';
import { GRADE3_WORDS } from '../subjects/spelling/skills';
import { LESSONS } from '../subjects/typing/lessons';
import { GameShell, type GameProps } from './GameShell';

// ---------- Falling Words (typing) ----------

const FALL_WORDS = `cat dog sun run fun hat map jam sit kid red bed fish jump skate hockey puck goal snow ice moose bear tree lake rock star
moon cake milk game play team fast slow cold warm hill sled snack apple green blue happy funny school book desk read write`.split(/\s+/);

interface Drop { id: number; word: string; x: number; y: number; speed: number }

/** Calgary's skyline, with the Calgary Tower, along the bottom of the sky. */
function Skyline() {
  const blocks = [[0, 40, 46], [44, 60, 30], [100, 34, 64], [130, 50, 40], [200, 40, 80], [236, 56, 54], [300, 30, 96], [326, 46, 60], [380, 60, 36], [440, 36, 70], [470, 54, 50], [530, 40, 84], [566, 34, 44]];
  return (
    <svg className="skyline" viewBox="0 0 600 110" preserveAspectRatio="none" aria-hidden="true">
      {blocks.map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={110 - h} width={w} height={h} fill={i % 2 ? '#1e293b' : '#334155'} />
          {Array.from({ length: Math.floor(h / 14) }, (_, r) => <rect key={r} x={x + 6} y={116 - h + r * 14} width={w - 12} height="4" fill="#fde68a" opacity={(i + r) % 3 ? 0.55 : 0.15} />)}
        </g>
      ))}
      <path d="M268 110 L272 30 L262 26 L262 16 L290 16 L290 26 L280 30 L284 110Z" fill="#475569" />
      <rect x="258" y="10" width="36" height="8" rx="3" fill="#dc2626" />
      <rect x="274" y="0" width="4" height="10" fill="#94a3b8" />
    </svg>
  );
}

function FallingRound({ end }: GameProps) {
  const { profile, data } = useStore();
  const classic = !!data.settings.classicLook;
  const fx = useRef<FxHandle>(null);
  const sky = useRef<HTMLDivElement>(null);
  const [zap, setZap] = useState<{ id: number; x: number; y: number } | null>(null);
  const [wave, setWave] = useState(1);
  // Only use letters he has learned in Type Rocket so far.
  const unlocked = LESSONS.filter((_, i) => i === 0 || (profile?.typing?.[LESSONS[i - 1].id]?.stars ?? 0) >= 1);
  const keys = unlocked[unlocked.length - 1].keys || 'abcdefghijklmnopqrstuvwxyz';
  const words = FALL_WORDS.filter((w) => w.split('').every((c) => keys.includes(c)));
  const pool = words.length >= 5 ? words : FALL_WORDS;
  const [drops, setDrops] = useState<Drop[]>([]);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const next = useRef(0);
  const over = useRef(false);
  const tick = useRef(0);

  useEffect(() => {
    const t = setInterval(() => {
      tick.current++;
      setDrops((ds) => {
        let lost = 0;
        const moved = ds.map((d) => ({ ...d, y: d.y + d.speed })).filter((d) => (d.y > (classic ? 100 : 82) ? (lost++, fx.current?.burst('poof', d.x / 100, 0.85, '#f97316'), false) : true));
        if (lost) {
          setLives((l) => l - lost);
          sfx.defeat();
          const el = sky.current;
          if (el && !classic) { el.classList.remove('shake-m'); void el.offsetWidth; el.classList.add('shake-m'); }
        }
        const level = 1 + Math.floor(tick.current / 150);
        setWave(level);
        if (tick.current % Math.max(25, 60 - level * 6) === 0 && moved.length < 5) {
          moved.push({ id: next.current++, word: pick(Math.random, pool), x: 8 + Math.random() * 70, y: 0, speed: 0.25 + level * 0.06 });
        }
        return moved;
      });
    }, 50);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (lives <= 0 && !over.current) {
      over.current = true;
      end(score, `You zapped ${score} words`);
    }
  }, [lives]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') return setTyped((t) => t.slice(0, -1));
      if (!/^[a-z]$/i.test(e.key)) return;
      e.preventDefault();
      setTyped((t) => {
        const nt = t + e.key.toLowerCase();
        const hit = drops.find((d) => d.word === nt);
        if (hit) {
          setDrops((ds) => ds.filter((d) => d.id !== hit.id));
          setScore((s) => s + 1);
          setZap({ id: hit.id, x: hit.x, y: hit.y + 6 });
          fx.current?.burst('crit', hit.x / 100, hit.y / 100 + 0.06);
          sfx.crit();
          return '';
        }
        // Start over if no falling word begins with what was typed.
        return drops.some((d) => d.word.startsWith(nt)) ? nt : e.key.toLowerCase();
      });
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  return (
    <div>
      <div className="race-bar"><span>{'❤️'.repeat(Math.max(lives, 0))}</span>{!classic && <span className="wave">Wave {wave}</span>}<span className="race-score">⚡ {score}</span></div>
      <div ref={sky} className={`sky-box ${classic ? '' : 'meteor-sky'}`}>
        {drops.map((d) => (
          <span key={d.id} className={`drop ${classic ? '' : 'meteor'} ${typed && d.word.startsWith(typed) ? 'target' : ''}`} style={{ left: `${d.x}%`, top: `${d.y}%` }}>
            {!classic && <Sprite e="☄️" size={54} className="rock" />}
            <span className="word">{d.word.startsWith(typed) && typed ? <><b>{typed}</b>{d.word.slice(typed.length)}</> : d.word}</span>
          </span>
        ))}
        {classic ? <div className="ground">🏙️🏠🏡🏘️🏠🏡</div> : (
          <>
            <Skyline />
            {zap && <svg key={zap.id} className="laser" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="50" y1="96" x2={zap.x} y2={zap.y} /></svg>}
            <span className="cannon"><Sprite e="🛸" size={60} /></span>
            <FxLayer ref={fx} />
          </>
        )}
      </div>
      <p className="center typed-now">{typed || '…'}</p>
    </div>
  );
}

export function FallingWords() {
  return (
    <GameShell gameId="falling" subject="typing" title="Word Meteors" icon="☄️" scoreLabel="words" rules={['Words fall from the sky. Type a word to zap it!', "If a word reaches the town, you lose a heart. You have 3.", 'It gets faster as you go. Uses only the keys you have learned in Type Rocket.']}>
      {(p) => <FallingRound {...p} />}
    </GameShell>
  );
}

// ---------- Spelling Bee ----------

function BeeRound({ end, fx }: GameProps) {
  const { profile, data } = useStore();
  const classic = !!data.settings.classicLook;
  const [words] = useState(() => {
    const mine = (profile?.spellingList ?? []).map((w) => w.trim().toLowerCase()).filter((w) => /^[a-z']+$/.test(w));
    const all = [...mine.map((w) => [w, ''] as [string, string]), ...shuffle(Math.random, GRADE3_WORDS)];
    return all.slice(0, 15);
  });
  const [i, setI] = useState(0);
  const [value, setValue] = useState('');
  const [strikes, setStrikes] = useState(0);
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState('');
  const [w, sentence] = words[i] ?? ['', ''];
  const say = () => speak(sentence ? `${w}. ${sentence} ${w}.` : `${w}. ${w}.`);
  useEffect(() => { if (w) say(); }, [i]);

  const submit = () => {
    if (!value.trim() || msg) return;
    const ok = normalize(value) === normalize(w);
    const s2 = strikes + (ok ? 0 : 1);
    const sc = score + (ok ? 1 : 0);
    setMsg(ok ? '🐝 Correct!' : `❌ It's spelled ${w.split('').join('-')}`);
    if (ok) { setScore(sc); fx('crit', 0.5, 0.22); sfx.coin(); } else { setStrikes(s2); sfx.ouch(); }
    setTimeout(() => {
      setMsg('');
      setValue('');
      if (s2 >= 3 || i + 1 >= words.length) end(sc, s2 >= 3 ? `Three strikes! You spelled ${sc} words.` : `You spelled all ${sc} words. Champion!`);
      else setI(i + 1);
    }, ok ? 900 : 2200);
  };

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (/^[a-zA-Z']$/.test(e.key)) setValue((v) => v + e.key.toLowerCase());
      else if (e.key === 'Backspace') setValue((v) => v.slice(0, -1));
      else if (e.key === 'Enter') submit();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  return (
    <div className="center">
      <div className="race-bar"><span>Word {i + 1}</span><span>{'❌'.repeat(strikes)}{'⚪'.repeat(3 - strikes)}</span><span className="race-score">🐝 {score}</span></div>
      {!classic && (
        <div className="hive" aria-hidden="true">
          {words.map((_, k) => <span key={k} className={`hcell ${k < score ? 'honey' : ''} ${k === score ? 'next' : ''}`} />)}
          <span className="hive-bee" style={{ left: `${((Math.min(score, words.length - 1) + 0.5) / words.length) * 100}%` }}><Sprite e="🐝" size={46} /></span>
        </div>
      )}
      <button className="btn ghost big" onClick={say}>🔊 Hear the word</button>
      {sentence && <p className="muted">{sentence.replace(new RegExp(`\\b${w}\\b`, 'i'), '_____')}</p>}
      <div className="answer-box"><span className="answer-value word">{value || '?'}</span></div>
      {msg ? <p className="feedback hint">{msg}</p> : <LetterKeys value={value} setValue={setValue} onEnter={submit} />}
    </div>
  );
}

export function SpellingBee() {
  return (
    <GameShell gameId="bee" subject="spelling" title="Spelling Bee" icon="🐝" scoreLabel="words" rules={['Listen to each word, then spell it.', 'Three wrong and the bee is over.', 'Words from your weekly list come first.']}>
      {(p) => <BeeRound {...p} />}
    </GameShell>
  );
}

// ---------- Word Ladder: change one letter at a time ----------

const LADDERS: { steps: string[]; clues: string[] }[] = [
  { steps: ['cat', 'hat', 'hot', 'dot', 'dog'], clues: ['You wear it on your head', 'The opposite of cold', 'A tiny round spot', 'A pet that barks'] },
  { steps: ['cold', 'cord', 'card', 'ward', 'warm'], clues: ['A thin rope or string', 'A birthday ___', 'A room in a hospital', 'Not cold, not hot'] },
  { steps: ['pig', 'big', 'bag', 'bat', 'cat'], clues: ['Large', 'You carry things in it', 'It flies at night, or you hit a ball with it', 'A pet that meows'] },
  { steps: ['fish', 'dish', 'wish', 'wash', 'cash'], clues: ['A plate or bowl', 'What you make on a birthday candle', 'Clean with water', 'Money'] },
  { steps: ['ten', 'pen', 'pin', 'pit', 'sit'], clues: ['You write with it', 'A sharp little pointer', 'A hole in the ground, or a peach stone', 'Take a seat'] },
  { steps: ['ball', 'bell', 'belt', 'bolt', 'boat'], clues: ['It rings', 'It holds up your pants', 'Lightning ___', 'It floats on water'] },
  { steps: ['snow', 'show', 'shop', 'ship', 'chip'], clues: ['A play or a TV program', 'A store', 'A big boat', 'A potato ___'] },
  { steps: ['puck', 'duck', 'luck', 'lock', 'rock'], clues: ['A bird that quacks', 'Good ___!', 'Use a key to open it', 'A stone'] },
];

function LadderRound({ end, fx }: GameProps) {
  const { profile, data } = useStore();
  const classic = !!data.settings.classicLook;
  const [ladders] = useState(() => shuffle(Math.random, LADDERS).slice(0, 3));
  const [li, setLi] = useState(0);
  const [step, setStep] = useState(1);
  const [value, setValue] = useState('');
  const [msg, setMsg] = useState('');
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const lad = ladders[li];
  const want = lad.steps[step];
  const prev = lad.steps[step - 1];

  const submit = () => {
    if (!value.trim() || msg) return;
    const v = normalize(value);
    if (v === want) {
      setScore((s) => s + 1);
      sfx.coin();
      fx(step + 1 >= lad.steps.length ? 'special' : 'hit', 0.5, 0.45);
      setMsg('');
      setValue('');
      if (step + 1 >= lad.steps.length) {
        if (li + 1 >= ladders.length) end(score + 1, `${score + 1} rungs climbed, ${misses} tries missed`);
        else { setLi(li + 1); setStep(1); }
      } else setStep(step + 1);
      return;
    }
    const diff = v.length === prev.length ? v.split('').filter((c, k) => c !== prev[k]).length : 99;
    setMisses((m) => m + 1);
    sfx.ouch();
    setMsg(diff !== 1 ? `Change just one letter of "${prev}".` : `"${v}" is one letter different, but it doesn't match the clue. Try again!`);
    setValue('');
  };

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (/^[a-zA-Z]$/.test(e.key)) setValue((v) => (v.length < prev.length ? v + e.key.toLowerCase() : v));
      else if (e.key === 'Backspace') setValue((v) => v.slice(0, -1));
      else if (e.key === 'Enter') submit();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  return (
    <div className="center">
      <p className="muted">Ladder {li + 1} of {ladders.length}: get from <b>{lad.steps[0]}</b> to <b>{lad.steps[lad.steps.length - 1]}</b></p>
      <div className={`ladder ${classic ? '' : 'wood'}`}>
        {lad.steps.map((w, k) => (
          <div key={k} className={`rung ${k < step ? 'done' : k === step ? 'now' : ''}`}>
            {k < step || k === lad.steps.length - 1 ? w : k === step ? (value || '?') : '•'.repeat(w.length)}
            {!classic && k === step - 1 && profile && <span className="climber"><AvatarArt look={lookOf(profile)} size={54} background={false} /></span>}
            {!classic && k === lad.steps.length - 1 && <span className="goal-star"><Sprite e="⭐" size={34} /></span>}
          </div>
        ))}
      </div>
      <p className="score">💡 {lad.clues[step - 1]}</p>
      <p className="muted">Change one letter of <b>{prev}</b>.</p>
      {msg && <p className="feedback hint">{msg}</p>}
      <LetterKeys value={value} setValue={setValue} onEnter={submit} />
    </div>
  );
}

export function WordLadder() {
  return (
    <GameShell gameId="ladder" subject="spelling" title="Word Ladder" icon="🪜" scoreLabel="rungs" rules={['Climb from the bottom word to the top word.', 'Change just one letter each step.', 'Use the clue to find each new word.']}>
      {(p) => <LadderRound {...p} />}
    </GameShell>
  );
}

// ---------- Silly Stories: pick the right kind of word ----------

const STORIES: { title: string; text: string }[] = [
  { title: 'The Hockey Game', text: 'Last night my {a} {n} played hockey against a {n}. The goalie {v} so {av} that the crowd {v}. After the game we ate a {a} {n} at the rink.' },
  { title: 'A Day at Banff', text: 'We drove to Banff in a {a} {n}. A {n} {v} across the road and my dad {v} {av}. Then we saw a {a} lake full of {n}s.' },
  { title: 'My Pet Dinosaur', text: 'My pet dinosaur is very {a}. Every morning it {v} into my {n} and eats my {n}. When it is happy it {v} {av}.' },
  { title: 'The Snow Day', text: 'On the snow day I built a {a} snowman with a {n} for a nose. My sister {v} down the hill {av} and landed in a {n}. It was the most {a} day ever!' },
];
const WORDS_BY_TAG: Record<string, string[]> = {
  n: ['banana', 'moose', 'robot', 'pickle', 'teacher', 'rocket', 'sock', 'pizza', 'dragon', 'toaster', 'puck', 'penguin'],
  v: ['danced', 'sneezed', 'jumped', 'giggled', 'zoomed', 'wobbled', 'sang', 'tripped', 'flipped', 'snored'],
  a: ['sparkly', 'gigantic', 'stinky', 'fluffy', 'tiny', 'purple', 'grumpy', 'slimy', 'shiny', 'silly'],
  av: ['loudly', 'quickly', 'slowly', 'happily', 'wildly', 'quietly', 'bravely', 'sleepily'],
};
const TAG_NAME: Record<string, string> = { n: 'noun', v: 'verb (past tense)', a: 'adjective', av: 'adverb' };
const TAG_HELP: Record<string, string> = { n: 'a person, place, animal or thing', v: 'an action word', a: 'a describing word', av: 'a word that tells how (often ends in -ly)' };

function StoryRound({ end, fx }: GameProps) {
  const [story] = useState(() => pick(Math.random, STORIES));
  const blanks = [...story.text.matchAll(/\{(n|v|a|av)\}/g)].map((m) => m[1]);
  const [filled, setFilled] = useState<string[]>([]);
  const [msg, setMsg] = useState('');
  const [misses, setMisses] = useState(0);
  const tag = blanks[filled.length];
  const [chips, setChips] = useState<{ w: string; t: string }[]>([]);
  useEffect(() => {
    if (!tag) return;
    const others = Object.keys(WORDS_BY_TAG).filter((t) => t !== tag);
    const right = shuffle(Math.random, WORDS_BY_TAG[tag]).filter((w) => !filled.includes(w)).slice(0, 2).map((w) => ({ w, t: tag }));
    const wrong = shuffle(Math.random, others).slice(0, 2).map((t) => ({ w: pick(Math.random, WORDS_BY_TAG[t]), t }));
    setChips(shuffle(Math.random, [...right, ...wrong]));
  }, [filled.length]);

  const choose = (c: { w: string; t: string }) => {
    if (c.t !== tag) {
      setMisses((m) => m + 1);
      sfx.ouch();
      setMsg(`"${c.w}" is ${c.t === 'av' ? 'an adverb' : c.t === 'a' ? 'an adjective' : `a ${TAG_NAME[c.t].split(' ')[0]}`}. We need ${tag === 'a' || tag === 'av' ? 'an' : 'a'} ${TAG_NAME[tag]}: ${TAG_HELP[tag]}.`);
      return;
    }
    setMsg('');
    sfx.coin();
    fx('hit', 0.5, 0.35, '#f472b6');
    setFilled((f) => [...f, c.w]);
  };

  let k = 0;
  const parts = story.text.split(/(\{(?:n|v|a|av)\})/g).map((part, idx) => {
    const m = part.match(/^\{(n|v|a|av)\}$/);
    if (!m) return <span key={idx}>{part}</span>;
    const i = k++;
    return <span key={idx} className={`blank t-${m[1]} ${i === filled.length ? 'now' : ''}`}>{filled[i] ?? TAG_NAME[m[1]].split(' ')[0]}</span>;
  });
  const done = filled.length === blanks.length;
  const finalText = () => { let j = 0; return story.text.replace(/\{(n|v|a|av)\}/g, () => filled[j++]); };

  return (
    <div>
      <h2>{story.title}</h2>
      <p className="story">{parts}</p>
      {!done ? (
        <div className="center">
          <p className="score">Pick {tag === 'a' || tag === 'av' ? 'an' : 'a'} <span className={`tagname t-${tag}`}>{TAG_NAME[tag]}</span></p>
          <div className="choices">
            {chips.map((c) => <button key={c.w} className="choice" onClick={() => choose(c)}>{c.w}</button>)}
          </div>
          {msg && <p className="feedback hint">{msg}</p>}
        </div>
      ) : (
        <div className="row">
          <button className="btn ghost" onClick={() => speak(finalText())}>🔊 Read my story</button>
          <button className="btn primary" onClick={() => end(Math.max(blanks.length - misses, 1), `${blanks.length} blanks filled, ${misses} wrong kinds of word`)}>Finish</button>
        </div>
      )}
    </div>
  );
}

export function SillyStories() {
  return (
    <GameShell gameId="stories" subject="grammar" title="Silly Stories" icon="🤪" scoreLabel="points" rules={['Fill in the blanks to make a silly story.', 'Each blank needs a certain kind of word: noun, verb, adjective or adverb.', 'Then have the story read aloud!']}>
      {(p) => <StoryRound {...p} />}
    </GameShell>
  );
}

// ---------- Sentence Builder: put jumbled words in order ----------

const BUILD = [
  'The [small|a] [dog|n] [ran|v] [to|p] the [park|n].', 'We played hockey after school.', 'My sister likes to read books.', 'The moose ate green leaves.',
  'Can you skate on the pond?', 'It snowed all night long.', 'Our class went to the museum.', 'The goalie stopped the puck.', 'I wear mittens in the winter.',
  'Dinosaurs lived in Alberta long ago.', 'Please close the door.', 'The sun is very bright today.',
].map((t) => parseTagged(t).plain);

function BuildRound({ end, fx }: GameProps) {
  const [list] = useState(() => shuffle(Math.random, BUILD).slice(0, 5));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState('');
  const sentence = list[i];
  const words = sentence.split(' ');
  const [order, setOrder] = useState<number[]>(() => shuffle(Math.random, words.map((_, k) => k)));
  useEffect(() => {
    let o = shuffle(Math.random, words.map((_, k) => k));
    if (o.every((v, k) => v === k)) o = o.reverse();
    setOrder(o);
    setPicked([]);
  }, [i]);

  const tap = (k: number) => {
    const next = [...picked, k];
    setPicked(next);
    if (next.length === words.length) {
      const built = next.map((x) => words[x]).join(' ');
      const ok = built === sentence;
      setMsg(ok ? '✅ Great sentence!' : `The sentence is: "${sentence}"`);
      if (ok) { sfx.special(); fx('special', 0.5, 0.25); } else sfx.ouch();
      setTimeout(() => {
        setMsg('');
        const sc = score + (ok ? 1 : 0);
        setScore(sc);
        if (i + 1 >= list.length) end(sc, `${sc} of ${list.length} sentences built`);
        else setI(i + 1);
      }, ok ? 1000 : 2600);
    }
  };

  return (
    <div className="center">
      <p className="muted">Sentence {i + 1} of {list.length}. Start with the word that has a capital letter.</p>
      <p className="built">{picked.map((k) => words[k]).join(' ') || '…'}</p>
      <div className="word-chips">
        {order.map((k) => (
          <button key={k} className="choice brick" disabled={picked.includes(k) || !!msg} onClick={() => { sfx.block(); tap(k); }}>{words[k]}</button>
        ))}
      </div>
      {msg ? <p className="feedback hint">{msg}</p> : <button className="link" onClick={() => setPicked([])}>Start over</button>}
    </div>
  );
}

export function SentenceBuilder() {
  return (
    <GameShell gameId="builder" subject="grammar" title="Sentence Builder" icon="🧱" scoreLabel="sentences" rules={['The words are all mixed up!', 'Tap them in the right order to build the sentence.', 'Look for the capital letter to start, and the end mark to finish.']}>
      {(p) => <BuildRound {...p} />}
    </GameShell>
  );
}
