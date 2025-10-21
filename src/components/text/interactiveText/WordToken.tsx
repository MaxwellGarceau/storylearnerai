import React from 'react';
import WordMenu from '../WordMenu';
import WordHighlight from '../WordHighlight';
import { useWordActions } from '../../../hooks/useWordActions';
import { getVocabularyHighlightClass } from '../../../lib/vocabularyHighlightService';
import type { DifficultyLevel } from '../../../types/llm/prompts';
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
  word: string;
  position?: number;
  punctuation?: string;
  disabled?: boolean;
  enableTooltips?: boolean;
}

const WordToken: React.FC<WordTokenProps> = ({
  word,
  position,
  punctuation = '',
  disabled = false,
  enableTooltips = true,
}) => {
  const {
    isSaved,
    isTranslating,
    translation,
    isOpen,
    handleToggleMenu,
  } = useWordActions(word, position);

  // Use the vocabulary highlighting service for consistent color coding
  const vocabularyHighlightClass = getVocabularyHighlightClass({
    isIncludedVocabulary: false, // Will be provided by context
    isSaved,
    isTranslating,
    isTranslated: !!translation,
    isActive: isOpen,
    isDisabled: disabled,
  });

  const handleWordClick = () => {
    if (enableTooltips && !disabled) {
      handleToggleMenu();
    }
  };

  if (!enableTooltips || disabled) {
    return (
      <span>
        {translation ? (
          <span className='relative inline-block align-baseline'>
            <span className='absolute left-1/2 -translate-x-1/2 -top-[1.35rem] text-[0.7rem] italic text-primary font-medium pointer-events-none select-none px-1 whitespace-nowrap'>
              {translation}
            </span>
            <WordHighlight
              word={word}
              disabled={disabled}
              className={`line-through decoration-2 decoration-red-500 ${vocabularyHighlightClass}`}
            >
              {word}
            </WordHighlight>
          </span>
        ) : (
          <WordHighlight
            word={word}
            disabled={disabled}
            className={vocabularyHighlightClass}
          >
            {word}
          </WordHighlight>
        )}
        {punctuation}
      </span>
    );
  }

  return (
    <span>
      <WordMenu
        word={word}
        position={position}
      >
        {translation ? (
          <span className='relative inline-block align-baseline'>
            <span className='absolute left-1/2 -translate-x-1/2 -top-[1.35rem] text-[0.7rem] italic text-primary font-medium pointer-events-none select-none px-1 whitespace-nowrap'>
              {translation}
            </span>
            <WordHighlight
              word={word}
              disabled={disabled}
              active={isOpen}
              className={`line-through decoration-2 decoration-red-500 ${vocabularyHighlightClass}`}
              onClick={handleWordClick}
            >
              {word}
            </WordHighlight>
          </span>
        ) : (
          <WordHighlight
            word={word}
            disabled={disabled}
            active={isOpen}
            className={vocabularyHighlightClass}
            onClick={handleWordClick}
          >
            {word}
          </WordHighlight>
        )}
      </WordMenu>
      {punctuation}
    </span>
  );
};

export default WordToken;
