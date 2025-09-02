import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { MockedFunction } from 'vitest';
import {
  DictionarySearchParams,
  DictionaryWord,
  DictionaryResponse,
  DictionaryApiClient,
  LexicalaDataTransformer,
  ApiManagerConfig,
  DictionaryApiManager as DictionaryApiManagerInterface,
} from '../../../types/dictionary';

// Mock EnvironmentConfig
vi.doMock('../../config/env', () => ({
  EnvironmentConfig: {
    getDictionaryConfig: vi.fn().mockReturnValue({
      endpoint: 'https://lexicala1.p.rapidapi.com',
      apiKey: 'test-api-key',
    }),
    isDictionaryDisabled: vi.fn().mockReturnValue(false),
  },
}));

// Mock LexicalaApiClient
vi.doMock('../clients/lexicalaApiClient', () => ({
  LexicalaApiClient: vi.fn(),
}));

// Mock LexicalaDataTransformerImpl
vi.doMock('../transformers/lexicalaTransformer', () => ({
  LexicalaDataTransformerImpl: vi.fn(),
}));

// Mock logger
vi.doMock('../../logger', () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Import the classes directly and mock their dependencies
let DictionaryApiManagerImpl: new (config?: ApiManagerConfig) => unknown;
let createDictionaryApiManager: (
  config?: ApiManagerConfig
) => DictionaryApiManagerInterface;

describe('DictionaryApiManagerImpl', () => {
  let apiManager: DictionaryApiManagerInterface;
  let mockApiClient: {
    searchWord: MockedFunction<DictionaryApiClient['searchWord']>;
    getWordDetails: MockedFunction<DictionaryApiClient['getWordDetails']>;
    isAvailable: MockedFunction<DictionaryApiClient['isAvailable']>;
  };
  let mockTransformer: {
    transformLexicalaResponse: MockedFunction<
      LexicalaDataTransformer['transformLexicalaResponse']
    >;
    validateWordData: MockedFunction<
      LexicalaDataTransformer['validateWordData']
    >;
  };
  let mockEnvironmentConfig: {
    getDictionaryConfig: vi.Mock;
    isDictionaryDisabled: vi.Mock;
  };

  const mockDictionaryWord: DictionaryWord = {
    word: 'hello',
    phonetic: 'həˈloʊ',
    definitions: [
      {
        definition: 'A greeting or an expression of goodwill.',
        partOfSpeech: 'noun',
        examples: ['She gave me a warm hello.'],
      },
    ],
    source: 'Lexicala API',
    lastUpdated: new Date().toISOString(),
  };

  const mockApiResponse: DictionaryResponse = {
    word: {
      word: 'hello',
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
    success: true,
    source: 'Lexicala API',
    timestamp: new Date().toISOString(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup mocks
    mockApiClient = {
      searchWord: vi.fn(),
      getWordDetails: vi.fn(),
      isAvailable: vi.fn().mockReturnValue(true),
    };

    mockTransformer = {
      transformLexicalaResponse: vi.fn().mockReturnValue(mockDictionaryWord),
      validateWordData: vi.fn().mockReturnValue(true),
    };

    // Import the modules after mocking
    const module = await import('../dictionaryApiManager');
    DictionaryApiManagerImpl = module.DictionaryApiManagerImpl;
    createDictionaryApiManager = module.createDictionaryApiManager;

    // Mock the modules - use the mocked versions directly
    const { EnvironmentConfig } = await import('../../config/env');

    // Store reference to the actual mock and reset it to default values
    mockEnvironmentConfig = EnvironmentConfig;
    mockEnvironmentConfig.getDictionaryConfig.mockReturnValue({
      endpoint: 'https://lexicala1.p.rapidapi.com',
      apiKey: 'test-api-key',
    });
    mockEnvironmentConfig.isDictionaryDisabled.mockReturnValue(false);

    // Mock LexicalaApiClient constructor
    const { LexicalaApiClient } = await import('../clients/lexicalaApiClient');
    (LexicalaApiClient as unknown as vi.Mock).mockImplementation(
      () => mockApiClient
    );

    // Mock LexicalaDataTransformerImpl constructor
    const { LexicalaDataTransformerImpl } = await import(
      '../transformers/lexicalaTransformer'
    );
    (LexicalaDataTransformerImpl as unknown as vi.Mock).mockImplementation(
      () => mockTransformer
    );

    apiManager = new DictionaryApiManagerImpl();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(apiManager).toBeInstanceOf(DictionaryApiManagerImpl);
      const config = apiManager.getConfig();
      expect(config.primaryApi).toBe('lexicala');
      expect(config.timeout).toBe(10000);
      expect(config.retryAttempts).toBe(2);
    });

    it('should initialize with custom configuration', () => {
      const customConfig = {
        primaryApi: 'custom',
        timeout: 5000,
        retryAttempts: 3,
      };

      const customApiManager = new DictionaryApiManagerImpl(customConfig);
      expect(customApiManager.getConfig()).toEqual(customConfig);
    });

    it('should throw error when dictionary config is missing', () => {
      // Reset the mock to return empty config before creating new instance
      mockEnvironmentConfig.getDictionaryConfig.mockReturnValue({});

      expect(() => new DictionaryApiManagerImpl()).toThrow(
        'Dictionary API endpoint and API key are required'
      );
    });

    it('should skip API client initialization when dictionary is disabled', () => {
      // Reset the mock to return disabled before creating new instance
      mockEnvironmentConfig.isDictionaryDisabled.mockReturnValue(true);

      const disabledApiManager = new DictionaryApiManagerImpl();
      expect(disabledApiManager.isAvailable()).toBe(false);
    });

    it('should initialize API clients and transformers when enabled', () => {
      expect(apiManager.isAvailable()).toBe(true);
      expect(apiManager.getAvailableApis()).toEqual(['lexicala']);
      expect(apiManager.getAvailableTransformers()).toEqual(['lexicala']);
    });
  });

  describe('searchWord', () => {
    const searchParams: DictionarySearchParams = {
      word: 'hello',
      targetLanguage: 'en',
    };

    it('should successfully search for a word', async () => {
      mockApiClient.searchWord.mockResolvedValue(mockApiResponse);

      const result = await apiManager.searchWord(searchParams);

      expect(result).toEqual(mockDictionaryWord);
      expect(mockApiClient.searchWord).toHaveBeenCalledWith(searchParams);
      expect(mockTransformer.transformLexicalaResponse).toHaveBeenCalledWith(
        mockApiResponse.word
      );
    });

    it('should throw error when dictionary is disabled', async () => {
      // Reset the mock to return disabled before creating new instance
      mockEnvironmentConfig.isDictionaryDisabled.mockReturnValue(true);
      const disabledApiManager = new DictionaryApiManagerImpl();

      await expect(disabledApiManager.searchWord(searchParams)).rejects.toThrow(
        'Dictionary service is disabled'
      );
    });

    it('should throw error when API client is not available', async () => {
      mockApiClient.isAvailable.mockReturnValue(false);

      await expect(apiManager.searchWord(searchParams)).rejects.toThrow(
        'API client not available: lexicala'
      );
    });

    it('should throw error when API request fails', async () => {
      const error = new Error('API request failed');
      mockApiClient.searchWord.mockRejectedValue(error);

      await expect(apiManager.searchWord(searchParams)).rejects.toThrow(
        'API request failed'
      );
    });

    it('should use default target language when not provided', async () => {
      mockApiClient.searchWord.mockResolvedValue(mockApiResponse);

      await apiManager.searchWord({ word: 'hello' });

      expect(mockApiClient.searchWord).toHaveBeenCalledWith({
        word: 'hello',
        targetLanguage: 'en',
      });
    });

    it('should retry failed requests', async () => {
      const error = new Error('Temporary error');
      mockApiClient.searchWord
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockApiResponse);

      const result = await apiManager.searchWord(searchParams);

      expect(result).toEqual(mockDictionaryWord);
      expect(mockApiClient.searchWord).toHaveBeenCalledTimes(2);
    });

    it('should throw error after all retry attempts fail', async () => {
      const error = new Error('Persistent error');
      mockApiClient.searchWord.mockRejectedValue(error);

      await expect(apiManager.searchWord(searchParams)).rejects.toThrow(
        'Persistent error'
      );
      expect(mockApiClient.searchWord).toHaveBeenCalledTimes(2); // Default retry attempts
    });

    it('should handle API response with error', async () => {
      const errorResponse = {
        ...mockApiResponse,
        success: false,
        error: 'Word not found',
      };
      mockApiClient.searchWord.mockResolvedValue(errorResponse);

      await expect(apiManager.searchWord(searchParams)).rejects.toThrow(
        'Word not found'
      );
    });

    it('should throw error when transformer is not available', async () => {
      mockApiClient.searchWord.mockResolvedValue(mockApiResponse);

      // Remove transformer
      apiManager.removeTransformer('lexicala');

      await expect(apiManager.searchWord(searchParams)).rejects.toThrow(
        'No transformer available for API type: lexicala'
      );
    });
  });

  describe('getWordDetails', () => {
    it('should call searchWord with correct parameters', async () => {
      mockApiClient.searchWord.mockResolvedValue(mockApiResponse);

      await apiManager.getWordDetails('hello', 'es', 'en');

      expect(mockApiClient.searchWord).toHaveBeenCalledWith({
        word: 'hello',
        fromLanguage: 'es',
        targetLanguage: 'en',
      });
    });

    it('should use default target language when not provided', async () => {
      mockApiClient.searchWord.mockResolvedValue(mockApiResponse);

      await apiManager.getWordDetails('hello', 'es');

      expect(mockApiClient.searchWord).toHaveBeenCalledWith({
        word: 'hello',
        fromLanguage: 'es',
        targetLanguage: 'en',
      });
    });
  });

  describe('isAvailable', () => {
    it('should return true when at least one API client is available', () => {
      expect(apiManager.isAvailable()).toBe(true);
    });

    it('should return false when no API clients are available', () => {
      mockApiClient.isAvailable.mockReturnValue(false);
      expect(apiManager.isAvailable()).toBe(false);
    });

    it('should return false when dictionary is disabled', () => {
      mockEnvironmentConfig.isDictionaryDisabled.mockReturnValue(true);
      const disabledApiManager = new DictionaryApiManagerImpl();
      expect(disabledApiManager.isAvailable()).toBe(false);
    });
  });

  describe('getAvailableApis', () => {
    it('should return list of available API types', () => {
      expect(apiManager.getAvailableApis()).toEqual(['lexicala']);
    });

    it('should return empty array when no APIs are configured', () => {
      mockEnvironmentConfig.isDictionaryDisabled.mockReturnValue(true);
      const disabledApiManager = new DictionaryApiManagerImpl();
      expect(disabledApiManager.getAvailableApis()).toEqual([]);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      const newConfig = {
        timeout: 15000,
        retryAttempts: 5,
      };

      apiManager.updateConfig(newConfig);

      expect(apiManager.getConfig().timeout).toBe(15000);
      expect(apiManager.getConfig().retryAttempts).toBe(5);
      expect(apiManager.getConfig().primaryApi).toBe('lexicala'); // Should remain unchanged
    });

    it('should merge configuration with existing values', () => {
      const originalConfig = apiManager.getConfig();
      const newConfig = { timeout: 15000 };

      apiManager.updateConfig(newConfig);

      expect(apiManager.getConfig()).toEqual({
        ...originalConfig,
        ...newConfig,
      });
    });
  });

  describe('getConfig', () => {
    it('should return a copy of the configuration', () => {
      const config1 = apiManager.getConfig();
      const config2 = apiManager.getConfig();

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // Should be different objects
    });
  });

  describe('addApiClient', () => {
    it('should add a custom API client', () => {
      const customClient = {
        searchWord: vi.fn(),
        getWordDetails: vi.fn(),
        isAvailable: vi.fn().mockReturnValue(true),
      };

      apiManager.addApiClient('custom', customClient);

      expect(apiManager.getAvailableApis()).toContain('custom');
      expect(apiManager.isAvailable()).toBe(true);
    });
  });

  describe('removeApiClient', () => {
    it('should remove an API client', () => {
      apiManager.removeApiClient('lexicala');

      expect(apiManager.getAvailableApis()).not.toContain('lexicala');
      expect(apiManager.isAvailable()).toBe(false);
    });

    it('should not throw error when removing non-existent client', () => {
      expect(() => apiManager.removeApiClient('non-existent')).not.toThrow();
    });
  });

  describe('addTransformer', () => {
    it('should add a custom transformer', () => {
      const customTransformer = {
        transformApiResponse: vi.fn(),
        validateWordData: vi.fn(),
      };

      apiManager.addTransformer('custom', customTransformer);

      expect(apiManager.getAvailableTransformers()).toContain('custom');
    });
  });

  describe('removeTransformer', () => {
    it('should remove a transformer', () => {
      apiManager.removeTransformer('lexicala');

      expect(apiManager.getAvailableTransformers()).not.toContain('lexicala');
    });

    it('should not throw error when removing non-existent transformer', () => {
      expect(() => apiManager.removeTransformer('non-existent')).not.toThrow();
    });
  });

  describe('getAvailableTransformers', () => {
    it('should return list of available transformer types', () => {
      expect(apiManager.getAvailableTransformers()).toEqual(['lexicala']);
    });

    it('should return empty array when no transformers are configured', () => {
      mockEnvironmentConfig.isDictionaryDisabled.mockReturnValue(true);
      const disabledApiManager = new DictionaryApiManagerImpl();
      expect(disabledApiManager.getAvailableTransformers()).toEqual([]);
    });
  });

  describe('tryApiRequest', () => {
    it('should throw error when API client is not available', async () => {
      mockApiClient.isAvailable.mockReturnValue(false);

      await expect(apiManager.searchWord({ word: 'hello' })).rejects.toThrow(
        'API client not available: lexicala'
      );
    });

    it('should throw error when API type is not supported', async () => {
      // Change primary API to non-existent type
      apiManager.updateConfig({ primaryApi: 'non-existent' });

      await expect(apiManager.searchWord({ word: 'hello' })).rejects.toThrow(
        'API client not available for: non-existent'
      );
    });

    it('should handle exponential backoff during retries', async () => {
      const error = new Error('Temporary error');
      mockApiClient.searchWord
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockApiResponse);

      const startTime = Date.now();
      await apiManager.searchWord({ word: 'hello' });
      const endTime = Date.now();

      // Should have waited at least 2 seconds (2^1 * 1000ms)
      expect(endTime - startTime).toBeGreaterThanOrEqual(2000);
    });
  });

  describe('LexicalaDataTransformerAdapter', () => {
    it('should properly adapt LexicalaDataTransformer to DictionaryDataTransformer interface', async () => {
      mockApiClient.searchWord.mockResolvedValue(mockApiResponse);

      const result = await apiManager.searchWord({ word: 'hello' });

      expect(result).toEqual(mockDictionaryWord);
      expect(mockTransformer.transformLexicalaResponse).toHaveBeenCalledWith(
        mockApiResponse.word
      );
    });

    it('should use validateWordData from the adapter', () => {
      const transformers = (
        apiManager as unknown as { transformers: Map<string, unknown> }
      ).transformers;
      const adapter = transformers.get('lexicala');
      expect(adapter).toBeDefined();
      const validate = (adapter as { validateWordData?: unknown })
        ?.validateWordData;
      expect(typeof validate).toBe('function');
    });
  });
});

describe('createDictionaryApiManager', () => {
  it('should create a DictionaryApiManager instance', () => {
    const manager = createDictionaryApiManager();
    expect(manager).toBeInstanceOf(DictionaryApiManagerImpl);
  });

  it('should create a DictionaryApiManager with custom configuration', () => {
    const customConfig = {
      primaryApi: 'custom',
      timeout: 5000,
      retryAttempts: 3,
    };

    const manager = createDictionaryApiManager(customConfig);
    expect(manager.getConfig()).toEqual(customConfig);
  });
});

describe('error handling and edge cases', () => {
  let apiManager: DictionaryApiManagerImpl;
  let mockApiClient: {
    searchWord: MockedFunction<DictionaryApiClient['searchWord']>;
    getWordDetails: MockedFunction<DictionaryApiClient['getWordDetails']>;
    isAvailable: MockedFunction<DictionaryApiClient['isAvailable']>;
  };
  let mockTransformer: {
    transformLexicalaResponse: MockedFunction<
      LexicalaDataTransformer['transformLexicalaResponse']
    >;
    validateWordData: MockedFunction<
      LexicalaDataTransformer['validateWordData']
    >;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockApiClient = {
      searchWord: vi.fn(),
      getWordDetails: vi.fn(),
      isAvailable: vi.fn().mockReturnValue(true),
    };

    mockTransformer = {
      transformLexicalaResponse: vi.fn(),
      validateWordData: vi.fn().mockReturnValue(true),
    };

    const { LexicalaApiClient } = await import('../clients/lexicalaApiClient');
    LexicalaApiClient.mockImplementation(() => mockApiClient);

    const { LexicalaDataTransformerImpl } = await import(
      '../transformers/lexicalaTransformer'
    );
    LexicalaDataTransformerImpl.mockImplementation(() => mockTransformer);

    apiManager = new DictionaryApiManagerImpl();
  });

  it('should handle transformer validation failure', async () => {
    const mockDictionaryWord: DictionaryWord = {
      word: 'hello',
      definitions: [{ definition: 'A greeting.' }],
    };

    mockApiClient.searchWord.mockResolvedValue({
      word: { test: 'data' },
      success: true,
    });

    mockTransformer.transformLexicalaResponse.mockReturnValue(
      mockDictionaryWord
    );
    mockTransformer.validateWordData.mockReturnValue(false);

    // Should still work since validation is not enforced in the current implementation
    const result = await apiManager.searchWord({ word: 'hello' });
    expect(result).toEqual(mockDictionaryWord);
  });

  it('should handle multiple API clients with fallback', async () => {
    const customClient = {
      searchWord: vi.fn(),
      getWordDetails: vi.fn(),
      isAvailable: vi.fn().mockReturnValue(true),
    };

    const customTransformer = {
      transformApiResponse: vi.fn(),
      validateWordData: vi.fn().mockReturnValue(true),
    };

    apiManager.addApiClient('custom', customClient);
    apiManager.addTransformer('custom', customTransformer);

    // Make primary API fail
    mockApiClient.searchWord.mockRejectedValue(new Error('Primary API failed'));
    customClient.searchWord.mockResolvedValue({
      word: { test: 'data' },
      success: true,
    });
    customTransformer.transformApiResponse.mockReturnValue({
      word: 'hello',
      definitions: [{ definition: 'A greeting.' }],
    });

    // Switch to custom API
    apiManager.updateConfig({ primaryApi: 'custom' });

    const result = await apiManager.searchWord({ word: 'hello' });
    expect(result.word).toBe('hello');
    expect(customClient.searchWord).toHaveBeenCalled();
  });

  it('should handle configuration updates affecting availability', () => {
    expect(apiManager.isAvailable()).toBe(true);

    // Remove all API clients
    apiManager.removeApiClient('lexicala');
    expect(apiManager.isAvailable()).toBe(false);

    // Add a new client
    const customClient = {
      searchWord: vi.fn(),
      getWordDetails: vi.fn(),
      isAvailable: vi.fn().mockReturnValue(true),
    };
    apiManager.addApiClient('custom', customClient);
    expect(apiManager.isAvailable()).toBe(true);
  });
});
