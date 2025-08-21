import { llmServiceManager } from './llm/LLMServiceManager';
import { EnvironmentConfig } from './config/env';
import { generalPromptConfigService } from './prompts';
import { LanguageCode, DifficultyLevel } from '../types/llm/prompts';
import { LLMError } from '../types/llm/providers';
import { logger } from './logger';

export interface TranslationRequest {
  text: string;
  fromLanguage: LanguageCode;
  toLanguage: LanguageCode;
  difficulty: DifficultyLevel;
  nativeLanguage?: LanguageCode; // Optional: user's native language for enhanced customization
}

export interface TranslationResponse {
  originalText: string;
  translatedText: string;
  fromLanguage: LanguageCode;
  toLanguage: LanguageCode;
  difficulty: DifficultyLevel;
  provider?: string;
  model?: string;
}

type TranslationResponsePromise = Promise<TranslationResponse>;

export interface TranslationError {
  message: string;
  code: string;
  provider?: string;
  statusCode?: number;
  details?: string;
}

class TranslationService {
  async translateStory(
    request: TranslationRequest
  ): TranslationResponsePromise {
    try {
      const prompt = await this.buildTranslationPrompt(request);

      const llmResponse = await llmServiceManager.generateCompletion({
        prompt,
        maxTokens: 2000,
        temperature: 0.7,
      });

      return {
        originalText: request.text,
        translatedText: llmResponse.content,
        fromLanguage: request.fromLanguage,
        toLanguage: request.toLanguage,
        difficulty: request.difficulty,
        provider: llmResponse.provider,
        model: llmResponse.model,
      };
    } catch (error) {
      logger.error('translation', 'Translation service error', { error });

      // Handle LLM-specific errors
      if (error && typeof error === 'object' && 'provider' in error) {
        const llmError = error as LLMError;
        const translationError: TranslationError = {
          message: this.getUserFriendlyErrorMessage(llmError),
          code: llmError.code,
          provider: llmError.provider,
          statusCode: llmError.statusCode,
          details: llmError.message,
        };
        throw new Error(translationError.message);
      }

      // Handle other errors
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Translation service unavailable';
      const translationError: TranslationError = {
        message: this.getUserFriendlyErrorMessage({
          message: errorMessage,
          code: 'TRANSLATION_ERROR',
          provider: 'unknown',
        }),
        code: 'TRANSLATION_ERROR',
        details: errorMessage,
      };
      throw new Error(translationError.message);
    }
  }

  /**
   * Build a customized translation prompt based on language and difficulty level
   */
  private async buildTranslationPrompt(
    request: TranslationRequest
  ): Promise<string> {
    const context = {
      fromLanguage: request.fromLanguage,
      toLanguage: request.toLanguage,
      difficulty: request.difficulty,
      text: request.text,
      nativeLanguage: request.nativeLanguage,
    };

    // If the configuration doesn't support this language/difficulty combination,
    // fall back to a basic prompt
    if (
      !generalPromptConfigService.isSupported(
        request.toLanguage,
        request.difficulty
      )
    ) {
      logger.warn(
        'translation',
        `Unsupported language/difficulty combination: ${request.toLanguage}/${request.difficulty}. Using fallback prompt.`
      );
      return this.buildFallbackPrompt(request);
    }

    // Use the prompt configuration service to build a customized prompt
    return generalPromptConfigService.buildPrompt(context);
  }

  /**
   * Fallback prompt for unsupported language/difficulty combinations
   */
  private buildFallbackPrompt(request: TranslationRequest): string {
    return `
      Translate the following ${request.fromLanguage} story to ${request.toLanguage}, adapted for ${request.difficulty} CEFR level:
      
      Instructions:
      - Maintain the story's meaning and narrative flow
      - Adapt vocabulary and sentence complexity to ${request.difficulty} level
      - Preserve cultural context where appropriate
      - Keep the story engaging and readable
      
      ${request.fromLanguage} Story:
      ${request.text}
      
      Please provide only the ${request.toLanguage} translation.
    `;
  }

  /**
   * Convert technical error messages to user-friendly messages
   */
  private getUserFriendlyErrorMessage(error: {
    message: string;
    code: string;
    provider?: string;
    statusCode?: number;
  }): string {
    const { message, code, provider, statusCode } = error;

    // Handle specific error codes
    switch (code) {
      case 'API_ERROR':
        if (statusCode === 401 || statusCode === 403) {
          return `Authentication failed for ${provider ?? 'translation service'}. Please check your API key.`;
        }
        if (statusCode === 429) {
          return `Rate limit exceeded for ${provider ?? 'translation service'}. Please wait a moment and try again.`;
        }
        if (
          statusCode === 500 ||
          statusCode === 502 ||
          statusCode === 503 ||
          statusCode === 504
        ) {
          return `${provider ?? 'Translation service'} is temporarily unavailable. Please try again later.`;
        }
        if (statusCode === 400) {
          return `Invalid request to ${provider ?? 'translation service'}. Please check your input and try again.`;
        }
        return `Service error (${statusCode}): ${message}`;

      case 'GEMINI_ERROR':
        return `Google Gemini service error: ${message}`;

      case 'PARSE_ERROR':
        return `Failed to process response from ${provider ?? 'translation service'}. Please try again.`;

      case 'NETWORK_ERROR':
        return `Network connection error. Please check your internet connection and try again.`;

      case 'TIMEOUT_ERROR':
        return `Request timed out. Please try again with a shorter story or check your connection.`;

      case 'TRANSLATION_ERROR':
        return `Translation failed: ${message}`;

      default:
        // If it's a known provider, include it in the message
        if (provider && provider !== 'unknown') {
          return `${provider} service error: ${message}`;
        }
        return message ?? 'An unexpected error occurred during translation.';
    }
  }

  // Mock translation for development/testing
  async mockTranslateStory(
    request: TranslationRequest
  ): TranslationResponsePromise {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock translation result
    const mockTranslation = `[TRANSLATED FROM SPANISH - ${request.difficulty} LEVEL]\n\n${request.text}\n\n[This is a mock translation for development purposes]`;

    return {
      originalText: request.text,
      translatedText: mockTranslation,
      fromLanguage: request.fromLanguage,
      toLanguage: request.toLanguage,
      difficulty: request.difficulty,
      provider: 'mock',
      model: 'mock-model',
    };
  }

  // Smart translation method that chooses between mock and real based on environment
  async translate(request: TranslationRequest): TranslationResponsePromise {
    if (EnvironmentConfig.isMockTranslationEnabled()) {
      return this.mockTranslateStory(request);
    } else {
      return this.translateStory(request);
    }
  }

  // New method to check if the LLM service is available
  async isLLMServiceAvailable(): Promise<boolean> {
    if (EnvironmentConfig.isMockTranslationEnabled()) {
      return true; // Mock is always available
    }

    try {
      return await llmServiceManager.healthCheck();
    } catch (error) {
      logger.warn('translation', 'LLM service health check failed', { error });
      return false;
    }
  }

  // Method to get current LLM provider info
  getLLMProviderInfo(): { provider: string; model: string } {
    return {
      provider: llmServiceManager.getProvider(),
      model: llmServiceManager.getModel(),
    };
  }

  // Method to check if mock translation is enabled
  isMockTranslationEnabled(): boolean {
    return EnvironmentConfig.isMockTranslationEnabled();
  }
}

export const translationService = new TranslationService();
