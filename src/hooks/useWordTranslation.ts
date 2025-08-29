import { useState, useCallback } from 'react';
import { translationService } from '../lib/translationService';
import { useLanguages } from './useLanguages';
import { useToast } from './useToast';
import type { LanguageCode, DifficultyLevel } from '../types/llm/prompts';
import { logger } from '../lib/logger';

interface UseWordTranslationReturn {
  translateWord: (
    word: string,
    fromLanguage: LanguageCode,
    toLanguage: LanguageCode
  ) => Promise<string | null>;
  isTranslating: boolean;
  error: string | null;
  clearError: () => void;
}

export function useWordTranslation(): UseWordTranslationReturn {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getLanguageIdByCode: _getLanguageIdByCode } = useLanguages();
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const translateWord = useCallback(
    async (
      word: string,
      fromLanguage: LanguageCode,
      toLanguage: LanguageCode
    ): Promise<string | null> => {
      setIsTranslating(true);
      setError(null);

      try {
        // Use a default difficulty level for word translations
        const defaultDifficulty: DifficultyLevel = 'a2';

        const response = await translationService.translate({
          text: word,
          fromLanguage,
          toLanguage,
          difficulty: defaultDifficulty,
        });

        logger.debug('translation', 'Word translation successful', {
          word,
          fromLanguage,
          toLanguage,
          translatedText: response.translatedText,
        });

        return response.translatedText;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to translate word';
        setError(errorMessage);

        logger.error('translation', 'Word translation failed', {
          word,
          fromLanguage,
          toLanguage,
          error: err,
        });

        toast({
          title: 'Translation Error',
          description: errorMessage,
          variant: 'destructive',
        });

        return null;
      } finally {
        setIsTranslating(false);
      }
    },
    [toast]
  );

  return {
    translateWord,
    isTranslating,
    error,
    clearError,
  };
}
