import type { LanguageCode, DifficultyLevel } from '../llm/prompts';
import type { NullableString } from '../common';

// Re-export all database types
export * from './user';
export * from './translation';
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
      // Story management
      stories: {
        Row: {
          id: string;
          title: string;
          content: string;
          language: LanguageCode;
          difficulty_level: DifficultyLevel;
          user_id: string; // Foreign key reference to users.id (UUID)
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          language: LanguageCode;
          difficulty_level: DifficultyLevel;
          user_id?: string; // Foreign key reference to users.id (UUID)
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          language?: LanguageCode;
          difficulty_level?: DifficultyLevel;
          user_id?: string; // Foreign key reference to users.id (UUID)
          created_at?: string;
          updated_at?: string;
        };
      };
      translations: {
        Row: {
          id: string;
          story_id: string;
          target_language: LanguageCode;
          translated_content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          target_language: LanguageCode;
          translated_content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          target_language?: LanguageCode;
          translated_content?: string;
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
