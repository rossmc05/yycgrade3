// The Kindergarten subjects, played in Unicorn Meadow. They are kept apart from the
// grade 3 subjects so Grade 3 Quest and the ballpark don't show them.

import type { KinderSubjectId, Skill } from '../../engine/types';
import { KMATH_SKILLS } from './math';
import { KREADING_SKILLS } from './reading';
import { KSCIENCE_SKILLS } from './science';

export interface KinderSubject {
  id: KinderSubjectId;
  name: string;
  icon: string;
  color: string;
  skills: Skill[];
}

export const K_SUBJECTS: KinderSubject[] = [
  { id: 'kmath', name: 'Numbers and shapes', icon: '🔢', color: '#8b5cf6', skills: KMATH_SKILLS },
  { id: 'kreading', name: 'Letters and words', icon: '🔤', color: '#ec4899', skills: KREADING_SKILLS },
  { id: 'kscience', name: 'Our world', icon: '🌦️', color: '#10b981', skills: KSCIENCE_SKILLS },
];

export const K_SKILLS: Skill[] = K_SUBJECTS.flatMap((s) => s.skills);

export const isKinderSkill = (id: string) => K_SKILLS.some((s) => s.id === id);
