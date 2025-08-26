import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';

interface WordTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const WordTooltip: React.FC<WordTooltipProps> = ({
  children,
  content,
  side = 'top',
  className,
  open,
  onOpenChange,
}) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <span 
          className={`cursor-pointer transition-colors duration-200 ${
            open 
              ? 'bg-primary/30 text-primary-foreground rounded px-1 -mx-1 ring-2 ring-primary/50' 
              : 'hover:bg-muted/50 rounded px-1 -mx-1'
          }`}
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent side={side} className={className ?? 'p-0'} sideOffset={8}>
        {content}
      </PopoverContent>
    </Popover>
  );
};

export default WordTooltip;
