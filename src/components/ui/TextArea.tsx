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
}

const TextArea: React.FC<TextAreaProps> = ({ id, name, value, onChange, placeholder, required, label, helperText }) => {
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
        aria-describedby={helperText ? `${id}-helper` : undefined}
      />
      {helperText && (
        <p id={`${id}-helper`} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default TextArea;
