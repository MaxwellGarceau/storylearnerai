import React, { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  className,
  maxWidth = '6xl' 
}) => {
  return (
    <div className={cn(
      "container mx-auto px-4 py-8",
      `max-w-${maxWidth}`,
      className
    )}>
      {children}
    </div>
  );
};

export default PageContainer; 