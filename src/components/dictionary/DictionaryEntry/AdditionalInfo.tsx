import React from 'react';
import { cn } from '../../../lib/utils';
import { useDictionaryEntryContext } from './Context';

// Additional Info component
export interface DictionaryEntryAdditionalInfoProps {
  maxSynonyms?: number;
  maxAntonyms?: number;
  showSynonyms?: boolean;
  showAntonyms?: boolean;
  className?: string;
}

const DictionaryEntryAdditionalInfo: React.FC<
  DictionaryEntryAdditionalInfoProps
> = ({
  maxSynonyms = 3,
  maxAntonyms = 2,
  showSynonyms = true,
  showAntonyms = true,
  className,
}) => {
  const { wordInfo } = useDictionaryEntryContext();

  if (!wordInfo || (!showSynonyms && !showAntonyms)) return null;

  const hasSynonyms =
    showSynonyms && wordInfo.synonyms && wordInfo.synonyms.length > 0;
  const hasAntonyms =
    showAntonyms && wordInfo.antonyms && wordInfo.antonyms.length > 0;

  if (!hasSynonyms && !hasAntonyms) return null;

  return (
    <span className={cn('mt-3 pt-2 border-t border-border block', className)}>
      {hasSynonyms && (
        <span className='text-xs block'>
          <span className='text-muted-foreground'>Synonyms: </span>
          <span>{wordInfo.synonyms!.slice(0, maxSynonyms).join(', ')}</span>
        </span>
      )}
      {hasAntonyms && (
        <span className='text-xs mt-1 block'>
          <span className='text-muted-foreground'>Antonyms: </span>
          <span>{wordInfo.antonyms!.slice(0, maxAntonyms).join(', ')}</span>
        </span>
      )}
    </span>
  );
};

export default DictionaryEntryAdditionalInfo;
