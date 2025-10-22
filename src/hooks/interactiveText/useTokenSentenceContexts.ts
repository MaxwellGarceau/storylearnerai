import { useMemo } from 'react';
import type { TranslationToken } from '../../types/llm/tokens';
import { useSentenceContext } from './useSentenceContext';

export interface TokenSentenceContexts {
  fromSentence: string;
  targetSentence: string;
}

/**
 * Derives full-sentence contexts for a token position on both from/to sides.
 * Uses punctuation tokens (., !, ?) as sentence boundaries.
 * 
 * NOTE: "Context" here refers to the surrounding text/sentence context, NOT React Context.
 * This hook extracts the full sentence containing a word for vocabulary saving purposes.
 */
export function useTokenSentenceContexts(
  tokens: TranslationToken[],
  position: number | undefined
): TokenSentenceContexts {
  const fromSideTokens: string[] = useMemo(
    () =>
      tokens.map(token =>
        token.type === 'word' ? token.from_word : (token as { value: string }).value
      ),
    [tokens]
  );
  const toSideTokens: string[] = useMemo(
    () =>
      tokens.map(token =>
        token.type === 'word' ? token.to_word : (token as { value: string }).value
      ),
    [tokens]
  );

  const { extractSentenceContext: extractFromSentence } =
    useSentenceContext(fromSideTokens);
  const { extractSentenceContext: extractToSentence } =
    useSentenceContext(toSideTokens);

  const fromSentence = useMemo(
    () =>
      position !== undefined && tokens.length > 0
        ? extractFromSentence(position)
        : '',
    [position, tokens.length, extractFromSentence]
  );
  const targetSentence = useMemo(
    () =>
      position !== undefined && tokens.length > 0
        ? extractToSentence(position)
        : '',
    [position, tokens.length, extractToSentence]
  );

  return { fromSentence, targetSentence };
}


