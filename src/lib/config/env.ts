import { LLMProvider, ProviderConfig } from '../../types/llm/providers';
import { logger } from '../logger';

export class EnvironmentConfig {
  private static validateRequiredEnvVar(key: string, value: string | undefined): string {
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  static getLLMConfig(): ProviderConfig {
    const provider = this.validateRequiredEnvVar('VITE_LLM_PROVIDER', import.meta.env.VITE_LLM_PROVIDER as string | undefined) as LLMProvider;
    const apiKey = this.validateRequiredEnvVar('VITE_LLM_API_KEY', import.meta.env.VITE_LLM_API_KEY as string | undefined);
    const endpoint = this.validateRequiredEnvVar('VITE_LLM_ENDPOINT', import.meta.env.VITE_LLM_ENDPOINT as string | undefined);
    const model = this.validateRequiredEnvVar('VITE_LLM_MODEL', import.meta.env.VITE_LLM_MODEL as string | undefined);
    
    const maxTokens = parseInt((import.meta.env.VITE_LLM_MAX_TOKENS as string | undefined) ?? '2000', 10);
    const temperature = parseFloat((import.meta.env.VITE_LLM_TEMPERATURE as string | undefined) ?? '0.7');

    const baseConfig = {
      provider,
      apiKey,
      endpoint,
      model,
      maxTokens,
      temperature,
    };

    // Return provider-specific configuration
    switch (provider) {
      case 'openai':
        return {
          ...baseConfig,
          provider: 'openai',
          organization: import.meta.env.VITE_OPENAI_ORGANIZATION as string | undefined,
        };
      
      case 'anthropic':
        return {
          ...baseConfig,
          provider: 'anthropic',
          version: (import.meta.env.VITE_ANTHROPIC_VERSION as string | undefined) ?? '2023-06-01',
        };
      
      case 'gemini':
        return {
          ...baseConfig,
          provider: 'gemini',
          projectId: import.meta.env.VITE_GEMINI_PROJECT_ID as string | undefined,
        };
      
      case 'llama':
        return {
          ...baseConfig,
          provider: 'llama',
          llamaProvider: (import.meta.env.VITE_LLAMA_PROVIDER as string | undefined) ?? 'ollama',
          systemPrompt: import.meta.env.VITE_LLAMA_SYSTEM_PROMPT as string | undefined,
          stopSequences: this.parseStopSequences(import.meta.env.VITE_LLAMA_STOP_SEQUENCES as string | undefined),
          headers: this.parseCustomHeaders(import.meta.env.VITE_LLAMA_HEADERS as string | undefined),
        };
      
      case 'custom':
        return {
          ...baseConfig,
          provider: 'custom',
          headers: this.parseCustomHeaders(import.meta.env.VITE_CUSTOM_HEADERS as string | undefined),
        };
      
      default:
        throw new Error(`Unsupported LLM provider: ${String(provider)}`);
    }
  }

  private static parseCustomHeaders(headersString?: string): Record<string, string> {
    if (!headersString) return {};
    
    try {
      return JSON.parse(headersString);
    } catch (error) {
      logger.warn('config', 'Failed to parse custom headers, using empty object', { error });
      return {};
    }
  }

  private static parseStopSequences(stopSequencesString?: string): string[] {
    if (!stopSequencesString) return [];
    
    try {
      // Try parsing as JSON array first
      return JSON.parse(stopSequencesString);
    } catch {
      // Fallback to comma-separated string
      return stopSequencesString.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
  }

  static isDevelopment(): boolean {
    return import.meta.env.MODE === 'development';
  }

  static isProduction(): boolean {
    return import.meta.env.MODE === 'production';
  }

  static isMockTranslationEnabled(): boolean {
    return import.meta.env.VITE_ENABLE_MOCK_TRANSLATION === 'true';
  }
} 