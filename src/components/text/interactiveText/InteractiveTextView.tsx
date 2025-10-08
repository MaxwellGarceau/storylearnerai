import React, { useState } from 'react';
import type { LanguageCode } from '../../../types/llm/prompts';
import type { TranslationToken } from '../../../types/llm/tokens';
import WordToken from './WordToken';
import PunctuationToken from './PunctuationToken';
import WhitespaceToken from './WhitespaceToken';

import type { WordMetadata } from './WordToken';

interface InteractiveTextViewProps {
  className?: string;
  tokens: TranslationToken[];
  enableTooltips: boolean;
  disabled: boolean;
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  getDisplaySentence: (segmentIndex: number) => string;
  getOverlaySentence: (displaySentence: string) => string | undefined;
  isSaved: (displayWordNormalized: string) => boolean;
  getOverlayOppositeWord: (displayWordNormalized: string, position?: number) => string | undefined;
  isTranslating: (normalizedWord: string, position?: number) => boolean;
  onTranslate: (
    normalizedWord: string,
    segmentIndex: number,
    metadata?: WordMetadata
  ) => void;
  // Whether we're displaying the original story (from side) or translated story (to side)
  isDisplayingFromSide?: boolean;
}

const InteractiveTextView: React.FC<InteractiveTextViewProps> = ({
  className,
  tokens,
  enableTooltips,
  disabled,
  fromLanguage,
  targetLanguage,
  getDisplaySentence,
  getOverlaySentence,
  isSaved,
  getOverlayOppositeWord,
  isTranslating,
  onTranslate,
  isDisplayingFromSide = false,
}) => {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  // Early return for empty tokens
  if (tokens.length === 0) return <span className={className} />;

  return (
    <span
      className={`${className ?? ''} relative block leading-9 md:leading-10 pt-5`}
    >
      {tokens.map((token, idx) => {
        if (token.type === 'punctuation') {
          return <PunctuationToken key={idx} value={token.value} />;
        }

        if (token.type === 'whitespace') {
          return <WhitespaceToken key={idx} value={token.value} />;
        }

        // Word token with rich metadata
        const wordToken = token;
        
        // Dynamic keys based on which side we're displaying
        const displayWordKey = isDisplayingFromSide ? 'from_word' : 'to_word';
        const displayLemmaKey = isDisplayingFromSide ? 'from_lemma' : 'to_lemma';
        
        const displayWord = wordToken[displayWordKey];
        const displayLemma = wordToken[displayLemmaKey];
        const cleanWord = displayWord;
        const normalizedWord = displayLemma; // Use lemma for normalization/lookups
        
        const overlayTranslatedTargetWord = getOverlayOppositeWord(normalizedWord, idx);

        // For TranslationTokens, we don't have segmentIndex, so use idx
        const displaySentence = getDisplaySentence(idx);
        const overlaySentence = getOverlaySentence(displaySentence);
        const open = openMenuIndex === idx;

        const handleTranslateClick = (metadata?: WordMetadata) => {
          onTranslate(normalizedWord, idx, metadata);
        };

        const normalizedWordForProps = overlayTranslatedTargetWord ?? normalizedWord;
        const saved = isSaved(normalizedWordForProps);

        return (
          <span key={idx}>
            <WordToken
              actionWordNormalized={normalizedWordForProps}
              inclusionCheckWord={normalizedWord}
              displayWord={displayWord}
              cleanWord={cleanWord}
              punctuation='' // No trailing punctuation in new structure
              isOpen={open}
              isSaved={saved}
              isTranslating={isTranslating(normalizedWord, idx)}
              overlayOppositeWord={overlayTranslatedTargetWord ?? undefined}
              displaySentenceContext={displaySentence}
              overlaySentenceContext={overlaySentence}
              fromLanguage={fromLanguage}
              targetLanguage={targetLanguage}
              onOpenChange={isOpen => {
                if (isOpen) setOpenMenuIndex(idx);
                else if (open) setOpenMenuIndex(null);
              }}
              onWordClick={() =>
                setOpenMenuIndex(prev => (prev === idx ? null : idx))
              }
              onTranslate={handleTranslateClick}
              enableTooltips={enableTooltips}
              disabled={disabled}
              // Pass metadata with swapped values based on display side
              // NOTE: These metadata values are ALWAYS the 'from' and 'to' words, not the swapped values
              wordMetadata={{
                from_word: wordToken.from_word,
                from_lemma: wordToken.from_lemma,
                to_word: wordToken.to_word,
                to_lemma: wordToken.to_lemma,
                pos: wordToken.pos,
                difficulty: wordToken.difficulty,
                from_definition: wordToken.from_definition,
              }}
              position={idx}
            />
          </span>
        );
      })}
    </span>
  );
};

export default InteractiveTextView;
