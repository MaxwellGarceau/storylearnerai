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

export interface DictionaryError {
  code: DictionaryErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

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

// API Client interfaces
export interface DictionaryApiClient {
  searchWord(params: DictionarySearchParams): Promise<DictionaryResponse>;
  getWordDetails(
    word: string,
    fromLanguage?: LanguageCode,
    targetLanguage?: LanguageCode
  ): Promise<DictionaryResponse>;
  isAvailable(): boolean;
}

// API Manager interfaces
export interface DictionaryApiManager {
  searchWord(params: DictionarySearchParams): Promise<DictionaryWord>;
  getWordDetails(
    word: string,
    fromLanguage?: LanguageCode,
    targetLanguage?: LanguageCode
  ): Promise<DictionaryWord>;
  isAvailable(): boolean;
  getAvailableApis(): string[];
  updateConfig(config: Partial<ApiManagerConfig>): void;
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
  ): Promise<DictionaryWord>;
  searchWord(params: DictionarySearchParams): Promise<DictionaryWord>;
  getCachedWord(
    word: string,
    fromLanguage?: LanguageCode,
    targetLanguage?: LanguageCode
  ): DictionaryWord | null;
  clearCache(): void;
}

// Hook return type
export interface UseDictionaryReturn {
  wordInfo: DictionaryWord | null;
  isLoading: boolean;
  error: DictionaryError | null;
  searchWord: (
    word: string,
    fromLanguage?: LanguageCode,
    targetLanguage?: LanguageCode
  ) => Promise<void>;
  clearError: () => void;
}
