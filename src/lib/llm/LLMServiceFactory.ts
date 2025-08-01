import { LLMService } from './LLMService';
import { ProviderConfig } from '../../types/llm/providers';
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
        return new OpenAIService(config);
      
      case 'anthropic':
        return new AnthropicService(config);
      
      case 'gemini':
        return new GeminiService(config);
      
      case 'llama':
        return new LlamaService(config);
      
      case 'custom':
        return new CustomService(config);
      
      default:
        throw new Error(`Unsupported LLM provider: ${(config as ProviderConfig).provider}`);
    }
  }

  /**
   * Get available providers
   */
  static getAvailableProviders(): string[] {
    return ['openai', 'anthropic', 'gemini', 'llama', 'custom'];
  }

  /**
   * Get provider display names for UI
   */
  static getProviderDisplayNames(): Record<string, string> {
    return {
      openai: 'OpenAI GPT',
      anthropic: 'Anthropic Claude',
      gemini: 'Google Gemini',
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
      gemini: 'Google Gemini models via Google GenAI SDK including Gemini Pro, Flash, and Ultra',
      llama: 'Meta Llama models via Ollama, Groq, Together AI, Replicate, or custom endpoints',
      custom: 'Custom API endpoint for other LLM providers',
    };
  }
} 