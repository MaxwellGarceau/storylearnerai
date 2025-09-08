import React from 'react';
import WordMenu from '../WordMenu';
import WordHighlight from '../WordHighlight';
import { useInteractiveTextContext } from '../useInteractiveTextContext';
import type { LanguageCode } from '../../../types/llm/prompts';

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
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
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
  fromLanguage,
  targetLanguage,
  onOpenChange,
  onWordClick,
  onTranslate,
  enableTooltips,
  disabled,
}) => {
  const ctx = useInteractiveTextContext();
  const isIncludedVocabulary = ctx?.isIncludedVocabulary(normalizedWord) ?? false;

  // Use green highlighting for included vocabulary words, yellow for saved words
  const vocabularyHighlightClass = isIncludedVocabulary
    ? 'bg-green-200 dark:bg-green-900/40'
    : isSaved
    ? 'bg-yellow-200 dark:bg-yellow-900/30'
    : '';

  const handleWordClick = () => {
    if (enableTooltips && !disabled) {
      onWordClick();
    }
  };

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
              className={`line-through decoration-2 decoration-red-500 ${vocabularyHighlightClass}`}
            >
              {cleanWord}
            </WordHighlight>
          </span>
        ) : (
          <WordHighlight
            word={normalizedWord}
            disabled={disabled}
            className={vocabularyHighlightClass}
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
        fromLanguage={fromLanguage}
        targetLanguage={targetLanguage}
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
              className={`line-through decoration-2 decoration-red-500 ${vocabularyHighlightClass}`}
              onClick={handleWordClick}
            >
              {cleanWord}
            </WordHighlight>
          </span>
        ) : (
          <WordHighlight
            word={normalizedWord}
            disabled={disabled}
            active={isOpen}
            className={vocabularyHighlightClass}
              onClick={handleWordClick}
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
