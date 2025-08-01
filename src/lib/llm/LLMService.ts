import { LLMRequest, LLMResponse, LLMError, ProviderConfig } from '../../types/llm/providers';

export abstract class LLMService {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  /**
   * Generate text completion from the LLM
   */
  abstract generateCompletion(request: LLMRequest): Promise<LLMResponse>;

  /**
   * Health check for the LLM service
   */
  abstract healthCheck(): Promise<boolean>;

  /**
   * Get the provider name
   */
  getProvider(): string {
    return this.config.provider;
  }

  /**
   * Get the model name
   */
  getModel(): string {
    return this.config.model;
  }

  /**
   * Create an LLM error with provider context
   */
  protected createError(message: string, code: string, statusCode?: number): LLMError {
    return {
      message,
      code,
      provider: this.config.provider,
      statusCode,
    };
  }

  /**
   * Build request headers for API calls
   */
  protected buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'User-Agent': 'StoryLearnerAI/1.0',
    };
  }

  /**
   * Handle API response and convert to LLMResponse
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const errorText = await response.text();
      throw this.createError(
        `API request failed: ${response.status} ${response.statusText}. ${errorText}`,
        'API_ERROR',
        response.status
      );
    }

    try {
      return await response.json();
    } catch {
      throw this.createError(
        'Failed to parse API response',
        'PARSE_ERROR',
        response.status
      );
    }
  }
} 