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
      console.log(`🚀 Loading walkthrough: ${currentConfig.title} (${currentConfig.id})`);
      console.log(`📋 Steps: ${currentConfig.steps.length}`, currentConfig.steps.map(s => s.title));
      
      const steps: Step[] = currentConfig.steps.map((step: WalkthroughStep, index: number) => ({
        target: step.targetSelector,
        content: (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
            <p className="text-gray-700">{step.description}</p>
            {step.actionText && (
              <p className="text-sm text-blue-600 font-medium">{step.actionText}</p>
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
            backgroundColor: '#3b82f6',
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
      }));
      setJoyrideSteps(steps);
    } else {
      if (state.isActive && !currentConfig) {
        console.warn('⚠️ Walkthrough is active but no config found');
      }
      setJoyrideSteps([]);
    }
  }, [state.isActive, state.currentStepIndex]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, status, type } = data;
    const currentConfig = walkthroughService.getCurrentConfig();

    console.log(`🎯 Joyride callback:`, { action, status, type, step: state.currentStepIndex });

    // Handle step completion actions
    if (type === EVENTS.STEP_AFTER) {
      const currentStep = walkthroughService.getCurrentStep();
      if (currentStep?.onComplete) {
        console.log(`✅ Executing onComplete for step: ${currentStep.title}`);
        currentStep.onComplete();
      }
    }

    // Handle different actions
    if (action === ACTIONS.NEXT) {
      console.log('➡️ Next step');
      walkthroughService.nextStep();
    } else if (action === ACTIONS.PREV) {
      console.log('⬅️ Previous step');
      walkthroughService.previousStep();
    } else if (action === ACTIONS.SKIP || action === ACTIONS.CLOSE) {
      if (status === STATUS.SKIPPED) {
        console.log(`⏭️ Skipping walkthrough: ${currentConfig?.id}`);
        walkthroughService.skipWalkthrough();
      } else {
        console.log(`❌ Closing walkthrough: ${currentConfig?.id}`);
        walkthroughService.stopWalkthrough();
      }
    }

    // Handle completion
    if (status === STATUS.FINISHED) {
      console.log(`🎉 Completed walkthrough: ${currentConfig?.id}`);
      walkthroughService.completeWalkthrough();
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