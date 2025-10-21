import { useMemo, useCallback } from 'react';
import { useVocabularyContext } from '../../contexts/VocabularyContext';
import { useLanguages } from '../useLanguages';
import type { LanguageCode } from '../../types/llm/prompts';

/**
 * useSavedWords
 * - Purpose: fast, memoized selectors for a specific language pair.
 * - Returns: a Set of saved original words (lowercased) and a finder by original word.
 * - Built on: useVocabulary (which owns fetching, CRUD, loading/error, and existence checks).
 *
 * When to use which:
 * - Use useVocabulary when you need to fetch or mutate vocabulary data, or run
 *   cross-language checks like checkVocabularyExists.
 * - Use useSavedWords in render paths (e.g., InteractiveText) to efficiently
 *   highlight/check words for a single from→target pair without duplicating fetch logic.
 */
export function useSavedWords(
  fromLanguage: LanguageCode,
  targetLanguage: LanguageCode
) {
  const { vocabulary } = useVocabularyContext();
  const { getLanguageIdByCode } = useLanguages();

  const fromLanguageId = getLanguageIdByCode(fromLanguage);
  const targetLanguageId = getLanguageIdByCode(targetLanguage);

  const savedOriginalWords = useMemo(() => {
    if (fromLanguageId == null || targetLanguageId == null)
      return new Set<string>();
    const set = new Set<string>();
    for (const item of vocabulary) {
      if (
        item.from_language_id === fromLanguageId &&
        item.target_language_id === targetLanguageId &&
        item.from_word
      ) {
        set.add(item.from_word.toLowerCase());
      }
    }
    return set;
  }, [vocabulary, fromLanguageId, targetLanguageId]);

  const savedTargetWords = useMemo(() => {
    if (fromLanguageId == null || targetLanguageId == null)
      return new Set<string>();
    const set = new Set<string>();
    for (const item of vocabulary) {
      if (
        item.from_language_id === fromLanguageId &&
        item.target_language_id === targetLanguageId &&
        item.target_word
      ) {
        set.add(item.target_word.toLowerCase());
      }
    }
    return set;
  }, [vocabulary, fromLanguageId, targetLanguageId]);

  const findSavedWordData = useCallback(
    (word: string) => {
      if (fromLanguageId == null || targetLanguageId == null) return null;

      const normalizedWord = word.toLowerCase();
      return (
        vocabulary.find(
          item =>
            item.from_language_id === fromLanguageId &&
            item.target_language_id === targetLanguageId &&
            item.from_word?.toLowerCase() === normalizedWord
        ) ?? null
      );
    },
    [vocabulary, fromLanguageId, targetLanguageId]
  );

  const findSavedByTargetWord = useCallback(
    (word: string) => {
      if (fromLanguageId == null || targetLanguageId == null) return null;

      const normalizedWord = word.toLowerCase();
      return (
        vocabulary.find(
          item =>
            item.from_language_id === fromLanguageId &&
            item.target_language_id === targetLanguageId &&
            item.target_word?.toLowerCase() === normalizedWord
        ) ?? null
      );
    },
    [vocabulary, fromLanguageId, targetLanguageId]
  );

  return {
    savedOriginalWords,
    findSavedWordData,
    savedTargetWords,
    findSavedByTargetWord,
  };
}
