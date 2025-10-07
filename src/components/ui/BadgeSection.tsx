import { Badge } from './Badge';
import type { NullableString } from '../../types/common';

interface BadgeSectionProps {
  partOfSpeech?: NullableString;
  frequencyLevel?: NullableString;
  partOfSpeechKey: (pos: string) => string;
  frequencyKey: (freq: string) => string;
  className?: string;
}

export function BadgeSection({
  partOfSpeech,
  frequencyLevel,
  partOfSpeechKey,
  frequencyKey,
  className = '',
}: BadgeSectionProps) {

  if (!partOfSpeech && !frequencyLevel) {
    return null;
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {partOfSpeech && (
        <Badge variant='outline'>{partOfSpeechKey(partOfSpeech)}</Badge>
      )}
      {frequencyLevel && (
        <Badge variant='secondary'>{frequencyKey(frequencyLevel)}</Badge>
      )}
    </div>
  );
}
