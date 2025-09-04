import { FieldWrapper } from './FieldWrapper';
import type { ReactNode } from 'react';

interface SelectFieldProps<TValue extends string | number> {
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
        className={`w-full p-2 text-sm border rounded-md ${error ? 'border-destructive' : ''}`}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
