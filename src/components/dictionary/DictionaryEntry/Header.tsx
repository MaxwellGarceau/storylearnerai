import React from 'react';
import { Badge } from '../../ui/Badge';
import { cn } from '../../../lib/utils';
import { useDictionaryEntryContext } from './Context';

// Header component
export interface DictionaryEntryHeaderProps {
  showPhonetic?: boolean;
  showFrequency?: boolean;
  className?: string;
}

const DictionaryEntryHeader: React.FC<DictionaryEntryHeaderProps> = ({
  showPhonetic = true,
  showFrequency = true,
  className,
}) => {
  const { word, wordInfo } = useDictionaryEntryContext();

  if (!wordInfo) {
    return <span className={cn('font-medium block', className)}>{word}</span>;
  }

  return (
    <span className={cn('flex items-center gap-2 mb-2 block', className)}>
      <span className='font-semibold text-base'>{wordInfo.word}</span>
      {showPhonetic && wordInfo.phonetic && (
        <span className='text-sm text-muted-foreground'>
          [{wordInfo.phonetic}]
        </span>
      )}
      {showFrequency && wordInfo.frequency && (
        <Badge variant='secondary' className='text-xs' as='span'>
          {wordInfo.frequency.level}
        </Badge>
      )}
    </span>
  );
};

export default DictionaryEntryHeader;
