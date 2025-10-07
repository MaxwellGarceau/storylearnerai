import React from 'react';
import WordMenu from '../WordMenu';
import WordHighlight from '../WordHighlight';
import { useInteractiveTextContext } from '../useInteractiveTextContext';
import { getVocabularyHighlightClass } from '../../../lib/vocabularyHighlightService';
import type { LanguageCode, DifficultyLevel } from '../../../types/llm/prompts';
import type { PartOfSpeech } from '../../../types/llm/tokens';

export interface WordMetadata {
  from_word: string;
  from_lemma: string;
  to_word: string;
  to_lemma: string;
  pos: PartOfSpeech | null;
  difficulty: DifficultyLevel | null;
  from_definition: string | null;
}

interface WordTokenProps {
  actionWordNormalized: string;
  cleanWord: string;
  punctuation: string;
  isOpen: boolean;
  isSaved: boolean;
  isTranslating: boolean;
  overlayOppositeWord?: string; // used for overlay only (runtime translation)
  // Use this word to decide included-vocabulary highlighting (tie to displayed token)
  inclusionCheckWord: string;
  displaySentenceContext: string;
  overlaySentenceContext?: string;
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  onOpenChange: (open: boolean) => void;
  onWordClick: () => void;
  onTranslate: () => void;
  enableTooltips: boolean;
  disabled: boolean;
  // Optional: Rich metadata from LLM
  wordMetadata?: WordMetadata;
}

const WordToken: React.FC<WordTokenProps> = ({
  actionWordNormalized,
  cleanWord,
  punctuation,
  isOpen,
  isSaved,
  isTranslating,
  overlayOppositeWord,
  inclusionCheckWord,
  displaySentenceContext,
  overlaySentenceContext,
  fromLanguage,
  targetLanguage,
  onOpenChange,
  onWordClick,
  onTranslate,
  enableTooltips,
  disabled,
  wordMetadata: _wordMetadata,
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
        {overlayOppositeWord ? (
          <span className='relative inline-block align-baseline'>
            <span className='absolute left-1/2 -translate-x-1/2 -top-[1.35rem] text-[0.7rem] italic text-primary font-medium pointer-events-none select-none px-1'>
              {overlayOppositeWord}
            </span>
            <WordHighlight
              word={actionWordNormalized}
              disabled={disabled}
              className={`line-through decoration-2 decoration-red-500 ${vocabularyHighlightClass}`}
            >
              {cleanWord}
            </WordHighlight>
          </span>
        ) : (
          <WordHighlight
            word={actionWordNormalized}
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
        word={inclusionCheckWord}
        open={isOpen}
        onOpenChange={onOpenChange}
        onTranslate={() => {
          onTranslate();
        }}
        fromLanguage={fromLanguage}
        targetLanguage={targetLanguage}
        targetWord={overlayOppositeWord}
        fromSentence={displaySentenceContext}
        targetSentence={overlaySentenceContext}
        isSaved={isSaved}
        isTranslating={isTranslating}
      >
        {overlayOppositeWord ? (
          <span className='relative inline-block align-baseline'>
            <span className='absolute left-1/2 -translate-x-1/2 -top-[1.35rem] text-[0.7rem] italic text-primary font-medium pointer-events-none select-none px-1'>
              {overlayOppositeWord}
            </span>
            <WordHighlight
              word={actionWordNormalized}
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
            word={actionWordNormalized}
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
