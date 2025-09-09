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
  // Optional: words the user wants included in the generated translation/story context
  // IMPORTANT: These should be TARGET-LANGUAGE words (e.g., English when translating es→en).
  // The UI stores and passes the 'target_word' values for the selected vocabulary
  // so the LLM can include those exact target-language words in its output.
  selectedVocabulary?: string[];
}

export interface TranslationResponse {
  fromText: string;
  targetText: string;
  fromLanguage: LanguageCode;
  toLanguage: LanguageCode;
  difficulty: DifficultyLevel;
  provider?: string;
  model?: string;
  // TARGET-language vocabulary that we asked to include
  selectedVocabulary?: string[];
  includedVocabulary?: string[];
  missingVocabulary?: string[];
}

export interface WordTranslationRequest {
  sentence: string;
  focusWord: string;
  fromLanguage: LanguageCode; // language of sentence/focus word
  toLanguage: LanguageCode; // desired output language
  difficulty: DifficultyLevel;
}

export interface WordTranslationResponse {
  fromWord: string;
  targetWord: string;
  sentence: string;
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
  async targetStory(request: TranslationRequest): TranslationResponsePromise {
    try {
      const context = {
        fromLanguage: request.fromLanguage,
        toLanguage: request.toLanguage,
        difficulty: request.difficulty,
        text: request.text,
        nativeLanguage: request.nativeLanguage,
        selectedVocabulary: request.selectedVocabulary,
      };
      const prompt =
        await generalPromptConfigService.buildTranslationPrompt(context);

      const llmResponse = await llmServiceManager.generateCompletion({
        prompt,
        maxTokens: 2000,
        temperature: 0.7,
      });

      // Track vocabulary inclusion - IMPORTANT: We analyze target language words in target language text
      const selectedVocabulary = request.selectedVocabulary ?? [];

      // Validate that we have target language text and target language vocabulary
      if (llmResponse.content && selectedVocabulary.length > 0) {
        const { includedVocabulary, missingVocabulary } =
          this.analyzeVocabularyInclusionInTargetLanguage(
            llmResponse.content, // Target language translated text
            selectedVocabulary, // Target language vocabulary words
            request.toLanguage // Target language code for validation
          );

        return {
          fromText: request.text,
          targetText: llmResponse.content,
          fromLanguage: request.fromLanguage,
          toLanguage: request.toLanguage,
          difficulty: request.difficulty,
          provider: llmResponse.provider,
          model: llmResponse.model,
          selectedVocabulary,
          includedVocabulary,
          missingVocabulary,
          // Echo original selection for UI; inclusion mapping handled by caller
        };
      }

      return {
        fromText: request.text,
        targetText: llmResponse.content,
        fromLanguage: request.fromLanguage,
        toLanguage: request.toLanguage,
        difficulty: request.difficulty,
        provider: llmResponse.provider,
        model: llmResponse.model,
        selectedVocabulary,
        includedVocabulary: [],
        missingVocabulary: [],
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

  async targetWordWithContext(
    request: WordTranslationRequest
  ): Promise<WordTranslationResponse> {
    try {
      const context = {
        sentence: request.sentence,
        focusWord: request.focusWord,
        fromLanguage: request.fromLanguage,
        toLanguage: request.toLanguage,
        difficulty: request.difficulty,
      };
      const prompt =
        generalPromptConfigService.buildWordTranslationPrompt(context);

      const llmResponse = await llmServiceManager.generateCompletion({
        prompt,
        maxTokens: 8,
        temperature: 0.2,
      });

      // Ensure we only keep the first line/token as the word
      const raw = (llmResponse.content ?? '').trim();
      const singleWord = raw.split(/\s+/)[0]?.replace(/[\s\p{P}]+$/u, '') ?? '';

      return {
        fromWord: request.focusWord,
        targetWord: singleWord,
        sentence: request.sentence,
        fromLanguage: request.fromLanguage,
        toLanguage: request.toLanguage,
        difficulty: request.difficulty,
        provider: llmResponse.provider,
        model: llmResponse.model,
      };
    } catch (error) {
      logger.error('translation', 'Word-with-context translation error', {
        error,
      });
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Translation service unavailable';
      throw new Error(
        this.getUserFriendlyErrorMessage({
          message: errorMessage,
          code: 'TRANSLATION_ERROR',
          provider: 'unknown',
        })
      );
    }
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

    // Mock vocabulary inclusion detection for development - using target language logic
    const selectedVocabulary = request.selectedVocabulary ?? [];
    let includedVocabulary: string[] = [];
    let missingVocabulary: string[] = [];

    if (selectedVocabulary.length > 0) {
      // Simulate that the first word is included, others are missing (for testing)
      includedVocabulary = [selectedVocabulary[0]];
      missingVocabulary = selectedVocabulary.slice(1);
    }

    return {
      fromText: request.text,
      targetText: mockTranslation,
      fromLanguage: request.fromLanguage,
      toLanguage: request.toLanguage,
      difficulty: request.difficulty,
      provider: 'mock',
      model: 'mock-model',
      selectedVocabulary,
      includedVocabulary,
      missingVocabulary,
    };
  }

  // Smart translation method that chooses between mock and real based on environment
  async translate(request: TranslationRequest): TranslationResponsePromise {
    if (EnvironmentConfig.isMockTranslationEnabled()) {
      return this.mockTranslateStory(request);
    } else {
      return this.targetStory(request);
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

  /**
   * Analyze which target language vocabulary words are actually included in the target language translated text
   * This ensures we're only checking target language words against target language text, not source language content
   */
  private analyzeVocabularyInclusionInTargetLanguage(
    targetLanguageTranslatedText: string,
    targetLanguageVocabularyWords: string[],
    _targetLanguageCode: LanguageCode // Reserved for future validation enhancements
  ): { includedVocabulary: string[]; missingVocabulary: string[] } {
    logger.info('translation', 'Analyzing vocabulary inclusion', {
      vocabularyWords: targetLanguageVocabularyWords,
      targetTextLength: targetLanguageTranslatedText.length,
    });
    if (
      !targetLanguageVocabularyWords ||
      targetLanguageVocabularyWords.length === 0
    ) {
      return { includedVocabulary: [], missingVocabulary: [] };
    }

    // Validate that we have target language text to analyze
    if (
      !targetLanguageTranslatedText ||
      targetLanguageTranslatedText.trim().length === 0
    ) {
      return {
        includedVocabulary: [],
        missingVocabulary: targetLanguageVocabularyWords,
      };
    }

    const normalizedTargetText = targetLanguageTranslatedText
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ');
    const includedVocabulary: string[] = [];
    const missingVocabulary: string[] = [];

    for (const targetWord of targetLanguageVocabularyWords) {
      // Ensure the word is not empty and is a valid target language word
      const normalizedTargetWord = targetWord.toLowerCase().trim();

      if (!normalizedTargetWord) {
        continue; // Skip empty words
      }

      // Use word boundaries to avoid partial matches in target language text
      const regex = new RegExp(
        `\\b${this.escapeRegExp(normalizedTargetWord)}\\b`,
        'i'
      );

      if (regex.test(normalizedTargetText)) {
        includedVocabulary.push(targetWord);
      } else {
        missingVocabulary.push(targetWord);
      }
    }

    return { includedVocabulary, missingVocabulary };
  }

  /**
   * Escape special regex characters to ensure safe word matching
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export const translationService = new TranslationService();
