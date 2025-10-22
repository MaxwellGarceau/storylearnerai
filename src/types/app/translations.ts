import type { LanguageCode, DifficultyLevel } from '../../types/llm/prompts';
import type { TokenType } from '../../types/llm/tokens';
import type {
  DatabaseDifficultyLevel,
  DatabaseLanguage,
} from '../../types/database';
import type { NullableString } from '../../types/common';

// DB input types for saving tokens alongside a translation
export type WordTokenInput = {
  type: 'word';
  to_word: string;
  to_lemma: string;
  from_word: string;
  from_lemma: string;
  pos?: string;
  difficulty?: string;
  from_definition?: string;
};

type NonWordTokenType = Extract<TokenType, 'punctuation' | 'whitespace'>;

export type PunctuationOrWhitespaceTokenInput = {
  type: NonWordTokenType;
  value: string;
};

export type TranslationTokenInput =
  | WordTokenInput
  | PunctuationOrWhitespaceTokenInput;

export interface SaveTranslationParams {
  userId: string;
  fromLanguage: LanguageCode;
  toLanguage: LanguageCode;
  fromText: string;
  toText: string;
  difficultyLevel: DifficultyLevel; // a1, a2, b1, b2
  title?: string;
  notes?: string;
  tokens: TranslationTokenInput[];
}

// DB loaded token types
export type LoadedWordToken = {
  type: 'word';
  to_word: string;
  to_lemma: string;
  from_word: string;
  from_lemma: string;
  pos?: string;
  difficulty?: string;
  from_definition?: string;
};

export type LoadedNonWordToken = {
  type: NonWordTokenType;
  value: string;
};

export type LoadedTranslationToken = LoadedWordToken | LoadedNonWordToken;

export interface LoadedTranslation {
  id: number;
  user_id: string;
  from_language_id: number;
  to_language_id: number;
  from_text: string;
  to_text: string;
  difficulty_level_id: number;
  title?: NullableString;
  notes?: NullableString;
  created_at: string;
  updated_at: string;
  tokens: LoadedTranslationToken[];
  from_language: DatabaseLanguage;
  to_language: DatabaseLanguage;
  difficulty_level: DatabaseDifficultyLevel;
}
