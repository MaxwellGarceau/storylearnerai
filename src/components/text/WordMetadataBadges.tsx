import React from 'react';
import { Badge } from '../ui/Badge';
import type { PartOfSpeech } from '../../types/llm/tokens';
import type { DifficultyLevel } from '../../types/llm/prompts';

interface WordMetadataBadgesProps {
  partOfSpeech: PartOfSpeech | null;
  difficulty: DifficultyLevel | null;
  className?: string;
}

export function WordMetadataBadges({
  partOfSpeech,
  difficulty,
  className = '',
}: WordMetadataBadgesProps) {

  // Helper function to get badge variant based on difficulty
  const getDifficultyVariant = (diff: string) => {
    switch (diff) {
      case 'a1':
        return 'success';
      case 'a2':
        return 'info';
      case 'b1':
        return 'warning';
      case 'b2':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Helper function to format part of speech
  const formatPartOfSpeech = (pos: PartOfSpeech) => {
    return pos.charAt(0).toUpperCase() + pos.slice(1);
  };

  // Helper function to format difficulty level
  const formatDifficulty = (diff: DifficultyLevel) => {
    return diff.toUpperCase();
  };

  // Don't render anything if no metadata is available
  if (!partOfSpeech && !difficulty) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {partOfSpeech && (
        <Badge variant='outline' className='text-xs'>
          {formatPartOfSpeech(partOfSpeech)}
        </Badge>
      )}
      {difficulty && (
        <Badge variant={getDifficultyVariant(difficulty)} className='text-xs'>
          {formatDifficulty(difficulty)}
        </Badge>
      )}
    </div>
  );
}
