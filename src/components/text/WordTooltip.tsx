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
    <TooltipProvider delayDuration={0}>
      <Tooltip open={open} onOpenChange={onOpenChange}>
        <TooltipTrigger asChild>
          <span>{children}</span>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className={className ?? 'p-0'}
          onPointerDownOutside={e => {
            // Don't close when clicking inside the tooltip content
            if (open) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={e => {
            // Don't close on escape when open
            if (open) {
              e.preventDefault();
            }
          }}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WordTooltip;
