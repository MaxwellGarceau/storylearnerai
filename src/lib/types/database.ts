import type { LanguageCode } from './prompt';
import type { DifficultyLevel as PromptDifficultyLevel } from './prompt';
// Database types for better TypeScript support
// These types match our current Supabase schema

export interface Database {
  public: {
    Tables: {
      // Lookup tables
      languages: {
        Row: {
          id: number
          code: LanguageCode // ISO 639-1 language codes (e.g., 'en', 'es')
          name: string // Full language name (e.g., 'English', 'Spanish', 'French')
          native_name: string | null // Name in the native language
          created_at: string
        }
        Insert: {
          id?: number
          code: LanguageCode
          name: string
          native_name?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          code?: LanguageCode
          name?: string
          native_name?: string | null
          created_at?: string
        }
      }
      difficulty_levels: {
        Row: {
          id: number
          code: PromptDifficultyLevel // Internal code (e.g., 'a1', 'a2', 'b1', 'b2')
          name: string // Display name (e.g., 'Beginner', 'Intermediate', 'Advanced')
          description: string | null // Optional description
          created_at: string
        }
        Insert: {
          id?: number
          code: PromptDifficultyLevel
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          code?: PromptDifficultyLevel
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      // User management
      users: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          preferred_language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          preferred_language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          preferred_language?: string
          created_at?: string
          updated_at?: string
        }
      }
      // Story management
      stories: {
        Row: {
          id: string
          title: string
          content: string
          language: string
          difficulty_level: PromptDifficultyLevel
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          language: string
          difficulty_level: PromptDifficultyLevel
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          language?: string
          difficulty_level?: PromptDifficultyLevel
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      translations: {
        Row: {
          id: string
          story_id: string
          target_language: string
          translated_content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          story_id: string
          target_language: string
          translated_content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          target_language?: string
          translated_content?: string
          created_at?: string
          updated_at?: string
        }
      }
      // Saved translations (new feature)
      saved_translations: {
        Row: {
          id: number
          user_id: string
          original_story: string
          translated_story: string
          original_language_id: number
          translated_language_id: number
          difficulty_level_id: number
          title: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          original_story: string
          translated_story: string
          original_language_id: number
          translated_language_id: number
          difficulty_level_id: number
          title?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          original_story?: string
          translated_story?: string
          original_language_id?: number
          translated_language_id?: number
          difficulty_level_id?: number
          title?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types for easier usage
export type DatabaseLanguage = Database['public']['Tables']['languages']['Row']
export type DatabaseDifficultyLevel = Database['public']['Tables']['difficulty_levels']['Row']
type DatabaseUser = Database['public']['Tables']['users']['Row']
type DatabaseStory = Database['public']['Tables']['stories']['Row']
type DatabaseTranslation = Database['public']['Tables']['translations']['Row']
type DatabaseSavedTranslation = Database['public']['Tables']['saved_translations']['Row']

// Insert types
type DatabaseLanguageInsert = Database['public']['Tables']['languages']['Insert']
type DatabaseDifficultyLevelInsert = Database['public']['Tables']['difficulty_levels']['Insert']
export type DatabaseUserInsert = Database['public']['Tables']['users']['Insert']
type DatabaseStoryInsert = Database['public']['Tables']['stories']['Insert']
export type DatabaseTranslationInsert = Database['public']['Tables']['translations']['Insert']
type DatabaseSavedTranslationInsert = Database['public']['Tables']['saved_translations']['Insert']

// Update types
type DatabaseLanguageUpdate = Database['public']['Tables']['languages']['Update']
type DatabaseDifficultyLevelUpdate = Database['public']['Tables']['difficulty_levels']['Update']
export type DatabaseUserUpdate = Database['public']['Tables']['users']['Update']
type DatabaseStoryUpdate = Database['public']['Tables']['stories']['Update']
export type DatabaseTranslationUpdate = Database['public']['Tables']['translations']['Update']
type DatabaseSavedTranslationUpdate = Database['public']['Tables']['saved_translations']['Update']

// Extended types for joins and relationships
export interface DatabaseSavedTranslationWithDetails extends DatabaseSavedTranslation {
  original_language: DatabaseLanguage
  translated_language: DatabaseLanguage
  difficulty_level: DatabaseDifficultyLevel
}

interface DatabaseStoryWithTranslations extends DatabaseStory {
  translations: DatabaseTranslation[]
}

// API request types for easier service usage
export interface CreateSavedTranslationRequest {
  original_story: string
  translated_story: string
  original_language_code: LanguageCode
  translated_language_code: LanguageCode
  difficulty_level_code: PromptDifficultyLevel
  title?: string
  notes?: string
}

export interface UpdateSavedTranslationRequest {
  title?: string
  notes?: string
}

export interface SavedTranslationFilters {
  original_language_code?: LanguageCode
  translated_language_code?: LanguageCode
  difficulty_level_code?: PromptDifficultyLevel
  search?: string // Search in title, notes, or story content
  limit?: number
  offset?: number
} 