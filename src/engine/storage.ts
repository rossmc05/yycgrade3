import type { AppData, Profile } from './types';

const KEY = 'grade3-studio';

export const defaultData = (): AppData => ({
  version: 1,
  profiles: [],
  settings: { dailyGoal: 20, readAloud: true, sessionLength: 10 },
});

export function newProfile(name: string, avatar: string): Profile {
  return {
    id: Math.random().toString(36).slice(2, 10),
    name,
    avatar,
    createdAt: Date.now(),
    xp: 0,
    coins: 0,
    streak: 0,
    skills: {},
    days: {},
    badges: {},
    owned: [],
    equipped: [],
    totalCorrect: 0,
  };
}

export function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultData();
    return parse(raw);
  } catch {
    return defaultData();
  }
}

export function save(data: AppData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked; progress lives in memory for this visit.
  }
}

/** Parse a backup or stored copy, filling in any settings added since it was saved. */
export function parse(raw: string): AppData {
  const data = JSON.parse(raw) as AppData;
  if (data.version !== 1 || !Array.isArray(data.profiles)) throw new Error('Not a Grade 3 Studio backup');
  return { ...defaultData(), ...data, settings: { ...defaultData().settings, ...data.settings } };
}
