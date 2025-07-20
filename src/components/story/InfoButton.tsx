import React, { forwardRef } from 'react';

interface InfoButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium';
  className?: string;
}

const InfoButton = forwardRef<HTMLButtonElement, InfoButtonProps>(
  ({ onClick, children, variant = 'secondary', size = 'small', className = '', ...props }, ref) => {
    const baseClasses = 'font-medium rounded transition-all duration-200 whitespace-nowrap';
    
    const variantClasses = {
      primary: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      secondary: 'bg-green-200 text-green-800 hover:bg-green-300'
    };

    const sizeClasses = {
      small: 'px-2 py-1.5 sm:px-2 sm:py-1 text-xs',
      medium: 'px-3 py-1.5 sm:px-3 sm:py-1 text-sm'
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
      <button
        ref={ref}
        onClick={onClick}
        className={combinedClasses}
        {...props}
      >
        {children}
      </button>
    );
  }
);

InfoButton.displayName = 'InfoButton';

export default InfoButton; 