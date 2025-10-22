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
          native_language: LanguageCode;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string;
          display_name?: string;
          avatar_url?: NullableString;
          native_language?: LanguageCode;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          avatar_url?: NullableString;
          native_language?: LanguageCode;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Vocabulary words
      vocabulary: {
        Row: {
          id: number;
          user_id: string; // Foreign key reference to users.id (UUID)
          from_word: string;
          target_word: string;
          target_language_id: number; // Foreign key reference to languages.id
          from_language_id: number; // Foreign key reference to languages.id
          from_word_context: NullableString; // Context sentence where the original word appears
          target_word_context: NullableString; // Context sentence where the translated word appears
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
          from_word: string;
          target_word: string;
          target_language_id: number; // Foreign key reference to languages.id
          from_language_id: number; // Foreign key reference to languages.id
          from_word_context?: NullableString; // Context sentence where the original word appears
          target_word_context?: NullableString; // Context sentence where the translated word appears
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
          from_word?: string;
          target_word?: string;
          target_language_id?: number; // Foreign key reference to languages.id
          from_language_id?: number; // Foreign key reference to languages.id
          from_word_context?: NullableString; // Context sentence where the original word appears
          target_word_context?: NullableString; // Context sentence where the translated word appears
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
          from_text: string;
          to_text: string;
          from_language_id: number; // Foreign key reference to languages.id
          to_language_id: number; // Foreign key reference to languages.id
          difficulty_level_id: number;
          title: NullableString;
          notes: NullableString;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id?: string; // Foreign key reference to users.id (UUID) - will be set by the service
          from_text: string;
          to_text: string;
          from_language_id: number; // Foreign key reference to languages.id
          to_language_id: number; // Foreign key reference to languages.id
          difficulty_level_id: number;
          title?: NullableString;
          notes?: NullableString;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string; // Foreign key reference to users.id (UUID)
          from_text?: string;
          to_text?: string;
          from_language_id?: number; // Foreign key reference to languages.id
          to_language_id?: number; // Foreign key reference to languages.id
          difficulty_level_id?: number;
          title?: NullableString;
          notes?: NullableString;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Translation tokens
      translation_tokens: {
        Row: {
          id: number;
          translation_id: number; // Foreign key reference to saved_translations.id
          token_index: number;
          token_type: string; // 'word', 'punctuation', 'whitespace'
          to_word: NullableString;
          to_lemma: NullableString;
          from_word: NullableString;
          from_lemma: NullableString;
          pos: NullableString; // part of speech
          difficulty: NullableString;
          from_definition: NullableString;
          token_value: NullableString;
        };
        Insert: {
          id?: number;
          translation_id: number; // Foreign key reference to saved_translations.id
          token_index: number;
          token_type: string; // 'word', 'punctuation', 'whitespace'
          to_word?: NullableString;
          to_lemma?: NullableString;
          from_word?: NullableString;
          from_lemma?: NullableString;
          pos?: NullableString; // part of speech
          difficulty?: NullableString;
          from_definition?: NullableString;
          token_value?: NullableString;
        };
        Update: {
          id?: number;
          translation_id?: number; // Foreign key reference to saved_translations.id
          token_index?: number;
          token_type?: string; // 'word', 'punctuation', 'whitespace'
          to_word?: NullableString;
          to_lemma?: NullableString;
          from_word?: NullableString;
          from_lemma?: NullableString;
          pos?: NullableString; // part of speech
          difficulty?: NullableString;
          from_definition?: NullableString;
          token_value?: NullableString;
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
