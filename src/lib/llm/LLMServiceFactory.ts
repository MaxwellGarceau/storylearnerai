import { LLMService } from './LLMService';
import { ProviderConfig } from '../../types/llm/providers';
import { GeminiService } from './providers/GeminiService';
import type { RecordString } from '../../types/common';

export class LLMServiceFactory {
  /**
   * Create an LLM service instance based on the provider configuration
   */
  static createService(config: ProviderConfig): LLMService {
    switch (config.provider) {
      case 'gemini':
        return new GeminiService(config);
      
      default: {
        const provider = (config as { provider: string }).provider;
        throw new Error(`Unsupported LLM provider: ${provider}`);
      }
    }
  }

  /**
   * Get available providers
   */
  static getAvailableProviders(): string[] {
    return ['gemini'];
  }

  /**
   * Get provider display names for UI
   */
  static getProviderDisplayNames(): RecordString {
    return {
      gemini: 'Google Gemini',
    };
  }

  /**
   * Get provider descriptions for UI
   */
  static getProviderDescriptions(): RecordString {
    return {
      gemini: 'Google Gemini models via Google GenAI SDK including Gemini Pro, Flash, and Ultra',
    };
  }
} 