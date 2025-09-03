import type { LanguageCode } from '../llm/prompts';
import type { NullableString, NullableNumber } from '../common';

// Language record type for joined language information
export type LanguageRecord = {
  id: number;
  code: LanguageCode;
  name: string;
  native_name: string;
};

// Promise types for vocabulary operations
export type VocabularyPromise = Promise<Vocabulary | null>;
export type VocabularyArrayPromise = Promise<VocabularyWithLanguages[]>;
export type BooleanPromise = Promise<boolean>;
export type VoidPromise = Promise<void>;

export interface Vocabulary {
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
}

export interface VocabularyInsert {
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
}

export interface VocabularyUpdate {
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
}

// Extended vocabulary type with joined language information
export interface VocabularyWithLanguages extends Vocabulary {
  translated_language: LanguageRecord;
  from_language: LanguageRecord;
}
