// 3D scenery for each zone: the zone banner and the battle backdrop.

import type { CSSProperties } from 'react';
import { Sprite } from './sprite';

const SCENES: Record<string, { sky: string; ground: string; art: [string, number, number][] }> = {
  math: { sky: 'linear-gradient(#7dd3fc, #e0f2fe)', ground: '#65a30d', art: [['⛰️', 40, 130], ['🏔️', 54, 150], ['🌲', 70, 80], ['🐐', 77, 70]] },
  spelling: { sky: 'linear-gradient(#4c1d95, #a78bfa)', ground: '#0f766e', art: [['🛖', 42, 110], ['🌾', 56, 80], ['🐊', 64, 90], ['🍄', 76, 64]] },
  grammar: { sky: 'linear-gradient(#334155, #94a3b8)', ground: '#374151', art: [['🏭', 42, 130], ['⚙️', 58, 70], ['🔩', 66, 70], ['🚧', 77, 64]] },
  fortress: { sky: 'linear-gradient(#0f172a, #7dd3fc)', ground: '#e0f2fe', art: [['🏰', 40, 130], ['🧊', 56, 70], ['❄️', 66, 60], ['🏔️', 74, 120]] },
  science: { sky: 'linear-gradient(#fb923c, #fde68a)', ground: '#ea580c', art: [['🌋', 42, 140], ['🌵', 58, 80], ['🪨', 68, 70], ['🦴', 78, 56]] },
};

export function ZoneScene({ id, battle = false }: { id: string; battle?: boolean }) {
  const sc = SCENES[id];
  // In battle the scenery stays small and in the middle, out of the fighters' way.
  const art = battle ? sc?.art.map(([e, , size], i): [string, number, number] => [e, 30 + i * 11, size * 0.55]) : sc?.art;
  if (!sc) return null;
  return (
    <div className={`zone-scene ${battle ? 'battle-scene' : ''}`} style={{ '--sky': sc.sky, '--ground': sc.ground } as CSSProperties} aria-hidden="true">
      {art!.map(([e, left, size], i) => (
        <span key={i} style={{ position: 'absolute', left: `${left}%`, bottom: battle ? '30%' : '8%', opacity: battle ? 0.9 : 1 }}>
          <Sprite e={e} size={size} />
        </span>
      ))}
    </div>
  );
}
