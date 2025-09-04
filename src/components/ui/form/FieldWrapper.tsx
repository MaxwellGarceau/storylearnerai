import type { ReactNode } from 'react';
import Label from '../Label';

interface FieldWrapperProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function FieldWrapper({
  id,
  label,
  required,
  error,
  className = '',
  children,
}: FieldWrapperProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>
        {label} {required && '*'}
      </Label>
      {children}
      {error && <p className='text-sm text-destructive'>{error}</p>}
    </div>
  );
}

