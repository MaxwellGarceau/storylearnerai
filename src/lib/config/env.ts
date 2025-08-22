import { LLMProvider, ProviderConfig } from '../../types/llm/providers';
// import { logger } from '../logger';

export class EnvironmentConfig {
  private static validateRequiredEnvVar(
    key: string,
    value: string | undefined
  ): string {
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  static getLLMConfig(): ProviderConfig {
    const provider = this.validateRequiredEnvVar(
      'VITE_LLM_PROVIDER',
      import.meta.env.VITE_LLM_PROVIDER as string | undefined
    ) as LLMProvider;
    const apiKey = this.validateRequiredEnvVar(
      'VITE_LLM_API_KEY',
      import.meta.env.VITE_LLM_API_KEY as string | undefined
    );
    const endpoint = this.validateRequiredEnvVar(
      'VITE_LLM_ENDPOINT',
      import.meta.env.VITE_LLM_ENDPOINT as string | undefined
    );
    const model = this.validateRequiredEnvVar(
      'VITE_LLM_MODEL',
      import.meta.env.VITE_LLM_MODEL as string | undefined
    );

    const maxTokens = parseInt(
      (import.meta.env.VITE_LLM_MAX_TOKENS as string | undefined) ?? '2000',
      10
    );
    const temperature = parseFloat(
      (import.meta.env.VITE_LLM_TEMPERATURE as string | undefined) ?? '0.7'
    );

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
      case 'gemini':
        return {
          ...baseConfig,
          provider: 'gemini',
          projectId: import.meta.env.VITE_GEMINI_PROJECT_ID as
            | string
            | undefined,
        };

      default:
        throw new Error(`Unsupported LLM provider: ${String(provider)}`);
    }
  }

  // (helpers removed – will reintroduce when needed by providers)

  static isDevelopment(): boolean {
    return import.meta.env.MODE === 'development';
  }

  static isProduction(): boolean {
    return import.meta.env.MODE === 'production';
  }

  static isMockTranslationEnabled(): boolean {
    return import.meta.env.VITE_ENABLE_MOCK_TRANSLATION === 'true';
  }

  static isDictionaryDisabled(): boolean {
    return import.meta.env.VITE_DISABLE_DICTIONARY === 'true';
  }

  static getDictionaryConfig(): {
    endpoint: string;
    apiKey: string;
  } {
    // If dictionary is disabled, return empty config to avoid errors
    if (this.isDictionaryDisabled()) {
      return {
        endpoint: '',
        apiKey: '',
      };
    }

    const endpoint = import.meta.env.VITE_DICTIONARY_API_ENDPOINT as string;

    if (!endpoint) {
      throw new Error(
        'VITE_DICTIONARY_API_ENDPOINT environment variable is required'
      );
    }

    const apiKey = import.meta.env.VITE_DICTIONARY_API_KEY as string;

    if (!apiKey) {
      throw new Error(
        'VITE_DICTIONARY_API_KEY environment variable is required'
      );
    }

    return {
      endpoint,
      apiKey,
    };
  }
}
