import React, { useEffect, useState } from 'react';
import Joyride, { Step, CallBackProps, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { walkthroughService } from '../../lib/walkthroughService';
import type { WalkthroughState, WalkthroughStep } from '../../lib/types/walkthrough';

interface WalkthroughJoyrideProps {
  className?: string;
}

export const WalkthroughJoyride: React.FC<WalkthroughJoyrideProps> = () => {
  const [state, setState] = useState<WalkthroughState>(walkthroughService.getState());
  const [joyrideSteps, setJoyrideSteps] = useState<Step[]>([]);

  useEffect(() => {
    const unsubscribe = walkthroughService.subscribe(setState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Convert walkthrough steps to Joyride steps format
    const currentConfig = walkthroughService.getCurrentConfig();
    
    if (currentConfig && state.isActive) {
      const steps: Step[] = currentConfig.steps.map((step: WalkthroughStep, index: number) => {
        const isLastStep = index === currentConfig.steps.length - 1;
        
        return {
          target: step.targetSelector,
          content: (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="text-gray-700">{step.description}</p>
              {step.actionText && !isLastStep && (
                <p className="text-sm text-blue-600 font-medium">{step.actionText}</p>
              )}
              {step.actionText && isLastStep && (
                <p className="text-sm text-blue-600 font-medium">Click "Finish" to complete the tour</p>
              )}
              <div className="text-xs text-gray-500 mt-2">
                Step {index + 1} of {currentConfig.steps.length} • {currentConfig.id}
              </div>
            </div>
          ),
          placement: step.position === 'center' ? 'center' : step.position,
          disableBeacon: true,
          hideCloseButton: false,
          hideFooter: false,
          showSkipButton: currentConfig.allowSkip ?? true,
          styles: {
            options: {
              primaryColor: '#3b82f6',
              zIndex: 10001, // Higher than TranslationOptionsSidebar's z-50
            },
            tooltip: {
              fontSize: '14px',
              padding: '20px',
              maxWidth: '320px',
              zIndex: 10001,
            },
            tooltipContainer: {
              textAlign: 'left',
            },
            tooltipTitle: {
              textAlign: 'left',
            },
            buttonClose: {
              position: 'absolute',
              right: '12px',
              top: '12px',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              pointerEvents: 'auto',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '18px',
              color: '#6b7280',
              zIndex: 10002,
            },
            buttonNext: {
              backgroundColor: '#3b82f6', // Use consistent blue primary color
              fontSize: '14px',
              padding: '8px 16px',
              cursor: 'pointer',
              pointerEvents: 'auto',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
            },
            buttonBack: {
              color: '#6b7280',
              fontSize: '14px',
              padding: '8px 16px',
              cursor: 'pointer',
              pointerEvents: 'auto',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
            },
            buttonSkip: {
              color: '#6b7280',
              fontSize: '13px',
              cursor: 'pointer',
              pointerEvents: 'auto',
              backgroundColor: 'transparent',
              border: 'none',
              textDecoration: 'underline',
              padding: '4px 8px',
            },
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: 10000,
            },
            spotlight: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 10000,
            },
          },
        };
      });
      setJoyrideSteps(steps);
    } else {
      if (state.isActive && !currentConfig) {
        console.warn('⚠️ Walkthrough is active but no config found');
      }
      setJoyrideSteps([]);
    }
  }, [state.isActive, state.currentStepIndex, state.isCompleted, state.isSkipped]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, status, type } = data;
    const currentConfig = walkthroughService.getCurrentConfig();

    // Handle step completion actions
    if (type === EVENTS.STEP_AFTER) {
      const currentStep = walkthroughService.getCurrentStep();
      if (currentStep?.onComplete) {
        currentStep.onComplete();
      }
    }

    // Handle completion FIRST (before action-based logic)
    if (status === STATUS.FINISHED) {
      walkthroughService.completeWalkthrough();
      // Force immediate state update to make modal disappear
      setState(walkthroughService.getState());
      return; // Exit early to prevent other logic from running
    }

    // Handle close/skip actions  
    if (action === ACTIONS.SKIP || action === ACTIONS.CLOSE) {
      if (status === STATUS.SKIPPED) {
        walkthroughService.skipWalkthrough();
      } else {
        walkthroughService.stopWalkthrough();
      }
      // Force immediate state update to make modal disappear
      setState(walkthroughService.getState());
      return; // Exit early to prevent other logic from running
    }

    // Handle navigation actions
    if (action === ACTIONS.NEXT) {
      const isLastStep = currentConfig && state.currentStepIndex >= currentConfig.steps.length - 1;
      
      if (isLastStep) {
        // Let Joyride handle the completion naturally
        return;
      } else {
        // Only manually handle next step if not on last step
        walkthroughService.nextStep();
      }
    } else if (action === ACTIONS.PREV) {
      walkthroughService.previousStep();
    }

    // Handle errors (target not found)
    if (status === STATUS.ERROR) {
      const currentStep = walkthroughService.getCurrentStep();
      console.warn(`❌ Joyride error: Target element not found for step "${currentStep?.title}" with selector "${currentStep?.targetSelector}"`);
      // Optionally skip to next step or stop walkthrough
      walkthroughService.nextStep();
    }
  };

  // Don't render if no active walkthrough
  if (!state.isActive || joyrideSteps.length === 0) {
    return null;
  }
  
  const currentConfig = walkthroughService.getCurrentConfig();
  
  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous={true}
      run={state.isActive}
      scrollToFirstStep={true}
      showProgress={currentConfig?.showProgress ?? true}
      showSkipButton={currentConfig?.allowSkip ?? true}
      stepIndex={state.currentStepIndex}
      steps={joyrideSteps}
      styles={{
        options: {
          primaryColor: '#3b82f6',
          zIndex: 10001, // Ensure it's above everything
        },
        buttonClose: {
          position: 'absolute',
          right: '12px',
          top: '12px',
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          backgroundColor: 'transparent',
          border: 'none',
          fontSize: '18px',
          color: '#6b7280',
          zIndex: 10002,
        },
        buttonSkip: {
          color: '#6b7280',
          fontSize: '13px',
          cursor: 'pointer',
          backgroundColor: 'transparent',
          border: 'none',
          textDecoration: 'underline',
          padding: '4px 8px',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 10000,
        },
      }}
      locale={{
        back: 'Previous',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip tour',
      }}
    />
  );
}; 