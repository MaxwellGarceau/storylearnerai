import React from 'react';
import { cn } from '../../../lib/utils';
import { DictionaryWord } from '../../../types/dictionary';
import { DictionaryEntryContext, DictionaryEntryContextValue } from './Context';

// Main container component
export interface DictionaryEntryRootProps {
  word: string;
  wordInfo: DictionaryWord | null;
  isLoading: boolean;
  error: any;
  children: React.ReactNode;
  className?: string;
}

const DictionaryEntryRoot: React.FC<DictionaryEntryRootProps> = ({
  word,
  wordInfo,
  isLoading,
  error,
  children,
  className,
}) => {
  const contextValue: DictionaryEntryContextValue = {
    word,
    wordInfo,
    isLoading,
    error,
  };

  return (
    <DictionaryEntryContext.Provider value={contextValue}>
      <span className={cn('p-2 min-w-[200px] block', className)}>
        {children}
      </span>
    </DictionaryEntryContext.Provider>
  );
};

export default DictionaryEntryRoot;
