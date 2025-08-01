import type { DifficultyLevel } from '../lib/types/prompt';

export interface SavedStory {
  id: string;
  title: string;
  originalText: string;
  difficulty: DifficultyLevel;
  fromLanguage: string;
  toLanguage: string;
  description: string;
}

 