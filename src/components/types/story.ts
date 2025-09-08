import { LanguageCode, DifficultyLevel } from '../../types/llm/prompts';

export interface StoryFormData {
  story: string;
  language: LanguageCode;
  difficulty: DifficultyLevel;
  selectedVocabulary: string[];
}
