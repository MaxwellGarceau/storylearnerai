import React, { createContext } from 'react';
import type { LanguageCode } from '../../types/llm/prompts';

export interface InteractiveTextContextValue {
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  savedOriginalWords: Set<string>;
  findSavedWordData: (word: string) => { target_word?: string | null } | null;
  targetWords: Map<string, string>;
  targetSentences: Map<string, string>;
  translatingWords: Set<string>;
  savedTranslationId?: number;
  includedVocabulary: string[];
  // Selector helpers
  getOppositeWordFor: (word: string) => string | undefined;
  isTranslatingWord: (word: string) => boolean;
  isSavedWord: (word: string) => boolean;
  isIncludedVocabulary: (word: string) => boolean;
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
