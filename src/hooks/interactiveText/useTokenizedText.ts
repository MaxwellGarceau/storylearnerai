import { useMemo } from 'react';

export type Token =
  | { kind: 'whitespace'; segmentIndex: number; text: string }
  | { kind: 'punct'; segmentIndex: number; text: string }
  | {
      kind: 'word';
      segmentIndex: number;
      raw: string; // original segment
      cleanWord: string; // the leading letters/numbers/apostrophes
      normalizedWord: string; // lowercased cleanWord
      punctuation: string; // trailing punctuation/symbols/spaces after the clean word
    };

const LEADING_WORD_RE = /^[\p{L}\p{N}'']+/u;

export function useTokenizedText(text: string): Token[] {
  return useMemo(() => {
    if (!text.trim()) return [];

    const segments = text.split(/(\s+)/);
    const tokens: Token[] = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (segment.length === 0) continue;

      // whitespace
      if (/^\s+$/.test(segment)) {
        tokens.push({ kind: 'whitespace', segmentIndex: i, text: segment });
        continue;
      }

      // Extract word core and trailing punctuation
      const match = segment.match(LEADING_WORD_RE);
      if (match) {
        const cleanWord = match[0];
        const punctuation = segment.slice(cleanWord.length);
        const normalizedWord = cleanWord.toLowerCase();
        tokens.push({
          kind: 'word',
          segmentIndex: i,
          raw: segment,
          cleanWord,
          normalizedWord,
          punctuation,
        });
        continue;
      }

      // pure punctuation or symbols
      tokens.push({ kind: 'punct', segmentIndex: i, text: segment });
    }

    return tokens;
  }, [text]);
}
