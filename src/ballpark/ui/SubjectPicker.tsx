import { Icon } from '../../art/sprite';
import type { SubjectId } from '../../engine/types';
import { BALL_SUBJECTS } from '../questions';

export const ALL_SUBJECTS = BALL_SUBJECTS.map((s) => s.id);

/**
 * Choose where questions come from: a mix of everything, or one or more subjects.
 * Tapping a subject while "Mix" is on picks just that subject.
 */
export function SubjectPicker({ value, onChange }: { value: SubjectId[]; onChange: (s: SubjectId[]) => void }) {
  const mix = value.length === ALL_SUBJECTS.length;
  const tap = (id: SubjectId) => {
    if (mix) return onChange([id]);
    if (!value.includes(id)) return onChange([...value, id]);
    const rest = value.filter((x) => x !== id);
    onChange(rest.length ? rest : ALL_SUBJECTS);
  };
  const names = BALL_SUBJECTS.filter((s) => value.includes(s.id)).map((s) => s.name);
  return (
    <>
      <div className="subject-chips">
        <button className={`subject-chip ${mix ? 'on' : ''}`} onClick={() => onChange(ALL_SUBJECTS)} aria-pressed={mix}>
          {mix && '✓ '}<Icon e="🎲" /> Mix of everything
        </button>
        {BALL_SUBJECTS.map((s) => {
          const on = !mix && value.includes(s.id);
          return (
            <button key={s.id} className={`subject-chip ${on ? 'on' : ''}`} style={{ ['--tile' as string]: s.color }} onClick={() => tap(s.id)} aria-pressed={on}>
              {on && '✓ '}<Icon e={s.icon} /> {s.name}
            </button>
          );
        })}
      </div>
      <p className="picked">{mix ? 'Questions from every subject.' : `Questions only from ${names.join(' and ')}.`}</p>
    </>
  );
}
