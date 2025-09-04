import { ReactNode } from 'react';
import Label from '../Label';

interface BaseFormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
}

interface InputProps extends BaseFormFieldProps {
  type: 'input';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputType?: 'text' | 'email' | 'password';
}

interface SelectProps extends BaseFormFieldProps {
  type: 'select';
  value: string | number;
  onChange: (value: string | number) => void;
  children: ReactNode;
}

interface TextareaProps extends BaseFormFieldProps {
  type: 'textarea';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

type FormFieldProps = InputProps | SelectProps | TextareaProps;

export function FormField(props: FormFieldProps) {
  const { id, label, error, required, className = '' } = props;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>
        {label} {required && '*'}
      </Label>

      {props.type === 'input' && (
        <input
          type={props.inputType ?? 'text'}
          id={id}
          value={props.value}
          onChange={e => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          className={`w-full p-2 border rounded-md ${
            error ? 'border-destructive' : ''
          }`}
        />
      )}

      {props.type === 'select' && (
        <select
          id={id}
          value={props.value}
          onChange={e =>
            props.onChange(
              typeof props.value === 'number'
                ? Number(e.target.value)
                : e.target.value
            )
          }
          className={`w-full p-2 text-sm border rounded-md ${
            error ? 'border-destructive' : ''
          }`}
        >
          {props.children}
        </select>
      )}

      {props.type === 'textarea' && (
        <textarea
          id={id}
          value={props.value}
          onChange={e => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          rows={props.rows ?? 3}
          className='w-full p-2 border rounded-md resize-none'
        />
      )}

      {error && <p className='text-sm text-destructive'>{error}</p>}
    </div>
  );
}
