import type { LanguageCode, DifficultyLevel } from '../llm/prompts';
import type { NullableString, NullableNumber } from '../common';

// Re-export all database types
export * from './user';
export * from './translation';
export * from './vocabulary';
export * from './promise';

// Main Database interface that includes all tables
export interface Database {
  public: {
    Tables: {
      // Lookup tables
      languages: {
        Row: {
          id: number;
          code: LanguageCode;
          name: string;
          native_name: NullableString;
          created_at: string;
        };
        Insert: {
          id?: number;
          code: LanguageCode;
          name: string;
          native_name?: NullableString;
          created_at?: string;
        };
        Update: {
          id?: number;
          code?: LanguageCode;
          name?: string;
          native_name?: NullableString;
          created_at?: string;
        };
      };
      difficulty_levels: {
        Row: {
          id: number;
          code: DifficultyLevel;
          name: string;
          description: NullableString;
          created_at: string;
        };
        Insert: {
          id?: number;
          code: DifficultyLevel;
          name: string;
          description?: NullableString;
          created_at?: string;
        };
        Update: {
          id?: number;
          code?: DifficultyLevel;
          name?: string;
          description?: NullableString;
          created_at?: string;
        };
      };
      // User management
      users: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: NullableString;
          preferred_language: LanguageCode;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string;
          display_name?: string;
          avatar_url?: NullableString;
          preferred_language?: LanguageCode;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          avatar_url?: NullableString;
          preferred_language?: LanguageCode;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Vocabulary words
      vocabulary: {
        Row: {
          id: number;
          user_id: string; // Foreign key reference to users.id (UUID)
          original_word: string;
          translated_word: string;
          translated_language_id: number; // Foreign key reference to languages.id
          from_language_id: number; // Foreign key reference to languages.id
          original_word_context: NullableString; // Context sentence where the original word appears
          translated_word_context: NullableString; // Context sentence where the translated word appears
          definition: NullableString; // Definition of the word
          part_of_speech: NullableString; // Part of speech (noun, verb, adjective, etc.)
          frequency_level: NullableString; // Frequency/level (common, rare, etc.)
          saved_translation_id: number | null; // Optional link to the story where this word was found
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id?: string; // Foreign key reference to users.id (UUID) - will be set by the service
          original_word: string;
          translated_word: string;
          translated_language_id: number; // Foreign key reference to languages.id
          from_language_id: number; // Foreign key reference to languages.id
          original_word_context?: NullableString; // Context sentence where the original word appears
          translated_word_context?: NullableString; // Context sentence where the translated word appears
          definition?: NullableString; // Definition of the word
          part_of_speech?: NullableString; // Part of speech (noun, verb, adjective, etc.)
          frequency_level?: NullableString; // Frequency/level (common, rare, etc.)
          saved_translation_id?: NullableNumber; // Optional link to the story where this word was found
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string; // Foreign key reference to users.id (UUID)
          original_word?: string;
          translated_word?: string;
          translated_language_id?: number; // Foreign key reference to languages.id
          from_language_id?: number; // Foreign key reference to languages.id
          original_word_context?: NullableString; // Context sentence where the original word appears
          translated_word_context?: NullableString; // Context sentence where the translated word appears
          definition?: NullableString; // Definition of the word
          part_of_speech?: NullableString; // Part of speech (noun, verb, adjective, etc.)
          frequency_level?: NullableString; // Frequency/level (common, rare, etc.)
          saved_translation_id?: NullableNumber; // Optional link to the story where this word was found
          created_at?: string;
          updated_at?: string;
        };
      };
      // Saved translations
      saved_translations: {
        Row: {
          id: number;
          user_id: string; // Foreign key reference to users.id (UUID)
          original_story: string;
          translated_story: string;
          original_language_id: number; // Foreign key reference to languages.id
          translated_language_id: number; // Foreign key reference to languages.id
          difficulty_level_id: number;
          title: NullableString;
          notes: NullableString;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string; // Foreign key reference to users.id (UUID)
          original_story: string;
          translated_story: string;
          original_language_id: number; // Foreign key reference to languages.id
          translated_language_id: number; // Foreign key reference to languages.id
          difficulty_level_id: number;
          title?: NullableString;
          notes?: NullableString;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string; // Foreign key reference to users.id (UUID)
          original_story?: string;
          translated_story?: string;
          original_language_id?: number; // Foreign key reference to languages.id
          translated_language_id?: number; // Foreign key reference to languages.id
          difficulty_level_id?: number;
          title?: NullableString;
          notes?: NullableString;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
