import type { TranslationToken, WordToken, PunctuationToken, WhitespaceToken, PartOfSpeech } from '../../types/llm/tokens';
import type { DifficultyLevel } from '../../types/llm/prompts';
import type { LoadedWordToken, LoadedNonWordToken, LoadedTranslationToken } from '../../api/supabase/database/savedTranslationService';

/**
 * Utility class for converting between different token formats
 * 
 * Handles conversion between:
 * - Database token format (LoadedWordToken, LoadedPunctuationToken, LoadedWhitespaceToken)
 * - UI token format (TranslationToken, WordToken, PunctuationToken, WhitespaceToken)
 */
export class TokenConverter {
  /**
   * Converts database tokens to UI tokens
   * 
   * @param dbTokens - Array of tokens from database
   * @returns Array of tokens for UI consumption
   */
  static convertDatabaseTokensToUITokens(
    dbTokens: LoadedTranslationToken[]
  ): TranslationToken[] {
    return dbTokens.map(token => {
      switch (token.type) {
        case 'word':
          return this.convertWordToken(token);
        case 'punctuation':
          return this.convertPunctuationToken(token);
        case 'whitespace':
          return this.convertWhitespaceToken(token);
        default:
          throw new Error(`Unknown token type: ${(token as any).type}`);
      }
    });
  }

  /**
   * Converts a database word token to UI word token
   */
  private static convertWordToken(dbToken: LoadedWordToken): WordToken {
    return {
      type: 'word' as const,
      to_word: dbToken.to_word,
      to_lemma: dbToken.to_lemma,
      from_word: dbToken.from_word,
      from_lemma: dbToken.from_lemma,
      pos: (dbToken.pos as PartOfSpeech) ?? null,
      difficulty: (dbToken.difficulty as DifficultyLevel) ?? null,
      from_definition: dbToken.from_definition ?? null,
    };
  }

  /**
   * Converts a database punctuation token to UI punctuation token
   */
  private static convertPunctuationToken(dbToken: LoadedNonWordToken): PunctuationToken {
    return {
      type: 'punctuation' as const,
      value: dbToken.value,
    };
  }

  /**
   * Converts a database whitespace token to UI whitespace token
   */
  private static convertWhitespaceToken(dbToken: LoadedNonWordToken): WhitespaceToken {
    return {
      type: 'whitespace' as const,
      value: dbToken.value,
    };
  }

  /**
   * Converts UI tokens to database token format
   * 
   * @param uiTokens - Array of tokens from UI
   * @returns Array of tokens for database storage
   */
  static convertUITokensToDatabaseTokens(uiTokens: TranslationToken[]): {
    word: LoadedWordToken[];
    punctuation: LoadedNonWordToken[];
    whitespace: LoadedNonWordToken[];
  } {
    const result = {
      word: [] as LoadedWordToken[],
      punctuation: [] as LoadedNonWordToken[],
      whitespace: [] as LoadedNonWordToken[],
    };

    uiTokens.forEach(token => {
      switch (token.type) {
        case 'word':
          result.word.push({
            type: 'word' as const,
            to_word: token.to_word,
            to_lemma: token.to_lemma,
            from_word: token.from_word,
            from_lemma: token.from_lemma,
            pos: token.pos ?? undefined,
            difficulty: token.difficulty ?? undefined,
            from_definition: token.from_definition ?? undefined,
          });
          break;
        case 'punctuation':
          result.punctuation.push({
            type: 'punctuation' as const,
            value: token.value,
          });
          break;
        case 'whitespace':
          result.whitespace.push({
            type: 'whitespace' as const,
            value: token.value,
          });
          break;
        default:
          throw new Error(`Unknown token type: ${(token as any).type}`);
      }
    });

    return result;
  }

  /**
   * Validates that token conversion preserves data integrity
   * 
   * @param originalTokens - Original tokens
   * @param convertedTokens - Converted tokens
   * @returns true if conversion is valid
   */
  static validateConversion(
    originalTokens: LoadedTranslationToken[],
    convertedTokens: TranslationToken[]
  ): boolean {
    if (originalTokens.length !== convertedTokens.length) {
      return false;
    }

    for (let i = 0; i < originalTokens.length; i++) {
      const original = originalTokens[i];
      const converted = convertedTokens[i];

      if (original.type !== converted.type) {
        return false;
      }

      switch (original.type) {
        case 'word':
          if (converted.type !== 'word') return false;
          if (original.to_word !== converted.to_word) return false;
          if (original.to_lemma !== converted.to_lemma) return false;
          if (original.from_word !== converted.from_word) return false;
          if (original.from_lemma !== converted.from_lemma) return false;
          if ((original.pos ?? null) !== converted.pos) return false;
          if ((original.difficulty ?? null) !== converted.difficulty) return false;
          if ((original.from_definition ?? null) !== converted.from_definition) return false;
          break;
        case 'punctuation':
        case 'whitespace':
          if (converted.type !== original.type) return false;
          if (original.value !== (converted as PunctuationToken | WhitespaceToken).value) return false;
          break;
      }
    }

    return true;
  }
}
