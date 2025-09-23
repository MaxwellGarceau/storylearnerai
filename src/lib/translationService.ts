import { llmServiceManager } from './llm/LLMServiceManager';
import { EnvironmentConfig } from './config/env';
import { generalPromptConfigService } from './prompts';
import { LanguageCode, DifficultyLevel } from '../types/llm/prompts';
import { LLMError } from '../types/llm/providers';
import { logger } from './logger';
import { DictionaryWord, TranslationWord } from '../types/dictionary';
import { GeminiTranslationTransformer } from './translation/transformers/geminiTransformer';
import { GeminiDictionaryTransformer } from './dictionary/transformers/geminiTransformer';

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
  lemma?: string;
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
  /**
   * Generate both translation and dictionary collections via Gemini in a single request
   */
  async generateLexicalCollections(request: TranslationRequest): Promise<{
    translations: TranslationWord[];
    dictionary: DictionaryWord[];
    provider?: string;
    model?: string;
  }> {
    // Validate language pair
    if (request.fromLanguage === request.toLanguage) {
      throw new Error('Source and target languages must be different');
    }

    // Enforce 1500-word limit
    const inputWordCount = this.countWords(request.text);
    if (inputWordCount > 1500) {
      throw new Error(
        `The input is too long (${inputWordCount} words). Max is 1500 words. Please try 3–5 paragraphs.`
      );
    }

    const context = {
      fromLanguage: request.fromLanguage,
      toLanguage: request.toLanguage,
      difficulty: request.difficulty,
      text: request.text,
      nativeLanguage: request.nativeLanguage,
      selectedVocabulary: request.selectedVocabulary,
    };

    const prompt =
      await generalPromptConfigService.buildLexicalCollectionsPrompt(context);

    const llmResponse = await llmServiceManager.generateCompletion({
      prompt,
      responseMimeType: 'application/json',
    });

    const raw = (llmResponse.content ?? '').trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // Try to salvage JSON object from mixed output
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start !== -1 && end > start) {
        parsed = JSON.parse(raw.slice(start, end + 1));
      } else {
        logger.error('translation', 'Failed to parse Gemini lexical JSON', {
          error: e instanceof Error ? e.message : 'Unknown parse error',
        });
        throw new Error('Failed to parse lexical collections response');
      }
    }

    const obj = parsed as {
      translations?: unknown;
      dictionary?: unknown;
    };

    if (
      !obj ||
      !Array.isArray(obj.translations) ||
      !Array.isArray(obj.dictionary)
    ) {
      throw new Error('Invalid lexical collections format from provider');
    }

    const translationTransformer = new GeminiTranslationTransformer();
    const dictionaryTransformer = new GeminiDictionaryTransformer();

    const validatedTranslations = translationTransformer.validateAndNormalize(
      obj.translations as unknown[]
    );
    const validatedDictionary = dictionaryTransformer.validateAndNormalize(
      obj.dictionary as unknown[]
    );

    return {
      translations: validatedTranslations,
      dictionary: validatedDictionary,
      provider: llmResponse.provider,
      model: llmResponse.model,
    };
  }
  async targetStory(request: TranslationRequest): TranslationResponsePromise {
    try {
      // Validate that source and target languages are different
      if (request.fromLanguage === request.toLanguage) {
        throw new Error('Source and target languages must be different');
      }

      // Enforce max input size (1500-word hard limit)
      const inputWordCount = this.countWords(request.text);
      if (inputWordCount > 1500) {
        throw new Error(
          `The input is too long (${inputWordCount} words). Max is 1500 words. Please try 3–5 paragraphs.`
        );
      }

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
      // Validate that source and target languages are different
      if (request.fromLanguage === request.toLanguage) {
        throw new Error('Source and target languages must be different');
      }

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
        responseMimeType: 'application/json',
      });

      // Prefer JSON when present, otherwise fallback to first token cleaned
      const raw = (llmResponse.content ?? '').trim();
      let targetWord = '';
      let lemma: string | undefined = undefined;

      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start !== -1 && end > start) {
        try {
          const json = raw.slice(start, end + 1);
          const parsed = JSON.parse(json) as {
            targetWord?: unknown;
            lemma?: unknown;
          };
          targetWord = String(parsed.targetWord ?? '').trim();
          lemma =
            parsed.lemma !== undefined
              ? String(parsed.lemma).trim()
              : undefined;
        } catch {
          // ignore and fallback
        }
      }

      if (!targetWord) {
        const first = raw.split(/\s+/)[0] ?? '';
        // Remove only wrapping quotes/backticks/brackets, not braces
        targetWord = first.replace(/^[`"'\(\[]+|[`"'\)\]]+$/g, '');
      }

      return {
        fromWord: request.focusWord,
        targetWord,
        lemma,
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

    // Enforce max input size (1500-word hard limit) in mock path as well
    const inputWordCount = this.countWords(request.text);
    if (inputWordCount > 1500) {
      throw new Error(
        `The input is too long (${inputWordCount} words). Max is 1500 words. Please try 3–5 paragraphs.`
      );
    }

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

  /**
   * Count words in a string. Words are sequences of non-whitespace characters.
   */
  private countWords(text: string): number {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return 0;
    }
    return trimmed.split(/\s+/).length;
  }
}

export const translationService = new TranslationService();
