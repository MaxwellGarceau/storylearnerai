import React, { useState } from 'react';
import type { Token } from '../../../hooks/interactiveText/useTokenizedText';
import type { LanguageCode } from '../../../types/llm/prompts';
import WordToken from './WordToken';

interface InteractiveTextViewProps {
  className?: string;
  tokens: Token[];
  enableTooltips: boolean;
  disabled: boolean;
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  getOriginalSentence: (segmentIndex: number) => string;
  getTargetSentence: (fromSentence: string) => string | undefined;
  isSaved: (normalizedWord: string) => boolean;
  getDisplayTranslation: (normalizedWord: string) => string | undefined;
  isTranslating: (normalizedWord: string) => boolean;
  onTranslate: (normalizedWord: string, segmentIndex: number) => void;
}

const InteractiveTextView: React.FC<InteractiveTextViewProps> = ({
  className,
  tokens,
  enableTooltips,
  disabled,
  fromLanguage,
  targetLanguage,
  getOriginalSentence,
  getTargetSentence,
  isSaved,
  getDisplayTranslation,
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
        if (t.kind !== 'word') {
          return <span key={idx}>{t.text}</span>;
        }

        const normalizedFromWord = t.normalizedWord;
        const cleanWord = t.cleanWord;
        const punctuation = t.punctuation;
        const overlayTranslatedTargetWord = getDisplayTranslation(normalizedFromWord);
        const fromSentence = getOriginalSentence(t.segmentIndex);
        const targetSentence = getTargetSentence(fromSentence);
        const open = openMenuIndex === idx;

        const handleTranslateClick = () => {
          // Always delegate to parent: it will inject saved or call API
          onTranslate(normalizedFromWord, t.segmentIndex);
        };

        // When available, treat the translated opposite-language word as the normalized key for WordToken
        const normalizedWordForProps = overlayTranslatedTargetWord ?? normalizedFromWord;
        // Saved status should be checked against the from-language word when overlay exists
        const saved = isSaved(normalizedWordForProps);

        return (
          <span key={idx}>
            <WordToken
              normalizedWord={normalizedWordForProps}
              inclusionCheckWord={normalizedFromWord}
              cleanWord={cleanWord}
              punctuation={punctuation}
              isOpen={open}
              isSaved={saved}
              isTranslating={isTranslating(normalizedFromWord)}
              // Only show overlay (from-word above target-word) when a translation exists
              targetWord={overlayTranslatedTargetWord ? normalizedFromWord : undefined}
              fromSentence={fromSentence}
              targetSentence={targetSentence}
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
