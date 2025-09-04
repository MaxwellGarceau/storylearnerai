import { FieldWrapper } from './FieldWrapper';

interface TextFieldProps {
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
        className={`w-full p-2 border rounded-md ${error ? 'border-destructive' : ''}`}
      />
    </FieldWrapper>
  );
}
