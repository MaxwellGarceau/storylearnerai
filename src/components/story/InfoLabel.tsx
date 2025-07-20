import React from 'react';

interface InfoLabelProps {
  children: React.ReactNode;
  variant?: 'success' | 'info' | 'warning';
  className?: string;
}

const InfoLabel: React.FC<InfoLabelProps> = ({ 
  children, 
  variant = 'success', 
  className = '' 
}) => {
  const baseClasses = 'text-sm px-2 py-1 rounded whitespace-nowrap';
  
  const variantClasses = {
    success: 'bg-green-100 text-green-700',
    info: 'bg-blue-100 text-blue-700',
    warning: 'bg-yellow-100 text-yellow-700'
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <span className={combinedClasses}>
      {children}
    </span>
  );
};

export default InfoLabel; 