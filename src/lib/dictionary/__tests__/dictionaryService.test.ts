import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DictionaryWord } from '../../../types/dictionary';

// Mock EnvironmentConfig
vi.doMock('../../config/env', () => ({
  EnvironmentConfig: {
    getDictionaryConfig: () => ({
      endpoint: 'https://lexicala1.p.rapidapi.com',
      apiKey: 'test-api-key',
    }),
    isDictionaryDisabled: () => false,
  },
}));

// Mock LexicalaApiClient
vi.doMock('../clients/lexicalaApiClient', () => ({
  LexicalaApiClient: vi.fn(),
}));

// Import the classes directly and mock their dependencies
let DictionaryServiceImpl: new (
  apiManager?: import('../dictionaryApiManager').DictionaryApiManagerImpl
) => import('../dictionaryService').DictionaryServiceImpl;
let DictionaryApiManagerImpl: new (
  config?: import('../../../types/dictionary').ApiManagerConfig
) => import('../dictionaryApiManager').DictionaryApiManagerImpl;
let LexicalaApiClient: new (
  endpoint: string,
  apiKey: string
) => import('../clients/lexicalaApiClient').LexicalaApiClient;

// Mock data for testing - raw API response format
const mockApiResponse = {
  n_results: 1,
  page_number: 1,
  results_per_page: 10,
  n_pages: 1,
  available_n_pages: 1,
  results: [
    {
      id: 'EN_DE2d686591a3f3',
      language: 'en',
      headword: {
        text: 'hello',
      },
      senses: [
        {
          id: 'EN_SEc21dc4afd439',
          definition: 'A greeting or an expression of goodwill.',
          partOfSpeech: 'noun',
          examples: ['She gave me a warm hello.'],
          synonyms: ['greeting', 'salutation'],
          antonyms: ['goodbye', 'farewell'],
        },
        {
          id: 'EN_SEc21dc4afd440',
          definition: 'To greet with "hello".',
          partOfSpeech: 'verb',
          examples: ['He helloed me from across the street.'],
        },
      ],
    },
  ],
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
  type ViFn = ReturnType<typeof vi.fn>;
  type MockApiClient = {
    searchWord: ViFn;
    getWordDetails: ViFn;
    isAvailable: ViFn;
  };

  let service: import('../dictionaryService').DictionaryServiceImpl;
  let apiManager: import('../dictionaryApiManager').DictionaryApiManagerImpl;
  let mockApiClient: MockApiClient;

  beforeEach(async () => {
    // Import the modules after mocking
    const serviceModule = await import('../dictionaryService');
    const managerModule = await import('../dictionaryApiManager');
    const clientModule = await import('../clients/lexicalaApiClient');

    DictionaryServiceImpl = serviceModule.DictionaryServiceImpl;
    DictionaryApiManagerImpl = managerModule.DictionaryApiManagerImpl;
    LexicalaApiClient = clientModule.LexicalaApiClient;

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
    vi.mocked(LexicalaApiClient).mockImplementation(
      () =>
        mockApiClient as unknown as import('../clients/lexicalaApiClient').LexicalaApiClient
    );

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
      (notFoundError as Error & { code: string }).code = 'WORD_NOT_FOUND';
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
          n_results: 1,
          page_number: 1,
          results_per_page: 10,
          n_pages: 1,
          available_n_pages: 1,
          results: [
            {
              id: 'ES_DE2d686591a3f3',
              language: 'es',
              headword: {
                text: 'hola',
              },
              senses: [
                {
                  id: 'ES_SEc21dc4afd439',
                  definition: 'Hello in Spanish',
                  partOfSpeech: 'noun',
                },
              ],
            },
          ],
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
      const privateCacheExpiry = (
        service as unknown as { cacheExpiry: Map<string, number> }
      ).cacheExpiry;

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
      (apiError as Error & { code: string }).code = 'API_ERROR';
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
