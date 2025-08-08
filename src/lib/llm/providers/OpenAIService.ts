import { LLMService } from '../LLMService';
import { LLMRequest, LLMResponse, OpenAIConfig } from '../../../types/llm/providers';
import { logger } from '../../../lib/logger';

export class OpenAIService extends LLMService {
  constructor(config: OpenAIConfig) {
    super(config);
  }

  async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
    try {
      const openaiConfig = this.config as OpenAIConfig;
      const response = await fetch(`${openaiConfig.endpoint}/chat/completions`, {
        method: 'POST',
        headers: this.buildOpenAIHeaders(),
        body: JSON.stringify({
          model: request.model ?? openaiConfig.model,
          messages: [
            {
              role: 'user',
              content: request.prompt,
            },
          ],
          max_tokens: request.maxTokens ?? openaiConfig.maxTokens,
          temperature: request.temperature ?? openaiConfig.temperature,
        }),
      });

      const data = await this.handleResponse(response) as {
        choices: Array<{ message: { content: string } }>;
        usage?: {
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
        };
        model: string;
      };

      return {
        content: data.choices[0]?.message?.content ?? '',
        tokenUsage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
        model: data.model,
        provider: 'openai',
      };
    } catch (error) {
      logger.error('llm', 'OpenAI API error', { error });
      throw error instanceof Error && 'provider' in error
        ? error
        : new Error(
          error instanceof Error ? error.message : 'OpenAI API request failed'
        );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const openaiConfig = this.config as OpenAIConfig;
      const response = await fetch(`${openaiConfig.endpoint}/models`, {
        method: 'GET',
        headers: this.buildOpenAIHeaders(),
      });

      return response.ok;
    } catch (error) {
      logger.error('llm', 'OpenAI health check failed', { error });
      return false;
    }
  }

  private buildOpenAIHeaders(): Record<string, string> {
    const headers = this.buildHeaders();
    const openaiConfig = this.config as OpenAIConfig;
    headers['Authorization'] = `Bearer ${openaiConfig.apiKey}`;
    
    if (openaiConfig.organization) {
      headers['OpenAI-Organization'] = openaiConfig.organization;
    }

    return headers;
  }
} 