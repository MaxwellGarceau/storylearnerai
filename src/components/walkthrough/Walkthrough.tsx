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
import { useSupabase } from '../../hooks/useSupabase';
import { logger } from '../../lib/logger';

interface WalkthroughProps {
  className?: string;
}

export const Walkthrough: React.FC<WalkthroughProps> = () => {
  // Ensure user state is loaded so skipIf logic in walkthrough configs is accurate
  useSupabase();
  const [state, setState] = useState<WalkthroughState>(walkthroughService.getState());
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [anchorPosition, setAnchorPosition] = useState({ left: 0, top: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);
  const { isLandscape, isMobile, isSmallLandscape, height: viewportHeight } = useViewport();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const previousStepIndexRef = useRef<number>(-1);

  // Subscribe to walkthrough service state changes
  useEffect(() => {
    const unsubscribe = walkthroughService.subscribe(setState);
    return unsubscribe;
  }, []);

  // Update spotlight effect when scrolling
  const updateSpotlight = useCallback((forceUpdate = false, elementOverride?: HTMLElement | null) => {
    const element = elementOverride || targetElement;
    if (!element || !overlayRef.current) return;

    const rect = element.getBoundingClientRect();
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

    // Update anchor position with debouncing to prevent jumps
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const newPosition = {
      left: Math.max(0, Math.min(window.innerWidth, centerX)),
      top: Math.max(0, Math.min(window.innerHeight, centerY))
    };
    
    // Force update if target element changed, otherwise use threshold
    const currentLeft = anchorPosition.left;
    const currentTop = anchorPosition.top;
    const threshold = forceUpdate ? 0 : 2; // Force update for new target elements
    
    if (forceUpdate || Math.abs(newPosition.left - currentLeft) > threshold || 
        Math.abs(newPosition.top - currentTop) > threshold) {
      setAnchorPosition(newPosition);
    }
  }, [targetElement, anchorPosition]);

  // Find target element and manage popover visibility
  useEffect(() => {
    if (!state.isActive) {
      setIsOpen(false);
      setTargetElement(null);
      previousStepIndexRef.current = -1;
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
      const isNewTarget = targetElement !== element;
      const isNewStep = state.currentStepIndex !== previousStepIndexRef.current;
      
      // Update if target element changed OR if it's a new step (even with same target)
      if (isNewTarget || isNewStep) {
        setTargetElement(element);
        setIsOpen(true);
        
        // Update the previous step index
        previousStepIndexRef.current = state.currentStepIndex;
        
        // Scroll element into view if needed
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });

        updateSpotlight(true, element);
      }
    } else {
      logger.warn('walkthrough', `Target element not found: ${currentStep.targetSelector}`);
      // Auto-advance if target not found (similar to Joyride behavior)
      setTimeout(() => {
        walkthroughService.nextStep();
      }, 1000);
    }
  }, [state.isActive, state.currentStepIndex, updateSpotlight, targetElement]);

  // Add scroll and resize listeners to update spotlight
  useEffect(() => {
    if (!targetElement) return;

    const handleScroll = () => {
      // Debounce scroll updates to prevent excessive repositioning
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => updateSpotlight(), 50);
    };

    const handleResize = () => {
      // Debounce resize updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(updateSpotlight, 100);
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

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('scroll', handleScroll);
      document.documentElement.removeEventListener('scroll', handleScroll);
      scrollableElements.forEach(element => {
        element.removeEventListener('scroll', handleScroll);
      });
      // Clear any pending timeouts
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [targetElement, updateSpotlight]);

  const currentConfig = walkthroughService.getCurrentConfig();
  const currentStep = walkthroughService.getCurrentStep();

  // Helper functions to handle skipped steps
  const getVisibleSteps = useCallback(() => {
    if (!currentConfig) return [];
    return currentConfig.steps.filter(step => !step.skipIf?.());
  }, [currentConfig]);

  const getCurrentVisibleStepIndex = useCallback(() => {
    if (!currentConfig) return 0;
    const currentStepIndex = state.currentStepIndex;
    
    // Find which visible step corresponds to the current step index
    let visibleIndex = 0;
    for (let i = 0; i <= currentStepIndex; i++) {
      if (!currentConfig.steps[i]?.skipIf?.()) {
        visibleIndex++;
      }
    }
    return visibleIndex - 1; // -1 because we want 0-based index
  }, [currentConfig, state.currentStepIndex]);

  const allVisibleSteps = getVisibleSteps();
  const currentVisibleStepIndex = getCurrentVisibleStepIndex();
  const isLastStep = currentVisibleStepIndex === allVisibleSteps.length - 1;

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

  if (!state.isActive || !currentStep || !currentConfig) {
    return null;
  }

  const isFirstStep = currentVisibleStepIndex === 0;
  // const isLastStep = state.currentStepIndex === currentConfig.steps.length - 1; // This line is now handled by getCurrentVisibleStepIndex

  return (
    <>
      {/* Backdrop overlay with spotlight effect */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 z-[9999] pointer-events-none touch-none"
      />



      <style>
        {`
          ${isSmallLandscape ? `
            [data-radix-popper-content-wrapper] {
              transform: translate3d(var(--radix-popper-content-transform-x), 10px, 0) !important;
              margin: 1rem !important;
              max-width: calc(100vw - 2rem) !important;
            }
          ` : ''}
        `}
      </style>

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
              height: 'auto',
              minHeight: 'min-content',
              // Ensure the modal doesn't get clipped by viewport edges
              maxWidth: 'calc(100vw - 2rem)',
              maxHeight: 'calc(100vh - 2rem)',
              // Add overflow handling for edge cases
              overflow: 'visible'
            }}
          >
            <Card 
              className="p-4 sm:p-6 shadow-xl border-2 border-primary/20 overflow-hidden" 
              data-testid="walkthrough-modal"
              style={{
                height: 'auto',
                minHeight: 'min-content',
                // Ensure card content doesn't overflow
                maxWidth: 'calc(100vw - 4rem)',
                // Use calc() for responsive height based on viewport
                maxHeight: isLandscape && isMobile 
                  ? `calc(${viewportHeight}px - 4rem)` 
                  : 'calc(100vh - 4rem)'
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
                      Step {currentVisibleStepIndex + 1} of {allVisibleSteps.length}
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