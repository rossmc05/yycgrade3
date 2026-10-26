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
  /** 'number' shows a keypad; 'choice' shows buttons. */
  input: 'number' | 'choice' | 'text';
  choices?: string[];
  answer: string;
  /** Unit shown after the input box, e.g. "cm" or "¢". */
  unit?: string;
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
  levels: string[];
  generate: (level: number, rng: Rng) => Question;
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
}

export interface Settings {
  pin?: string;
  dailyGoal: number;
  readAloud: boolean;
  sessionLength: number;
}

export interface AppData {
  version: 1;
  profiles: Profile[];
  activeProfileId?: string;
  settings: Settings;
}
