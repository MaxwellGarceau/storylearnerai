import { useCallback } from 'react';
import { useStoryContext } from '../contexts/StoryContext';
import { WordMetadata } from '../components/text/interactiveText/WordToken';

/**
 * Hook for word-specific actions and state
 * Provides a clean interface for word-level operations
 */
export const useWordActions = (word: string, position?: number) => {
  const {
    translateWord,
    saveWord,
    toggleWordMenu,
    getWordState,
    isWordSaved,
    isWordTranslating,
    getWordTranslation,
  } = useStoryContext();

  const wordState = getWordState(word, position);
  const isSaved = isWordSaved(word);
  const isTranslating = isWordTranslating(word, position);
  const translation = getWordTranslation(word, position);

  const handleTranslate = useCallback(() => {
    if (!isTranslating) {
      translateWord(word, position);
    }
  }, [word, position, isTranslating, translateWord]);

  const handleSave = useCallback((metadata: WordMetadata) => {
    saveWord(word, metadata);
  }, [word, saveWord]);

  const handleToggleMenu = useCallback(() => {
    toggleWordMenu(word, position);
  }, [word, position, toggleWordMenu]);

  return {
    // State
    wordState,
    isSaved,
    isTranslating,
    translation,
    isOpen: wordState.isOpen,
    
    // Actions
    handleTranslate,
    handleSave,
    handleToggleMenu,
    
    // Metadata
    metadata: wordState.metadata,
  };
};
