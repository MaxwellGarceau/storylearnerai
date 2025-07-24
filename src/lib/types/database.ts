// Database types for better TypeScript support
// These types match our current Supabase schema

export interface Database {
  public: {
    Tables: {
      // Lookup tables
      languages: {
        Row: {
          id: number
          code: string // ISO 639-1 language codes (e.g., 'en', 'es', 'fr')
          name: string // Full language name (e.g., 'English', 'Spanish', 'French')
          native_name: string | null // Name in the native language
          created_at: string
        }
        Insert: {
          id?: number
          code: string
          name: string
          native_name?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          code?: string
          name?: string
          native_name?: string | null
          created_at?: string
        }
      }
      difficulty_levels: {
        Row: {
          id: number
          code: string // Internal code (e.g., 'a1', 'a2', 'b1', 'b2')
          name: string // Display name (e.g., 'Beginner', 'Intermediate', 'Advanced')
          description: string | null // Optional description
          created_at: string
        }
        Insert: {
          id?: number
          code: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          code?: string
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
          difficulty_level: string
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          language: string
          difficulty_level: string
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          language?: string
          difficulty_level?: string
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
export type Language = Database['public']['Tables']['languages']['Row']
export type DifficultyLevel = Database['public']['Tables']['difficulty_levels']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Story = Database['public']['Tables']['stories']['Row']
export type Translation = Database['public']['Tables']['translations']['Row']
export type SavedTranslation = Database['public']['Tables']['saved_translations']['Row']

// Insert types
export type LanguageInsert = Database['public']['Tables']['languages']['Insert']
export type DifficultyLevelInsert = Database['public']['Tables']['difficulty_levels']['Insert']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type StoryInsert = Database['public']['Tables']['stories']['Insert']
export type TranslationInsert = Database['public']['Tables']['translations']['Insert']
export type SavedTranslationInsert = Database['public']['Tables']['saved_translations']['Insert']

// Update types
export type LanguageUpdate = Database['public']['Tables']['languages']['Update']
export type DifficultyLevelUpdate = Database['public']['Tables']['difficulty_levels']['Update']
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type StoryUpdate = Database['public']['Tables']['stories']['Update']
export type TranslationUpdate = Database['public']['Tables']['translations']['Update']
export type SavedTranslationUpdate = Database['public']['Tables']['saved_translations']['Update']

// Extended types for joins and relationships
export interface SavedTranslationWithDetails extends SavedTranslation {
  original_language: Language
  translated_language: Language
  difficulty_level: DifficultyLevel
}

export interface StoryWithTranslations extends Story {
  translations: Translation[]
}

// API request types for easier service usage
export interface CreateSavedTranslationRequest {
  original_story: string
  translated_story: string
  original_language_code: string // We'll use language codes for easier API usage
  translated_language_code: string
  difficulty_level_code: string
  title?: string
  notes?: string
}

export interface UpdateSavedTranslationRequest {
  title?: string
  notes?: string
}

export interface SavedTranslationFilters {
  original_language_code?: string
  translated_language_code?: string
  difficulty_level_code?: string
  search?: string // Search in title, notes, or story content
  limit?: number
  offset?: number
} 