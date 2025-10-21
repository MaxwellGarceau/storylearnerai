import React, { createContext, useContext, useCallback, useState, useMemo } from 'react';
import { LanguageCode } from '../types/llm/prompts';
import { TranslationResponse } from '../lib/translationService';
import { WordMetadata } from '../components/text/interactiveText/WordToken';

/**
 * Primary Purpose:
 * The StoryContext is a centralized state management system designed to eliminate 
 * technical debt in the story-related components, particularly the WordMenu component 
 * that was suffering from prop drilling and redundant state management.
 * 
 * Core Architecture:
 * - Word-level state: Tracks individual word states (open/closed, saved, translating, translations)
 * - Translation cache: Stores runtime translations for words
 * - Translating words: Tracks which words are currently being translated
 * - Position-based keys: Supports both lemma-based and position-specific word tracking
 */

export interface WordState {
  isOpen: boolean;
  isSaved: boolean;
  isTranslating: boolean;
  translation?: string;
  metadata: WordMetadata;
  position?: number;
}

export interface StoryContextValue {
  // Core story data
  translationData: TranslationResponse;
  savedTranslationId?: number;
  
  // Language configuration
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  isDisplayingFromSide: boolean;
  
  // Word-level state management
  wordStates: Map<string, WordState>;
  translationCache: Map<string, string>;
  translatingWords: Set<string>;
  
  // Actions
  translateWord: (word: string, position?: number) => void;
  saveWord: (word: string, metadata: WordMetadata) => void;
  toggleWordMenu: (word: string, position?: number) => void;
  closeAllWordMenus: () => void;
  
  // Computed values
  getWordState: (word: string, position?: number) => WordState;
  isWordSaved: (word: string) => boolean;
  isWordTranslating: (word: string, position?: number) => boolean;
  getWordTranslation: (word: string, position?: number) => string | undefined;
}

const StoryContext = createContext<StoryContextValue | null>(null);

export const useStoryContext = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStoryContext must be used within a StoryProvider');
  }
  return context;
};

export const useWordState = (word: string, position?: number) => {
  const { getWordState } = useStoryContext();
  return getWordState(word, position);
};

export const StoryProvider: React.FC<{
  translationData: TranslationResponse;
  savedTranslationId?: number;
  isDisplayingFromSide?: boolean;
  children: React.ReactNode;
}> = ({ 
  translationData, 
  savedTranslationId, 
  isDisplayingFromSide = true,
  children 
}) => {
  // Word-level state management
  const [wordStates, setWordStates] = useState<Map<string, WordState>>(new Map());
  const [translationCache, setTranslationCache] = useState<Map<string, string>>(new Map());
  const [translatingWords, setTranslatingWords] = useState<Set<string>>(new Set());

  // Create position-based key for word state
  const createWordKey = useCallback((word: string, position?: number) => {
    return position !== undefined ? `${word}:${position}` : word;
  }, []);

  // Get word state with fallback to default
  const getWordState = useCallback((word: string, position?: number): WordState => {
    const key = createWordKey(word, position);
    const existingState = wordStates.get(key);
    
    if (existingState) {
      return existingState;
    }

    // Create default state from translation data
    const token = translationData.tokens?.find((token, index) => {
      if (position !== undefined) {
        return index === position && token.type === 'word';
      }
      return token.type === 'word' && (
        token.from_word === word || 
        token.to_word === word ||
        token.from_lemma === word ||
        token.to_lemma === word
      );
    });

    const defaultState: WordState = {
      isOpen: false,
      isSaved: false,
      isTranslating: false,
      translation: undefined,
      metadata: token && token.type === 'word' ? {
        from_word: token.from_word,
        from_lemma: token.from_lemma,
        to_word: token.to_word,
        to_lemma: token.to_lemma,
        pos: token.pos,
        difficulty: token.difficulty,
        from_definition: token.from_definition,
      } : {
        from_word: word,
        from_lemma: word,
        to_word: '',
        to_lemma: '',
        pos: null,
        difficulty: null,
        from_definition: null,
      },
      position,
    };

    return defaultState;
  }, [wordStates, translationData.tokens, createWordKey]);

  // Update word state
  const updateWordState = useCallback((word: string, position: number | undefined, updates: Partial<WordState>) => {
    const key = createWordKey(word, position);
    setWordStates(prev => {
      const newMap = new Map(prev);
      const currentState = newMap.get(key) || getWordState(word, position);
      newMap.set(key, { ...currentState, ...updates });
      return newMap;
    });
  }, [createWordKey, getWordState]);

  // Actions
  const translateWord = useCallback((word: string, position?: number) => {
    const key = createWordKey(word, position);
    
    // Set translating state
    setTranslatingWords(prev => new Set(prev).add(key));
    updateWordState(word, position, { isTranslating: true });

    // Simulate translation (in real implementation, this would call the translation service)
    setTimeout(() => {
      const wordState = getWordState(word, position);
      const translation = wordState.metadata.to_word || `translated_${word}`;
      
      // Update translation cache
      setTranslationCache(prev => new Map(prev).set(key, translation));
      
      // Update word state
      updateWordState(word, position, {
        isTranslating: false,
        translation,
      });
      
      // Remove from translating set
      setTranslatingWords(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }, 1000);
  }, [createWordKey, updateWordState, getWordState]);

  const saveWord = useCallback((word: string, metadata: WordMetadata) => {
    // This would integrate with the vocabulary saving system
    console.log('Saving word:', word, metadata);
    updateWordState(word, undefined, { isSaved: true });
  }, [updateWordState]);

  const toggleWordMenu = useCallback((word: string, position?: number) => {
    const key = createWordKey(word, position);
    const currentState = getWordState(word, position);
    
    // Close all other menus first
    setWordStates(prev => {
      const newMap = new Map(prev);
      for (const [k, state] of newMap) {
        if (k !== key) {
          newMap.set(k, { ...state, isOpen: false });
        }
      }
      return newMap;
    });

    // Toggle current menu
    updateWordState(word, position, { isOpen: !currentState.isOpen });
  }, [createWordKey, getWordState, updateWordState]);

  const closeAllWordMenus = useCallback(() => {
    setWordStates(prev => {
      const newMap = new Map(prev);
      for (const [key, state] of newMap) {
        newMap.set(key, { ...state, isOpen: false });
      }
      return newMap;
    });
  }, []);

  const isWordSaved = useCallback((word: string) => {
    const state = getWordState(word);
    return state.isSaved;
  }, [getWordState]);

  const isWordTranslating = useCallback((word: string, position?: number) => {
    const key = createWordKey(word, position);
    return translatingWords.has(key);
  }, [createWordKey, translatingWords]);

  const getWordTranslation = useCallback((word: string, position?: number) => {
    const key = createWordKey(word, position);
    return translationCache.get(key);
  }, [createWordKey, translationCache]);

  const contextValue: StoryContextValue = useMemo(() => ({
    translationData,
    savedTranslationId,
    fromLanguage: translationData.fromLanguage,
    targetLanguage: translationData.toLanguage,
    isDisplayingFromSide,
    wordStates,
    translationCache,
    translatingWords,
    translateWord,
    saveWord,
    toggleWordMenu,
    closeAllWordMenus,
    getWordState,
    isWordSaved,
    isWordTranslating,
    getWordTranslation,
  }), [
    translationData,
    savedTranslationId,
    isDisplayingFromSide,
    wordStates,
    translationCache,
    translatingWords,
    translateWord,
    saveWord,
    toggleWordMenu,
    closeAllWordMenus,
    getWordState,
    isWordSaved,
    isWordTranslating,
    getWordTranslation,
  ]);

  return (
    <StoryContext.Provider value={contextValue}>
      {children}
    </StoryContext.Provider>
  );
};

export { StoryContext };
