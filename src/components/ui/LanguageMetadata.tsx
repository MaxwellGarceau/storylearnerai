import { Calendar, Languages } from 'lucide-react';

interface LanguageMetadataProps {
  fromLanguage: string;
  toLanguage: string;
  createdAt: string;
  className?: string;
}

export function LanguageMetadata({
  fromLanguage,
  toLanguage,
  createdAt,
  className = '',
}: LanguageMetadataProps) {
  return (
    <div
      className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}
    >
      <Languages className='h-4 w-4' />
      <span>
        {fromLanguage} → {toLanguage}
      </span>
      <span>•</span>
      <Calendar className='h-4 w-4' />
      <span>{createdAt}</span>
    </div>
  );
}
