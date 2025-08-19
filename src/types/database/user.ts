import { LanguageCode } from "../llm/prompts";
import type { NullableString } from "../common";

// User management types
export interface DatabaseUser {
  id: string;
  // NullableString so we can clear these fields when needed
  username: NullableString;
  display_name: NullableString;
  avatar_url: NullableString;
  preferred_language: LanguageCode;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserInsert {
  id: string;
  // NullableString so we can clear these fields when needed
  username?: NullableString;
  display_name?: NullableString;
  avatar_url?: NullableString;
  preferred_language?: LanguageCode;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserUpdate {
  id?: string;
  // NullableString so we can clear these fields when needed
  username?: NullableString;
  display_name?: NullableString;
  avatar_url?: NullableString;
  preferred_language?: LanguageCode;
  created_at?: string;
  updated_at?: string;
} 