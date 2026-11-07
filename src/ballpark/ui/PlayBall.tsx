// Play Ball: one game against a made-up Alberta team. Pick subjects, then pitch and bat by answering questions.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../art/sprite';
import { AvatarArt } from '../../avatar/AvatarArt';
import { colorOf } from '../../avatar/catalog';
import { Celebrate, FxLayer, type FxHandle } from '../../battle/fx';
import { useMusic } from '../../battle/music';
import { sfx } from '../../battle/sfx';
import { stopSpeaking } from '../../engine/speech';
import { useStore } from '../../engine/store';
import type { Question, Skill, SubjectId } from '../../engine/types';
import { go } from '../../router';
import { ballOf, payout, type Payout, ballLookOf } from '../data';
import { bat, closeWin, comeback, CLOSE_WIN_COINS, COMEBACK_COINS, newGame, ON_FIRE, onFire, pitch, PITCHES, resultCoins, SWINGS, tierLevel, hitForCycle, winCards, winLuck, type Game, type Pitch, type Play, type Swing } from '../game';
import { ballPerks } from '../gear';
import { gameOvr, scoutBoost, squadOf, teamOvr, type TeamCard } from '../squad';
import { ask, closeBallReviews, dueSkills, levelOf, planSkills, recordBall, XP_RIGHT, XP_WRONG } from '../questions';
import { CHAMPION_COINS, newSeason, nextOpponent, played, PLAYOFF_TEAMS, recordSeasonGame, SEASON_GAMES, stageName, standings, type Season } from '../season';
import { OPPONENTS, type Team } from '../teams';
import { Ask } from './Ask';
import { ALL_SUBJECTS, SubjectPicker } from './SubjectPicker';
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

interface MatchSetup { subjects: SubjectId[]; innings: number; team: Team; season: boolean; /** The team's rating for this game, after scouting you. */ ovr: number }

export function PlayBall() {
  const { profile } = useStore();
  const [setup, setSetup] = useState<MatchSetup | null>(null);
  const [round, setRound] = useState(0);
  if (!profile) return null;
  if (!setup) return <Setup onStart={setSetup} />;
  // A season game goes back to the setup screen, which shows the next opponent.
  return <Match key={round} {...setup} again={() => (setup.season ? setSetup(null) : setRound((r) => r + 1))} />;
}

/** The season to play now: the one in progress, or a new one once the last is over. */
export const currentSeason = (s: Season | undefined) => (!s ? newSeason(1) : s.stage === 'champion' || s.stage === 'out' ? newSeason(s.n + 1) : s);

function Setup({ onStart }: { onStart: (s: MatchSetup) => void }) {
  const { profile, updateProfile } = useStore();
  const [subjects, setSubjects] = useState<SubjectId[]>(ALL_SUBJECTS);
  const [innings, setInnings] = useState(3);
  const [mode, setMode] = useState<'season' | 'quick'>('season');
  const [quick] = useState(() => OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)]);
  useMusic('ballpark');
  const ball = ballOf(profile!);
  const season = currentSeason(ball.season);
  const team = mode === 'season' ? OPPONENTS[nextOpponent(season)!] : quick;
  const round = mode === 'season' ? (season.stage === 'semi' ? 1 : season.stage === 'final' ? 2 : 0) : 0;
  const ovr = gameOvr(team.ovr, ball, round);
  const scout = scoutBoost(ball);
  const start = () => {
    sfx.unlock();
    if (mode === 'season' && season !== ball.season) updateProfile((p) => ({ ...p, ball: { ...ballOf(p), season } }));
    onStart({ subjects, innings, team, season: mode === 'season', ovr });
  };
  return (
    <main className="page ballpark">
      <BallBar back={() => go('')} />
      <section className="card center setup">
        <h1>Play Ball!</h1>
        <div className="subject-chips">
          <button className={`subject-chip ${mode === 'season' ? 'on' : ''}`} onClick={() => setMode('season')} aria-pressed={mode === 'season'}>🏆 Season {season.n} <small>{stageName(season)}</small></button>
          <button className={`subject-chip ${mode === 'quick' ? 'on' : ''}`} onClick={() => setMode('quick')} aria-pressed={mode === 'quick'}>⚾ Quick game <small>doesn't count</small></button>
        </div>
        <p className="muted">{mode === 'season' && season.stage !== 'regular' ? <strong>{stageName(season)}! </strong> : null}You play the <strong>{team.name}</strong> ({ovr} OVR). Your team is {teamOvr(ball)} OVR. You pitch first, then you bat.</p>
        {(scout > 0 || round > 0) && <p className="muted small">🔎 {[scout > 0 && `They scouted your team and gear: +${scout} OVR`, round > 0 && `Playoff intensity: +${ovr - team.ovr - scout} OVR`].filter(Boolean).join('. ')}.</p>}
        <h3>Questions from</h3>
        <SubjectPicker value={subjects} onChange={setSubjects} />
        <h3>How long?</h3>
        <div className="subject-chips">
          {[3, 6].map((n) => (
            <button key={n} className={`subject-chip ${innings === n ? 'on' : ''}`} onClick={() => setInnings(n)} aria-pressed={innings === n}>
              {n} innings <small>{n === 3 ? 'about 5 min' : 'about 10 min'}</small>
            </button>
          ))}
        </div>
        <ul className="rules">
          <li>At bat, pick a swing. Harder questions hit farther: single, double, triple or home run. A wrong answer is an out, and good teams can rob a big hit.</li>
          <li>Pitching, a right answer usually gets the batter out. Good teams can still hit a good pitch. A wrong answer gives up a hit.</li>
          <li>Get {ON_FIRE} right in a row and you're 🔥 on fire: the other team plays at half strength until you miss.</li>
          <li>Win to earn 2 collector cards, or 3 for a big win or a shutout. Close wins and comebacks earn bonus coins.</li>
        </ul>
        {mode === 'season' && <p className="muted small">Play {SEASON_GAMES} games. Finish in the top {PLAYOFF_TEAMS} to make the playoffs, then win the semifinal and the final for the Championship Ring. <a href="#/league">See the standings</a></p>}
        <button className="btn primary big" onClick={start}>⚾ Play ball!</button>
      </section>
    </main>
  );
}

function Match({ subjects, innings, team, season: inSeason, ovr, again }: MatchSetup & { again: () => void }) {
  const { profile, data, setData, updateProfile } = useStore();
  const ball = ballOf(profile!);
  const perks = useMemo(() => ballPerks(ball.gearOn), []);
  const [game, setGame] = useState<Game>(() => newGame(innings, perks, ovr));
  const [plan] = useState(() => planSkills(profile!, subjects, 160, Math.random, Date.now()));
  const [wasDue] = useState(() => dueSkills(profile!, Date.now()));
  const results = useRef<{ skillId: string; correct: boolean }[]>([]);
  // Start at the top so the scoreboard shows.
  useEffect(() => window.scrollTo(0, 0), []);
  const [n, setN] = useState(0);
  const [atBat, setAtBat] = useState<AtBat | null>(null);
  const [play, setPlay] = useState<Play | null>(null);
  const [banner, setBanner] = useState<string | null>('Top of the 1st. You are pitching!');
  const [xp, setXp] = useState(0);
  const [result, setResult] = useState<Payout | null>(null);
  const [after, setAfter] = useState<Season | null>(null);
  const [batter, setBatter] = useState(0);
  const used = useRef(new Set<string>());
  const run = useRef({ now: 0, best: 0 });
  const fx = useRef<FxHandle>(null);
  const soundOn = data.settings.sound !== false;
  useMusic(result ? undefined : 'ballpark');

  // Your batting order: you lead off, then the cards in your Dugout lineup. Your ace pitches.
  const squad = useMemo(() => squadOf(ball), []);
  const lineup = useMemo<(TeamCard | null)[]>(() => [null, ...squad.lineup], []);

  if (!profile) return null;
  const look = ballLookOf(profile);
  const myColor = colorOf(look.topColor, '#2563eb');
  const myTeam = `${profile.name}'s Sluggers`;
  const batting = game.half === 'bottom';
  const skill = plan[n % plan.length];
  const lvl = levelOf(profile, skill);
  const up = lineup[batter % lineup.length];
  const atBatPerks = batting
    ? { ...perks, star: up ? { name: up.player.name, boost: up.boost } : undefined }
    : { ...perks, ace: squad.ace ? { name: squad.ace.player.name, boost: squad.ace.boost } : undefined };

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
    const r = batting ? bat(game, atBat.choice as Swing, correct, Math.random, atBatPerks) : pitch(game, atBat.choice as Pitch, correct, Math.random, atBatPerks);
    run.current.now = correct ? run.current.now + 1 : 0;
    run.current.best = Math.max(run.current.best, run.current.now);
    setGame(r.game);
    setPlay(r.play);
    setXp((x) => x + (correct ? XP_RIGHT : XP_WRONG));
    updateProfile((p) => recordBall(p, atBat.skill, atBat.q, correct, seconds, atBat.level, now));
    if (r.play.kind !== 'foul') results.current.push({ skillId: atBat.skill.id, correct });
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
      const win = g.result === 'win';
      const winStreak = win ? (ball.winStreak ?? 0) + 1 : 0;
      const before = inSeason ? currentSeason(ball.season) : undefined;
      const s = before ? recordSeasonGame(before, g.you, g.them, Math.random) : undefined;
      const champion = s?.stage === 'champion';
      const moments = { walkoff: win && !!g.walkoff, shutout: win && g.them === 0, cycle: hitForCycle(g), winStreak, answerRun: run.current.best, champion };
      // Champions get 100 coins and a bonus card on top of the winner's cards.
      const out = payout(ball, earned, coins + (champion ? CHAMPION_COINS : 0), winLuck(g, perks), perks.coinBonus ?? 0, Math.random, Date.now(), winCards(g) + (champion ? 1 : 0), moments);
      const rec = { ...ball.record };
      if (g.result === 'win') rec.w += 1; else if (g.result === 'loss') rec.l += 1; else rec.t += 1;
      updateProfile((pr) => ({ ...closeBallReviews(pr, results.current, wasDue, Date.now()), ball: { ...out.ball, record: rec, winStreak, ...(s ? { season: s, titles: (ball.titles ?? 0) + (champion ? 1 : 0) } : {}) } }));
      setAfter(s ?? null);
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

  if (result) return <Final game={game} payout={result} myTeam={myTeam} team={team} season={after} again={again} />;

  return (
    <main className="page ballpark match">
      <BallBar back={leave} />
      <Scoreboard g={game} you={myTeam} them={team.name} />
      <Field bases={game.bases} play={play ?? undefined} runner={batting ? myColor : team.colors[0]}>
        {batting ? (
          <>
            <OnField {...SPOTS.mound} className="small"><TheirPlayer color={team.colors[0]} trim={team.colors[1]} pose="pitch" size={54} /></OnField>
            <OnField {...SPOTS.plate}>{up ? <Figure color={myColor} trim="#fff" pose="bat" skin={[...up.player.id].reduce((n, c) => n + c.charCodeAt(0), 0)} size={84} /> : <AvatarArt look={look} size={76} background={false} full />}</OnField>
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
          {onFire(game) && <p className="banner on-fire">🔥 On fire! {game.streak} right in a row. The {team.name} play at half strength until you miss.</p>}
          {!onFire(game) && (game.streak ?? 0) >= ON_FIRE - 2 && <p className="muted small">🔥 {ON_FIRE - (game.streak ?? 0)} more right in a row and you're on fire!</p>}
          <p className="at-bat">
            {batting ? <>Now batting: <strong>{up ? up.player.name : profile.name}</strong></> : <>You're pitching to the {team.name}.</>}
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
          {batting && up && <p className="star-boost">⭐ {up.player.name} · {up.ovr} OVR: a right answer has a {Math.round(up.boost * 100)}% chance of an extra base</p>}
          {!batting && squad.ace && <p className="star-boost">⭐ Your ace {squad.ace.player.name} · {squad.ace.ovr} OVR: {Math.round(squad.ace.boost * 100)}% chance to escape a wrong answer with a strikeout</p>}
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

function Final({ game, payout: pay, myTeam, team, season, again }: { game: Game; payout: Payout; myTeam: string; team: Team; season: Season | null; again: () => void }) {
  const win = game.result === 'win';
  useEffect(() => window.scrollTo(0, 0), []);
  const cards = winCards(game) + (season?.stage === 'champion' ? 1 : 0);
  return (
    <main className="page ballpark">
      <BallBar back={() => go('')} />
      <section className="card center summary final">
        {win && <Celebrate big />}
        <h1>{win ? (game.walkoff ? 'Walk-off win!' : comeback(game) ? 'Comeback win!' : 'You win!') : game.result === 'tie' ? "It's a tie!" : game.them - game.you <= 2 ? 'So close!' : `The ${team.name} win this one`}</h1>
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
        {(closeWin(game) || comeback(game)) && <p className="good">{closeWin(game) && `Nail-biter bonus: +${CLOSE_WIN_COINS} coins. `}{comeback(game) && `Comeback bonus: +${COMEBACK_COINS} coins.`}</p>}
        {!game.stats.right && <p className="muted">No right answers this game, so no coins. Every right answer counts!</p>}
        {season && <SeasonNote s={season} myTeam={myTeam} />}
        {pay.rankUp && <p className="good"><Icon e="🎉" /> You were promoted to {pay.rankUp}! Here's a bonus card.</p>}
        {!win && <p className="muted">Win a game to earn 2 collector cards, or 3 for a big win. Try a Home Run Derby too: every derby earns at least one card!</p>}
        {pay.pulls.map((c, i) => (
          <CardReveal key={i} player={c.player} parallel={c.parallel} serial={c.serial} isNew={c.isNew} coins={c.coins} label={c.parallel === 'milestone' ? 'Special card unlocked!' : win && i < winCards(game) ? `Winner's card ${i + 1} of ${winCards(game)}` : win && i < cards ? "Champion's bonus card" : 'Promotion bonus'} />
        ))}
        <div className="row">
          <button className="btn ghost" onClick={() => go('')}>Clubhouse</button>
          {season ? <button className="btn ghost" onClick={() => go('league')}>Standings</button> : null}
          <button className="btn primary" onClick={again}>{season ? (season.stage === 'champion' || season.stage === 'out' ? 'Start next season' : 'Next game') : 'Play again'}</button>
        </div>
      </section>
    </main>
  );
}

function SeasonNote({ s, myTeam }: { s: Season; myTeam: string }) {
  const table = standings(s, myTeam);
  const place = table.findIndex((r) => r.you) + 1;
  const last = s.log.at(-1);
  const tiedPlayoff = last?.playoff && last.you === last.them;
  const text =
    s.stage === 'champion' ? `🏆 CHAMPIONS! ${myTeam} win Season ${s.n}!`
    : s.stage === 'final' ? `On to the Championship Final against the ${OPPONENTS[s.opp!].name}!`
    : s.stage === 'semi' && tiedPlayoff ? 'A tie in the playoffs means a replay. Win it to move on!'
    : s.stage === 'semi' ? `You made the playoffs as the ${s.seed} seed! Next: the semifinal against the ${OPPONENTS[s.opp!].name}.`
    : s.stage === 'out' && last?.playoff ? `Your season ends in the ${s.log.filter((g) => g.playoff).length > 1 ? 'final' : 'semifinal'}. Great run! Start a new season to try again.`
    : s.stage === 'out' ? `Season over: you finished ${place}${['th', 'st', 'nd', 'rd'][place] ?? 'th'}. The top ${PLAYOFF_TEAMS} make the playoffs. Try again next season!`
    : `Season ${s.n}: you're ${s.you.w}-${s.you.l}${s.you.t ? `-${s.you.t}` : ''}, in ${place}${['th', 'st', 'nd', 'rd'][place] ?? 'th'} place with ${SEASON_GAMES - played(s)} game${SEASON_GAMES - played(s) === 1 ? '' : 's'} left.`;
  return <p className={`season-note ${s.stage}`}>{text}</p>;
}
