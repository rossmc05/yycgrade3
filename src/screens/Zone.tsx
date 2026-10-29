import { Icon, Sprite } from '../art/sprite';
import { SceneArt } from '../battle/Art';
import { TopBar } from '../components/TopBar';
import { useStore } from '../engine/store';
import type { SubjectId } from '../engine/types';
import { guideLine, isOpen, placeOf, quests, recommended } from '../map/world';
import { go } from '../router';
import { findSubject } from '../subjects';

const STATE_LABEL = { locked: 'Locked', open: 'Open', review: 'Rematch!', done: 'Cleared' } as const;

export function Zone({ subjectId }: { subjectId: string }) {
  const { profile, data } = useStore();
  const classic = !!data.settings.classicLook;
  const place = placeOf(subjectId);
  const subject = findSubject(subjectId);
  if (!profile || !place || !subject || place.id === 'village') return null;
  const back = () => go('');

  if (!isOpen(place, profile)) {
    return (
      <main className="page">
        <TopBar back={back} />
        <section className="card center-text">
          <h1>🔒 {place.name}</h1>
          <p>This zone opens at {place.unlockAt} right answers. You have {profile.totalCorrect}.</p>
          <button className="btn primary" onClick={back}>Back to the map</button>
        </section>
      </main>
    );
  }

  const list = quests(subject.skills, profile, Date.now());
  const pick = recommended(list);
  const stars = list.reduce((n, q) => n + q.stars, 0);

  return (
    <main className={`page zone-page zone-${subjectId}`}>
      <TopBar back={back} />
      <section className="zone-banner">
        {classic ? <SceneArt subject={subjectId as SubjectId} /> : <ZoneScene id={subjectId} />}
        <div className="zone-title">
          <h1>{place.name}</h1>
          <span>⭐ {stars} / {list.length * 3}</span>
        </div>
      </section>

      <section className="card guide-row">
        <span className="guide-face">{place.guide && <Icon e={place.guide.icon} size="1em" />}</span>
        <div className="speech">
          <small>{place.guide?.name}</small>
          <p>{guideLine(place, list)}</p>
        </div>
        <div className="guide-actions">
          {pick && (
            <button className="btn primary" onClick={() => go('play', subjectId, pick.skill.id)}>
              ⚔️ {pick.state === 'review' ? 'Rematch' : 'Go'}: {pick.skill.name}
            </button>
          )}
          <button className="btn ghost" onClick={() => go('play', subjectId, 'mix')}>
            🎲 Quick battle: mixed quests
          </button>
        </div>
      </section>

      <ol className="quest-trail" aria-label="Quest trail">
        {list.map((q, i) => (
          <li key={q.skill.id} className={`quest-node ${q.state} ${q === pick ? 'picked' : ''}`}>
            <button
              disabled={q.state === 'locked'}
              onClick={() => go('play', subjectId, q.skill.id)}
              aria-label={`Quest ${i + 1}: ${q.skill.name}, ${STATE_LABEL[q.state]}, ${q.stars} of 3 stars`}
            >
              <span className="node-num">{q.state === 'locked' ? '🔒' : q.state === 'done' ? '🏁' : i + 1}</span>
              <span className="node-name">{q.skill.name}</span>
              <span className="node-stars" aria-hidden="true">
                {[0, 1, 2].map((s) => <i key={s} className={s < q.stars ? 'on' : ''}>★</i>)}
              </span>
              {q.state === 'review' && <span className="node-tag">Rematch!</span>}
              {q === pick && q.state !== 'review' && <span className="node-tag">Next</span>}
            </button>
          </li>
        ))}
      </ol>
      <p className="muted small center-text">Win battles to earn stars. Each quest you level up opens a new one on the trail.</p>
      <button className="link center-text" onClick={() => go('subject', subjectId)}>Lessons and practice list</button>
    </main>
  );
}

const SCENES: Record<string, { sky: string; ground: string; art: [string, number, number][] }> = {
  math: { sky: 'linear-gradient(#7dd3fc, #e0f2fe)', ground: '#65a30d', art: [['⛰️', 40, 130], ['🏔️', 54, 150], ['🌲', 70, 80], ['🐐', 77, 70]] },
  spelling: { sky: 'linear-gradient(#4c1d95, #a78bfa)', ground: '#0f766e', art: [['🛖', 42, 110], ['🌾', 56, 80], ['🐊', 64, 90], ['🍄', 76, 64]] },
  grammar: { sky: 'linear-gradient(#334155, #94a3b8)', ground: '#374151', art: [['🏭', 42, 130], ['⚙️', 58, 70], ['🤖', 66, 96], ['🚧', 77, 64]] },
  science: { sky: 'linear-gradient(#fb923c, #fde68a)', ground: '#ea580c', art: [['🌋', 42, 140], ['🌵', 58, 80], ['🦖', 66, 100], ['🦴', 78, 56]] },
};

function ZoneScene({ id }: { id: string }) {
  const sc = SCENES[id];
  if (!sc) return null;
  return (
    <div className="zone-scene" style={{ '--sky': sc.sky, '--ground': sc.ground } as React.CSSProperties} aria-hidden="true">
      {sc.art.map(([e, left, size], i) => (
        <span key={i} style={{ position: 'absolute', left: `${left}%`, bottom: '8%' }}>
          <Sprite e={e} size={size} />
        </span>
      ))}
    </div>
  );
}
