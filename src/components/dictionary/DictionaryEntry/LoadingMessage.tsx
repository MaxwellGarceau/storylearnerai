import React from 'react';
import { cn } from '../../../lib/utils';
import { useDictionaryEntryContext } from './Context';
import { logger } from '../../../lib/logger';

// Loading Message component
export interface DictionaryEntryLoadingMessageProps {
  message?: string;
  className?: string;
}

const DictionaryEntryLoadingMessage: React.FC<
  DictionaryEntryLoadingMessageProps
> = ({ message = 'Loading dictionary info...', className }) => {
  const { isLoading, word } = useDictionaryEntryContext();

  if (!isLoading) return null;

  try {
    logger.debug('dictionary', 'LoadingMessage shown', { word });
  } catch {}

  return (
    <>
      <span className='font-medium block'>{word}</span>
      <span
        className={cn('text-xs text-muted-foreground mt-1 block', className)}
      >
        {message}
      </span>
    </>
  );
};

export default DictionaryEntryLoadingMessage;
