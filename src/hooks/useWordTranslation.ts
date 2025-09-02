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
  translateWordInSentence: (
    focusWord: string,
    sentence: string,
    fromLanguage: LanguageCode,
    toLanguage: LanguageCode
  ) => Promise<string | null>;
  translateSentence: (
    sentence: string,
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

  const translateSentence = useCallback(
    async (
      sentence: string,
      fromLanguage: LanguageCode,
      toLanguage: LanguageCode
    ): Promise<string | null> => {
      setIsTranslating(true);
      setError(null);

      try {
        // Use a default difficulty level for sentence translations
        const defaultDifficulty: DifficultyLevel = 'a2';

        const response = await translationService.translate({
          text: sentence,
          fromLanguage,
          toLanguage,
          difficulty: defaultDifficulty,
        });

        logger.debug('translation', 'Sentence translation successful', {
          sentence,
          fromLanguage,
          toLanguage,
          translatedText: response.translatedText,
        });

        return response.translatedText;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to translate sentence';
        setError(errorMessage);

        logger.error('translation', 'Sentence translation failed', {
          sentence,
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

  const translateWordInSentence = useCallback(
    async (
      focusWord: string,
      sentence: string,
      fromLanguage: LanguageCode,
      toLanguage: LanguageCode
    ): Promise<string | null> => {
      setIsTranslating(true);
      setError(null);

      try {
        const defaultDifficulty: DifficultyLevel = 'a2';

        const response = await translationService.translateWordWithContext({
          sentence,
          focusWord,
          fromLanguage,
          toLanguage,
          difficulty: defaultDifficulty,
        });

        logger.debug('translation', 'Word-in-sentence translation successful', {
          focusWord,
          sentence,
          fromLanguage,
          toLanguage,
          translatedWord: response.translatedWord,
        });

        return response.translatedWord;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to translate word';
        setError(errorMessage);

        logger.error('translation', 'Word-in-sentence translation failed', {
          focusWord,
          sentence,
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

  const translateWord = useCallback(
    async (
      word: string,
      fromLanguage: LanguageCode,
      toLanguage: LanguageCode
    ): Promise<string | null> => {
      // Backward-compatible: when no sentence is provided, fall back to simple translation
      return translateSentence(word, fromLanguage, toLanguage);
    },
    [translateSentence]
  );

  return {
    translateWord,
    translateWordInSentence,
    translateSentence,
    isTranslating,
    error,
    clearError,
  };
}
