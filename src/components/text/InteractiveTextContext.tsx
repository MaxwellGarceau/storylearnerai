import React, { createContext } from 'react';
import type { LanguageCode } from '../../types/llm/prompts';

export interface InteractiveTextContextValue {
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  // Whether the currently displayed text is the from-language side
  isDisplayingFromSide: boolean;
  savedOriginalWords: Set<string>;
  findSavedWordData: (word: string) => { target_word?: string | null } | null;
  targetWords: Map<string, string>;
  targetSentences: Map<string, string>;
  translatingWords: Set<string>;
  savedTranslationId?: number;
  includedVocabulary: string[];
  // Selector helpers
  getOppositeWordFor: (word: string, position?: number) => string | undefined;
  isTranslatingWord: (word: string, position?: number) => boolean;
  isSavedWord: (word: string) => boolean;
  isIncludedVocabulary: (word: string) => boolean;
  // Position-based translation helpers
  getTranslationByPosition: (lemma: string, position: number) => string | undefined;
  createPositionKey: (lemma: string, position: number) => string;
}

export const InteractiveTextContext =
  createContext<InteractiveTextContextValue | null>(null);

export const InteractiveTextProvider: React.FC<{
  value: InteractiveTextContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <InteractiveTextContext.Provider value={value}>
      {children}
    </InteractiveTextContext.Provider>
  );
};
