import type { DifficultyLevel, LanguageCode } from '../llm/prompts';

export interface SavedStory {
  id: string;
  title: string;
  originalText: string;
  difficulty: DifficultyLevel;
  fromLanguage: LanguageCode;
  toLanguage: LanguageCode;
  description: string;
}

 