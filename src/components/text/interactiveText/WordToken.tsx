import React from 'react';
import WordMenu from '../WordMenu';
import WordHighlight from '../WordHighlight';
import { useWordActions } from '../../../hooks/useWordActions';
import { useSavedWords } from '../../../hooks/interactiveText/useSavedWords';
import { useStoryContext } from '../../../contexts/StoryContext';
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

interface WordTokenDisabledProps {
  word: string;
  translation?: string;
  disabled?: boolean;
  punctuation?: string;
  vocabularyHighlightClass: string;
}

const WordTokenDisabled: React.FC<WordTokenDisabledProps> = ({
  word,
  translation,
  disabled,
  punctuation,
  vocabularyHighlightClass,
}) => {
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
};

const WordToken: React.FC<WordTokenProps> = ({
  word,
  position,
  punctuation = '',
  disabled = false,
  enableTooltips = true,
}) => {
  const { isSaved, isTranslating, translation, isOpen, handleToggleMenu } =
    useWordActions(word, position);

  // Get language information from StoryContext
  const { translationData, isDisplayingFromSide } = useStoryContext();
  const fromLanguage = translationData.fromLanguage;
  const toLanguage = translationData.toLanguage;
  const includedVocabulary = translationData.includedVocabulary ?? [];

  // Check if word is saved in vocabulary
  const {
    savedOriginalWords,
    savedTargetWords,
    loading: vocabularyLoading,
  } = useSavedWords(fromLanguage, toLanguage);

  // Check if word is in included vocabulary (user-selected for translation)
  const isWordIncludedVocabulary = includedVocabulary.some(
    vocabWord => vocabWord.toLowerCase() === word.toLowerCase()
  );

  // When displaying from side, check if the displayed word (from language) is in vocabulary
  // When displaying to side, check if the corresponding from language word is in vocabulary
  const isWordInVocabulary =
    !vocabularyLoading &&
    (isDisplayingFromSide
      ? savedOriginalWords.has(word.toLowerCase()) // Displaying from language, check original words
      : savedTargetWords.has(word.toLowerCase())); // Displaying to language, check target words

  // Use the vocabulary highlighting service for consistent color coding
  const vocabularyHighlightClass = getVocabularyHighlightClass({
    isIncludedVocabulary: isWordIncludedVocabulary, // Check if word is in included vocabulary
    isSaved: isSaved || isWordInVocabulary, // Check both local state and vocabulary
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
      <WordTokenDisabled
        word={word}
        translation={translation}
        disabled={disabled}
        punctuation={punctuation}
        vocabularyHighlightClass={vocabularyHighlightClass}
      />
    );
  }

  return (
    <span>
      <WordMenu word={word} position={position}>
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
