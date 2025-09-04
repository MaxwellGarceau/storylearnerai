import React, { useState } from 'react';
import type { Token } from '../../../hooks/interactiveText/useTokenizedText';
import WordToken from './WordToken';

interface InteractiveTextViewProps {
  className?: string;
  tokens: Token[];
  enableTooltips: boolean;
  disabled: boolean;
  getOriginalSentence: (segmentIndex: number) => string;
  getTranslatedSentence: (originalSentence: string) => string | undefined;
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
  getOriginalSentence,
  getTranslatedSentence,
  isSaved,
  getDisplayTranslation,
  isTranslating,
  onTranslate,
}) => {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  if (tokens.length === 0) return <span className={className} />;

  return (
    <span className={`${className ?? ''} relative block leading-9 md:leading-10 pt-5`}>
      {tokens.map((t, idx) => {
        if (t.kind !== 'word') {
          return <span key={idx}>{t.text}</span>;
        }

        const normalizedWord = t.normalizedWord;
        const cleanWord = t.cleanWord;
        const punctuation = t.punctuation;
        const saved = isSaved(normalizedWord);
        const overlayTranslatedWord = getDisplayTranslation(normalizedWord);
        const originalSentence = getOriginalSentence(t.segmentIndex);
        const translatedSentence = getTranslatedSentence(originalSentence);
        const open = openMenuIndex === idx;

        const handleTranslateClick = () => {
          // Always delegate to parent: it will inject saved or call API
          onTranslate(normalizedWord, t.segmentIndex);
        };

        return (
          <span key={idx}>
            <WordToken
              normalizedWord={normalizedWord}
              cleanWord={cleanWord}
              punctuation={punctuation}
              isOpen={open}
              isSaved={saved}
              isTranslating={isTranslating(normalizedWord)}
              translatedWord={overlayTranslatedWord}
              originalSentence={originalSentence}
              translatedSentence={translatedSentence}
              onOpenChange={isOpen => {
                if (isOpen) setOpenMenuIndex(idx);
                else if (open) setOpenMenuIndex(null);
              }}
              onWordClick={() => setOpenMenuIndex(prev => (prev === idx ? null : idx))}
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
