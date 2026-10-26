import { TopBar } from '../components/TopBar';
import { isReviewDue, status, topLevelAccuracy } from '../engine/adaptive';
import { useStore } from '../engine/store';
import { go } from '../router';
import { findSubject } from '../subjects';

const STATUS_LABEL = { new: 'New', practising: 'Practising', mastered: 'Mastered ⭐' };

export function SubjectScreen({ subjectId }: { subjectId: string }) {
  const { profile } = useStore();
  const subject = findSubject(subjectId);
  if (!profile || !subject) return null;
  const now = Date.now();
  const strands = [...new Set(subject.skills.map((s) => s.strand))];

  return (
    <main className="page">
      <TopBar back={() => go('')} />
      <section className="subject-head" style={{ ['--tile' as string]: subject.color }}>
        <span className="tile-icon">{subject.icon}</span>
        <div>
          <h1>{subject.name}</h1>
          <p className="muted">Pick a skill, or let the mix choose for you.</p>
        </div>
        <button className="btn ghost" onClick={() => go('arcade')}>🕹️ Games</button>
        <button className="btn primary" onClick={() => go('play', subject.id, 'mix')}>
          🎲 Mixed practice
        </button>
      </section>

      {strands.map((strand) => (
        <section key={strand}>
          <h2 className="strand">{strand}</h2>
          <div className="skill-grid">
            {subject.skills
              .filter((s) => s.strand === strand)
              .map((s) => {
                const st = profile.skills[s.id];
                const stat = status(st);
                const lvl = st?.level ?? 0;
                const acc = st ? topLevelAccuracy(s, st) : null;
                const due = isReviewDue(st, now);
                return (
                  <button key={s.id} className={`skill-card ${stat}`} onClick={() => go('play', subject.id, s.id)}>
                    <span className="skill-icon">{s.icon}</span>
                    <span className="skill-name">{s.name}</span>
                    <span className="skill-blurb">{s.blurb}</span>
                    <span className="level-dots" aria-label={`Level ${lvl + 1} of ${s.levels.length}`}>
                      {s.levels.map((_, i) => (
                        <span key={i} className={i < lvl || stat === 'mastered' ? 'on' : i === lvl ? 'now' : ''} />
                      ))}
                    </span>
                    <span className="skill-level">{stat === 'mastered' ? s.levels[s.levels.length - 1] : s.levels[lvl]}</span>
                    <span className={`chip ${stat}`}>{due ? 'Review time!' : STATUS_LABEL[stat]}</span>
                    {stat === 'practising' && lvl === s.levels.length - 1 && acc && acc.count > 0 && (
                      <span className="skill-blurb">Top level: {Math.round(acc.accuracy * 100)}% of last {acc.count}</span>
                    )}
                  </button>
                );
              })}
          </div>
        </section>
      ))}
    </main>
  );
}
