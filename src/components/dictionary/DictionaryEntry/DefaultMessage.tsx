import React from 'react';
import { cn } from '../../../lib/utils';
import { useDictionaryEntryContext } from './Context';

// Default Message component
export interface DictionaryEntryDefaultMessageProps {
  message?: string;
  className?: string;
}

const DictionaryEntryDefaultMessage: React.FC<DictionaryEntryDefaultMessageProps> = ({
  message = 'Hover to see dictionary info',
  className,
}) => {
  const { word, wordInfo, isLoading, error } = useDictionaryEntryContext();

  // Only show default message if no other state is active
  if (isLoading || error || wordInfo) return null;

  return (
    <>
      <span className='font-medium block'>{word}</span>
      <span className={cn('text-xs text-muted-foreground mt-1 block', className)}>
        {message}
      </span>
    </>
  );
};

export default DictionaryEntryDefaultMessage;
