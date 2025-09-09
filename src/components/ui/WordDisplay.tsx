interface WordDisplayProps {
  fromWord: string;
  targetWord: string;
  className?: string;
}

export function WordDisplay({
  fromWord,
  targetWord,
  className = '',
}: WordDisplayProps) {
  return (
    <div className={`flex items-center gap-2 mr-2 ${className}`}>
      <span className='font-semibold text-lg'>{fromWord}</span>
      <span className='text-muted-foreground'>→</span>
      <span className='font-semibold text-lg'>{targetWord}</span>
    </div>
  );
}
