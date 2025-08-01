import { LLMService } from '../LLMService';
import { LLMRequest, LLMResponse, AnthropicConfig } from '../../types/llm';
import { logger } from '../../../lib/logger';

export class AnthropicService extends LLMService {
  constructor(config: AnthropicConfig) {
    super(config);
  }

  async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
    try {
      const anthropicConfig = this.config as AnthropicConfig;
      const response = await fetch(`${anthropicConfig.endpoint}/messages`, {
        method: 'POST',
        headers: this.buildAnthropicHeaders(),
        body: JSON.stringify({
          model: request.model || anthropicConfig.model,
          max_tokens: request.maxTokens || anthropicConfig.maxTokens,
          temperature: request.temperature || anthropicConfig.temperature,
          messages: [
            {
              role: 'user',
              content: request.prompt,
            },
          ],
        }),
      });

      const data = await this.handleResponse(response);

      return {
        content: data.content[0]?.text || '',
        tokenUsage: data.usage ? {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        } : undefined,
        model: data.model,
        provider: 'anthropic',
      };
    } catch (error) {
      logger.error('llm', 'Anthropic API error', { error });
      throw error instanceof Error && 'provider' in error
        ? error
        : this.createError(
          error instanceof Error ? error.message : 'Anthropic API request failed',
          'ANTHROPIC_ERROR'
        );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const anthropicConfig = this.config as AnthropicConfig;
      // Anthropic doesn't have a models endpoint, so we'll make a minimal request
      const response = await fetch(`${anthropicConfig.endpoint}/messages`, {
        method: 'POST',
        headers: this.buildAnthropicHeaders(),
        body: JSON.stringify({
          model: anthropicConfig.model,
          max_tokens: 1,
          messages: [
            {
              role: 'user',
              content: 'ping',
            },
          ],
        }),
      });

      return response.ok;
    } catch (error) {
      logger.error('llm', 'Anthropic health check failed', { error });
      return false;
    }
  }

  private buildAnthropicHeaders(): Record<string, string> {
    const headers = this.buildHeaders();
    const anthropicConfig = this.config as AnthropicConfig;
    headers['x-api-key'] = anthropicConfig.apiKey;
    headers['anthropic-version'] = anthropicConfig.version || '2023-06-01';

    return headers;
  }
} 