import { LLMService } from '../LLMService';
import { LLMRequest, LLMResponse, LlamaConfig } from '../../../types/llm/providers';
import { logger } from '../../../lib/logger';

export class LlamaService extends LLMService {
  constructor(config: LlamaConfig) {
    super(config);
  }

  async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
    try {
      const llamaConfig = this.config as LlamaConfig;
      const endpoint = this.getCompletionEndpoint(llamaConfig);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.buildLlamaHeaders(),
        body: JSON.stringify(this.buildRequestBody(request, llamaConfig)),
      });

      const data = await this.handleResponse(response);
      return this.parseResponse(data, llamaConfig);
    } catch (error) {
      logger.error('llm', 'Llama API error', { error });
      // If it's already an LLMError from handleResponse, re-throw it
      if (error && typeof error === 'object' && 'provider' in error) {
        throw error;
      }
      // Otherwise, create a new LLMError
      throw this.createError(
        error instanceof Error ? error.message : 'Llama API request failed',
        'LLAMA_ERROR'
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const llamaConfig = this.config as LlamaConfig;
      
      // For Ollama, check the tags endpoint
      if (llamaConfig.llamaProvider === 'ollama') {
        const response = await fetch(`${llamaConfig.endpoint}/tags`, {
          method: 'GET',
          headers: this.buildLlamaHeaders(),
        });
        return response.ok;
      }
      
      // For other providers, try a minimal completion
      const testResponse = await fetch(this.getCompletionEndpoint(llamaConfig), {
        method: 'POST',
        headers: this.buildLlamaHeaders(),
        body: JSON.stringify({
          model: llamaConfig.model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1,
        }),
      });
      
      return testResponse.ok;
    } catch (error) {
      logger.error('llm', 'Llama health check failed', { error });
      return false;
    }
  }

  private getCompletionEndpoint(config: LlamaConfig): string {
    const provider = config.llamaProvider || 'ollama';
    
    switch (provider) {
      case 'ollama':
        return `${config.endpoint}/api/chat`;
      case 'groq':
        return `${config.endpoint}/chat/completions`;
      case 'together':
        return `${config.endpoint}/chat/completions`;
      case 'replicate':
        return `${config.endpoint}/predictions`;
      default:
        return `${config.endpoint}/chat/completions`;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildRequestBody(request: LLMRequest, config: LlamaConfig): any {
    const provider = config.llamaProvider || 'ollama';
    const baseBody = {
      model: request.model || config.model,
      max_tokens: request.maxTokens || config.maxTokens,
      temperature: request.temperature || config.temperature,
    };

    switch (provider) {
      case 'ollama':
        return {
          model: baseBody.model,
          messages: [
            ...(config.systemPrompt ? [{ role: 'system', content: config.systemPrompt }] : []),
            { role: 'user', content: request.prompt },
          ],
          stream: false,
          options: {
            temperature: baseBody.temperature,
            num_predict: baseBody.max_tokens,
            stop: config.stopSequences,
          },
        };
      
      case 'groq':
      case 'together':
        return {
          model: baseBody.model,
          messages: [
            ...(config.systemPrompt ? [{ role: 'system', content: config.systemPrompt }] : []),
            { role: 'user', content: request.prompt },
          ],
          max_tokens: baseBody.max_tokens,
          temperature: baseBody.temperature,
          stop: config.stopSequences,
        };
      
      case 'replicate':
        return {
          version: baseBody.model,
          input: {
            prompt: request.prompt,
            max_tokens: baseBody.max_tokens,
            temperature: baseBody.temperature,
            system_prompt: config.systemPrompt,
          },
        };
      
      default:
        return {
          model: baseBody.model,
          messages: [
            ...(config.systemPrompt ? [{ role: 'system', content: config.systemPrompt }] : []),
            { role: 'user', content: request.prompt },
          ],
          max_tokens: baseBody.max_tokens,
          temperature: baseBody.temperature,
          stop: config.stopSequences,
        };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseResponse(data: any, config: LlamaConfig): LLMResponse {
    const provider = config.llamaProvider || 'ollama';
    
    switch (provider) {
      case 'ollama':
        return {
          content: data.message?.content || '',
          tokenUsage: data.prompt_eval_count || data.eval_count ? {
            promptTokens: data.prompt_eval_count || 0,
            completionTokens: data.eval_count || 0,
            totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
          } : undefined,
          model: data.model || config.model,
          provider: 'llama',
        };
      
      case 'groq':
      case 'together':
        return {
          content: data.choices?.[0]?.message?.content || '',
          tokenUsage: data.usage ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          } : undefined,
          model: data.model || config.model,
          provider: 'llama',
        };
      
      case 'replicate':
        return {
          content: Array.isArray(data.output) ? data.output.join('') : data.output || '',
          tokenUsage: data.metrics ? {
            promptTokens: 0, // Replicate doesn't typically provide token counts
            completionTokens: 0,
            totalTokens: 0,
          } : undefined,
          model: config.model,
          provider: 'llama',
        };
      
      default:
        return {
          content: data.choices?.[0]?.message?.content || data.content || '',
          tokenUsage: data.usage ? {
            promptTokens: data.usage.prompt_tokens || 0,
            completionTokens: data.usage.completion_tokens || 0,
            totalTokens: data.usage.total_tokens || 0,
          } : undefined,
          model: data.model || config.model,
          provider: 'llama',
        };
    }
  }

  private buildLlamaHeaders(): Record<string, string> {
    const headers = this.buildHeaders();
    const llamaConfig = this.config as LlamaConfig;
    const provider = llamaConfig.llamaProvider || 'ollama';
    
    switch (provider) {
      case 'ollama':
        // Ollama typically doesn't require auth for local deployments
        if (llamaConfig.apiKey && llamaConfig.apiKey !== 'none') {
          headers['Authorization'] = `Bearer ${llamaConfig.apiKey}`;
        }
        break;
      
      case 'groq':
        headers['Authorization'] = `Bearer ${llamaConfig.apiKey}`;
        break;
      
      case 'together':
        headers['Authorization'] = `Bearer ${llamaConfig.apiKey}`;
        break;
      
      case 'replicate':
        headers['Authorization'] = `Token ${llamaConfig.apiKey}`;
        break;
      
      default:
        headers['Authorization'] = `Bearer ${llamaConfig.apiKey}`;
        break;
    }
    
    // Add any custom headers
    if (llamaConfig.headers) {
      Object.assign(headers, llamaConfig.headers);
    }
    
    return headers;
  }
} 