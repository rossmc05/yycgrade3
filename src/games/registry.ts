import type { ComponentType } from 'react';
import type { SubjectId } from '../engine/types';
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
}

export const GAMES: Game[] = [
  { id: 'fact-race', subject: 'math', name: 'Fact Race', icon: '🏎️', blurb: '60 seconds of fast facts', scoreKeys: ['fact-race-+', 'fact-race-−', 'fact-race-×', 'fact-race-÷'], component: FactRace },
  { id: 'boss', subject: 'math', name: 'Boss Battle', icon: '⚔️', blurb: 'Defeat monsters with math', scoreKeys: ['boss'], component: BossBattle },
  { id: 'store', subject: 'math', name: 'Corner Store', icon: '🏪', blurb: 'Pay with Canadian coins', scoreKeys: ['store'], component: CornerStore },
  { id: 'bee', subject: 'spelling', name: 'Spelling Bee', icon: '🐝', blurb: 'Three strikes and you’re out', scoreKeys: ['bee'], component: SpellingBee },
  { id: 'ladder', subject: 'spelling', name: 'Word Ladder', icon: '🪜', blurb: 'Change one letter at a time', scoreKeys: ['ladder'], component: WordLadder },
  { id: 'falling', subject: 'typing', name: 'Word Meteors', icon: '☄️', blurb: 'Type fast to zap falling words', scoreKeys: ['falling'], component: FallingWords },
  { id: 'stories', subject: 'grammar', name: 'Silly Stories', icon: '🤪', blurb: 'Nouns, verbs and adjectives make a story', scoreKeys: ['stories'], component: SillyStories },
  { id: 'builder', subject: 'grammar', name: 'Sentence Builder', icon: '🧱', blurb: 'Unscramble the sentence', scoreKeys: ['builder'], component: SentenceBuilder },
  { id: 'water-lab', subject: 'science', name: 'Water Lab', icon: '🧪', blurb: 'Freeze, melt and boil water', scoreKeys: ['water-lab'], component: WaterLab },
  { id: 'puck-slide', subject: 'science', name: 'Puck Slide', icon: '🏒', blurb: 'Test friction and force', scoreKeys: ['puck-slide'], component: PuckSlide },
];
