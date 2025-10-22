import { useMemo } from 'react';

/**
 * Hook for extracting sentence context from a word position.
 * 
 * NOTE: "Context" here refers to the surrounding text/sentence context, NOT React Context.
 * This hook finds sentence boundaries and extracts the full sentence containing a word.
 */
export function useSentenceContext(words: string[]) {
  const findSentenceStart = useMemo(() => {
    return (wordIndex: number): number => {
      for (let i = wordIndex; i >= 0; i--) {
        const token = words[i];
        if (token && /[.!?]\s*$/.test(token)) {
          return i + 1;
        }
      }
      return 0;
    };
  }, [words]);

  const findSentenceEnd = useMemo(() => {
    return (wordIndex: number): number => {
      for (let i = wordIndex; i < words.length; i++) {
        const token = words[i];
        if (token && /[.!?]\s*$/.test(token)) {
          return i;
        }
      }
      return words.length - 1;
    };
  }, [words]);

  const extractSentenceContext = useMemo(() => {
    return (wordIndex: number): string => {
      const sentenceStart = findSentenceStart(wordIndex);
      const sentenceEnd = findSentenceEnd(wordIndex);
      return words
        .slice(sentenceStart, sentenceEnd + 1)
        .join('')
        .trim();
    };
  }, [words, findSentenceStart, findSentenceEnd]);

  return { extractSentenceContext };
}
