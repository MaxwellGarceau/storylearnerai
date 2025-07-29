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
  const [lastProcessedStep, setLastProcessedStep] = useState<number>(-1);

  console.log('state', state);

  useEffect(() => {
    const unsubscribe = walkthroughService.subscribe(setState);
    return unsubscribe;
  }, []);

  // Reset step tracking when walkthrough starts/stops
  useEffect(() => {
    if (state.isActive) {
      console.log('🎬 Walkthrough started - Resetting step tracking');
      setLastProcessedStep(-1);
    }
  }, [state.isActive]);

  useEffect(() => {
    // 🐛 DEBUG: Track useEffect execution
    console.log('🔄 useEffect triggered - Converting walkthrough steps', {
      isActive: state.isActive,
      currentStepIndex: state.currentStepIndex,
      isCompleted: state.isCompleted,
      isSkipped: state.isSkipped
    });

    // Convert walkthrough steps to Joyride steps format
    const currentConfig = walkthroughService.getCurrentConfig();
    
    if (currentConfig && state.isActive) {
      console.log('📋 Creating Joyride steps for config:', currentConfig.id, 'with', currentConfig.steps.length, 'steps');
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
              {/* Display step position and formatted walkthrough name */}
              <div className="text-xs text-gray-500 mt-2">
                {`Step ${index + 1} of ${currentConfig.steps.length} • ${currentConfig.id
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}`}
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
      console.log('✅ Created', steps.length, 'Joyride steps, setting joyrideSteps');
      setJoyrideSteps(steps);
    } else {
      if (state.isActive && !currentConfig) {
        console.warn('⚠️ Walkthrough is active but no config found');
      }
      console.log('🚫 Clearing joyride steps');
      setJoyrideSteps([]);
    }
  }, [state.isActive, state.currentStepIndex, state.isCompleted, state.isSkipped]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, status, type, index } = data;
    const currentConfig = walkthroughService.getCurrentConfig();

    // 🐛 DEBUG: Log every callback to trace the infinite loop
    console.log('🔍 Joyride Callback:', { 
      action, 
      status, 
      type, 
      index, 
      currentStepIndex: state.currentStepIndex,
      stepCount: currentConfig?.steps.length 
    });

    // Handle step completion actions
    if (type === EVENTS.STEP_AFTER) {
      const currentStep = walkthroughService.getCurrentStep();
      console.log('📝 STEP_AFTER event for step:', currentStep?.title);
      if (currentStep?.onComplete) {
        console.log('🎯 Running onComplete callback for step:', currentStep.title);
        currentStep.onComplete();
      }
      // NOTE: Don't advance step here - let ACTIONS.NEXT handle it
    }

    // Handle completion FIRST (before action-based logic)
    if (status === STATUS.FINISHED) {
      console.log('✅ STATUS.FINISHED - Completing walkthrough');
      walkthroughService.completeWalkthrough();
      // Force immediate state update to make modal disappear
      setState(walkthroughService.getState());
      return; // Exit early to prevent other logic from running
    }

    // Handle close/skip actions  
    if (action === ACTIONS.SKIP || action === ACTIONS.CLOSE) {
      console.log('❌ SKIP/CLOSE action:', action, 'status:', status);
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
      console.log('➡️ NEXT action - Checking if should advance', {
        type,
        index,
        lastProcessedStep,
        currentStepIndex: state.currentStepIndex
      });
      
      // Only process NEXT actions on step:after events to avoid duplicates
      // OR if this is a different step than we last processed
      if (type === EVENTS.STEP_AFTER && index !== lastProcessedStep) {
        console.log('✅ Processing NEXT action - Advancing step');
        setLastProcessedStep(index);
        walkthroughService.nextStep();
      } else {
        console.log('⏭️ Skipping duplicate NEXT action for step:', index);
      }
    } else if (action === ACTIONS.PREV) {
      console.log('⬅️ PREV action - Going back');
      walkthroughService.previousStep();
      setLastProcessedStep(index - 1); // Update tracking for previous step
    }

    // Handle errors (target not found) - POTENTIAL INFINITE LOOP SOURCE
    if (status === STATUS.ERROR) {
      const currentStep = walkthroughService.getCurrentStep();
      console.log('💥 STATUS.ERROR - Target not found!', {
        stepTitle: currentStep?.title,
        targetSelector: currentStep?.targetSelector,
        currentIndex: state.currentStepIndex,
        lastProcessedStep,
      });
      console.warn(`❌ Joyride error: Target element not found for step "${currentStep?.title}" with selector "${currentStep?.targetSelector}"`);

      /*
        React-Joyride fires a STATUS.ERROR event repeatedly when the target
        element for the current step cannot be found. If we blindly call
        walkthroughService.nextStep() every time we receive that event we
        very quickly race through every remaining step until the tour is
        marked as finished – exactly the bug we are seeing.

        To avoid this we only advance **once** per failing step. We track the
        index of the last step we processed (lastProcessedStep). If the same
        step fires another ERROR event we simply ignore it, letting Joyride
        continue to look for the element or wait for user navigation.
      */

      if (index !== lastProcessedStep) {
        console.log('🔄 Auto-advancing to next step due to missing target');
        setLastProcessedStep(index);
        walkthroughService.nextStep();
      } else {
        console.log('⏭️ Duplicate ERROR event ignored for step:', index);
      }
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
        // Skip button drops to its own row beneath Previous/Next for better spacing
        buttonSkip: {
          color: '#6b7280',
          fontSize: '13px',
          cursor: 'pointer',
          backgroundColor: 'transparent',
          border: 'none',
          textDecoration: 'underline',
          padding: '4px 8px',
          display: 'block',
          width: '100%',
          marginTop: '8px',
        },
        // Force footer to use flexbox column layout so skip button goes on its own row
        tooltipFooter: {
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        },
        // Container for Previous/Next buttons - keep them on same row
        tooltipFooterSpacer: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
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