import React from 'react';
import { DictionaryWord } from '../../../types/dictionary';

// Context for sharing data between compound components
export interface DictionaryEntryContextValue {
  word: string;
  wordInfo: DictionaryWord | null;
  isLoading: boolean;
  error: Error | null;
}

export const DictionaryEntryContext =
  React.createContext<DictionaryEntryContextValue | null>(null);

// Hook to use the context
export const useDictionaryEntryContext = () => {
  const context = React.useContext(DictionaryEntryContext);
  if (!context) {
    throw new Error(
      'DictionaryEntry components must be used within DictionaryEntry.Root'
    );
  }
  return context;
};
