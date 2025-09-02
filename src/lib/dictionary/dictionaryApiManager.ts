import {
  DictionaryApiManager,
  DictionaryApiClient,
  DictionarySearchParams,
  DictionaryWord,
  ApiManagerConfig,
  DictionaryWordPromise,
  DictionaryDataTransformer,
} from '../../types/dictionary';
import { LanguageCode } from '../../types/llm/prompts';
import { LexicalaApiClient } from './clients/lexicalaApiClient';
import { LexicalaDataTransformerImpl } from './transformers/lexicalaTransformer';
import { EnvironmentConfig } from '../config/env';
import { logger } from '../logger';

/**
 * Adapter class to make LexicalaDataTransformer compatible with DictionaryDataTransformer interface
 */
class LexicalaDataTransformerAdapter implements DictionaryDataTransformer {
  private lexicalaTransformer: LexicalaDataTransformerImpl;

  constructor() {
    this.lexicalaTransformer = new LexicalaDataTransformerImpl();
  }

  transformApiResponse(rawData: unknown): DictionaryWord {
    return this.lexicalaTransformer.transformLexicalaResponse(rawData);
  }

  validateWordData(data: unknown): data is DictionaryWord {
    return this.lexicalaTransformer.validateWordData(data);
  }
}

/**
 * Dictionary API Manager
 * Orchestrates API requests and data transformations with fallback support
 * Manages the complete request flow from API call to transformed data
 */
export class DictionaryApiManagerImpl implements DictionaryApiManager {
  private apiClients: Map<string, DictionaryApiClient> = new Map();
  private transformers: Map<string, DictionaryDataTransformer> = new Map();
  private config: ApiManagerConfig;

  constructor(config: ApiManagerConfig = { primaryApi: 'lexicala' }) {
    // Get configuration from environment
    const envConfig = EnvironmentConfig.getDictionaryConfig();

    // If dictionary is disabled, don't initialize API clients
    if (EnvironmentConfig.isDictionaryDisabled()) {
      logger.debug(
        'dictionary',
        'Dictionary is disabled, skipping API client initialization'
      );
      this.config = {
        timeout: 10000,
        retryAttempts: 2,
        ...config,
      };
      return;
    }

    // Ensure required configuration is present
    if (!envConfig.endpoint || !envConfig.apiKey) {
      throw new Error('Dictionary API endpoint and API key are required');
    }

    this.config = {
      timeout: 10000,
      retryAttempts: 2,
      ...config,
    };

    this.initializeApiClients(envConfig);
    this.initializeTransformers();
  }

  /**
   * Initialize all available API clients
   */
  private initializeApiClients(envConfig: {
    endpoint: string;
    apiKey: string;
  }): void {
    this.apiClients.set(
      'lexicala',
      new LexicalaApiClient(envConfig.endpoint, envConfig.apiKey)
    );

    logger.debug('dictionary', 'Initialized API clients', {
      availableClients: Array.from(this.apiClients.keys()),
      primaryApi: this.config.primaryApi,
      endpoint: envConfig.endpoint,
    });
  }

  /**
   * Initialize all available transformers
   */
  private initializeTransformers(): void {
    this.transformers.set('lexicala', new LexicalaDataTransformerAdapter());

    logger.debug('dictionary', 'Initialized transformers', {
      availableTransformers: Array.from(this.transformers.keys()),
      primaryApi: this.config.primaryApi,
    });
  }

  /**
   * Search for a word using the configured API
   */
  async searchWord(params: DictionarySearchParams): DictionaryWordPromise {
    // Check if dictionary is disabled
    if (EnvironmentConfig.isDictionaryDisabled()) {
      logger.debug('dictionary', 'Dictionary is disabled, throwing error', {
        word: params.word,
      });
      throw new Error('Dictionary service is disabled');
    }

    // Set default target language if not provided
    const searchParams = {
      ...params,
      targetLanguage: params.targetLanguage ?? 'en',
    };

    logger.debug('dictionary', 'Starting word search', {
      word: searchParams.word,
      targetLanguage: searchParams.targetLanguage,
      primaryApi: this.config.primaryApi,
    });

    try {
      // Try primary API
      return await this.tryApiRequest(this.config.primaryApi, searchParams);
    } catch (error) {
      logger.warn('dictionary', 'API request failed', {
        primaryApi: this.config.primaryApi,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Get detailed word information
   */
  async getWordDetails(
    word: string,
    fromLanguage?: LanguageCode,
    targetLanguage?: LanguageCode
  ): DictionaryWordPromise {
    return this.searchWord({
      word,
      fromLanguage,
      targetLanguage: targetLanguage ?? 'en',
    });
  }

  /**
   * Try a specific API with retry logic
   */
  private async tryApiRequest(
    apiType: string,
    params: DictionarySearchParams
  ): Promise<DictionaryWord> {
    const client = this.apiClients.get(apiType);
    if (!client) {
      throw new Error(`API client not available for: ${apiType}`);
    }

    if (!client.isAvailable()) {
      throw new Error(`API client not available: ${apiType}`);
    }

    let lastError: Error | null = null;

    for (
      let attempt = 1;
      attempt <= (this.config.retryAttempts ?? 1);
      attempt++
    ) {
      try {
        logger.debug('dictionary', `Attempting API request`, {
          apiType,
          attempt,
          word: params.word,
        });

        // Make API request
        const response = await client.searchWord(params);

        if (!response.success) {
          throw new Error(response.error ?? 'API request failed');
        }

        // Transform the response using the appropriate transformer
        const transformer = this.transformers.get(apiType);
        if (!transformer) {
          throw new Error(`No transformer available for API type: ${apiType}`);
        }

        const transformedWord = transformer.transformApiResponse(response.word);

        logger.info('dictionary', 'Successfully processed API request', {
          apiType,
          word: params.word,
          definitionsCount: transformedWord.definitions.length,
        });

        return transformedWord;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        logger.debug('dictionary', 'API request attempt failed', {
          apiType,
          attempt,
          error: lastError.message,
        });

        if (attempt < (this.config.retryAttempts ?? 1)) {
          // Wait before retry (exponential backoff)
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError ?? new Error(`All attempts failed for API: ${apiType}`);
  }

  /**
   * Check if any API is available
   */
  isAvailable(): boolean {
    return Array.from(this.apiClients.values()).some(client =>
      client.isAvailable()
    );
  }

  /**
   * Get available API types
   */
  getAvailableApis(): string[] {
    return Array.from(this.apiClients.keys());
  }

  /**
   * Get available transformer types
   */
  getAvailableTransformers(): string[] {
    return Array.from(this.transformers.keys());
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ApiManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    logger.debug('dictionary', 'Updated API manager configuration', {
      newConfig: this.config,
    });
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiManagerConfig {
    return { ...this.config };
  }

  /**
   * Add a custom API client
   */
  addApiClient(apiType: string, client: DictionaryApiClient): void {
    this.apiClients.set(apiType, client);
    logger.debug('dictionary', 'Added custom API client', { apiType });
  }

  /**
   * Remove an API client
   */
  removeApiClient(apiType: string): void {
    this.apiClients.delete(apiType);
    logger.debug('dictionary', 'Removed API client', { apiType });
  }

  /**
   * Add a custom transformer
   */
  addTransformer(
    apiType: string,
    transformer: DictionaryDataTransformer
  ): void {
    this.transformers.set(apiType, transformer);
    logger.debug('dictionary', 'Added custom transformer', { apiType });
  }

  /**
   * Remove a transformer
   */
  removeTransformer(apiType: string): void {
    this.transformers.delete(apiType);
    logger.debug('dictionary', 'Removed transformer', { apiType });
  }

  /**
   * Get available transformer types
   */
  getAvailableTransformers(): string[] {
    return Array.from(this.transformers.keys());
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create API manager
 */
export function createDictionaryApiManager(
  config?: ApiManagerConfig
): DictionaryApiManager {
  return new DictionaryApiManagerImpl(config);
}
