import type { DifficultyLevel } from '../llm/prompts';

export interface SavedStory {
  id: string;
  title: string;
  originalText: string;
  difficulty: DifficultyLevel;
  fromLanguage: string;
  toLanguage: string;
  description: string;
}

 