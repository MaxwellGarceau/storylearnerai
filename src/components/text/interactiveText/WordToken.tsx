import React from 'react';
import WordMenu from '../WordMenu';
import WordHighlight from '../WordHighlight';
import { useInteractiveTextContext } from '../useInteractiveTextContext';
import { getVocabularyHighlightClass } from '../../../lib/vocabularyHighlightService';
import type { LanguageCode } from '../../../types/llm/prompts';

interface WordTokenProps {
  normalizedWord: string;
  cleanWord: string;
  punctuation: string;
  isOpen: boolean;
  isSaved: boolean;
  isTranslating: boolean;
  targetWord?: string; // used for overlay only (runtime translation)
  // Use this word to decide included-vocabulary highlighting (tie to displayed token)
  inclusionCheckWord: string;
  fromSentence: string;
  targetSentence?: string;
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
  targetWord,
  inclusionCheckWord,
  fromSentence,
  targetSentence,
  fromLanguage,
  targetLanguage,
  onOpenChange,
  onWordClick,
  onTranslate,
  enableTooltips,
  disabled,
}) => {
  const ctx = useInteractiveTextContext();
  const isIncludedVocabulary =
    ctx?.isIncludedVocabulary(inclusionCheckWord) ?? false;

  // Use the vocabulary highlighting service for consistent color coding
  const vocabularyHighlightClass = getVocabularyHighlightClass({
    isIncludedVocabulary,
    isSaved,
    isTranslating,
    isActive: isOpen,
    isDisabled: disabled,
  });

  const handleWordClick = () => {
    if (enableTooltips && !disabled) {
      onWordClick();
    }
  };

  if (!enableTooltips || disabled) {
    return (
      <span>
        {targetWord ? (
          <span className='relative inline-block align-baseline'>
            <span className='absolute left-1/2 -translate-x-1/2 -top-[1.35rem] text-[0.7rem] italic text-primary font-medium pointer-events-none select-none px-1'>
              {targetWord}
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
        targetWord={targetWord}
        fromSentence={fromSentence}
        targetSentence={targetSentence}
        isSaved={isSaved}
        isTranslating={isTranslating}
      >
        {targetWord ? (
          <span className='relative inline-block align-baseline'>
            <span className='absolute left-1/2 -translate-x-1/2 -top-[1.35rem] text-[0.7rem] italic text-primary font-medium pointer-events-none select-none px-1'>
              {targetWord}
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
