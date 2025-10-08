import { useCallback, useState } from 'react';
import type { LanguageCode } from '../../types/llm/prompts';
import { useWordTranslation } from '../useWordTranslation';

export function useTranslationCache(args: {
  extractSentenceContext: (wordIndex: number) => string;
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  tokens?: Array<{ to_lemma?: string; from_lemma?: string; type?: string }>; // Add tokens to track all lemma positions
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

  // Helper function to find all positions where a lemma appears
  const findAllLemmaPositions = useCallback(
    (lemma: string) => {
      if (!args.tokens) return [];
      const positions: number[] = [];
      args.tokens.forEach((token, index) => {
        // Only check word tokens (skip punctuation and whitespace)
        if (token.type === 'word' && (token.to_lemma === lemma || token.from_lemma === lemma)) {
          positions.push(index);
        }
      });
      return positions;
    },
    [args.tokens]
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

  // Function to translate all instances of a lemma
  const translateAllLemmaInstances = useCallback(
    async (lemma: string) => {
      const allPositions = findAllLemmaPositions(lemma);
      
      // Set translating state for all positions
      const positionKeys = allPositions.map(pos => createPositionKey(lemma, pos));
      setTranslatingWords(prev => {
        const newSet = new Set(prev);
        positionKeys.forEach(key => newSet.add(key));
        return newSet;
      });

      try {
        // Translate each position individually to get context-specific translations
        const translationPromises = allPositions.map(async (position) => {
          // Skip if already translated
          const positionKey = createPositionKey(lemma, position);
          if (targetWords.has(positionKey)) return;

          const sentenceContext = extractSentenceContext(position);
          
          // Ensure sentence is translated
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

          // Get word-specific translation
          const toText = await targetWordInSentence(
            lemma,
            sentenceContext,
            targetLanguage,
            fromLanguage
          );
          if (toText) {
            setTargetWords(prev => new Map(prev).set(positionKey, toText));
          }
        });

        await Promise.all(translationPromises);
      } finally {
        // Clear translating state for all positions
        setTranslatingWords(prev => {
          const newSet = new Set(prev);
          positionKeys.forEach(key => newSet.delete(key));
          return newSet;
        });
      }
    },
    [
      findAllLemmaPositions,
      createPositionKey,
      targetWords,
      extractSentenceContext,
      targetSentences,
      translateSentence,
      targetWordInSentence,
      targetLanguage,
      fromLanguage,
    ]
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
      
      // Use the new function to translate all instances of this lemma
      await translateAllLemmaInstances(normalizedWord);
    },
    [
      targetWords,
      createPositionKey,
      translateAllLemmaInstances,
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
    findAllLemmaPositions,
    translateAllLemmaInstances,
  };
}
