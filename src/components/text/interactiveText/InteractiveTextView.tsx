import React, { useState } from 'react';
import type { Token } from '../../../hooks/interactiveText/useTokenizedText';
import type { LanguageCode } from '../../../types/llm/prompts';
import type { TranslationToken, WordToken as WordTokenType } from '../../../types/llm/tokens';
import WordToken from './WordToken';
import PunctuationToken from './PunctuationToken';
import WhitespaceToken from './WhitespaceToken';

interface InteractiveTextViewProps {
  className?: string;
  tokens: Token[] | TranslationToken[];
  isUsingTranslationTokens: boolean;
  enableTooltips: boolean;
  disabled: boolean;
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  getDisplaySentence: (segmentIndex: number) => string;
  getOverlaySentence: (displaySentence: string) => string | undefined;
  isSaved: (displayWordNormalized: string) => boolean;
  getOverlayOppositeWord: (displayWordNormalized: string) => string | undefined;
  isTranslating: (normalizedWord: string) => boolean;
  onTranslate: (normalizedWord: string, segmentIndex: number) => void;
}

const InteractiveTextView: React.FC<InteractiveTextViewProps> = ({
  className,
  tokens,
  isUsingTranslationTokens,
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
}) => {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  if (tokens.length === 0) return <span className={className} />;

  return (
    <span
      className={`${className ?? ''} relative block leading-9 md:leading-10 pt-5`}
    >
      {tokens.map((t, idx) => {
        // Handle new TranslationToken structure
        if (isUsingTranslationTokens) {
          const token = t as TranslationToken;

          if (token.type === 'punctuation') {
            return <PunctuationToken key={idx} value={token.value} />;
          }

          if (token.type === 'whitespace') {
            return <WhitespaceToken key={idx} value={token.value} />;
          }

          // Word token with rich metadata
          const wordToken = token as WordTokenType;
          const normalizedFromWord = wordToken.to_lemma; // Use lemma for normalization
          const cleanWord = wordToken.to_word;
          const overlayTranslatedTargetWord =
            getOverlayOppositeWord(normalizedFromWord);
          
          // For TranslationTokens, we don't have segmentIndex, so use idx
          const displaySentence = getDisplaySentence(idx);
          const overlaySentence = getOverlaySentence(displaySentence);
          const open = openMenuIndex === idx;

          const handleTranslateClick = () => {
            onTranslate(normalizedFromWord, idx);
          };

          const normalizedWordForProps =
            overlayTranslatedTargetWord ?? normalizedFromWord;
          const saved = isSaved(normalizedWordForProps);

          return (
            <span key={idx}>
              <WordToken
                actionWordNormalized={normalizedWordForProps}
                inclusionCheckWord={normalizedFromWord}
                cleanWord={cleanWord}
                punctuation="" // No trailing punctuation in new structure
                isOpen={open}
                isSaved={saved}
                isTranslating={isTranslating(normalizedFromWord)}
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
                // Pass new metadata
                wordMetadata={{
                  from_word: wordToken.from_word,
                  from_lemma: wordToken.from_lemma,
                  to_word: wordToken.to_word,
                  to_lemma: wordToken.to_lemma,
                  pos: wordToken.pos,
                  difficulty: wordToken.difficulty,
                  from_definition: wordToken.from_definition,
                }}
              />
            </span>
          );
        }

        // Handle legacy Token structure
        const legacyToken = t as Token;
        if (legacyToken.kind !== 'word') {
          return <span key={idx}>{legacyToken.text}</span>;
        }

        const normalizedFromWord = legacyToken.normalizedWord;
        const cleanWord = legacyToken.cleanWord;
        const punctuation = legacyToken.punctuation;
        const overlayTranslatedTargetWord =
          getOverlayOppositeWord(normalizedFromWord);
        const displaySentence = getDisplaySentence(legacyToken.segmentIndex);
        const overlaySentence = getOverlaySentence(displaySentence);
        const open = openMenuIndex === idx;

        const handleTranslateClick = () => {
          onTranslate(normalizedFromWord, legacyToken.segmentIndex);
        };

        const normalizedWordForProps =
          overlayTranslatedTargetWord ?? normalizedFromWord;
        const saved = isSaved(normalizedWordForProps);

        return (
          <span key={idx}>
            <WordToken
              actionWordNormalized={normalizedWordForProps}
              inclusionCheckWord={normalizedFromWord}
              cleanWord={cleanWord}
              punctuation={punctuation}
              isOpen={open}
              isSaved={saved}
              isTranslating={isTranslating(normalizedFromWord)}
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
            />
          </span>
        );
      })}
    </span>
  );
};

export default InteractiveTextView;
