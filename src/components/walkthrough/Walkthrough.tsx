import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { cn } from '../../lib/utils';

import { useViewport } from '../../hooks/useViewport';
import { walkthroughService } from '../../lib/walkthroughService';
import type { WalkthroughState } from '../../lib/types/walkthrough';

interface WalkthroughProps {
  className?: string;
}

export const Walkthrough: React.FC<WalkthroughProps> = () => {
  const [state, setState] = useState<WalkthroughState>(walkthroughService.getState());
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [anchorPosition, setAnchorPosition] = useState({ left: 0, top: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);
  const { isLandscape, isMobile, height: viewportHeight } = useViewport();

  // Subscribe to walkthrough service state changes
  useEffect(() => {
    const unsubscribe = walkthroughService.subscribe(setState);
    return unsubscribe;
  }, []);

  // Update spotlight effect when scrolling
  const updateSpotlight = useCallback(() => {
    if (!targetElement || !overlayRef.current) return;

    const rect = targetElement.getBoundingClientRect();
    const padding = 8;
    const left = Math.max(0, rect.left - padding);
    const top = Math.max(0, rect.top - padding);
    const right = Math.min(window.innerWidth, rect.right + padding);
    const bottom = Math.min(window.innerHeight, rect.bottom + padding);
    
    const clipPath = `polygon(
      0% 0%, 
      0% 100%, 
      ${left}px 100%, 
      ${left}px ${top}px, 
      ${right}px ${top}px, 
      ${right}px ${bottom}px, 
      ${left}px ${bottom}px, 
      ${left}px 100%, 
      100% 100%, 
      100% 0%
    )`;
    
    overlayRef.current.style.clipPath = clipPath;

    // Update anchor position
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setAnchorPosition({
      left: Math.max(0, Math.min(window.innerWidth, centerX)),
      top: Math.max(0, Math.min(window.innerHeight, centerY))
    });
  }, [targetElement]);

  // Find target element and manage popover visibility
  useEffect(() => {
    if (!state.isActive) {
      setIsOpen(false);
      setTargetElement(null);
      return;
    }

    const currentStep = walkthroughService.getCurrentStep();
    if (!currentStep) {
      setIsOpen(false);
      setTargetElement(null);
      return;
    }

    // Find the target element
    const element = document.querySelector(currentStep.targetSelector) as HTMLElement;
    if (element) {
      setTargetElement(element);
      setIsOpen(true);
      
      // Scroll element into view if needed
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });

      // Update spotlight immediately
      setTimeout(updateSpotlight, 100);
    } else {
      console.warn(`Target element not found: ${currentStep.targetSelector}`);
      // Auto-advance if target not found (similar to Joyride behavior)
      setTimeout(() => {
        walkthroughService.nextStep();
      }, 1000);
    }
  }, [state.isActive, state.currentStepIndex, updateSpotlight]);

  // Add scroll and resize listeners to update spotlight
  useEffect(() => {
    if (!targetElement) return;

    const handleScroll = () => {
      updateSpotlight();
    };

    const handleResize = () => {
      updateSpotlight();
    };

    // Listen for scroll events on window and all scrollable containers
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Also listen for scroll events on document body and html
    document.addEventListener('scroll', handleScroll, { passive: true });
    document.documentElement.addEventListener('scroll', handleScroll, { passive: true });

    // Find and listen to scroll events on all scrollable containers
    const scrollableElements = document.querySelectorAll('[data-scrollable], .overflow-auto, .overflow-scroll, .overflow-y-auto, .overflow-y-scroll');
    scrollableElements.forEach(element => {
      element.addEventListener('scroll', handleScroll, { passive: true });
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('scroll', handleScroll);
      document.documentElement.removeEventListener('scroll', handleScroll);
      scrollableElements.forEach(element => {
        element.removeEventListener('scroll', handleScroll);
      });
    };
  }, [targetElement, updateSpotlight]);

  const currentConfig = walkthroughService.getCurrentConfig();
  const currentStep = walkthroughService.getCurrentStep();

  const handleNext = () => {
    walkthroughService.nextStep();
  };

  const handlePrevious = () => {
    walkthroughService.previousStep();
  };

  const handleSkip = () => {
    walkthroughService.skipWalkthrough();
  };

  const handleClose = () => {
    walkthroughService.stopWalkthrough();
  };

  // Don't render if not active or no current step
  if (!state.isActive || !currentStep || !currentConfig || !targetElement) {
    return null;
  }

  const isFirstStep = state.currentStepIndex === 0;
  const isLastStep = state.currentStepIndex === currentConfig.steps.length - 1;

  return (
    <>
      {/* Backdrop overlay with spotlight effect */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 z-[9999] pointer-events-none touch-none"
      />

      {/* Walkthrough popover */}
      <Popover.Root open={isOpen}>
        <Popover.Anchor asChild>
          <div
            style={{
              position: 'fixed',
              left: anchorPosition.left,
              top: anchorPosition.top,
              width: 1,
              height: 1,
              zIndex: 10000,
            }}
          />
        </Popover.Anchor>

        <Popover.Portal>
          <Popover.Content
            className="z-[10001] w-80 max-w-[calc(100vw-2rem)] sm:max-w-[90vw] md:w-80 max-h-[calc(100vh-2rem)]"
            side={currentStep.position === 'center' ? 'bottom' : currentStep.position}
            align="center"
            sideOffset={16}
            alignOffset={0}
            avoidCollisions={true}
            collisionPadding={16}
            style={{
              maxHeight: 'calc(100vh - 2rem)',
              height: 'auto',
              minHeight: 'min-content'
            }}
          >
            <Card 
              className="p-4 sm:p-6 shadow-xl border-2 border-primary/20 overflow-hidden" 
              data-testid="walkthrough-modal"
              style={{
                maxHeight: 'calc(100vh - 4rem)',
                height: 'auto',
                minHeight: 'min-content'
              }}
            >
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 sm:h-6 sm:w-6 p-0 z-10"
                onClick={handleClose}
                data-testid="walkthrough-close-button"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Scrollable content */}
              <div 
                className="overflow-y-auto pr-2"
                style={{
                  maxHeight: isLandscape && isMobile ? `calc(${viewportHeight}px - 6rem)` : 'calc(100vh - 8rem)',
                  height: 'auto',
                  minHeight: 'min-content'
                }}
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">
                      {currentStep.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentStep.description}
                    </p>
                    {currentStep.actionText && (
                      <p className="text-sm text-primary font-medium">
                        {isLastStep ? 'Click "Finish" to complete the tour' : currentStep.actionText}
                      </p>
                    )}
                  </div>

                  {/* Progress indicator */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      Step {state.currentStepIndex + 1} of {currentConfig.steps.length}
                    </Badge>
                    <span className="capitalize hidden sm:inline">
                      {currentConfig.id
                        .split('-')
                        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </span>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex flex-col gap-3">
                    {/* Previous/Next row */}
                    <div className="flex justify-between items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevious}
                        disabled={isFirstStep}
                        className={cn(
                          "flex items-center gap-1 sm:gap-2 h-9 sm:h-8 px-3 sm:px-2 text-sm",
                          isFirstStep && "invisible"
                        )}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={handleNext}
                        className="flex items-center gap-1 sm:gap-2 h-9 sm:h-8 px-4 sm:px-2 text-sm flex-1 sm:flex-none"
                        data-testid="walkthrough-next-button"
                      >
                        <span>{isLastStep ? 'Finish' : 'Next'}</span>
                        {!isLastStep && <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Skip button row */}
                    {currentConfig.allowSkip && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSkip}
                        className="flex items-center gap-1 sm:gap-2 justify-center text-muted-foreground hover:text-foreground h-8 px-3 text-sm"
                      >
                        <SkipForward className="h-4 w-4" />
                        <span>Skip</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Popover arrow */}
            <Popover.Arrow className="fill-background stroke-border stroke-2" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}; 