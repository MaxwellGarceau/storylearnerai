import React from 'react';
import { cn } from '../../lib/utils';

type MouseHandler = () => void;

interface WordHighlightProps {
  word: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: MouseHandler;
  onMouseEnter?: MouseHandler;
  onMouseLeave?: MouseHandler;
  disabled?: boolean;
  active?: boolean;
}

const WordHighlight: React.FC<WordHighlightProps> = ({
  word,
  children,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  disabled = false,
  active = false,
}) => {
  return (
    <span
      className={cn(
        'inline-block transition-colors duration-200 rounded px-0.5',
        !disabled && !active &&
          'cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30',
        disabled && 'cursor-default opacity-60',
        className
      )}
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={!disabled ? onMouseEnter : undefined}
      onMouseLeave={!disabled ? onMouseLeave : undefined}
    >
      {children ?? word}
    </span>
  );
};

export default WordHighlight;
