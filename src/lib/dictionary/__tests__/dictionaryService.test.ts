import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DictionaryServiceImpl } from '../dictionaryService';
import { DictionaryApiManagerImpl } from '../dictionaryApiManager';
import { LexicalaApiClient } from '../clients/lexicalaApiClient';
import { DictionaryWord } from '../../../types/dictionary';

// Mock EnvironmentConfig
vi.mock('../../config/env', () => ({
  EnvironmentConfig: {
    getDictionaryConfig: () => ({
      endpoint: 'https://lexicala1.p.rapidapi.com',
      apiKey: 'test-api-key',
    }),
    isDictionaryDisabled: () => false,
  },
}));

// Mock LexicalaApiClient
vi.mock('../clients/lexicalaApiClient', () => ({
  LexicalaApiClient: vi.fn(),
}));

// Mock data for testing - raw API response format
const mockApiResponse = {
  word: 'hello',
  phonetic: 'həˈloʊ',
  phonetics: [
    {
      text: 'həˈloʊ',
      audio:
        'https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3',
    },
  ],
  meanings: [
    {
      partOfSpeech: 'noun',
      definitions: [
        {
          definition: 'A greeting or an expression of goodwill.',
          example: 'She gave me a warm hello.',
          synonyms: ['greeting', 'salutation'],
          antonyms: ['goodbye', 'farewell'],
        },
      ],
      synonyms: ['greeting', 'salutation'],
      antonyms: ['goodbye', 'farewell'],
    },
    {
      partOfSpeech: 'verb',
      definitions: [
        {
          definition: 'To greet with "hello".',
          example: 'He helloed me from across the street.',
        },
      ],
    },
  ],
  origin: 'From Old English hēlā, a compound of hēl and ā.',
};

// Mock data in DictionaryWord format for MockDictionaryApiClient
const _mockDictionaryWord: DictionaryWord = {
  word: 'hello',
  phonetic: 'həˈloʊ',
  definitions: [
    {
      definition: 'A greeting or an expression of goodwill.',
      partOfSpeech: 'noun',
      examples: ['She gave me a warm hello.'],
      synonyms: ['greeting', 'salutation'],
      antonyms: ['goodbye', 'farewell'],
    },
    {
      definition: 'To greet with "hello".',
      partOfSpeech: 'verb',
      examples: ['He helloed me from across the street.'],
    },
  ],
  synonyms: ['greeting', 'salutation'],
  antonyms: ['goodbye', 'farewell'],
  etymology: 'From Old English hēlā, a compound of hēl and ā.',
  audioUrl:
    'https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3',
  source: 'Lexicala API',
  lastUpdated: new Date().toISOString(),
};

describe('DictionaryService', () => {
  let service: DictionaryServiceImpl;
  let apiManager: DictionaryApiManagerImpl;
  let mockApiClient: any;

  beforeEach(() => {
    // Create mock API client instance
    mockApiClient = {
      searchWord: vi.fn(),
      getWordDetails: vi.fn(),
      isAvailable: vi.fn().mockReturnValue(true),
    };

    // Default mock response for searchWord
    mockApiClient.searchWord.mockResolvedValue({
      word: mockApiResponse,
      success: true,
      source: 'Lexicala API',
      timestamp: new Date().toISOString(),
    });

    // Mock the LexicalaApiClient constructor to return our mock
    vi.mocked(LexicalaApiClient).mockImplementation(() => mockApiClient);

    // Create API manager (it will use the mocked client)
    apiManager = new DictionaryApiManagerImpl({
      primaryApi: 'lexicala',
    });

    service = new DictionaryServiceImpl(apiManager);
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('getWordInfo', () => {
    it('should fetch and transform word information successfully', async () => {
      // Mock the API response
      mockApiClient.searchWord.mockResolvedValue({
        word: mockApiResponse,
        success: true,
        source: 'Lexicala API',
        timestamp: new Date().toISOString(),
      });

      const result = await service.getWordInfo('hello', undefined, 'en');

      expect(result.word).toBe('hello');
      expect(result.phonetic).toBe('həˈloʊ');
      expect(result.definitions).toHaveLength(2);
      expect(result.definitions[0].definition).toContain('greeting');
      expect(result.definitions[0].partOfSpeech).toBe('noun');
      expect(result.synonyms).toBeDefined();
      if (result.synonyms) {
        expect(result.synonyms).toContain('greeting');
      }
      expect(result.antonyms).toBeDefined();
      if (result.antonyms) {
        expect(result.antonyms).toContain('goodbye');
      }
      if (result.etymology) {
        expect(result.etymology).toContain('Old English');
      }
      if (result.audioUrl) {
        expect(result.audioUrl).toBe(
          'https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3'
        );
      }
      expect(result.source).toBe('Lexicala API');
    });

    it('should cache word information', async () => {
      // Mock the API response
      mockApiClient.searchWord.mockResolvedValue({
        word: mockApiResponse,
        success: true,
        source: 'Lexicala API',
        timestamp: new Date().toISOString(),
      });

      // First call should hit the API
      const result1 = await service.getWordInfo('hello', undefined, 'en');

      // Second call should use cache
      const result2 = await service.getWordInfo('hello', undefined, 'en');

      expect(result1).toEqual(result2);

      // Verify API was only called once (second call used cache)
      expect(mockApiClient.searchWord).toHaveBeenCalledTimes(1);

      // Verify cache stats
      const stats = service.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.entries).toContain('hello:default:en');
    });

    it('should handle word not found errors', async () => {
      // Mock the API to throw a WORD_NOT_FOUND error
      const notFoundError = new Error('Word not found');
      (notFoundError as any).code = 'WORD_NOT_FOUND';
      mockApiClient.searchWord.mockRejectedValue(notFoundError);

      await expect(
        service.getWordInfo('nonexistentword', undefined, 'en')
      ).rejects.toMatchObject({
        code: 'WORD_NOT_FOUND',
        message: 'Word not found',
      });
    });

    it('should normalize word input', async () => {
      const result1 = await service.getWordInfo('HELLO', undefined, 'en');
      const result2 = await service.getWordInfo('hello', undefined, 'en');
      const result3 = await service.getWordInfo('  hello  ', undefined, 'en');

      expect(result1.word).toBe('hello');
      expect(result2.word).toBe('hello');
      expect(result3.word).toBe('hello');
    });

    it('should handle different languages', async () => {
      // Override the default mock for this specific test
      mockApiClient.searchWord.mockResolvedValueOnce({
        word: {
          word: 'hola',
          definitions: [{ definition: 'Hello in Spanish' }],
        },
        success: true,
        source: 'Lexicala API',
        timestamp: new Date().toISOString(),
      });

      const result = await service.getWordInfo('hola', undefined, 'es');

      expect(result.word).toBe('hola');

      // Verify cache key includes language
      const stats = service.getCacheStats();
      expect(stats.entries).toContain('hola:default:es');
    });
  });

  describe('caching', () => {
    it('should clear cache', async () => {
      await service.getWordInfo('hello', undefined, 'en');
      expect(service.getCacheStats().size).toBe(1);

      service.clearCache();
      expect(service.getCacheStats().size).toBe(0);
    });

    it('should handle cache expiration', async () => {
      await service.getWordInfo('hello', undefined, 'en');
      expect(service.getCacheStats().size).toBe(1);

      // Manually expire cache by setting expiry time in the past
      const cacheKey = 'hello:default:en';
      const privateCacheExpiry = (service as any).cacheExpiry;

      privateCacheExpiry.set(cacheKey, Date.now() - 1000); // Expired 1 second ago

      // This should trigger cleanup and remove expired entry
      await service.getWordInfo('world', undefined, 'en'); // Trigger cleanup

      expect(service.getCacheStats().size).toBe(1); // Only 'world' should remain
      expect(service.getCacheStats().entries).not.toContain('hello:default:en');
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      // Clear the default mock and set up error response
      mockApiClient.searchWord.mockReset();
      const apiError = new Error('API is down');
      (apiError as any).code = 'API_ERROR';
      mockApiClient.searchWord.mockRejectedValue(apiError);

      await expect(
        service.getWordInfo('hello', undefined, 'en')
      ).rejects.toMatchObject({
        code: 'API_ERROR',
        message: 'API is down',
      });
    });

    it('should handle invalid API responses', async () => {
      // Clear the default mock and set up invalid response
      mockApiClient.searchWord.mockReset();
      mockApiClient.searchWord.mockResolvedValue({
        word: null,
        success: true,
        source: 'Lexicala API',
        timestamp: new Date().toISOString(),
      });

      await expect(
        service.getWordInfo('hello', undefined, 'en')
      ).rejects.toMatchObject({
        code: 'API_ERROR',
      });
    });
  });

  describe('service availability', () => {
    it('should check if service is available', () => {
      expect(service.isAvailable()).toBe(true);
    });
  });
});
