import { useCallback, useState } from 'react';
import type { LanguageCode } from '../../types/llm/prompts';
import { useWordTranslation } from '../useWordTranslation';

export function useTranslationCache(args: {
  extractSentenceContext: (wordIndex: number) => string;
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
}) {
  const { targetWordInSentence, translateSentence } = useWordTranslation();
  const { extractSentenceContext, fromLanguage, targetLanguage } = args;

  const [targetWords, setTargetWords] = useState<Map<string, string>>(
    new Map()
  );
  const [targetSentences, setTargetSentences] = useState<Map<string, string>>(
    new Map()
  );
  const [translatingWords, setTranslatingWords] = useState<Set<string>>(
    new Set()
  );

  const setWordTranslation = useCallback(
    (normalizedWord: string, toText: string) => {
      setTargetWords(prev => new Map(prev).set(normalizedWord, toText));
    },
    []
  );

  const handleTranslate = useCallback(
    async (normalizedWord: string, wordIndex: number) => {
      if (targetWords.has(normalizedWord)) return;
      setTranslatingWords(prev => new Set(prev).add(normalizedWord));

      try {
        const sentenceContext = extractSentenceContext(wordIndex);

        if (!targetSentences.has(sentenceContext)) {
          const targetSentence = await translateSentence(
            sentenceContext,
            targetLanguage,
            fromLanguage
          );
          if (targetSentence) {
            setTargetSentences(prev =>
              new Map(prev).set(sentenceContext, targetSentence)
            );
          }
        }

        const toText = await targetWordInSentence(
          normalizedWord,
          sentenceContext,
          targetLanguage,
          fromLanguage
        );
        if (toText) {
          setTargetWords(prev => new Map(prev).set(normalizedWord, toText));
        }
      } finally {
        setTranslatingWords(prev => {
          const newSet = new Set(prev);
          newSet.delete(normalizedWord);
          return newSet;
        });
      }
    },
    [
      targetWords,
      extractSentenceContext,
      targetSentences,
      translateSentence,
      targetWordInSentence,
      targetLanguage,
      fromLanguage,
    ]
  );

  return {
    targetWords,
    targetSentences,
    translatingWords,
    setWordTranslation,
    handleTranslate,
  };
}
