import type { Look } from '../avatar/catalog';

// Shared types for every subject app.

export type SubjectId = 'math' | 'science' | 'typing' | 'spelling' | 'grammar';

/** Pictures a question can show. Each subject renders its own kinds. */
export type Visual =
  | { kind: 'clock'; hour: number; minute: number }
  | { kind: 'array'; rows: number; cols: number }
  | { kind: 'groups'; groups: number; each: number }
  | { kind: 'fraction-bar'; parts: number; shaded: number }
  | { kind: 'fraction-compare'; a: [number, number]; b: [number, number] }
  | { kind: 'coins'; coins: string[] }
  | { kind: 'bar-graph'; title: string; labels: string[]; values: number[] }
  | { kind: 'polygon'; sides: number; labels?: string[]; regular: boolean; rightAngles?: boolean }
  | { kind: 'balance'; left: string; right: string }
  | { kind: 'number-line'; denominator: number; mark: number }
  | { kind: 'base-ten'; hundreds: number; tens: number; ones: number };

export interface Question {
  /** Stable text for this exact item, used to bring missed items back later. */
  key: string;
  prompt: string;
  visual?: Visual;
  /** 'number' shows a keypad; 'choice' shows buttons; 'order' asks to tap the choices in order. */
  input: 'number' | 'choice' | 'text' | 'order';
  choices?: string[];
  answer: string;
  /** Unit shown after the input box, e.g. "cm" or "¢". */
  unit?: string;
  /** What to read aloud instead of the prompt (e.g. the word to spell, used in a sentence). */
  say?: string;
  hint: string;
  explain: string;
}

export interface Skill {
  id: string;
  subject: SubjectId;
  name: string;
  /** Short kid-friendly description. */
  blurb: string;
  /** Curriculum strand, e.g. "Number: Multiplication and Division". */
  strand: string;
  /** Alberta learning outcome text. */
  outcome: string;
  icon: string;
  /** Short lesson shown before the first practice. */
  learn?: string[];
  levels: string[];
  generate: (level: number, rng: Rng, ctx: GenContext) => Question;
}

/** Per-child data a generator may use, such as the school spelling list. */
export interface GenContext {
  spellingList: string[];
}

export interface TypingResult {
  bestWpm: number;
  bestAccuracy: number;
  stars: number;
  plays: number;
}

export type Rng = () => number;

export interface Attempt {
  t: number;
  correct: boolean;
  level: number;
  key: string;
}

export interface SkillState {
  level: number;
  /** Consecutive first-try correct answers at the current level. */
  upStreak: number;
  /** Consecutive misses at the current level. */
  downStreak: number;
  /** First-try results at the current level since it last changed (up to 5). */
  recent?: boolean[];
  history: Attempt[];
  masteredAt?: number;
  /** Next spaced-review date (ms). */
  reviewAt?: number;
  reviewStep: number;
  /** Items missed recently, retried in later sessions. */
  missed: Question[];
}

export interface DayLog {
  questions: number;
  correct: number;
  seconds: number;
  bySubject: Partial<Record<SubjectId, number>>;
  /** Seconds spent per subject (added later, so older days lack it). */
  secondsBySubject?: Partial<Record<SubjectId, number>>;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
  xp: number;
  coins: number;
  streak: number;
  lastActiveDay?: string;
  skills: Record<string, SkillState>;
  days: Record<string, DayLog>;
  badges: Record<string, number>;
  owned: string[];
  equipped: string[];
  totalCorrect: number;
  /** Weekly words entered by a parent. */
  spellingList?: string[];
  typing?: Record<string, TypingResult>;
  /** Best scores in the arcade games. */
  games?: Record<string, { best: number; plays: number }>;
  /** Built avatar; older saves only have the emoji `avatar`. */
  look?: Look;
}

export interface Settings {
  pin?: string;
  dailyGoal: number;
  readAloud: boolean;
  sessionLength: number;
  /** Subjects the daily warm-up focuses on; empty means all. */
  focus?: SubjectId[];
  /** Battle mode for practice sessions (on unless turned off). */
  battle?: boolean;
  /** Game sound effects (on unless turned off). */
  sound?: boolean;
}

export interface AppData {
  version: 1;
  profiles: Profile[];
  activeProfileId?: string;
  settings: Settings;
}
