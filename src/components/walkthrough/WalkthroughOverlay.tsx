import React, { useEffect, useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { X, ChevronLeft, ChevronRight, SkipForward, HelpCircle } from 'lucide-react';
import { walkthroughService } from '../../lib/walkthroughService';
import type { WalkthroughState } from '../../lib/types/walkthrough';
import { cn } from '../../lib/utils';

interface WalkthroughOverlayProps {
  className?: string;
}

export const WalkthroughOverlay: React.FC<WalkthroughOverlayProps> = ({ className }) => {
  const [state, setState] = useState<WalkthroughState>(walkthroughService.getState());
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = walkthroughService.subscribe(setState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!state.isActive) {
      setTargetElement(null);
      return;
    }

    const currentStep = walkthroughService.getCurrentStep();
    if (!currentStep) return;

    // Find the target element
    const element = document.querySelector(currentStep.targetSelector) as HTMLElement;
    if (!element) {
      console.warn(`Walkthrough target not found: ${currentStep.targetSelector}`);
      return;
    }

    setTargetElement(element);

    // Calculate overlay position
    const rect = element.getBoundingClientRect();
    const overlay = overlayRef.current;
    if (!overlay) return;

    const overlayRect = overlay.getBoundingClientRect();
    let top = 0;
    let left = 0;

    switch (currentStep.position) {
      case 'top':
        top = rect.top - overlayRect.height - 16;
        left = rect.left + (rect.width / 2) - (overlayRect.width / 2);
        break;
      case 'bottom':
        top = rect.bottom + 16;
        left = rect.left + (rect.width / 2) - (overlayRect.width / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (overlayRect.height / 2);
        left = rect.left - overlayRect.width - 16;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (overlayRect.height / 2);
        left = rect.right + 16;
        break;
      case 'center':
        top = window.innerHeight / 2 - overlayRect.height / 2;
        left = window.innerWidth / 2 - overlayRect.width / 2;
        break;
    }

    // Ensure overlay stays within viewport
    top = Math.max(16, Math.min(top, window.innerHeight - overlayRect.height - 16));
    left = Math.max(16, Math.min(left, window.innerWidth - overlayRect.width - 16));

    setOverlayPosition({ top, left });
  }, [state.currentStepIndex, state.isActive]);

  useEffect(() => {
    if (!targetElement || !state.isActive) return;

    // Add highlight class to target element
    targetElement.classList.add('walkthrough-highlight');

    return () => {
      targetElement.classList.remove('walkthrough-highlight');
    };
  }, [targetElement, state.isActive]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    walkthroughService.nextStep();
  };

  const handlePrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    walkthroughService.previousStep();
  };

  const handleSkip = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    walkthroughService.skipWalkthrough();
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    walkthroughService.stopWalkthrough();
  };

  const handleComplete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    walkthroughService.completeWalkthrough();
  };

  if (!state.isActive) {
    return null;
  }

  const currentStep = walkthroughService.getCurrentStep();
  const currentConfig = walkthroughService.getCurrentConfig();
  
  if (!currentStep || !currentConfig) {
    return null;
  }

  const isFirstStep = state.currentStepIndex === 0;
  const isLastStep = state.currentStepIndex === currentConfig.steps.length - 1;
  const progress = ((state.currentStepIndex + 1) / currentConfig.steps.length) * 100;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-25"
        onClick={handleClose}
      />
      
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={cn(
          "fixed z-50 transition-all duration-300 ease-in-out",
          className
        )}
        style={{
          top: overlayPosition.top,
          left: overlayPosition.left,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-80 shadow-2xl border-2 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">
                  {currentStep.title}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleClose(e)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            {currentConfig.showProgress && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Step {state.currentStepIndex + 1} of {currentConfig.steps.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1">
                  <div 
                    className="bg-primary h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-4">
              {currentStep.description}
            </p>
            
            {currentStep.actionText && (
              <div className="mb-4">
                <Badge variant="secondary" className="text-xs">
                  {currentStep.actionText}
                </Badge>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handlePrevious(e)}
                    className="h-8 px-3"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {currentConfig.allowSkip && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleSkip(e)}
                    className="h-8 px-3 text-muted-foreground hover:text-foreground"
                  >
                    <SkipForward className="h-3 w-3 mr-1" />
                    Skip
                  </Button>
                )}
                
                <Button
                  size="sm"
                  onClick={(e) => isLastStep ? handleComplete(e) : handleNext(e)}
                  className="h-8 px-4"
                >
                  {isLastStep ? (
                    'Finish'
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}; 