interface ContextSectionProps {
  fromContext?: string | null;
  targetContext?: string | null;
  className?: string;
}

export function ContextSection({
  fromContext,
  targetContext,
  className = '',
}: ContextSectionProps) {
  if (!fromContext && !targetContext) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <hr className='border-t border-border' />
      <h4 className='font-medium'>Context</h4>

      {fromContext && (
        <div className='space-y-1'>
          <p className='text-sm font-medium text-muted-foreground'>Original:</p>
          <p className='text-sm bg-muted p-2 rounded'>{fromContext}</p>
        </div>
      )}

      {targetContext && (
        <div className='space-y-1'>
          <p className='text-sm font-medium text-muted-foreground'>
            Translated:
          </p>
          <p className='text-sm bg-muted p-2 rounded'>{targetContext}</p>
        </div>
      )}
    </div>
  );
}
