import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/Tooltip';

interface WordTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

const WordTooltip: React.FC<WordTooltipProps> = ({
  children,
  content,
  onMouseEnter,
  onMouseLeave,
  side = 'top',
  className,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className={className || 'p-0'}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WordTooltip;
