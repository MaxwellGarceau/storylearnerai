import { useCallback, useState } from 'react';
import type { LanguageCode } from '../../types/llm/prompts';
import { useWordTranslation } from '../useWordTranslation';

export function useTranslationCache(args: {
  extractSentenceContext: (wordIndex: number) => string;
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
}) {
  const { translateWordInSentence, translateSentence } = useWordTranslation();
  const { extractSentenceContext, fromLanguage, targetLanguage } = args;

  const [translatedWords, setTranslatedWords] = useState<Map<string, string>>(
    new Map()
  );
  const [translatedSentences, setTranslatedSentences] = useState<
    Map<string, string>
  >(new Map());
  const [translatingWords, setTranslatingWords] = useState<Set<string>>(
    new Set()
  );

  const setWordTranslation = useCallback((normalizedWord: string, translatedText: string) => {
    setTranslatedWords(prev => new Map(prev).set(normalizedWord, translatedText));
  }, []);

  const handleTranslate = useCallback(
    async (normalizedWord: string, wordIndex: number) => {
      if (translatedWords.has(normalizedWord)) return;
      setTranslatingWords(prev => new Set(prev).add(normalizedWord));

      try {
        const sentenceContext = extractSentenceContext(wordIndex);

        if (!translatedSentences.has(sentenceContext)) {
          const translatedSentence = await translateSentence(
            sentenceContext,
            targetLanguage,
            fromLanguage
          );
          if (translatedSentence) {
            setTranslatedSentences(prev =>
              new Map(prev).set(sentenceContext, translatedSentence)
            );
          }
        }

        const translatedText = await translateWordInSentence(
          normalizedWord,
          sentenceContext,
          targetLanguage,
          fromLanguage
        );
        if (translatedText) {
          setTranslatedWords(prev =>
            new Map(prev).set(normalizedWord, translatedText)
          );
        }
      } finally {
        setTranslatingWords(prev => {
          const newSet = new Set(prev);
          newSet.delete(normalizedWord);
          return newSet;
        });
      }
    },
    [translatedWords, extractSentenceContext, translatedSentences, translateSentence, translateWordInSentence, targetLanguage, fromLanguage]
  );

  return {
    translatedWords,
    translatedSentences,
    translatingWords,
    setWordTranslation,
    handleTranslate,
  };
}
