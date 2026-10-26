import { useRef, useState, type ReactNode } from 'react';
import { TopBar } from '../components/TopBar';
import { finishGame } from '../engine/progress';
import { checkBadges } from '../engine/rewards';
import { useStore } from '../engine/store';
import type { SubjectId } from '../engine/types';
import { go } from '../router';
import { ALL_SKILLS } from '../subjects';

export interface GameProps {
  /** Call when the round is over, with the score to keep. */
  end: (score: number, summary?: string) => void;
}

/** Intro, play and results screens shared by every arcade game. */
export function GameShell({ gameId, subject, title, icon, rules, scoreLabel, introExtra, children }: {
  gameId: string;
  subject: SubjectId;
  title: string;
  icon: string;
  rules: string[];
  scoreLabel: string;
  introExtra?: ReactNode;
  children: (props: GameProps) => ReactNode;
}) {
  const { profile, updateProfile } = useStore();
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<{ score: number; xp: number; best: boolean; summary?: string } | null>(null);
  const started = useRef(Date.now());
  if (!profile) return null;
  const best = profile.games?.[gameId]?.best;

  const start = () => {
    started.current = Date.now();
    setRound((r) => r + 1);
    setPhase('play');
  };

  const end = (score: number, summary?: string) => {
    const now = Date.now();
    const out = finishGame(profile, gameId, subject, score, (now - started.current) / 1000, now);
    updateProfile(() => checkBadges(out.profile, ALL_SKILLS, now).profile);
    setResult({ score, xp: out.xp, best: out.best && score > 0, summary });
    setPhase('done');
  };

  return (
    <main className="page">
      <TopBar back={() => go('arcade')} />
      <section className="card game">
        {phase === 'intro' && (
          <div className="center">
            <div className="big-emoji">{icon}</div>
            <h1>{title}</h1>
            <ul className="rules">{rules.map((r) => <li key={r}>{r}</li>)}</ul>
            {introExtra}
            {best !== undefined && <p className="muted">Your best: {best} {scoreLabel}</p>}
            <button className="btn primary big" onClick={start}>▶ Play</button>
          </div>
        )}
        {phase === 'play' && <div key={round}>{children({ end })}</div>}
        {phase === 'done' && result && (
          <div className="center summary">
            <div className="big-emoji">{result.best ? '🏆' : '🎉'}</div>
            <h1>{result.score} {scoreLabel}</h1>
            {result.summary && <p className="score">{result.summary}</p>}
            {result.best && <p className="good">New personal best!</p>}
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
