import { LanguageCode, DifficultyLevel } from '../../lib/types/prompt';

export interface StoryFormData {
  story: string;
  language: LanguageCode;
  difficulty: DifficultyLevel;
}
