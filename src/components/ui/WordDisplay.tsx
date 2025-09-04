interface WordDisplayProps {
  originalWord: string;
  translatedWord: string;
  className?: string;
}

export function WordDisplay({
  originalWord,
  translatedWord,
  className = '',
}: WordDisplayProps) {
  return (
    <div className={`flex items-center gap-2 mr-2 ${className}`}>
      <span className='font-semibold text-lg'>{originalWord}</span>
      <span className='text-muted-foreground'>→</span>
      <span className='font-semibold text-lg'>{translatedWord}</span>
    </div>
  );
}
