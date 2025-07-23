import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for better TypeScript support
export interface Database {
  public: {
    Tables: {
      stories: {
        Row: {
          id: string
          title: string
          content: string
          language: string
          difficulty_level: string
          created_at: string
          updated_at: string
          user_id?: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          language: string
          difficulty_level: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          language?: string
          difficulty_level?: string
          created_at?: string
          updated_at?: string
          user_id?: string
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
      user_progress: {
        Row: {
          id: string
          user_id: string
          story_id: string
          progress_percentage: number
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id: string
          progress_percentage: number
          completed: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string
          progress_percentage?: number
          completed?: boolean
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

// Typed Supabase client
export type TypedSupabaseClient = ReturnType<typeof createClient<Database>> 