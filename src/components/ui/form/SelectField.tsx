import { FieldWrapper } from './FieldWrapper';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const selectVariants = cva('w-full p-2 text-sm border rounded-md', {
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
});

interface SelectFieldProps<TValue extends string | number>
  extends VariantProps<typeof selectVariants> {
  id: string;
  label: string;
  value: TValue;
  onChange: (value: TValue) => void;
  children: ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
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
}: SelectFieldProps<TValue>) {
  return (
    <FieldWrapper
      id={id}
      label={label}
      required={required}
      error={error}
      className={className}
    >
      <select
        id={id}
        value={value}
        onChange={e =>
          onChange(
            (typeof value === 'number'
              ? Number(e.target.value)
              : e.target.value) as TValue
          )
        }
        className={cn(selectVariants({ state: error ? 'error' : state, size }))}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
