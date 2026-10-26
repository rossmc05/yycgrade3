import type { Skill, SubjectId } from '../engine/types';
import { GRAMMAR_SKILLS } from './grammar/skills';
import { MATH_SKILLS } from './math/skills';
import { SCIENCE_SKILLS } from './science/skills';
import { SPELLING_SKILLS } from './spelling/skills';

export interface Subject {
  id: SubjectId;
  name: string;
  icon: string;
  color: string;
  tagline: string;
  skills: Skill[];
  ready: boolean;
}

export const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Math Quest', icon: '🧮', color: '#4f46e5', tagline: 'Numbers, shapes, time and money', skills: MATH_SKILLS, ready: true },
  { id: 'spelling', name: 'Spell Builder', icon: '🔤', color: '#db2777', tagline: 'Word patterns and spelling lists', skills: SPELLING_SKILLS, ready: true },
  { id: 'typing', name: 'Type Rocket', icon: '🚀', color: '#0891b2', tagline: 'Learn to type with all ten fingers', skills: [], ready: true },
  { id: 'grammar', name: 'Grammar Garage', icon: '🛠️', color: '#ea580c', tagline: 'Build great sentences', skills: GRAMMAR_SKILLS, ready: true },
  { id: 'science', name: 'Science Lab', icon: '🔬', color: '#16a34a', tagline: 'Matter, forces, living things and dinosaurs', skills: SCIENCE_SKILLS, ready: true },
];

export const ALL_SKILLS: Skill[] = SUBJECTS.flatMap((s) => s.skills);

export function findSkill(id: string): Skill | undefined {
  return ALL_SKILLS.find((s) => s.id === id);
}

export function findSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}
