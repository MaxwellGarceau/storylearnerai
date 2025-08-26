import React from 'react';
import { cn } from '../../../lib/utils';
import { useDictionaryEntryContext } from './Context';

// Source component
export interface DictionaryEntrySourceProps {
  showSource?: boolean;
  className?: string;
}

const DictionaryEntrySource: React.FC<DictionaryEntrySourceProps> = ({
  showSource = true,
  className,
}) => {
  const { wordInfo } = useDictionaryEntryContext();

  if (!wordInfo || !showSource) return null;

  return (
    <span className={cn('mt-2 pt-2 border-t border-border block', className)}>
      <span className='text-xs text-muted-foreground block'>
        Source: {wordInfo.source ?? 'Dictionary API'}
      </span>
    </span>
  );
};

export default DictionaryEntrySource;
