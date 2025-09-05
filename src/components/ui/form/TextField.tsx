import * as React from 'react';
import { FieldWrapper } from './FieldWrapper';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'w-full rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 px-3 py-2 text-sm',
  {
    variants: {
      state: {
        default: '',
        error: 'border-destructive',
      },
      size: {
        sm: 'h-8 text-sm',
        md: 'h-9 text-sm',
        lg: 'h-10 text-base',
      },
    },
    defaultVariants: {
      state: 'default',
      size: 'md',
    },
  }
);

interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputType?: 'text' | 'email' | 'password';
  required?: boolean;
  error?: string;
  className?: string;
  description?: React.ReactNode;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id,
      label,
      value,
      onChange,
      placeholder,
      inputType,
      required,
      error,
      className,
      state,
      size,
      description,
      disabled,
      ...props
    },
    ref
  ) => {
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
        <input
          ref={ref}
          type={inputType ?? 'text'}
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          className={cn(
            inputVariants({
              state: error ? 'error' : (state ?? 'default'),
              size,
            })
          )}
          {...props}
        />
      </FieldWrapper>
    );
  }
);

TextField.displayName = 'TextField';
