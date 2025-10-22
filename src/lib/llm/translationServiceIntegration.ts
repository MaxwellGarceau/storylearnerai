import { llmServiceManager } from './LLMServiceManager';
import { TranslationTokenValidator } from './tokens/translationTokenValidator';
import { FallbackTokenGenerator } from './tokens/fallbackTokenGenerator';
import { TranslationWithTokens } from '../../types/llm/tokens';
import { logger } from '../logger';

/**
 * Integration layer between LLM Service and Translation Service
 *
 * Responsibilities:
 * - Request translation from LLM
 * - Validate response format
 * - Handle fallback when validation fails
 * - Return consistent token structure to Translation Service
 */
export class TranslationServiceIntegration {
  /**
   * Generates translation with structured tokens
   *
   * @param prompt - The translation prompt
   * @param maxTokens - Maximum tokens for LLM response
   * @param temperature - LLM temperature setting
   * @returns Translation with validated tokens
   * @throws Error if both validation and fallback fail
   */
  static async generateTranslationWithTokens(
    prompt: string,
    maxTokens?: number,
    temperature?: number
  ): Promise<TranslationWithTokens> {
    logger.time('llm', 'translation-with-tokens');

    try {
      // Step 1: Get response from LLM
      logger.debug('llm', 'Requesting translation from LLM', {
        promptLength: prompt.length,
        maxTokens,
        temperature,
      });

      const llmResponse = await llmServiceManager.generateCompletion({
        prompt,
        maxTokens,
        temperature,
      });

      logger.debug('llm', 'Received LLM response', {
        contentLength: llmResponse.content.length,
        provider: llmResponse.provider,
        model: llmResponse.model,
      });

      // Step 2: Try to validate structured response
      logger.debug('llm', 'Attempting to validate structured response');

      const validationResult = TranslationTokenValidator.validate(
        llmResponse.content
      );

      if (validationResult.isValid && validationResult.data) {
        // Validation successful
        if (validationResult.warnings.length > 0) {
          logger.warn('llm', 'Validation succeeded with warnings', {
            warningCount: validationResult.warnings.length,
            warnings: validationResult.warnings,
          });
        }

        logger.info('llm', 'Structured response validated successfully', {
          tokenCount: validationResult.data.tokens.length,
          hasWarnings: validationResult.warnings.length > 0,
        });

        logger.timeEnd('llm', 'translation-with-tokens');

        return {
          ...validationResult.data,
          // Add metadata about warnings for UI
          _metadata: {
            hasWarnings: validationResult.warnings.length > 0,
            warnings: validationResult.warnings,
            usedFallback: false,
          },
        } as TranslationWithTokens;
      }

      // Step 3: Validation failed - use fallback
      logger.warn(
        'llm',
        'Structured response validation failed, using fallback',
        {
          errors: validationResult.errors,
        }
      );

      return this.generateFallbackTokens(llmResponse.content);
    } catch (error) {
      logger.error('llm', 'Translation generation failed completely', {
        error,
      });
      throw error;
    } finally {
      logger.timeEnd('llm', 'translation-with-tokens');
    }
  }

  /**
   * Generates fallback tokens from plain text response
   *
   * @param rawContent - Plain text from LLM
   * @returns Translation with fallback tokens
   */
  private static generateFallbackTokens(
    rawContent: string
  ): TranslationWithTokens {
    logger.time('llm', 'fallback-generation');

    try {
      // Extract translation text
      // The content might be just plain text or might have some structure
      // For now, treat entire content as translation
      const translation = rawContent.trim();

      // Generate tokens from plain text
      const tokens = FallbackTokenGenerator.generateTokens(translation);

      // Validate reconstruction (for debugging)
      const reconstructionValid = FallbackTokenGenerator.validateReconstruction(
        translation,
        tokens
      );

      if (!reconstructionValid) {
        logger.error(
          'llm',
          'Fallback token reconstruction failed - tokens may not match original text'
        );
      }

      logger.info('llm', 'Fallback tokens generated successfully', {
        tokenCount: tokens.length,
        reconstructionValid,
      });

      logger.timeEnd('llm', 'fallback-generation');

      return {
        translation,
        tokens,
        // Add metadata about fallback for UI
        _metadata: {
          hasWarnings: false,
          warnings: [],
          usedFallback: true,
        },
      } as TranslationWithTokens;
    } catch (error) {
      logger.error('llm', 'Fallback generation failed', { error });
      throw new Error(
        'Failed to generate fallback tokens: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  }
}
