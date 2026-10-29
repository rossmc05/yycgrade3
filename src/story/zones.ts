import { ZONES, type Zone } from '../battle/zones';
import { BOSSES, FINAL, type Zone4 } from './story';

/** The battle zone for a story boss: one big foe with its own art. */
export function storyZone(which: Zone4 | 'final'): Zone {
  if (which === 'final') {
    return {
      subject: 'science', name: 'Blizzard Fortress', monsters: [FINAL.name], scene: 'fortress',
      attack: { hit: '🔥', special: '☀️', specialName: 'Chinook Blast' }, intro: 'Baron Blizzard blocks the way!',
      bossArt: { e: FINAL.e, filter: FINAL.filter },
    };
  }
  const base = ZONES[which]!;
  const b = BOSSES[which];
  return { ...base, monsters: [b.name], bossArt: { e: b.e, filter: b.filter } };
}
