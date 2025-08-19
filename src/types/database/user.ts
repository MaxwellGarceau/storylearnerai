import { LanguageCode } from "../llm/prompts";
import type { NullableString } from "../common";

// User management types
export interface DatabaseUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: NullableString;
  preferred_language: LanguageCode;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserInsert {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: NullableString;
  preferred_language?: LanguageCode;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserUpdate {
  id?: string;
  username?: string;
  display_name?: string;
  avatar_url?: NullableString;
  preferred_language?: LanguageCode;
  created_at?: string;
  updated_at?: string;
} 