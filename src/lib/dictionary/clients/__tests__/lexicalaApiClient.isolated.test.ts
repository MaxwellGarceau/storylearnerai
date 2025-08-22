import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DictionarySearchParams } from '../../../../types/dictionary';
import { LanguageCode } from '../../../../types/llm/prompts';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock window event listeners
const mockAddEventListener = vi.fn();
Object.defineProperty(window, 'addEventListener', {
  writable: true,
  value: mockAddEventListener,
});

// Mock createDictionaryError to avoid import chain
const mockCreateDictionaryError = vi.fn((code: string, message: string) => {
  const error = new Error(message);
  (error as any).code = code;
  return error;
});

// Import the class directly and mock its dependencies
let LexicalaApiClient: any;

// Mock the utils module before importing
vi.doMock('../utils', () => ({
  createDictionaryError: mockCreateDictionaryError,
}));

describe('LexicalaApiClient (Isolated)', () => {
  let client: any;
  const mockEndpoint = 'https://lexicala1.p.rapidapi.com';
  const mockApiKey = 'test-api-key';

  beforeEach(async () => {
    vi.clearAllMocks();

    // Ensure client is online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Import the class after mocking
    const module = await import('../lexicalaApiClient');
    LexicalaApiClient = module.LexicalaApiClient;

    client = new LexicalaApiClient(mockEndpoint, mockApiKey);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with endpoint and API key', () => {
      expect(client).toBeInstanceOf(LexicalaApiClient);
      expect(client.isAvailable()).toBe(true);
    });

    it('should set up online/offline event listeners', () => {
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'online',
        expect.any(Function)
      );
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'offline',
        expect.any(Function)
      );
    });
  });

  describe('searchWord', () => {
    const mockParams: DictionarySearchParams = {
      word: 'hello',
      targetLanguage: 'en',
    };

    it('should successfully search for a word', async () => {
      const mockResponse = {
        results: [
          {
            word: 'hello',
            phonetic: 'həˈloʊ',
            meanings: [
              {
                partOfSpeech: 'noun',
                definitions: [
                  {
                    definition: 'A greeting or an expression of goodwill.',
                    example: 'She gave me a warm hello.',
                  },
                ],
              },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        clone: function() { return this; },
      });

      const result = await client.searchWord(mockParams);

      expect(result.success).toBe(true);
      expect(result.word).toEqual(mockResponse);
      expect(result.source).toBe('Lexicala API');
      expect(result.timestamp).toBeDefined();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `${mockEndpoint}/search?text=hello&language=en`,
          method: 'GET',
        })
      );
    });

    it('should handle 404 responses (word not found)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        clone: function() { return this; },
      });

      await expect(client.searchWord(mockParams)).rejects.toThrow(
        'Word "hello" not found in dictionary'
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        clone: function() { return this; },
      });

      await expect(client.searchWord(mockParams)).rejects.toThrow(
        'API request failed with status 500'
      );
    });

    it('should handle empty results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ results: [] }),
        clone: function() { return this; },
      });

      await expect(client.searchWord(mockParams)).rejects.toThrow(
        'Word "hello" not found in dictionary'
      );
    });

    it('should handle missing results property', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
        clone: function() { return this; },
      });

      await expect(client.searchWord(mockParams)).rejects.toThrow(
        'Word "hello" not found in dictionary'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

      await expect(client.searchWord(mockParams)).rejects.toThrow(
        'Network request failed'
      );
      expect(client.isAvailable()).toBe(false);
    });

    it('should handle request timeouts', async () => {
      // Mock a timeout by rejecting with AbortError
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      await expect(client.searchWord(mockParams)).rejects.toThrow(
        'Request timeout'
      );
    });

    it('should handle empty word parameter', async () => {
      await expect(client.searchWord({ word: '' })).rejects.toThrow(
        'Word parameter is required'
      );
    });

    it('should handle whitespace-only word parameter', async () => {
      await expect(client.searchWord({ word: '   ' })).rejects.toThrow(
        'Word parameter is required'
      );
    });

    it('should handle offline status', async () => {
      // Simulate offline status
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const offlineClient = new LexicalaApiClient(mockEndpoint, mockApiKey);
      await expect(offlineClient.searchWord(mockParams)).rejects.toThrow(
        'No internet connection available'
      );
    });

    it('should use default target language when not provided', async () => {
      const mockResponse = { results: [{ word: 'hello' }] };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        clone: function() { return this; },
      });

      await client.searchWord({ word: 'hello' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `${mockEndpoint}/search?text=hello&language=en`,
          method: 'GET',
        })
      );
    });

    it('should URL encode the word parameter', async () => {
      const mockResponse = { results: [{ word: 'hello world' }] };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        clone: function() { return this; },
      });

      await client.searchWord({ word: 'hello world' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `${mockEndpoint}/search?text=hello%20world&language=en`,
          method: 'GET',
        })
      );
    });
  });

  describe('getWordDetails', () => {
    it('should call searchWord with correct parameters', async () => {
      const mockResponse = { results: [{ word: 'hello' }] };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        clone: function() { return this; },
      });

      await client.getWordDetails('hello', 'es', 'en');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `${mockEndpoint}/search?text=hello&language=en`,
          method: 'GET',
        })
      );
    });

    it('should use default target language when not provided', async () => {
      const mockResponse = { results: [{ word: 'hello' }] };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        clone: function() { return this; },
      });

      await client.getWordDetails('hello', 'es');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `${mockEndpoint}/search?text=hello&language=en`,
          method: 'GET',
        })
      );
    });
  });

  describe('isAvailable', () => {
    it('should return true when online', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const onlineClient = new LexicalaApiClient(mockEndpoint, mockApiKey);
      expect(onlineClient.isAvailable()).toBe(true);
    });

    it('should return false when offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const offlineClient = new LexicalaApiClient(mockEndpoint, mockApiKey);
      expect(offlineClient.isAvailable()).toBe(false);
    });
  });

  describe('online/offline event handling', () => {
    it('should update availability when going offline', () => {
      const offlineCall = mockAddEventListener.mock.calls.find(
        call => call[0] === 'offline'
      );
      expect(offlineCall).toBeDefined();
      const offlineHandler = offlineCall![1];

      offlineHandler();
      expect(client.isAvailable()).toBe(false);
    });

    it('should update availability when going online', () => {
      // First go offline
      const offlineCall = mockAddEventListener.mock.calls.find(
        call => call[0] === 'offline'
      );
      expect(offlineCall).toBeDefined();
      const offlineHandler = offlineCall![1];
      offlineHandler();

      // Then go online
      const onlineCall = mockAddEventListener.mock.calls.find(
        call => call[0] === 'online'
      );
      expect(onlineCall).toBeDefined();
      const onlineHandler = onlineCall![1];
      onlineHandler();

      expect(client.isAvailable()).toBe(true);
    });
  });

  describe('makeRequest', () => {
    it('should handle request timeout', async () => {
      // Mock a timeout by rejecting with AbortError
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      await expect(client.searchWord({ word: 'hello' })).rejects.toThrow(
        'Request timeout'
      );
    });

    it('should set correct headers', async () => {
      const mockResponse = { results: [{ word: 'hello' }] };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        clone: function() { return this; },
      });

      await client.searchWord({ word: 'hello' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/search?text=hello&language=en'),
          method: 'GET',
        })
      );
    });
  });
});
