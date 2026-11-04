// The league: standings for the season, your results, and the playoff picture.

import { useMusic } from '../../battle/music';
import { useStore } from '../../engine/store';
import { go } from '../../router';
import { ballOf } from '../data';
import { teamOvr } from '../squad';
import { nextOpponent, played, PLAYOFF_TEAMS, SEASON_GAMES, stageName, standings } from '../season';
import { OPPONENTS } from '../teams';
import { BallBar } from './BallBar';
import { currentSeason } from './PlayBall';

export function League() {
  const { profile } = useStore();
  useMusic('ballpark');
  if (!profile) return null;
  const b = ballOf(profile);
  // Show the season just finished until a new one starts.
  const s = b.season ?? currentSeason(undefined);
  const me = `${profile.name}'s Sluggers`;
  const table = standings(s, me);
  const next = nextOpponent(s);
  return (
    <main className="page ballpark binder-page league">
      <BallBar back={() => go('')} />
      <section className="album-cover">
        <div className="album-title">
          <small>Ballpark League · Season {s.n}</small>
          <h1>{s.stage === 'champion' ? 'Champions!' : 'Standings'}</h1>
        </div>
        <div className="album-count"><b>{s.you.w}-{s.you.l}{s.you.t ? `-${s.you.t}` : ''}</b><span>{stageName(s)}</span></div>
        <div className="album-bar"><span style={{ width: `${(played(s) / SEASON_GAMES) * 100}%` }} /></div>
        <p className="album-note">
          {s.stage === 'regular' ? `${SEASON_GAMES - played(s)} games left. The top ${PLAYOFF_TEAMS} make the playoffs: 1st plays 4th and 2nd plays 3rd, then the winners meet in the final.`
            : s.stage === 'semi' || s.stage === 'final' ? `You're the ${s.seed} seed. Next: the ${stageName(s).toLowerCase()} against the ${OPPONENTS[next!].name}.`
            : s.stage === 'champion' ? `${me} won Season ${s.n}! Titles won: ${b.titles ?? 1}.`
            : 'This season is over. Your next game starts a new season.'}
          {' '}Your team: {teamOvr(b)} OVR.{b.titles ? ` 🏆 × ${b.titles}` : ''}
        </p>
        <button className="btn album-btn" onClick={() => go('game')}>{s.stage === 'champion' || s.stage === 'out' ? 'Start next season' : next !== undefined ? `Play the ${OPPONENTS[next].name}` : 'Play ball'}</button>
      </section>

      <section className="album-sec">
        <h2 className="album-head"><span>Standings</span><small>W · L · T</small></h2>
        <table className="standings">
          <tbody>
            {table.map((r, i) => (
              <tr key={r.name} className={`${r.you ? 'you' : ''} ${i === PLAYOFF_TEAMS - 1 ? 'cut' : ''}`}>
                <td className="st-n">{i + 1}</td>
                <td className="st-team"><i style={{ background: r.team ? `linear-gradient(135deg, ${r.team.colors[0]} 50%, ${r.team.colors[1]} 50%)` : 'linear-gradient(135deg, #d6b86a 50%, #1e3a8a 50%)' }} />{r.name}{r.team ? <small>{r.team.ovr}</small> : <small>{teamOvr(b)}</small>}</td>
                <td className="st-rec">{r.rec.w}</td><td className="st-rec">{r.rec.l}</td><td className="st-rec">{r.rec.t}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="album-note">The line shows the playoff cut. The small number is each team's overall.</p>
      </section>

      {s.log.length > 0 && (
        <section className="album-sec">
          <h2 className="album-head"><span>Your games</span><small>{s.log.length}</small></h2>
          <ol className="results">
            {s.log.map((g, i) => {
              const res = g.you > g.them ? 'W' : g.you < g.them ? 'L' : 'T';
              return (
                <li key={i} className={`res-${res}`}>
                  <b>{res}</b>
                  <span>{g.playoff ? 'Playoff · ' : ''}{OPPONENTS[g.opp].name}</span>
                  <span className="res-score">{g.you}–{g.them}</span>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </main>
  );
}
