import React from 'react';
import { cn } from '../../../lib/utils';
import { useDictionaryEntryContext } from './Context';

// Error Message component
export interface DictionaryEntryErrorMessageProps {
  errorMessage?: string;
  wordNotFoundMessage?: string;
  className?: string;
}

const DictionaryEntryErrorMessage: React.FC<DictionaryEntryErrorMessageProps> = ({
  errorMessage = 'Failed to load dictionary info',
  wordNotFoundMessage = 'Word not found in dictionary',
  className,
}) => {
  const { error, word } = useDictionaryEntryContext();

  if (!error) return null;

  const message = error.code === 'WORD_NOT_FOUND' ? wordNotFoundMessage : errorMessage;

  return (
    <>
      <span className='font-medium block'>{word}</span>
      <span className={cn('text-xs text-red-500 mt-1 block', className)}>
        {message}
      </span>
    </>
  );
};

export default DictionaryEntryErrorMessage;
