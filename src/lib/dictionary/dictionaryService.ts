import {
  DictionaryWord,
  DictionaryError,
  DictionaryErrorCode,
  DictionarySearchParams,
  DictionaryService,
  DictionaryWordPromise,
  DictionaryWordOrNull,
} from '../../types/dictionary';
import {
  DictionaryApiManagerImpl,
  createDictionaryApiManager,
} from './dictionaryApiManager';
import { logger } from '../logger';
import { LanguageCode } from '../../types/llm/prompts';
import { EnvironmentConfig } from '../config/env';
import { createDictionaryError } from './utils';

/**
 * Main dictionary service that orchestrates API calls, data transformation, and caching
 */
export class DictionaryServiceImpl implements DictionaryService {
  private apiManager: DictionaryApiManagerImpl;
  private cache: Map<string, DictionaryWord> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly cacheTimeout = 30 * 60 * 1000; // 30 minutes

  constructor(apiManager?: DictionaryApiManagerImpl) {
    this.apiManager =
      apiManager ||
      (createDictionaryApiManager({
        primaryApi: 'lexicala',
      }) as DictionaryApiManagerImpl);
  }

  /**
   * Get word information with caching
   */
  async getWordInfo(
    word: string,
    fromLanguage?: LanguageCode,
    targetLanguage: LanguageCode = 'en'
  ): DictionaryWordPromise {
    // Check if dictionary is disabled
    if (EnvironmentConfig.isDictionaryDisabled()) {
      logger.debug(
        'dictionary',
        'Dictionary is disabled, returning empty result',
        {
          word,
        }
      );
      throw createDictionaryError(
        'API_ERROR',
        'Dictionary service is disabled',
        { word, fromLanguage, targetLanguage }
      );
    }

    const normalizedWord = word.toLowerCase().trim();
    const cacheKey = `${normalizedWord}:${fromLanguage ?? 'default'}:${targetLanguage}`;

    // Check cache first
    const cachedWord = this.getCachedWord(
      normalizedWord,
      fromLanguage,
      targetLanguage
    );
    if (cachedWord) {
      logger.debug('dictionary', 'Returning cached word', {
        word: normalizedWord,
      });
      return cachedWord;
    }

    try {
      logger.debug('dictionary', 'Fetching word from API', {
        word: normalizedWord,
        fromLanguage,
        targetLanguage,
      });

      // Use API manager to handle the complete request flow
      const transformedWord = await this.apiManager.searchWord({
        word: normalizedWord,
        fromLanguage,
        targetLanguage,
      });

      // Cache the result
      this.cacheWord(cacheKey, transformedWord);

      logger.debug('dictionary', 'Successfully fetched and transformed word', {
        word: normalizedWord,
        definitionsCount: transformedWord.definitions.length,
      });

      return transformedWord;
    } catch (error) {
      logger.error('dictionary', 'Failed to get word info', {
        word: normalizedWord,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Re-throw as DictionaryError
      if (error instanceof Error && 'code' in error) {
        throw error as DictionaryError;
      }

      throw createDictionaryError(
        'API_ERROR',
        error instanceof Error
          ? error.message
          : 'Failed to fetch word information',
        { word: normalizedWord, fromLanguage, targetLanguage }
      );
    }
  }

  /**
   * Search for a word with specific parameters
   */
  async searchWord(params: DictionarySearchParams): DictionaryWordPromise {
    return this.getWordInfo(
      params.word,
      params.fromLanguage,
      params.targetLanguage
    );
  }

  /**
   * Get cached word if available and not expired
   */
  getCachedWord(
    word: string,
    fromLanguage?: LanguageCode,
    targetLanguage?: LanguageCode
  ): DictionaryWordOrNull {
    const cacheKey = `${word}:${fromLanguage ?? 'default'}:${targetLanguage ?? 'en'}`;
    const expiryTime = this.cacheExpiry.get(cacheKey);
    const now = Date.now();

    if (expiryTime && now < expiryTime) {
      const cachedWord = this.cache.get(cacheKey);
      if (cachedWord) {
        return cachedWord;
      }
    }

    // Remove expired cache entry
    if (expiryTime && now >= expiryTime) {
      this.cache.delete(cacheKey);
      this.cacheExpiry.delete(cacheKey);
    }

    return null;
  }

  /**
   * Clear all cached words
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    logger.debug('dictionary', 'Cache cleared');
  }

  /**
   * Cache a word with expiration
   */
  private cacheWord(cacheKey: string, word: DictionaryWord): void {
    this.cache.set(cacheKey, word);
    this.cacheExpiry.set(cacheKey, Date.now() + this.cacheTimeout);

    // Clean up old cache entries periodically
    this.cleanupCache();
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, expiryTime] of this.cacheExpiry.entries()) {
      if (now >= expiryTime) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    });

    if (expiredKeys.length > 0) {
      logger.debug('dictionary', 'Cleaned up expired cache entries', {
        count: expiredKeys.length,
      });
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  /**
   * Check if the service is available
   */
  isAvailable(): boolean {
    return this.apiManager.isAvailable();
  }
}

/**
 * Factory function to create dictionary service with different configurations
 */
export function createDictionaryService(config?: {
  useMock?: boolean;
  mockData?: Record<string, DictionaryWord>;
  cacheTimeout?: number;
}): DictionaryServiceImpl {
  const { cacheTimeout } = config ?? {};

  // Create API manager with appropriate configuration
  const apiManager = createDictionaryApiManager({
    primaryApi: 'lexicala',
  });

  const service = new DictionaryServiceImpl(
    apiManager as DictionaryApiManagerImpl
  );

  if (cacheTimeout) {
    // Note: This would require exposing cacheTimeout as a public property
    // For now, we'll use the default timeout
  }

  return service;
}

// Export a default instance
export const dictionaryService = createDictionaryService();
