import * as React from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  spinnerSize?: 'sm' | 'default';
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      loading = false,
      loadingText,
      spinnerSize = 'default',
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const spinnerClasses = cn(
      'animate-spin rounded-full border-b border-current',
      {
        'h-3 w-3 mr-1': spinnerSize === 'sm',
        'h-4 w-4 mr-2': spinnerSize === 'default',
      }
    );

    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn('flex items-center gap-1', className)}
        {...props}
      >
        {loading ? (
          <>
            <div className={spinnerClasses} />
            {loadingText || 'Loading...'}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export { LoadingButton };
