import { Badge } from './Badge';

interface BadgeSectionProps {
  partOfSpeech?: string;
  frequencyLevel?: string;
  partOfSpeechKey?: (pos: string) => string;
  frequencyKey?: (freq: string) => string;
  className?: string;
}

export function BadgeSection({
  partOfSpeech,
  frequencyLevel,
  partOfSpeechKey = pos => `vocabulary.pos.${pos}`,
  frequencyKey = freq => `vocabulary.frequency.${freq}`,
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
