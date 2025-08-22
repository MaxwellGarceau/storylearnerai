import React, { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/Tooltip';
import { cn } from '../../lib/utils';

interface WordHighlightProps {
  word: string;
  children?: React.ReactNode;
  className?: string;
}

const WordHighlight: React.FC<WordHighlightProps> = ({
  word,
  children,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-block cursor-pointer transition-colors duration-200 rounded px-0.5',
              isHovered && 'bg-blue-100 dark:bg-blue-900/30',
              className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {children ?? word}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className='p-2'>
            <div className='font-medium'>{word}</div>
            {/* Placeholder for future dictionary content */}
            <div className='text-xs text-muted-foreground mt-1'>
              Dictionary info coming soon...
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WordHighlight;
