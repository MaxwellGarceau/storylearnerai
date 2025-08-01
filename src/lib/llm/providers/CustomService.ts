import { LLMService } from '../LLMService';
import { LLMRequest, LLMResponse, CustomConfig } from '../../types/llm';
import { logger } from '../../../lib/logger';

export class CustomService extends LLMService {
  constructor(config: CustomConfig) {
    super(config);
  }

  async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
    try {
      const customConfig = this.config as CustomConfig;
      const response = await fetch(`${customConfig.endpoint}/completions`, {
        method: 'POST',
        headers: this.buildCustomHeaders(),
        body: JSON.stringify({
          model: request.model || customConfig.model,
          prompt: request.prompt,
          max_tokens: request.maxTokens || customConfig.maxTokens,
          temperature: request.temperature || customConfig.temperature,
        }),
      });

      const data = await this.handleResponse(response);

      // Generic response format - may need adjustment based on actual API
      return {
        content: data.choices?.[0]?.text || data.content || data.response || '',
        tokenUsage: data.usage ? {
          promptTokens: data.usage.prompt_tokens || data.usage.input_tokens || 0,
          completionTokens: data.usage.completion_tokens || data.usage.output_tokens || 0,
          totalTokens: data.usage.total_tokens || (data.usage.prompt_tokens + data.usage.completion_tokens) || 0,
        } : undefined,
        model: data.model || customConfig.model,
        provider: 'custom',
      };
    } catch (error) {
      logger.error('llm', 'Custom API error', { error });
      throw error instanceof Error && 'provider' in error
        ? error
        : this.createError(
          error instanceof Error ? error.message : 'Custom API request failed',
          'CUSTOM_ERROR'
        );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const customConfig = this.config as CustomConfig;
      // Try to make a minimal request to check if the service is available
      const response = await fetch(`${customConfig.endpoint}/health`, {
        method: 'GET',
        headers: this.buildCustomHeaders(),
      });

      // If health endpoint doesn't exist, try the main endpoint
      if (response.status === 404) {
        const testResponse = await fetch(`${customConfig.endpoint}/completions`, {
          method: 'POST',
          headers: this.buildCustomHeaders(),
          body: JSON.stringify({
            model: customConfig.model,
            prompt: 'ping',
            max_tokens: 1,
          }),
        });
        return testResponse.ok;
      }

      return response.ok;
    } catch (error) {
      logger.error('llm', 'Custom API health check failed', { error });
      return false;
    }
  }

  private buildCustomHeaders(): Record<string, string> {
    const headers = this.buildHeaders();
    const customConfig = this.config as CustomConfig;
    
    // Default authorization header
    headers['Authorization'] = `Bearer ${customConfig.apiKey}`;
    
    // Add any custom headers from configuration
    if (customConfig.headers) {
      Object.assign(headers, customConfig.headers);
    }

    return headers;
  }
} 