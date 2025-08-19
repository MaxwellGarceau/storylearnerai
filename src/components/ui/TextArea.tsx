import React from 'react';

interface TextAreaProps {
  id: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  label: string;
  helperText?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({ 
  id, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required, 
  label, 
  helperText, 
  maxLength, 
  showCharacterCount = false 
}) => {
  const characterCount = value.length;
  const isNearLimit = maxLength && characterCount > maxLength * 0.8;
  const isAtLimit = maxLength && characterCount >= maxLength;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        aria-describedby={helperText ? `${id}-helper` : undefined}
      />
      <div className="flex justify-between items-center mt-1">
        {helperText && (
          <p id={`${id}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
        {showCharacterCount && maxLength && (
          <p className={`text-xs ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-gray-400'}`}>
            {characterCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export default TextArea;
