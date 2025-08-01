import { LanguageCode } from "../llm/prompts";

// User management types
export interface DatabaseUser {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserInsert {
  id: string;
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  preferred_language?: LanguageCode | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserUpdate {
  id?: string;
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  preferred_language?: string;
  created_at?: string;
  updated_at?: string;
} 