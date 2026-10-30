// Play Ball: one game against a made-up Alberta team. Pick subjects, then pitch and bat by answering questions.

import { useMemo, useRef, useState } from 'react';
import { Icon } from '../../art/sprite';
import { AvatarArt } from '../../avatar/AvatarArt';
import { colorOf, lookOf } from '../../avatar/catalog';
import { Celebrate, FxLayer, type FxHandle } from '../../battle/fx';
import { useMusic } from '../../battle/music';
import { sfx } from '../../battle/sfx';
import { stopSpeaking } from '../../engine/speech';
import { useStore } from '../../engine/store';
import type { Question, Skill, SubjectId } from '../../engine/types';
import { go } from '../../router';
import { RANK } from '../cards';
import { ballOf, payout, type Payout } from '../data';
import { bat, newGame, pitch, PITCHES, resultCoins, SWINGS, tierLevel, winLuck, type Game, type Pitch, type Play, type Swing } from '../game';
import { ballPerks } from '../gear';
import { playerById, type Player } from '../players';
import { ask, BALL_SUBJECTS, levelOf, planSkills, recordBall, XP_RIGHT, XP_WRONG } from '../questions';
import { OPPONENTS, type Team } from '../teams';
import { Ask } from './Ask';
import { BallBar } from './BallBar';
import { CardReveal } from './Card';
import { Field, OnField, SPOTS, TheirPlayer } from './Field';
import { Figure } from './Figure';
import { inningName, Scoreboard } from './Scoreboard';

const DIFF = ['Easier', 'Your level', 'Harder', 'Hardest'];
const HITS = ['single', 'double', 'triple', 'hr'];

/** A hit for you, an out for them, or a foul that keeps you alive. */
const goodFor = (p: Play) => (p.side === 'you' ? HITS.includes(p.kind) || p.kind === 'foul' : !HITS.includes(p.kind));

interface AtBat {
  skill: Skill;
  level: number;
  clock?: number;
  choice: Swing | Pitch;
  q: Question;
}

export function PlayBall() {
  const { profile } = useStore();
  const [setup, setSetup] = useState<{ subjects: SubjectId[]; innings: number; team: Team } | null>(null);
  const [round, setRound] = useState(0);
  if (!profile) return null;
  if (!setup) return <Setup onStart={setSetup} />;
  return <Match key={round} {...setup} again={() => setRound((r) => r + 1)} />;
}

function Setup({ onStart }: { onStart: (s: { subjects: SubjectId[]; innings: number; team: Team }) => void }) {
  const [subjects, setSubjects] = useState<SubjectId[]>(BALL_SUBJECTS.map((s) => s.id));
  const [innings, setInnings] = useState(3);
  const [team] = useState(() => OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)]);
  useMusic('ballpark');
  const toggle = (id: SubjectId) => setSubjects((s) => (s.includes(id) ? (s.length > 1 ? s.filter((x) => x !== id) : s) : [...s, id]));
  return (
    <main className="page ballpark">
      <BallBar back={() => go('')} />
      <section className="card center setup">
        <h1>Play Ball!</h1>
        <p className="muted">Today you play the <strong>{team.name}</strong>. You pitch first, then you bat.</p>
        <h3>Questions from</h3>
        <div className="subject-chips">
          {BALL_SUBJECTS.map((s) => (
            <button key={s.id} className={`subject-chip ${subjects.includes(s.id) ? 'on' : ''}`} style={{ ['--tile' as string]: s.color }} onClick={() => toggle(s.id)} aria-pressed={subjects.includes(s.id)}>
              <Icon e={s.icon} /> {s.name}
            </button>
          ))}
        </div>
        <h3>How long?</h3>
        <div className="subject-chips">
          {[3, 6].map((n) => (
            <button key={n} className={`subject-chip ${innings === n ? 'on' : ''}`} onClick={() => setInnings(n)} aria-pressed={innings === n}>
              {n} innings <small>{n === 3 ? 'about 15 min' : 'about 30 min'}</small>
            </button>
          ))}
        </div>
        <ul className="rules">
          <li>At bat, pick a swing. Harder questions hit farther: single, double, triple or home run. A wrong answer is an out.</li>
          <li>Pitching, a right answer gets the batter out. Harder pitches are surer outs. A wrong answer gives up a hit.</li>
          <li>Win the game to earn a collector card!</li>
        </ul>
        <button className="btn primary big" onClick={() => { sfx.unlock(); onStart({ subjects, innings, team }); }}>⚾ Play ball!</button>
      </section>
    </main>
  );
}

function Match({ subjects, innings, team, again }: { subjects: SubjectId[]; innings: number; team: Team; again: () => void }) {
  const { profile, data, setData, updateProfile } = useStore();
  const ball = ballOf(profile!);
  const perks = useMemo(() => ballPerks(ball.gearOn), []);
  const [game, setGame] = useState<Game>(() => newGame(innings, perks));
  const [plan] = useState(() => planSkills(profile!, subjects, 160, Math.random, Date.now()));
  const [n, setN] = useState(0);
  const [atBat, setAtBat] = useState<AtBat | null>(null);
  const [play, setPlay] = useState<Play | null>(null);
  const [banner, setBanner] = useState<string | null>('Top of the 1st. You are pitching!');
  const [xp, setXp] = useState(0);
  const [result, setResult] = useState<Payout | null>(null);
  const [batter, setBatter] = useState(0);
  const used = useRef(new Set<string>());
  const fx = useRef<FxHandle>(null);
  const soundOn = data.settings.sound !== false;
  useMusic(result ? undefined : 'ballpark');

  // Your batting order: you lead off, then your best hitter cards.
  const lineup = useMemo<(Player | null)[]>(() => {
    const best = new Map<string, number>();
    for (const key of Object.keys(ball.cards)) {
      const [id, par] = key.split(':');
      best.set(id, Math.max(best.get(id) ?? -1, RANK[par as keyof typeof RANK]));
    }
    const hitters = [...best.entries()].map(([id, r]) => ({ p: playerById(id), r })).filter((x) => x.p?.role === 'hitter').sort((a, b) => b.r - a.r).slice(0, 8);
    return [null, ...hitters.map((x) => x.p!)];
  }, []);

  if (!profile) return null;
  const look = lookOf(profile);
  const myColor = colorOf(look.topColor, '#2563eb');
  const myTeam = `${profile.name}'s Sluggers`;
  const batting = game.half === 'bottom';
  const skill = plan[n % plan.length];
  const lvl = levelOf(profile, skill);
  const up = lineup[batter % lineup.length];

  const choose = (choice: Swing | Pitch, offset: number) => {
    sfx.unlock();
    setBanner(null);
    setPlay(null);
    const t = tierLevel(skill.levels.length, lvl, offset);
    setAtBat({ skill, level: t.level, clock: t.clock, choice, q: ask(profile, skill, t.level, used.current) });
  };

  const onAnswer = (correct: boolean, seconds: number) => {
    if (!atBat) return;
    const now = Date.now();
    const r = batting ? bat(game, atBat.choice as Swing, correct, Math.random, perks) : pitch(game, atBat.choice as Pitch, correct, Math.random, perks);
    setGame(r.game);
    setPlay(r.play);
    setXp((x) => x + (correct ? XP_RIGHT : XP_WRONG));
    updateProfile((p) => recordBall(p, atBat.skill, atBat.q, correct, seconds, atBat.level, now));
    const k = r.play.kind;
    if (k === 'hr' && r.play.side === 'you') { sfx.special(); setTimeout(() => fx.current?.burst('confetti', 0.5, 0.2), 900); }
    else if (k === 'hr') sfx.growl();
    else if (k === 'single' || k === 'double' || k === 'triple') (r.play.side === 'you' ? sfx.crit : sfx.hit)();
    else if (k === 'foul') sfx.block();
    else r.play.side === 'you' ? sfx.ouch() : sfx.coin();
  };

  const next = () => {
    stopSpeaking();
    const g = game;
    const p = play;
    setAtBat(null);
    setN((x) => x + 1);
    if (batting && p && p.kind !== 'foul') setBatter((b) => b + 1);
    if (g.over) {
      const earned = xp;
      const coins = g.coins + resultCoins(g);
      const out = payout(ball, earned, coins, winLuck(g, perks), perks.coinBonus ?? 0, Math.random, Date.now());
      const rec = { ...ball.record };
      if (g.result === 'win') rec.w += 1; else if (g.result === 'loss') rec.l += 1; else rec.t += 1;
      updateProfile((pr) => ({ ...pr, ball: { ...out.ball, record: rec } }));
      setResult(out.payout);
      if (g.result === 'win') sfx.fanfare();
      return;
    }
    // A new half-inning: say whose turn it is.
    if (p && (g.half !== (p.side === 'you' ? 'bottom' : 'top'))) {
      const why = g.half === 'bottom' ? (game.runRule ? 'They hit the 5-run limit. ' : 'Three outs! ') : game.runRule ? 'You hit the 5-run limit! ' : 'Three outs. ';
      setBanner(`${why}${inningName(g)}: ${g.half === 'bottom' ? 'your turn to bat!' : 'back to the mound.'}`);
    }
  };

  const leave = () => {
    if (result || window.confirm('Leave this game? You keep what you learned, but not the coins or a card.')) {
      stopSpeaking();
      go('');
    }
  };

  if (result) return <Final game={game} payout={result} myTeam={myTeam} team={team} again={again} />;

  return (
    <main className="page ballpark match">
      <BallBar back={leave} />
      <Scoreboard g={game} you={myTeam} them={team.name} />
      <Field bases={game.bases} play={play ?? undefined} runner={batting ? myColor : team.colors[0]}>
        {batting ? (
          <>
            <OnField {...SPOTS.mound} className="small"><TheirPlayer color={team.colors[0]} trim={team.colors[1]} pose="pitch" size={54} /></OnField>
            <OnField {...SPOTS.plate}>{up ? <Figure color={myColor} trim="#fff" pose="bat" skin={batter} size={84} /> : <AvatarArt look={look} size={76} background={false} full />}</OnField>
          </>
        ) : (
          <>
            <OnField {...SPOTS.mound} className="small"><AvatarArt look={look} size={56} background={false} full /></OnField>
            <OnField {...SPOTS.plate}><TheirPlayer color={team.colors[0]} trim={team.colors[1]} pose="bat" size={84} /></OnField>
          </>
        )}
        <FxLayer ref={fx} />
        <button className="sound-toggle" onClick={() => setData((d) => ({ ...d, settings: { ...d.settings, sound: !soundOn } }))} aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}>{soundOn ? '🔊' : '🔇'}</button>
      </Field>

      {!atBat && (
        <section className="card choose">
          {banner && <p className="banner">{banner}</p>}
          <p className="at-bat">
            {batting ? <>Now batting: <strong>{up ? up.name : profile.name}</strong></> : <>You're pitching to the {team.name}.</>}
            <span className="chip">{skill.icon} {skill.name}</span>
          </p>
          {batting ? (
            <div className="swing-grid">
              {SWINGS.map((s, i) => {
                const t = tierLevel(skill.levels.length, lvl, s.offset);
                return (
                  <button key={s.id} className={`swing s-${s.id}`} onClick={() => choose(s.id, s.offset)}>
                    <strong>{s.hit}</strong>
                    <span>{s.name}</span>
                    <small>{DIFF[i]} · {skill.levels[t.level]}{t.clock ? ` · ⏱️ ${t.clock}s` : ''}</small>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="swing-grid three">
              {PITCHES.map((p, i) => {
                const t = tierLevel(skill.levels.length, lvl, p.offset);
                return (
                  <button key={p.id} className={`swing p-${p.id}`} onClick={() => choose(p.id, p.offset)}>
                    <strong>{p.name}</strong>
                    <span>{p.does}</span>
                    <small>{DIFF[i]} · {skill.levels[t.level]}{t.clock ? ` · ⏱️ ${t.clock}s` : ''}</small>
                  </button>
                );
              })}
            </div>
          )}
          {batting && game.fouls > 0 && <p className="muted small">🛡️ {game.fouls} foul ball{game.fouls > 1 ? 's' : ''} left this game</p>}
        </section>
      )}

      {atBat && (
        <Ask key={n} q={atBat.q} skill={atBat.skill} level={atBat.level} clock={atBat.clock} readAloud={data.settings.readAloud} onAnswer={onAnswer} onNext={next} nextLabel={game.over ? 'See the final score →' : 'Next batter →'}>
          {play && (
            <p className={`play-call ${goodFor(play) ? 'good-call' : 'bad-call'}`}>
              <strong>{play.text}</strong>
              {play.runs > 0 && <> {play.runs} run{play.runs > 1 ? 's' : ''} score{play.runs > 1 ? '' : 's'}!</>}
              {play.coins > 0 && <span className="coins-pop"> +{play.coins} 🪙</span>}
            </p>
          )}
        </Ask>
      )}
    </main>
  );
}

function Final({ game, payout: pay, myTeam, team, again }: { game: Game; payout: Payout; myTeam: string; team: Team; again: () => void }) {
  const win = game.result === 'win';
  return (
    <main className="page ballpark">
      <BallBar back={() => go('')} />
      <section className="card center summary final">
        {win && <Celebrate big />}
        <h1>{win ? (game.walkoff ? 'Walk-off win!' : 'You win!') : game.result === 'tie' ? "It's a tie!" : 'Good game!'}</h1>
        <p className="final-score"><span>{myTeam}</span> <b>{game.you}</b> – <b>{game.them}</b> <span>{team.name}</span></p>
        <Scoreboard g={game} you={myTeam} them={team.name} />
        <div className="loot-row">
          <div><strong>{game.stats.right}/{game.stats.asked}</strong><span>right</span></div>
          <div><strong>{game.stats.hits}</strong><span>hits</span></div>
          <div><strong>{game.stats.hrs}</strong><span>home runs</span></div>
          <div><strong>{game.stats.ks}</strong><span>strikeouts</span></div>
          <div><strong>+{pay.xp}</strong><span>XP</span></div>
          <div><strong>+{pay.coins}</strong><span>coins</span></div>
        </div>
        {pay.rankUp && <p className="good"><Icon e="🎉" /> You were promoted to {pay.rankUp}! Here's a bonus card.</p>}
        {!win && <p className="muted">Win a game to earn a collector card. Try a Home Run Derby too: every derby earns a card!</p>}
        {pay.pulls.map((c, i) => (
          <CardReveal key={i} player={c.player} parallel={c.parallel} serial={c.serial} isNew={c.isNew} coins={c.coins} label={i === 0 && win ? 'Winner\'s card' : 'Promotion bonus'} />
        ))}
        <div className="row">
          <button className="btn ghost" onClick={() => go('')}>Clubhouse</button>
          <button className="btn primary" onClick={again}>Play again</button>
        </div>
      </section>
    </main>
  );
}
