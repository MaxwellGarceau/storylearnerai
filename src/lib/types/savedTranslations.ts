export interface Language {
  id: string;
  code: string; // ISO 639-1 language codes (e.g., 'en', 'es', 'fr')
  name: string; // Full language name (e.g., 'English', 'Spanish', 'French')
  native_name?: string; // Name in the native language
  created_at: string;
}

export interface DifficultyLevel {
  id: string;
  code: string; // Internal code (e.g., 'beginner', 'intermediate', 'advanced')
  name: string; // Display name (e.g., 'Beginner', 'Intermediate', 'Advanced')
  description?: string; // Optional description
  created_at: string;
}

export interface SavedTranslation {
  id: string;
  user_id: string;
  original_story: string;
  translated_story: string;
  original_language_id: string;
  translated_language_id: string;
  difficulty_level_id: string;
  title?: string; // Optional title for the saved translation
  notes?: string; // Optional user notes
  created_at: string;
  updated_at: string;
}

export interface SavedTranslationWithDetails extends SavedTranslation {
  original_language: Language;
  translated_language: Language;
  difficulty_level: DifficultyLevel;
}

export interface CreateSavedTranslationRequest {
  original_story: string;
  translated_story: string;
  original_language_code: string; // We'll use language codes for easier API usage
  translated_language_code: string;
  difficulty_level_code: string;
  title?: string;
  notes?: string;
}

export interface UpdateSavedTranslationRequest {
  title?: string;
  notes?: string;
}

export interface SavedTranslationFilters {
  original_language_code?: string;
  translated_language_code?: string;
  difficulty_level_code?: string;
  search?: string; // Search in title, notes, or story content
  limit?: number;
  offset?: number;
} 