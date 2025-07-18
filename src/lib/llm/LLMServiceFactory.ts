import { LLMService } from './LLMService';
import { ProviderConfig, OpenAIConfig, AnthropicConfig, GeminiConfig, LlamaConfig, CustomConfig } from '../types/llm';
import { OpenAIService } from './providers/OpenAIService';
import { AnthropicService } from './providers/AnthropicService';
import { GeminiService } from './providers/GeminiService';
import { LlamaService } from './providers/LlamaService';
import { CustomService } from './providers/CustomService';

export class LLMServiceFactory {
  /**
   * Create an LLM service instance based on the provider configuration
   */
  static createService(config: ProviderConfig): LLMService {
    switch (config.provider) {
      case 'openai':
        return new OpenAIService(config as OpenAIConfig);
      
      case 'anthropic':
        return new AnthropicService(config as AnthropicConfig);
      
      case 'google':
        // For now, Google uses the custom service pattern
        // In the future, we can create a dedicated GoogleService
        return new CustomService({
          ...config,
          provider: 'custom',
        } as CustomConfig);
      
      case 'gemini':
        return new GeminiService(config as GeminiConfig);
      
      case 'llama':
        return new LlamaService(config as LlamaConfig);
      
      case 'custom':
        return new CustomService(config as CustomConfig);
      
      default:
        throw new Error(`Unsupported LLM provider: ${(config as ProviderConfig).provider}`);
    }
  }

  /**
   * Get available providers
   */
  static getAvailableProviders(): string[] {
    return ['openai', 'anthropic', 'google', 'gemini', 'llama', 'custom'];
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
      gemini: 'Google Gemini models via Google GenAI SDK including Gemini Pro, Flash, and Ultra',
      llama: 'Meta Llama models via Ollama, Groq, Together AI, Replicate, or custom endpoints',
      custom: 'Custom API endpoint for other LLM providers',
    };
  }
} 