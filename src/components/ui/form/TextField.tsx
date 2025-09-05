import { FieldWrapper } from './FieldWrapper';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva('w-full p-2 border rounded-md', {
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
});

interface TextFieldProps extends VariantProps<typeof inputVariants> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputType?: 'text' | 'email' | 'password';
  required?: boolean;
  error?: string;
  className?: string;
}

export function TextField({
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
}: TextFieldProps) {
  return (
    <FieldWrapper
      id={id}
      label={label}
      required={required}
      error={error}
      className={className}
    >
      <input
        type={inputType ?? 'text'}
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          inputVariants({
            state: error ? 'error' : (state ?? 'default'),
            size,
          })
        )}
      />
    </FieldWrapper>
  );
}
