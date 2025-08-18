import { LanguageCode } from "../llm/prompts";
import type { NullableString } from "../common";

// User management types
export interface DatabaseUser {
  id: string;
  username: NullableString;
  display_name: NullableString;
  avatar_url: NullableString;
  preferred_language: LanguageCode | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserInsert {
  id: string;
  username?: NullableString;
  display_name?: NullableString;
  avatar_url?: NullableString;
  preferred_language?: LanguageCode | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserUpdate {
  id?: string;
  username?: NullableString;
  display_name?: NullableString;
  avatar_url?: NullableString;
  preferred_language?: LanguageCode | null;
  created_at?: string;
  updated_at?: string;
} 