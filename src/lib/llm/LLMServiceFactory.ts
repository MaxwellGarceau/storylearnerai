import { LLMService } from './LLMService';
import { ProviderConfig } from '../types/llm';
import { OpenAIService } from './providers/OpenAIService';
import { AnthropicService } from './providers/AnthropicService';
import { LlamaService } from './providers/LlamaService';
import { CustomService } from './providers/CustomService';

export class LLMServiceFactory {
  /**
   * Create an LLM service instance based on the provider configuration
   */
  static createService(config: ProviderConfig): LLMService {
    switch (config.provider) {
      case 'openai':
        return new OpenAIService(config as any);
      
      case 'anthropic':
        return new AnthropicService(config as any);
      
      case 'google':
        // For now, Google uses the custom service pattern
        // In the future, we can create a dedicated GoogleService
        return new CustomService({
          ...config,
          provider: 'custom',
        } as any);
      
      case 'llama':
        return new LlamaService(config as any);
      
      case 'custom':
        return new CustomService(config as any);
      
      default:
        throw new Error(`Unsupported LLM provider: ${(config as any).provider}`);
    }
  }

  /**
   * Get available providers
   */
  static getAvailableProviders(): string[] {
    return ['openai', 'anthropic', 'google', 'llama', 'custom'];
  }

  /**
   * Get provider display names for UI
   */
  static getProviderDisplayNames(): Record<string, string> {
    return {
      openai: 'OpenAI GPT',
      anthropic: 'Anthropic Claude',
      google: 'Google Gemini',
      llama: 'Meta Llama',
      custom: 'Custom API',
    };
  }

  /**
   * Get provider descriptions for UI
   */
  static getProviderDescriptions(): Record<string, string> {
    return {
      openai: 'OpenAI GPT models including GPT-4, GPT-3.5, and GPT-4o',
      anthropic: 'Anthropic Claude models including Claude-3 Haiku, Sonnet, and Opus',
      google: 'Google Gemini models including Gemini Pro and Gemini Flash',
      llama: 'Meta Llama models via Ollama, Groq, Together AI, Replicate, or custom endpoints',
      custom: 'Custom API endpoint for other LLM providers',
    };
  }
} 