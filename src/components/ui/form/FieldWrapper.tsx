import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Label from '../Label';

const fieldWrapperVariants = cva('space-y-2', {
  variants: {
    size: {
      sm: 'space-y-1.5',
      md: 'space-y-2',
      lg: 'space-y-3',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

interface FieldWrapperProps extends VariantProps<typeof fieldWrapperVariants> {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  description?: ReactNode;
  children: ReactNode;
}

export function FieldWrapper({
  id,
  label,
  required,
  error,
  className = '',
  size,
  description,
  children,
}: FieldWrapperProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={cn(fieldWrapperVariants({ size }), className)}>
      <Label htmlFor={id}>
        {label} {required && '*'}
      </Label>
      {description && (
        <p id={descriptionId} className='text-sm text-muted-foreground'>
          {description}
        </p>
      )}
      {children}
      {error && (
        <p id={errorId} className='text-sm text-destructive'>
          {error}
        </p>
      )}
    </div>
  );
}
