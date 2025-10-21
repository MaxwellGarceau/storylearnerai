import { TranslationToken, WordToken } from '../../../types/llm/tokens';
import { logger } from '../../logger';

/**
 * Generates tokens from plain text when LLM doesn't return proper JSON
 * This is a deterministic fallback that maintains data structure consistency
 *
 * Note: Fallback tokens have minimal metadata:
 * - No from_word/from_lemma (unknown)
 * - No pos/difficulty/from_definition (set to null)
 */
export class FallbackTokenGenerator {
  private static readonly LEADING_WORD_RE = /^[\p{L}\p{N}'']+/u;

  /**
   * Creates tokens from plain text
   * Splits text into words, whitespace, and punctuation
   */
  static generateTokens(text: string): TranslationToken[] {
    logger.warn('llm', 'Using fallback token generation from plain text', {
      textLength: text.length,
    });

    logger.time('llm', 'fallback-token-generation');

    const tokens: TranslationToken[] = [];

    // Split on whitespace, keeping the delimiters
    const segments = text.split(/(\s+)/);

    for (const segment of segments) {
      if (segment.length === 0) continue;

      // Handle whitespace segments
      if (/^\s+$/.test(segment)) {
        tokens.push({
          type: 'whitespace',
          value: segment,
        });
        continue;
      }

      // Extract word core and trailing punctuation
      const match = segment.match(this.LEADING_WORD_RE);

      if (match) {
        const cleanWord = match[0];
        const punctuation = segment.slice(cleanWord.length);
        const normalizedWord = cleanWord.toLowerCase();

        // Add word token with minimal metadata
        const wordToken: WordToken = {
          type: 'word',
          to_word: cleanWord,
          to_lemma: normalizedWord,
          from_word: '', // Unknown in fallback
          from_lemma: '', // Unknown in fallback
          pos: null, // Unknown in fallback
          difficulty: null, // Unknown in fallback
          from_definition: null, // Unknown in fallback
        };
        tokens.push(wordToken);

        // Add punctuation characters individually
        if (punctuation) {
          for (const char of punctuation) {
            tokens.push({
              type: 'punctuation',
              value: char,
            });
          }
        }
      } else {
        // Pure punctuation or symbols - add each character
        for (const char of segment) {
          tokens.push({
            type: 'punctuation',
            value: char,
          });
        }
      }
    }

    logger.info('llm', 'Fallback tokens generated', {
      tokenCount: tokens.length,
      wordCount: tokens.filter(t => t.type === 'word').length,
      punctuationCount: tokens.filter(t => t.type === 'punctuation').length,
      whitespaceCount: tokens.filter(t => t.type === 'whitespace').length,
    });

    logger.timeEnd('llm', 'fallback-token-generation');

    return tokens;
  }

  /**
   * Validates that generated tokens can reconstruct the original text
   * Useful for testing
   */
  static validateReconstruction(
    originalText: string,
    tokens: TranslationToken[]
  ): boolean {
    const reconstructed = tokens
      .map(token => {
        if (token.type === 'word') return token.to_word;
        return token.value;
      })
      .join('');

    const isValid = reconstructed === originalText;

    if (!isValid) {
      logger.error('llm', 'Token reconstruction validation failed', {
        original: originalText,
        reconstructed,
        diff: {
          originalLength: originalText.length,
          reconstructedLength: reconstructed.length,
        },
      });
    }

    return isValid;
  }
}
