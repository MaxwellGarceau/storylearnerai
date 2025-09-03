import { useMemo, useCallback } from 'react';
import { useVocabulary } from '../useVocabulary';
import { useLanguages } from '../useLanguages';
import type { LanguageCode } from '../../types/llm/prompts';

export function useSavedWords(fromLanguage: LanguageCode, targetLanguage: LanguageCode) {
  const { vocabulary } = useVocabulary();
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
        item.translated_language_id === targetLanguageId &&
        item.original_word
      ) {
        set.add(item.original_word.toLowerCase());
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
            item.translated_language_id === targetLanguageId &&
            item.original_word?.toLowerCase() === normalizedWord
        ) ?? null
      );
    },
    [vocabulary, fromLanguageId, targetLanguageId]
  );

  return { savedOriginalWords, findSavedWordData };
}
