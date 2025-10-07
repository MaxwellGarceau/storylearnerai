import {
  TranslationWithTokens,
  TranslationToken,
  WordToken,
  PunctuationToken,
  WhitespaceToken,
  TokenValidationResult,
  PartOfSpeech,
} from '../../types/llm/tokens';
import { DifficultyLevel } from '../../types/llm/prompts';
import { logger } from '../logger';

/**
 * Validates translation tokens from LLM responses
 * 
 * Two-tier validation:
 * 1. Required fields: Must be present or validation fails (triggers fallback)
 * 2. Metadata fields: Can be missing, will be set to null with warning
 */
export class TranslationTokenValidator {
  private static readonly VALID_POS: PartOfSpeech[] = [
    'noun',
    'verb',
    'adjective',
    'adverb',
    'pronoun',
    'preposition',
    'conjunction',
    'interjection',
    'article',
    'determiner',
    'other',
  ];

  private static readonly VALID_CEFR: DifficultyLevel[] = [
    'a1',
    'a2',
    'b1',
    'b2',
    'c1',
    'c2',
  ];

  /**
   * Validates and parses LLM response into structured tokens
   * Returns validation result with errors/warnings
   */
  static validate(rawResponse: string): TokenValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      logger.time('llm', 'token-validation');

      // Parse JSON
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawResponse);
      } catch (parseError) {
        errors.push('Failed to parse JSON response');
        logger.error('llm', 'JSON parse error', { parseError });
        return { isValid: false, errors, warnings, data: null };
      }

      // Validate top-level structure
      if (!parsed || typeof parsed !== 'object') {
        errors.push('Response is not a valid object');
        return { isValid: false, errors, warnings, data: null };
      }

      const response = parsed as Record<string, unknown>;

      // Validate translation field
      if (!response.translation || typeof response.translation !== 'string') {
        errors.push('Missing or invalid translation field');
        return { isValid: false, errors, warnings, data: null };
      }

      // Validate tokens array
      if (!Array.isArray(response.tokens)) {
        errors.push('Missing or invalid tokens array');
        return { isValid: false, errors, warnings, data: null };
      }

      // Validate each token
      const validatedTokens: TranslationToken[] = [];
      for (let i = 0; i < response.tokens.length; i++) {
        const tokenResult = this.validateToken(response.tokens[i], i);

        if (tokenResult.errors.length > 0) {
          // Required field validation failed
          errors.push(...tokenResult.errors);
          return { isValid: false, errors, warnings, data: null };
        }

        if (tokenResult.warnings.length > 0) {
          // Metadata validation issues (non-fatal)
          warnings.push(...tokenResult.warnings);
        }

        validatedTokens.push(tokenResult.token);
      }

      logger.info('llm', 'Token validation successful', {
        tokenCount: validatedTokens.length,
        wordCount: validatedTokens.filter(t => t.type === 'word').length,
        warningCount: warnings.length,
      });

      logger.timeEnd('llm', 'token-validation');

      return {
        isValid: true,
        errors: [],
        warnings,
        data: {
          translation: response.translation,
          tokens: validatedTokens,
        },
      };
    } catch (error) {
      logger.error('llm', 'Unexpected validation error', { error });
      errors.push(
        error instanceof Error ? error.message : 'Unknown validation error'
      );
      return { isValid: false, errors, warnings, data: null };
    }
  }

  /**
   * Validates a single token with two-tier validation
   */
  private static validateToken(
    token: unknown,
    index: number
  ): {
    token: TranslationToken;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!token || typeof token !== 'object') {
      errors.push(`Token at index ${index} is not an object`);
      return { token: null as never, errors, warnings };
    }

    const t = token as Record<string, unknown>;

    // Required: type field
    if (!t.type || typeof t.type !== 'string') {
      errors.push(`Token at index ${index} missing or invalid type`);
      return { token: null as never, errors, warnings };
    }

    switch (t.type) {
      case 'word':
        return this.validateWordToken(t, index);
      case 'punctuation':
        return this.validatePunctuationToken(t, index);
      case 'whitespace':
        return this.validateWhitespaceToken(t, index);
      default:
        errors.push(`Unknown token type at index ${index}: ${t.type}`);
        return { token: null as never, errors, warnings };
    }
  }

  /**
   * Validates word token with two-tier validation
   */
  private static validateWordToken(
    t: Record<string, unknown>,
    index: number
  ): {
    token: WordToken;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // TIER 1: Required fields validation
    const requiredFields = ['to_word', 'to_lemma', 'from_word', 'from_lemma'];
    for (const field of requiredFields) {
      if (!t[field] || typeof t[field] !== 'string') {
        errors.push(
          `Word token at index ${index} missing or invalid required field: ${field}`
        );
      }
    }

    // If required validation failed, return early
    if (errors.length > 0) {
      return { token: null as never, errors, warnings };
    }

    // TIER 2: Metadata fields validation (non-fatal)
    const pos = this.validatePartOfSpeech(t.pos, index, warnings);
    const difficulty = this.validateDifficulty(t.difficulty, index, warnings);
    const from_definition = this.validateDefinition(
      t.from_definition,
      index,
      warnings
    );

    const wordToken: WordToken = {
      type: 'word',
      to_word: t.to_word as string,
      to_lemma: t.to_lemma as string,
      from_word: t.from_word as string,
      from_lemma: t.from_lemma as string,
      pos,
      difficulty,
      from_definition,
    };

    return { token: wordToken, errors, warnings };
  }

  /**
   * Validates part of speech (metadata field)
   */
  private static validatePartOfSpeech(
    value: unknown,
    index: number,
    warnings: string[]
  ): PartOfSpeech | null {
    if (!value || typeof value !== 'string') {
      warnings.push(
        `Word token at index ${index} missing or invalid pos, setting to null`
      );
      return null;
    }

    const normalized = value.toLowerCase() as PartOfSpeech;
    if (!this.VALID_POS.includes(normalized)) {
      warnings.push(
        `Word token at index ${index} has invalid pos "${value}", setting to null`
      );
      return null;
    }

    return normalized;
  }

  /**
   * Validates difficulty level (metadata field)
   */
  private static validateDifficulty(
    value: unknown,
    index: number,
    warnings: string[]
  ): DifficultyLevel | null {
    if (!value || typeof value !== 'string') {
      warnings.push(
        `Word token at index ${index} missing or invalid difficulty, setting to null`
      );
      return null;
    }

    const normalized = value.toLowerCase() as DifficultyLevel;
    if (!this.VALID_CEFR.includes(normalized)) {
      warnings.push(
        `Word token at index ${index} has invalid difficulty "${value}", setting to null`
      );
      return null;
    }

    return normalized;
  }

  /**
   * Validates definition (metadata field)
   */
  private static validateDefinition(
    value: unknown,
    index: number,
    warnings: string[]
  ): string | null {
    if (!value || typeof value !== 'string') {
      warnings.push(
        `Word token at index ${index} missing or invalid from_definition, setting to null`
      );
      return null;
    }

    if (value.trim().length === 0) {
      warnings.push(
        `Word token at index ${index} has empty from_definition, setting to null`
      );
      return null;
    }

    return value;
  }

  /**
   * Validates punctuation token
   */
  private static validatePunctuationToken(
    t: Record<string, unknown>,
    index: number
  ): {
    token: PunctuationToken;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!t.value || typeof t.value !== 'string') {
      errors.push(
        `Punctuation token at index ${index} missing or invalid value`
      );
      return { token: null as never, errors, warnings };
    }

    return {
      token: { type: 'punctuation', value: t.value },
      errors,
      warnings,
    };
  }

  /**
   * Validates whitespace token
   */
  private static validateWhitespaceToken(
    t: Record<string, unknown>,
    index: number
  ): {
    token: WhitespaceToken;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!t.value || typeof t.value !== 'string') {
      errors.push(`Whitespace token at index ${index} missing or invalid value`);
      return { token: null as never, errors, warnings };
    }

    return {
      token: { type: 'whitespace', value: t.value },
      errors,
      warnings,
    };
  }
}

