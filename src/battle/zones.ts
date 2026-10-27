import type { SubjectId } from '../engine/types';

export interface Zone {
  subject: SubjectId;
  name: string;
  /** Monster names; the last one is the zone boss. */
  monsters: string[];
  /** What the hero throws, by attack kind. */
  attack: { hit: string; special: string; specialName: string };
  intro: string;
}

export const ZONES: Partial<Record<SubjectId, Zone>> = {
  math: {
    subject: 'math', name: 'Math Mountains', monsters: ['Pebble Golem', 'Frost Golem', 'Moss Golem', 'Granite King'],
    attack: { hit: '✦', special: '🌟', specialName: 'Number Nova' }, intro: 'Rock golems block the mountain pass!',
  },
  spelling: {
    subject: 'spelling', name: 'Spelling Swamp', monsters: ['Bog Slime', 'Bubble Slime', 'Goo Slime', 'Swamp Queen'],
    attack: { hit: '🅰️', special: '🔤', specialName: 'Alphabet Avalanche' }, intro: 'Slimes are bubbling up from the bog!',
  },
  grammar: {
    subject: 'grammar', name: 'Grammar Garage', monsters: ['Bolt Bot', 'Gear Bot', 'Spring Bot', 'Mega Mech'],
    attack: { hit: '🔧', special: '⚡', specialName: 'Sentence Surge' }, intro: 'Rogue robots are loose in the garage!',
  },
  science: {
    subject: 'science', name: 'Science Badlands', monsters: ['Fossil Raptor', 'Fossil Trike', 'Fossil Ptero', 'Rex the Restless'],
    attack: { hit: '🧪', special: '🌋', specialName: 'Volcano Blast' }, intro: 'Fossil beasts have woken up in the badlands!',
  },
};

export const zoneFor = (s: SubjectId) => ZONES[s];

/** The daily warm-up's subject: one subject a day, rotating through those with battles (or the parent's focus list). */
export function dailySubject(now: number, focus?: SubjectId[]): SubjectId {
  const all = Object.keys(ZONES) as SubjectId[];
  const pool = focus?.filter((s) => all.includes(s)).length ? focus.filter((s) => all.includes(s)) : all;
  const day = Math.floor((now - new Date(now).getTimezoneOffset() * 60000) / 86400000);
  return pool[day % pool.length];
}
