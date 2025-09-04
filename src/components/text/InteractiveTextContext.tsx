import React, { createContext, useContext } from 'react';
import type { LanguageCode } from '../../types/llm/prompts';

export interface InteractiveTextContextValue {
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  savedOriginalWords: Set<string>;
  findSavedWordData: (
    word: string
  ) => { translated_word?: string | null } | null;
  translatedWords: Map<string, string>;
  translatedSentences: Map<string, string>;
  translatingWords: Set<string>;
  savedTranslationId?: number;
  // Selector helpers
  getTranslatedWord: (word: string) => string | undefined;
  isTranslatingWord: (word: string) => boolean;
  isSavedWord: (word: string) => boolean;
}

const InteractiveTextContext =
  createContext<InteractiveTextContextValue | null>(null);

export const useInteractiveTextContext =
  (): InteractiveTextContextValue | null => {
    return useContext(InteractiveTextContext);
  };

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
