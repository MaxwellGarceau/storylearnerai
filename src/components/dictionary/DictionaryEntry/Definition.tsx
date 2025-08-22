import React from 'react';
import { Badge } from '../../ui/Badge';
import { cn } from '../../../lib/utils';
import { useDictionaryEntryContext } from './Context';

// Definition component
export interface DictionaryEntryDefinitionProps {
  maxDefinitions?: number;
  showExamples?: boolean;
  className?: string;
}

const DictionaryEntryDefinition: React.FC<DictionaryEntryDefinitionProps> = ({
  maxDefinitions = 3,
  showExamples = true,
  className,
}) => {
  const { wordInfo } = useDictionaryEntryContext();

  if (!wordInfo) return null;

  return (
    <span className={cn('space-y-2 block', className)}>
      {wordInfo.definitions.slice(0, maxDefinitions).map((definition, index) => (
        <span key={index} className='text-sm block'>
          <span className='flex items-start gap-2 block'>
            <span className='text-muted-foreground text-xs mt-0.5'>
              {index + 1}.
            </span>
            <span className='block'>
              <span className='leading-relaxed block'>
                {definition.definition}
              </span>
              {definition.partOfSpeech && (
                <Badge variant='outline' className='text-xs mt-1' as='span'>
                  {definition.partOfSpeech}
                </Badge>
              )}
              {showExamples && definition.examples && definition.examples.length > 0 && (
                <span className='text-xs text-muted-foreground mt-1 italic block'>
                  "{definition.examples[0]}"
                </span>
              )}
            </span>
          </span>
        </span>
      ))}
    </span>
  );
};

export default DictionaryEntryDefinition;
