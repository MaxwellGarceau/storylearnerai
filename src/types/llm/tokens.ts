// Types for translation tokens returned by LLM

import { DifficultyLevel } from './prompts';

export type TokenType = 'word' | 'punctuation' | 'whitespace';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'interjection'
  | 'article'
  | 'determiner'
  | 'other';

export interface BaseToken {
  type: TokenType;
}

/**
 * Word token with linguistic metadata
 * 
 * Required fields: type, to_word, to_lemma, from_word, from_lemma
 * Metadata fields: pos, difficulty, from_definition (can be null if validation fails)
 */
export interface WordToken extends BaseToken {
  type: 'word';
  // Required fields
  to_word: string; // Word in the learning language (toLanguage)
  to_lemma: string; // Base form in learning language
  from_word: string; // Word in native language (fromLanguage)
  from_lemma: string; // Base form in native language
  // Metadata fields (nullable if validation fails)
  pos: PartOfSpeech | null; // Part of speech
  difficulty: DifficultyLevel | null; // CEFR difficulty level
  from_definition: string | null; // Definition in native language
}

/**
 * Punctuation token
 * Contains orthographic marks like periods, commas, etc.
 */
export interface PunctuationToken extends BaseToken {
  type: 'punctuation';
  value: string;
}

/**
 * Whitespace token
 * Contains spacing elements like spaces, tabs, newlines
 */
export interface WhitespaceToken extends BaseToken {
  type: 'whitespace';
  value: string;
}

/**
 * Union type of all token types
 */
export type TranslationToken = WordToken | PunctuationToken | WhitespaceToken;

/**
 * Complete translation response with tokens
 */
export interface TranslationWithTokens {
  translation: string; // Full translated text
  tokens: TranslationToken[]; // Array of structured tokens
}

/**
 * Validation result for token processing
 */
export interface TokenValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[]; // For metadata field issues
  data: TranslationWithTokens | null;
}

