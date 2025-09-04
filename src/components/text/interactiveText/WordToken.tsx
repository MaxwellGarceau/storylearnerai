import React from 'react';
import WordMenu from '../WordMenu';
import WordHighlight from '../WordHighlight';
import { useInteractiveTextContext } from '../InteractiveTextContext';

interface WordTokenProps {
  normalizedWord: string;
  cleanWord: string;
  punctuation: string;
  isOpen: boolean;
  isSaved: boolean;
  isTranslating: boolean;
  translatedWord?: string; // used for overlay only (runtime translation)
  originalSentence: string;
  translatedSentence?: string;
  onOpenChange: (open: boolean) => void;
  onWordClick: () => void;
  onTranslate: () => void;
  enableTooltips: boolean;
  disabled: boolean;
}

const WordToken: React.FC<WordTokenProps> = ({
  normalizedWord,
  cleanWord,
  punctuation,
  isOpen,
  isSaved,
  isTranslating,
  translatedWord,
  originalSentence,
  translatedSentence,
  onOpenChange,
  onWordClick,
  onTranslate,
  enableTooltips,
  disabled,
}) => {
  const ctx = useInteractiveTextContext();
  const savedHighlightClass = isSaved ? 'bg-yellow-200 dark:bg-yellow-900/30' : '';

  if (!enableTooltips || disabled) {
    return (
      <span>
        {translatedWord ? (
          <span className='relative inline-block align-baseline'>
            <span className='absolute left-1/2 -translate-x-1/2 -top-[1.35rem] text-[0.7rem] italic text-primary font-medium pointer-events-none select-none px-1'>
              {translatedWord}
            </span>
            <WordHighlight
              word={normalizedWord}
              disabled={disabled}
              className={`line-through decoration-2 decoration-red-500 ${savedHighlightClass}`}
            >
              {cleanWord}
            </WordHighlight>
          </span>
        ) : (
          <WordHighlight
            word={normalizedWord}
            disabled={disabled}
            className={savedHighlightClass}
          >
            {cleanWord}
          </WordHighlight>
        )}
        {punctuation}
      </span>
    );
  }

  return (
    <span>
      <WordMenu
        word={normalizedWord}
        open={isOpen}
        onOpenChange={onOpenChange}
        onTranslate={() => {
          onTranslate();
        }}
        fromLanguage={ctx?.fromLanguage}
        targetLanguage={ctx?.targetLanguage}
        translatedWord={translatedWord}
        originalSentence={originalSentence}
        translatedSentence={translatedSentence}
        isSaved={isSaved}
        isTranslating={isTranslating}
      >
        {translatedWord ? (
          <span className='relative inline-block align-baseline'>
            <span className='absolute left-1/2 -translate-x-1/2 -top-[1.35rem] text-[0.7rem] italic text-primary font-medium pointer-events-none select-none px-1'>
              {translatedWord}
            </span>
            <WordHighlight
              word={normalizedWord}
              disabled={disabled}
              active={isOpen}
              className={`line-through decoration-2 decoration-red-500 ${savedHighlightClass}`}
              onClick={onWordClick}
            >
              {cleanWord}
            </WordHighlight>
          </span>
        ) : (
          <WordHighlight
            word={normalizedWord}
            disabled={disabled}
            active={isOpen}
            className={savedHighlightClass}
            onClick={onWordClick}
          >
            {cleanWord}
          </WordHighlight>
        )}
      </WordMenu>
      {punctuation}
    </span>
  );
};

export default WordToken;
