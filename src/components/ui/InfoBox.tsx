import React from 'react';

export type InfoBoxVariant = 'info' | 'success' | 'warning' | 'error';

interface InfoBoxProps {
  variant: InfoBoxVariant;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    content: 'text-blue-800'
  },
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    title: 'text-green-800',
    content: 'text-green-800'
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-600',
    title: 'text-amber-800',
    content: 'text-amber-800'
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    title: 'text-red-800',
    content: 'text-red-800'
  }
};

export const InfoBox: React.FC<InfoBoxProps> = ({
  variant,
  title,
  icon,
  children,
  className = ''
}) => {
  const styles = variantStyles[variant];

  return (
    <div className={`border rounded-lg p-3 ${styles.container} ${className}`}>
      <div className="flex items-start gap-2">
        {icon && (
          <div className={`w-4 h-4 mt-0.5 flex-shrink-0 ${styles.icon}`}>
            {icon}
          </div>
        )}
        <div className={`text-sm ${styles.content}`}>
          <div className="font-medium mb-1">{title}</div>
          {children}
        </div>
      </div>
    </div>
  );
};
