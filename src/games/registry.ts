import type { ComponentType } from 'react';
import type { SubjectId } from '../engine/types';
export { medalFor, MEDAL_ICON, type Medal } from './medals';
import { FallingWords, SentenceBuilder, SillyStories, SpellingBee, WordLadder } from './LanguageGames';
import { BossBattle, CornerStore, FactRace } from './MathGames';
import { PuckSlide, WaterLab } from './ScienceLabs';

export interface Game {
  id: string;
  subject: SubjectId;
  name: string;
  icon: string;
  blurb: string;
  /** Score keys in profile.games that count toward this game's best. */
  scoreKeys: string[];
  component: ComponentType;
  /** Scores for bronze, silver and gold. */
  medals: [number, number, number];
  /** The arcade cabinet's colour. */
  color: string;
}

export const gameById = (id: string) => GAMES.find((g) => g.id === id || g.scoreKeys.includes(id));

export const GAMES: Game[] = [
  { id: 'fact-race', subject: 'math', name: 'Fact Race', icon: '🏎️', blurb: '60 seconds of fast facts', scoreKeys: ['fact-race-+', 'fact-race-−', 'fact-race-×', 'fact-race-÷'], component: FactRace, medals: [10, 18, 26], color: '#ef4444' },
  { id: 'boss', subject: 'math', name: 'Boss Battle', icon: '⚔️', blurb: 'Defeat monsters with math', scoreKeys: ['boss'], component: BossBattle, medals: [8, 18, 25], color: '#7c3aed' },
  { id: 'store', subject: 'math', name: 'Corner Store', icon: '🏪', blurb: 'Pay with Canadian coins', scoreKeys: ['store'], component: CornerStore, medals: [4, 5, 6], color: '#f59e0b' },
  { id: 'bee', subject: 'spelling', name: 'Spelling Bee', icon: '🐝', blurb: 'Three strikes and you’re out', scoreKeys: ['bee'], component: SpellingBee, medals: [5, 10, 15], color: '#eab308' },
  { id: 'ladder', subject: 'spelling', name: 'Word Ladder', icon: '🪜', blurb: 'Change one letter at a time', scoreKeys: ['ladder'], component: WordLadder, medals: [6, 10, 12], color: '#a16207' },
  { id: 'falling', subject: 'typing', name: 'Word Meteors', icon: '☄️', blurb: 'Type fast to zap falling words', scoreKeys: ['falling'], component: FallingWords, medals: [10, 20, 35], color: '#1e40af' },
  { id: 'stories', subject: 'grammar', name: 'Silly Stories', icon: '🤪', blurb: 'Nouns, verbs and adjectives make a story', scoreKeys: ['stories'], component: SillyStories, medals: [4, 7, 9], color: '#ec4899' },
  { id: 'builder', subject: 'grammar', name: 'Sentence Builder', icon: '🧱', blurb: 'Unscramble the sentence', scoreKeys: ['builder'], component: SentenceBuilder, medals: [3, 4, 5], color: '#ea580c' },
  { id: 'water-lab', subject: 'science', name: 'Water Lab', icon: '🧪', blurb: 'Freeze, melt and boil water', scoreKeys: ['water-lab'], component: WaterLab, medals: [3, 5, 6], color: '#0891b2' },
  { id: 'puck-slide', subject: 'science', name: 'Puck Slide', icon: '🏒', blurb: 'Test friction and force', scoreKeys: ['puck-slide'], component: PuckSlide, medals: [3, 5, 7], color: '#0ea5e9' },
];
