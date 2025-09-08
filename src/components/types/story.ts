import { LanguageCode, DifficultyLevel } from '../../types/llm/prompts';

export interface StoryFormData {
  story: string;
  fromLanguage: LanguageCode;
  language: LanguageCode;
  difficulty: DifficultyLevel;
  selectedVocabulary: string[];
}
