import { FieldWrapper } from './FieldWrapper';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva('w-full p-2 border rounded-md resize-none', {
  variants: {
    state: {
      default: '',
      error: 'border-destructive',
    },
    size: {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    state: 'default',
    size: 'md',
  },
});

interface TextareaFieldProps extends VariantProps<typeof textareaVariants> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  error?: string;
  className?: string;
}

export function TextareaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows,
  required,
  error,
  className,
  state,
  size,
}: TextareaFieldProps) {
  return (
    <FieldWrapper
      id={id}
      label={label}
      required={required}
      error={error}
      className={className}
    >
      <textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows ?? 3}
        className={cn(
          textareaVariants({ state: error ? 'error' : state, size })
        )}
      />
    </FieldWrapper>
  );
}
