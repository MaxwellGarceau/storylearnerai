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

  // Position-based translation cache: key = "lemma:position"
  const [targetWords, setTargetWords] = useState<Map<string, string>>(
    new Map()
  );
  const [targetSentences, setTargetSentences] = useState<Map<string, string>>(
    new Map()
  );
  const [translatingWords, setTranslatingWords] = useState<Set<string>>(
    new Set()
  );

  // Helper function to create position-based keys
  const createPositionKey = useCallback(
    (lemma: string, position: number) => `${lemma}:${position}`,
    []
  );

  // Helper function to get translation by position or fallback to lemma
  const getTranslationByPosition = useCallback(
    (lemma: string, position: number) => {
      const positionKey = createPositionKey(lemma, position);
      return targetWords.get(positionKey) ?? targetWords.get(lemma);
    },
    [targetWords, createPositionKey]
  );

  const setWordTranslation = useCallback(
    (normalizedWord: string, toText: string, position?: number) => {
      if (position !== undefined) {
        const positionKey = createPositionKey(normalizedWord, position);
        setTargetWords(prev => new Map(prev).set(positionKey, toText));
      } else {
        // Fallback to lemma-based key for backward compatibility
        setTargetWords(prev => new Map(prev).set(normalizedWord, toText));
      }
    },
    [createPositionKey]
  );

  const handleTranslate = useCallback(
    async (normalizedWord: string, wordIndex: number) => {
      const positionKey = createPositionKey(normalizedWord, wordIndex);
      
      // Check if we already have a translation for this specific position
      if (targetWords.has(positionKey)) return;
      
      // Also check if we have a lemma-based translation (for backward compatibility)
      if (targetWords.has(normalizedWord)) {
        // Copy lemma-based translation to position-based key
        setTargetWords(prev => {
          const newMap = new Map(prev);
          const lemmaTranslation = prev.get(normalizedWord);
          if (lemmaTranslation) {
            newMap.set(positionKey, lemmaTranslation);
          }
          return newMap;
        });
        return;
      }
      
      setTranslatingWords(prev => new Set(prev).add(positionKey));

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
          setTargetWords(prev => new Map(prev).set(positionKey, toText));
        }
      } finally {
        setTranslatingWords(prev => {
          const newSet = new Set(prev);
          newSet.delete(positionKey);
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
      createPositionKey,
    ]
  );

  return {
    targetWords,
    targetSentences,
    translatingWords,
    setWordTranslation,
    handleTranslate,
    getTranslationByPosition,
    createPositionKey,
  };
}
