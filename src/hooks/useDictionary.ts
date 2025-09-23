import { useState, useCallback, useRef } from 'react';
import {
  UseDictionaryReturn,
  DictionaryWord,
  DictionaryError,
} from '../types/dictionary';
import { createDictionaryError } from '../lib/dictionary/utils';
import { logger } from '../lib/logger';
import { LanguageCode } from '../types/llm/prompts';
import { useLexicalCollectionsContext } from '../components/providers/LexicalCollectionsProvider';

/**
 * React hook for dictionary functionality
 * Provides word lookup with loading states and error handling
 */
export function useDictionary(): UseDictionaryReturn {
  const [wordInfo, setWordInfo] = useState<DictionaryWord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<DictionaryError | null>(null);
  const lexical = useLexicalCollectionsContext();

  // Use ref to prevent race conditions with multiple rapid requests
  const currentRequestRef = useRef<AbortController | null>(null);

  /**
   * Search for a word in the dictionary
   */
  const searchWord = useCallback(
    async (
      word: string,
      fromLanguage?: LanguageCode,
      targetLanguage: LanguageCode = 'en'
    ) => {
      if (!word || word.trim() === '') {
        setError(
          createDictionaryError('INVALID_REQUEST', 'Word cannot be empty', {
            word,
          })
        );
        return;
      }

      const normalizedWord = word.toLowerCase().trim();

      // Cancel any ongoing request
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }

      // Create new abort controller for this request
      const abortController = new AbortController();
      currentRequestRef.current = abortController;

      setIsLoading(true);
      setError(null);
      setWordInfo(null);

      try {
        logger.debug('dictionary-hook', 'Searching for word (provider first)', {
          word: normalizedWord,
          fromLanguage,
          targetLanguage,
        });
        // Provider-first lookup: fromWord -> lemma -> dictionaryByLemma
        const translation = lexical.translationByFromWord.get(
          normalizedWord.normalize('NFC')
        );
        if (translation) {
          const lemmaKey = translation.lemma.normalize('NFC').toLowerCase();
          const dictWord = lexical.dictionaryByLemma.get(lemmaKey) ?? null;
          if (dictWord) {
            if (abortController.signal.aborted) return;
            setWordInfo(dictWord);
            logger.debug('dictionary-hook', 'Found word in provider state', {
              word: normalizedWord,
              lemma: lemmaKey,
            });
            return;
          }
        }

        // If not found in provider, return not found (no external API in new design)
        setError(
          createDictionaryError('WORD_NOT_FOUND', 'Word not found', {
            word: normalizedWord,
            fromLanguage,
            targetLanguage,
          })
        );
      } catch (err) {
        // Check if this request was cancelled
        if (abortController.signal.aborted) {
          logger.debug('dictionary-hook', 'Request was cancelled', {
            word: normalizedWord,
          });
          return;
        }

        logger.error('dictionary-hook', 'Failed to search word', {
          word: normalizedWord,
          error: err instanceof Error ? err.message : 'Unknown error',
        });

        // Handle different error types
        if (err && typeof err === 'object' && 'code' in err) {
          setError(err as DictionaryError);
        } else {
          setError(
            createDictionaryError(
              'API_ERROR',
              err instanceof Error
                ? err.message
                : 'Failed to fetch word information',
              { word: normalizedWord, fromLanguage, targetLanguage }
            )
          );
        }
      } finally {
        // Only update loading state if this is still the current request
        if (currentRequestRef.current === abortController) {
          setIsLoading(false);
          currentRequestRef.current = null;
        }
      }
    },
    [lexical]
  );

  /**
   * Clear any current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    wordInfo,
    isLoading,
    error,
    searchWord,
    clearError,
  };
}

/**
 * Hook for getting dictionary service instance
 * Useful for components that need direct access to service methods
 */
export function useDictionaryService() {
  // No external service in the new flow; this function remains for compatibility.
  return null;
}
