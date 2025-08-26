import {
  DictionaryApiClient,
  DictionarySearchParams,
  DictionaryResponsePromise,
  LexicalaApiResponse,
} from '../../../types/dictionary';
import { LanguageCode } from '../../../types/llm/prompts';
import { createDictionaryError } from '../utils';

/**
 * API Client for dictionary services
 * Currently supports Lexicala API (https://lexicala.com/)
 * Can be easily extended to support other APIs
 */
export class LexicalaApiClient implements DictionaryApiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout = 10000; // 10 seconds
  private isOnline = true;

  constructor(endpoint: string, apiKey: string) {
    this.baseUrl = endpoint;
    this.apiKey = apiKey;
    // Check online status
    this.checkOnlineStatus();
  }

  /**
   * Search for a word in the dictionary
   */
  async searchWord(params: DictionarySearchParams): DictionaryResponsePromise {
    const { word, targetLanguage = 'en' } = params;

    if (!this.isOnline) {
      throw createDictionaryError(
        'NETWORK_ERROR',
        'No internet connection available'
      );
    }

    if (!word || word.trim() === '') {
      throw createDictionaryError(
        'INVALID_REQUEST',
        'Word parameter is required'
      );
    }

    try {
      // Lexicala API endpoint format: /search-entries?text=word&language=en
      const searchParams = new URLSearchParams({
        text: word.trim(),
        language: targetLanguage,
        source: 'password',
      });
      const url = `${this.baseUrl}/search-entries?${searchParams.toString()}`;
      const response = await this.makeRequest(url);

      if (response.status === 404) {
        throw createDictionaryError(
          'WORD_NOT_FOUND',
          `Word "${word}" not found in dictionary`
        );
      }

      if (!response.ok) {
        throw createDictionaryError(
          'API_ERROR',
          `API request failed with status ${response.status}`
        );
      }

      const data = (await response.json()) as LexicalaApiResponse;

      // Check if results exist
      if (!data.results || data.results.length === 0) {
        throw createDictionaryError(
          'WORD_NOT_FOUND',
          `Word "${word}" not found in dictionary`
        );
      }

      return {
        word: data, // Raw data - will be transformed by the data transformer
        success: true,
        source: 'Lexicala API',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error; // Re-throw our custom errors
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        this.isOnline = false;
        throw createDictionaryError('NETWORK_ERROR', 'Network request failed');
      }

      throw createDictionaryError(
        'API_ERROR',
        `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get detailed word information
   */
  async getWordDetails(
    word: string,
    _fromLanguage?: LanguageCode,
    targetLanguage: LanguageCode = 'en'
  ): DictionaryResponsePromise {
    return this.searchWord({ word, targetLanguage });
  }

  /**
   * Check if the API is available
   */
  isAvailable(): boolean {
    return this.isOnline;
  }

  /**
   * Make HTTP request with timeout and error handling
   */
  private async makeRequest(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': 'lexicala1.p.rapidapi.com',
      };

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw createDictionaryError('TIMEOUT', 'Request timeout');
      }

      throw error;
    }
  }

  /**
   * Check online status
   */
  private checkOnlineStatus(): void {
    this.isOnline = navigator.onLine;

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }
}
