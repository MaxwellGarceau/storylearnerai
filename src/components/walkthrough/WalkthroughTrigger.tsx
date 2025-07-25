import React from 'react';
import { Button } from '../ui/Button';
import { HelpCircle } from 'lucide-react';
import { useWalkthrough } from '../../hooks/useWalkthrough';
import type { WalkthroughId } from '../../lib/types/walkthrough';

interface WalkthroughTriggerProps {
  walkthroughId: WalkthroughId;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const WalkthroughTrigger: React.FC<WalkthroughTriggerProps> = ({
  walkthroughId,
  variant = 'ghost',
  size = 'sm',
  className,
  children,
}) => {
  const { startWalkthroughById, isCompleted, isSkipped } = useWalkthrough();

  const handleClick = () => {
    startWalkthroughById(walkthroughId);
  };

  // Don't show if already completed or skipped
  if (isCompleted(walkthroughId) || isSkipped(walkthroughId)) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
      title="Start walkthrough"
    >
      {children || <HelpCircle className="h-4 w-4" />}
    </Button>
  );
}; 