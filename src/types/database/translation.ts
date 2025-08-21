import type { LanguageCode, DifficultyLevel, NativeLanguageName, EnglishLanguageName, DifficultyLevelDisplay } from '../llm/prompts';
import type { NullableString } from '../common';

// Translation management types

export interface DatabaseTranslationInsert {
  id?: string;
  story_id: string;
  target_language: LanguageCode;
  translated_content: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseTranslationUpdate {
  id?: string;
  story_id?: string;
  target_language?: LanguageCode;
  translated_content?: string;
  created_at?: string;
  updated_at?: string;
}

// Lookup tables
export interface DatabaseLanguage {
  id: number;
  code: LanguageCode;
  name: EnglishLanguageName;
  native_name: NativeLanguageName;
  created_at: string;
}

export interface DatabaseDifficultyLevel {
  id: number;
  code: DifficultyLevel;
  name: DifficultyLevelDisplay;
  description: NullableString;
  created_at: string;
}

// Saved translations (new feature)

// Extended types for joins and relationships
export interface DatabaseSavedTranslationWithDetails {
  id: number;
  user_id: string;
  original_story: string;
  translated_story: string;
  original_language_id: number;
  translated_language_id: number;
  difficulty_level_id: number;
  title: NullableString;
  notes: NullableString;
  created_at: string;
  updated_at: string;
  original_language: DatabaseLanguage;
  translated_language: DatabaseLanguage;
  difficulty_level: DatabaseDifficultyLevel;
}

// API request types for easier service usage
export interface CreateSavedTranslationRequest {
  original_story: string;
  translated_story: string;
  original_language_code: LanguageCode;
  translated_language_code: LanguageCode;
  difficulty_level_code: DifficultyLevel;
  title?: string;
  notes?: string;
}

export interface UpdateSavedTranslationRequest {
  title?: string;
  notes?: string;
}

export interface SavedTranslationFilters {
  original_language_code?: LanguageCode;
  translated_language_code?: LanguageCode;
  difficulty_level_code?: DifficultyLevel;
  search?: string; // Search in title, notes, or story content
  limit?: number;
  offset?: number;
}
