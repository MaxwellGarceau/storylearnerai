import * as React from 'react';
import { FieldWrapper } from './FieldWrapper';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const selectVariants = cva(
  'w-full rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 px-3 py-2 text-sm',
  {
    variants: {
      state: {
        default: '',
        error: 'border-destructive',
      },
      size: {
        sm: 'h-8',
        md: 'h-9',
        lg: 'h-10',
      },
    },
    defaultVariants: {
      state: 'default',
      size: 'md',
    },
  }
);

interface SelectFieldProps<TValue extends string | number>
  extends Omit<
      React.SelectHTMLAttributes<HTMLSelectElement>,
      'size' | 'onChange' | 'value'
    >,
    VariantProps<typeof selectVariants> {
  id: string;
  label: string;
  value: TValue;
  onChange: (value: TValue) => void;
  children: ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
  description?: React.ReactNode;
}

export function SelectField<TValue extends string | number>({
  id,
  label,
  value,
  onChange,
  children,
  required,
  error,
  className,
  state,
  size,
  description,
  disabled,
  ...props
}: SelectFieldProps<TValue>) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <FieldWrapper
      id={id}
      label={label}
      required={required}
      error={error}
      className={className}
      description={description}
    >
      <select
        id={id}
        value={value as unknown as string | number}
        onChange={e =>
          onChange(
            (typeof value === 'number'
              ? Number(e.target.value)
              : e.target.value) as TValue
          )
        }
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        className={cn(
          selectVariants({
            state: error ? 'error' : state,
            size: size,
          })
        )}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
