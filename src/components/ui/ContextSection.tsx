interface ContextSectionProps {
  originalContext?: string | null;
  translatedContext?: string | null;
  className?: string;
}

export function ContextSection({
  originalContext,
  translatedContext,
  className = '',
}: ContextSectionProps) {
  if (!originalContext && !translatedContext) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <hr className='border-t border-border' />
      <h4 className='font-medium'>Context</h4>

      {originalContext && (
        <div className='space-y-1'>
          <p className='text-sm font-medium text-muted-foreground'>Original:</p>
          <p className='text-sm bg-muted p-2 rounded'>{originalContext}</p>
        </div>
      )}

      {translatedContext && (
        <div className='space-y-1'>
          <p className='text-sm font-medium text-muted-foreground'>
            Translated:
          </p>
          <p className='text-sm bg-muted p-2 rounded'>{translatedContext}</p>
        </div>
      )}
    </div>
  );
}
