import { FieldWrapper } from './FieldWrapper';

interface TextareaFieldProps {
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
        className='w-full p-2 border rounded-md resize-none'
      />
    </FieldWrapper>
  );
}
