// Topics a grown-up has switched off because they haven't been taught at school yet.

import type { Profile, Skill } from './types';

export const isPaused = (p: Profile | null | undefined, skillId: string) => !!p?.paused?.includes(skillId);

/** The skills still switched on. If every one is off, all of them, so there is always something to ask. */
export function onSkills(p: Profile | null | undefined, skills: Skill[]): Skill[] {
  const on = skills.filter((s) => !isPaused(p, s.id));
  return on.length ? on : skills;
}

/** Switch a topic off or back on. Switching it on clears the player's flag. */
export function setPaused(p: Profile, skillId: string, paused: boolean): Profile {
  const rest = (p.paused ?? []).filter((x) => x !== skillId);
  return { ...p, paused: paused ? [...rest, skillId] : rest, flagged: paused ? p.flagged : (p.flagged ?? []).filter((x) => x !== skillId) };
}

/** The player tapped "Haven't learned this yet": switch it off and flag it for a grown-up. */
export function flagNotLearned(p: Profile, skillId: string): Profile {
  const off = setPaused(p, skillId, true);
  return { ...off, flagged: [...(off.flagged ?? []).filter((x) => x !== skillId), skillId] };
}
