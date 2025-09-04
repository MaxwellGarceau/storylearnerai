import { DifficultyLevel, LanguageCode } from './llm/prompts';

// Dictionary system types
export interface DictionaryWord {
  word: string;
  phonetic?: string;
  definitions: WordDefinition[];
  partsOfSpeech?: PartOfSpeech[];
  etymology?: string;
  examples?: string[];
  synonyms?: string[];
  antonyms?: string[];
  frequency?: WordFrequency;
  difficulty?: DifficultyLevel;
  audioUrl?: string;
  source?: string;
  lastUpdated?: string;
}

export interface WordDefinition {
  definition: string;
  partOfSpeech?: string;
  examples?: string[];
  synonyms?: string[];
  antonyms?: string[];
  context?: string;
}

export interface PartOfSpeech {
  type: string;
  confidence?: number;
  definitions: WordDefinition[];
}

export interface WordFrequency {
  level: 'common' | 'uncommon' | 'rare' | 'very-rare';
  frequency?: number; // 0-1 scale
  rank?: number; // Word frequency rank
}

export interface DictionarySearchParams {
  word: string;
  fromLanguage?: LanguageCode; // User's native language
  targetLanguage?: LanguageCode; // Language of the story being read
  includeEtymology?: boolean;
  includeExamples?: boolean;
  includeAudio?: boolean;
  difficulty?: DifficultyLevel;
}

export interface DictionaryResponse {
  word: unknown; // Raw API response data that will be transformed
  success: boolean;
  error?: string;
  source?: string;
  timestamp: string;
}

export type DictionaryErrorCode =
  | 'WORD_NOT_FOUND'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'INVALID_REQUEST'
  | 'TIMEOUT';

export class DictionaryError extends Error {
  public readonly code: DictionaryErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: DictionaryErrorCode,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DictionaryError';
    this.code = code;
    this.details = details;
  }
}

// Legacy interface for backward compatibility
export interface DictionaryErrorInterface {
  code: DictionaryErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

// Reusable type aliases to avoid duplication
export type DictionaryResponsePromise = Promise<DictionaryResponse>;
export type DictionaryWordPromise = Promise<DictionaryWord>;
export type DictionaryWordOrNull = DictionaryWord | null;

// Data transformation layer interfaces
export interface DictionaryDataTransformer {
  transformApiResponse(rawData: unknown, apiType?: string): DictionaryWord;
  validateWordData(data: unknown): data is DictionaryWord;
}

// Specific transformer interface for Lexicala API
export interface LexicalaDataTransformer {
  transformLexicalaResponse(rawData: unknown): DictionaryWord;
  validateWordData(data: unknown): data is DictionaryWord;
}

// Lexicala API Response Interfaces
export interface LexicalaApiResponse {
  n_results: number;
  page_number: number;
  results_per_page: number;
  n_pages: number;
  available_n_pages: number;
  results: LexicalaResult[];
}

export interface LexicalaResult {
  id: string;
  source?: string;
  language: string;
  version?: number;
  frequency?: string;
  headword: LexicalaHeadword;
  senses: LexicalaSense[];
}

export interface LexicalaHeadword {
  text: string;
  pronunciation?: {
    value: string;
  };
  pos?: string; // part of speech
}

export interface LexicalaSense {
  id: string;
  see?: string;
  definition?: string;
  subcategory?: string;
  examples?: LexicalaExample[];
  synonyms?: string[];
  antonyms?: string[];
  partOfSpeech?: string;
  translations?: Record<string, LexicalaTranslation>;
  compositional_phrases?: LexicalaCompositionalPhrase[];
}

export interface LexicalaExample {
  text: string;
  translations?: Record<string, LexicalaTranslation>;
}

export interface LexicalaTranslation {
  text: string;
  gender?: string;
  alternative_scripts?: LexicalaAlternativeScript[];
}

export interface LexicalaAlternativeScript {
  type: string;
  text: string;
}

export interface LexicalaCompositionalPhrase {
  text: string;
  definition: string;
  translations?: Record<string, LexicalaTranslation>;
  examples?: LexicalaExample[];
}

// API Client interfaces
export interface DictionaryApiClient {
  searchWord(params: DictionarySearchParams): DictionaryResponsePromise;
  getWordDetails(
    word: string,
    fromLanguage?: LanguageCode,
    targetLanguage?: LanguageCode
  ): DictionaryResponsePromise;
  isAvailable(): boolean;
}

// API Manager interfaces
export interface DictionaryApiManager {
  searchWord(params: DictionarySearchParams): DictionaryWordPromise;
  getWordDetails(
    word: string,
    fromLanguage?: LanguageCode,
    targetLanguage?: LanguageCode
  ): DictionaryWordPromise;
  isAvailable(): boolean;
  getAvailableApis(): string[];
  getAvailableTransformers(): string[];
  updateConfig(config: Partial<ApiManagerConfig>): void;
  getConfig(): ApiManagerConfig;
  addApiClient(apiType: string, client: DictionaryApiClient): void;
  removeApiClient(apiType: string): void;
  addTransformer(apiType: string, transformer: DictionaryDataTransformer): void;
  removeTransformer(apiType: string): void;
}

export interface ApiManagerConfig {
  primaryApi: string;
  timeout?: number;
  retryAttempts?: number;
}

// Service layer interfaces
export interface DictionaryService {
  getWordInfo(
    word: string,
    fromLanguage?: LanguageCode,
    targetLanguage?: LanguageCode
  ): DictionaryWordPromise;
  searchWord(params: DictionarySearchParams): DictionaryWordPromise;
  getCachedWord(
    word: string,
    fromLanguage?: LanguageCode,
    targetLanguage?: LanguageCode
  ): DictionaryWordOrNull;
  clearCache(): void;
}

// Hook return type
export interface UseDictionaryReturn {
  wordInfo: DictionaryWordOrNull;
  isLoading: boolean;
  error: DictionaryError | null;
  searchWord: (
    word: string,
    fromLanguage?: LanguageCode,
    targetLanguage?: LanguageCode
  ) => Promise<void>;
  clearError: () => void;
}
