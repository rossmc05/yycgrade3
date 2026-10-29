import { useRef, useState, type ReactNode } from 'react';
import { Sprite } from '../art/sprite';
import { Celebrate, FxLayer, type BurstKind, type FxHandle } from '../battle/fx';
import { useMusic, type Theme } from '../battle/music';
import { sfx } from '../battle/sfx';
import { TopBar } from '../components/TopBar';
import { finishGame } from '../engine/progress';
import { checkBadges } from '../engine/rewards';
import { useStore } from '../engine/store';
import type { SubjectId } from '../engine/types';
import { go } from '../router';
import { ALL_SKILLS } from '../subjects';
import { medalFor, MEDAL_ICON, nextGoal, type Medal } from './medals';
import { gameById } from './registry';

export interface GameProps {
  /** Call when the round is over, with the score to keep. */
  end: (score: number, summary?: string) => void;
  /** Particles over the play area, at x, y as fractions of its size. */
  fx: (kind: BurstKind, x: number, y: number, accent?: string) => void;
}

const THEMES: Record<SubjectId, Theme> = { math: 'math', spelling: 'spelling', grammar: 'grammar', science: 'science', typing: 'map' };
const MEDAL_NAME = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

function MedalRow({ medals, best }: { medals: [number, number, number]; best: number }) {
  const won = medalFor(best, medals);
  const rank = won === 'gold' ? 3 : won === 'silver' ? 2 : won === 'bronze' ? 1 : 0;
  return (
    <div className="medal-row">
      {(['bronze', 'silver', 'gold'] as const).map((m, i) => (
        <div key={m} className={`medal-goal ${i < rank ? 'won' : ''}`}>
          <Sprite e={MEDAL_ICON[m]} size={40} label={`${MEDAL_NAME[m]} medal`} />
          <small>{medals[i]}+</small>
        </div>
      ))}
    </div>
  );
}

/** Intro, play and results screens shared by every arcade game. */
export function GameShell({ gameId, subject, title, icon, rules, scoreLabel, introExtra, theme, children }: {
  gameId: string;
  subject: SubjectId;
  title: string;
  icon: string;
  rules: string[];
  scoreLabel: string;
  introExtra?: ReactNode;
  /** Music while playing (defaults to the subject's). */
  theme?: Theme;
  children: (props: GameProps) => ReactNode;
}) {
  const { profile, updateProfile, data } = useStore();
  const classic = !!data.settings.classicLook;
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<{ score: number; xp: number; best: boolean; summary?: string; medal: Medal; newMedal: boolean } | null>(null);
  const started = useRef(Date.now());
  const fxRef = useRef<FxHandle>(null);
  useMusic(phase === 'play' ? theme ?? THEMES[subject] : undefined);
  if (!profile) return null;
  const best = profile.games?.[gameId]?.best;
  const game = gameById(gameId);
  const medals = game?.medals;
  const fx: GameProps['fx'] = (kind, x, y, accent) => fxRef.current?.burst(kind, x, y, accent);

  const start = () => {
    started.current = Date.now();
    setRound((r) => r + 1);
    setPhase('play');
  };

  const end = (score: number, summary?: string) => {
    const now = Date.now();
    const out = finishGame(profile, gameId, subject, score, (now - started.current) / 1000, now);
    updateProfile(() => checkBadges(out.profile, ALL_SKILLS, now).profile);
    const medal = medals ? medalFor(score, medals) : null;
    const before = medals ? medalFor(best ?? 0, medals) : null;
    const rank = (m: Medal) => (m === 'gold' ? 3 : m === 'silver' ? 2 : m === 'bronze' ? 1 : 0);
    setResult({ score, xp: out.xp, best: out.best && score > 0, summary, medal, newMedal: rank(medal) > rank(before) });
    if (!classic) (medal ? sfx.fanfare : sfx.coin)();
    setPhase('done');
  };

  return (
    <main className="page">
      <TopBar back={() => go('arcade')} />
      <section className="card game" style={{ ['--cab' as string]: game?.color ?? '#7c3aed' }}>
        {phase === 'intro' && (
          <div className="center">
            {classic ? <div className="big-emoji">{icon}</div> : <div className="game-banner"><Sprite e={icon} size={110} /></div>}
            <h1>{title}</h1>
            <ul className="rules">{rules.map((r) => <li key={r}>{r}</li>)}</ul>
            {introExtra}
            {medals && <MedalRow medals={medals} best={best ?? 0} />}
            {best !== undefined && <p className="muted">Your best: {best} {scoreLabel}</p>}
            <button className="btn primary big" onClick={() => { sfx.unlock(); start(); }}>▶ Play</button>
          </div>
        )}
        {phase === 'play' && (
          <div key={round} className="game-play">
            {children({ end, fx })}
            {!classic && <FxLayer ref={fxRef} />}
          </div>
        )}
        {phase === 'done' && result && (
          <div className="center summary game-done">
            {!classic && (result.newMedal || result.best) && <Celebrate big={result.newMedal} />}
            {classic || !result.medal ? <div className="big-emoji">{result.best ? '🏆' : '🎉'}</div> : <div className="medal-won"><Sprite e={MEDAL_ICON[result.medal]} size={120} label={`${MEDAL_NAME[result.medal]} medal`} /></div>}
            <h1>{result.score} {scoreLabel}</h1>
            {result.summary && <p className="score">{result.summary}</p>}
            {result.newMedal && result.medal && <p className="good">You won a {MEDAL_NAME[result.medal].toLowerCase()} medal!</p>}
            {result.best && !result.newMedal && <p className="good">New personal best!</p>}
            {medals && (() => { const g = nextGoal(Math.max(result.score, best ?? 0), medals); return g ? <p className="muted">Next goal: {g.score} {scoreLabel} for {g.medal}.</p> : <p className="muted">You have every medal. Can you beat {Math.max(result.score, best ?? 0)}?</p>; })()}
            <p className="xp-gain">+{result.xp} XP · +{Math.ceil(result.xp / 2)} 🪙</p>
            <div className="row">
              <button className="btn ghost" onClick={() => go('arcade')}>Arcade</button>
              <button className="btn primary" onClick={start}>Play again</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
