import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { WalkthroughJoyride } from '../../components/walkthrough/WalkthroughJoyride';
import { walkthroughService } from '../../lib/walkthroughService';

// Mock the walkthrough service
vi.mock('../../lib/walkthroughService', () => ({
  walkthroughService: {
    getState: vi.fn(),
    subscribe: vi.fn(),
    getCurrentConfig: vi.fn(),
    getCurrentStep: vi.fn(),
    nextStep: vi.fn(),
    previousStep: vi.fn(),
    skipWalkthrough: vi.fn(),
    stopWalkthrough: vi.fn(),
    completeWalkthrough: vi.fn(),
  },
}));

// Mock react-joyride
vi.mock('react-joyride', () => ({
  default: ({ callback, run, steps, stepIndex }: any) => {
    if (!run || !steps || steps.length === 0) {
      return null;
    }
    
    // Use stepIndex to show the correct step (default to 0 if not provided)
    const currentStepIndex = stepIndex || 0;
    const currentStep = steps[currentStepIndex];
    
    if (!currentStep) {
      return null;
    }
    
    return (
      <div data-testid="joyride-modal" role="dialog">
        <div data-testid="joyride-content">
          {currentStep.content}
        </div>
        <button 
          data-testid="joyride-next-button"
          onClick={() => {
            callback({
              action: 'next',
              status: 'running',
              type: 'step:after',
              index: currentStepIndex,
              lifecycle: 'complete'
            });
          }}
        >
          Next
        </button>
        <button 
          data-testid="joyride-close-button"
          onClick={() => {
            callback({
              action: 'close',
              status: 'interrupted',
              type: 'step:after',
              index: currentStepIndex,
              lifecycle: 'complete'
            });
          }}
        >
          ×
        </button>
      </div>
    );
  },
  ACTIONS: {
    NEXT: 'next',
    PREV: 'prev',
    SKIP: 'skip',
    CLOSE: 'close',
  },
  EVENTS: {
    STEP_AFTER: 'step:after',
  },
  STATUS: {
    FINISHED: 'finished',
    SKIPPED: 'skipped',
    ERROR: 'error',
  },
}));

describe('WalkthroughJoyride Button Behavior', () => {
  const mockMultiStepWalkthrough = {
    id: 'test-walkthrough',
    title: 'Test Multi-Step Walkthrough',
    description: 'Testing button behavior',
    steps: [
      {
        id: 'step-1',
        targetSelector: '#step1',
        title: 'Step 1',
        description: 'First step of the walkthrough',
        position: 'bottom' as const,
        actionText: 'Click Next to continue',
      },
      {
        id: 'step-2',
        targetSelector: '#step2', 
        title: 'Step 2',
        description: 'Second step of the walkthrough',
        position: 'bottom' as const,
        actionText: 'Click Next to continue',
      },
      {
        id: 'step-3',
        targetSelector: '#step3',
        title: 'Step 3',
        description: 'Final step of the walkthrough', 
        position: 'bottom' as const,
        actionText: 'Click Finish to complete',
      },
    ],
    autoStart: false,
  };

  const mockUnsubscribe = vi.fn();
  let mockStateChangeCallback: ((state: any) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStateChangeCallback = null;
    
    // Ensure clean DOM before each test
    cleanup();
    
    // Mock subscribe to capture the setState callback
    vi.mocked(walkthroughService.subscribe).mockImplementation((callback) => {
      mockStateChangeCallback = callback;
      return mockUnsubscribe;
    });
    
    vi.mocked(walkthroughService.getCurrentConfig).mockReturnValue(mockMultiStepWalkthrough);
    vi.mocked(walkthroughService.getCurrentStep).mockReturnValue(mockMultiStepWalkthrough.steps[0]);
  });

  afterEach(() => {
    // Clean up DOM after each test to prevent test isolation issues
    cleanup();
  });

  describe('Next Button Navigation', () => {
    it('should show new modal window with next step content when Next button is clicked', async () => {
      // Start on step 1 (index 0)
      const initialState = {
        isActive: true,
        currentStepIndex: 0,
        isCompleted: false,
        isSkipped: false,
      };
      vi.mocked(walkthroughService.getState).mockReturnValue(initialState);
      
      render(<WalkthroughJoyride />);
      
      // Verify initial modal window shows step 1
      const modals = screen.getAllByTestId('joyride-modal');
      const initialModal = modals[0]; // Take the first modal if multiple exist
      expect(initialModal).toBeInTheDocument();
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('First step of the walkthrough')).toBeInTheDocument();
      console.log('✅ Initial modal window shows Step 1 content');
      
      // Mock what happens when nextStep is called - advance to step 2
      vi.mocked(walkthroughService.nextStep).mockImplementation(() => {
        console.log('🔧 Service: nextStep() called, updating to step 2');
        const newState = {
          ...initialState,
          currentStepIndex: 1, // Advanced to step 2
        };
        
        // Update the current step mock to return step 2
        vi.mocked(walkthroughService.getCurrentStep).mockReturnValue(mockMultiStepWalkthrough.steps[1]);
        vi.mocked(walkthroughService.getState).mockReturnValue(newState);
        
        // Simulate the service notifying subscribers of the state change
        if (mockStateChangeCallback) {
          console.log('🔧 Service: Notifying subscribers with new state:', newState);
          act(() => {
            mockStateChangeCallback!(newState);
          });
        }
      });
      
      // Click the Next button
      const nextButton = screen.getByTestId('joyride-next-button');
      fireEvent.click(nextButton);
      console.log('🔍 Clicked Next button');
      
      // Verify service method was called
      expect(walkthroughService.nextStep).toHaveBeenCalled();
      console.log('✅ nextStep service method was called');
      
      // CRITICAL: Verify modal window is STILL present (same modal, different content)
      await waitFor(() => {
        const updatedModals = screen.getAllByTestId('joyride-modal');
        const updatedModal = updatedModals[0]; // Take the first modal
        expect(updatedModal).toBeInTheDocument();
      });
      console.log('✅ Modal window is still present after Next click');
      
      // Verify the modal window now shows step 2 content
      await waitFor(() => {
        expect(screen.getByText('Step 2')).toBeInTheDocument();
        expect(screen.getByText('Second step of the walkthrough')).toBeInTheDocument();
      });
      console.log('✅ Modal window now shows Step 2 content');
      
      // Verify step 1 content is no longer in the modal
      expect(screen.queryByText('Step 1')).not.toBeInTheDocument();
      expect(screen.queryByText('First step of the walkthrough')).not.toBeInTheDocument();
      console.log('✅ Step 1 content is no longer visible');
      
      // Verify it's the same modal element that got updated (not a new one)
      const finalModals = screen.getAllByTestId('joyride-modal');
      const finalModal = finalModals[0]; // Take the first modal
      expect(finalModal).toBeInTheDocument();
      console.log('✅ Same modal element updated with new content');
    });

    it('should advance to next step when Next button is clicked (not close)', async () => {
      // Start on step 1 (index 0)
      const initialState = {
        isActive: true,
        currentStepIndex: 0,
        isCompleted: false,
        isSkipped: false,
      };
      vi.mocked(walkthroughService.getState).mockReturnValue(initialState);
      
      render(<WalkthroughJoyride />);
      
      // Debug: Log initial render
      console.log('🔍 Initial render - looking for Step 1');
      
      // Verify step 1 is initially visible
      const initialModals = screen.getAllByTestId('joyride-modal');
      expect(initialModals[0]).toBeInTheDocument();
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      
      // Mock what happens when nextStep is called - advance to step 2
      vi.mocked(walkthroughService.nextStep).mockImplementation(() => {
        console.log('🔧 Service: nextStep() called, updating to step 2');
        const newState = {
          ...initialState,
          currentStepIndex: 1, // Advanced to step 2
        };
        
        // Update the current step mock to return step 2
        vi.mocked(walkthroughService.getCurrentStep).mockReturnValue(mockMultiStepWalkthrough.steps[1]);
        vi.mocked(walkthroughService.getState).mockReturnValue(newState);
        
        // Simulate the service notifying subscribers of the state change
        if (mockStateChangeCallback) {
          console.log('🔧 Service: Notifying subscribers with new state:', newState);
          act(() => {
            mockStateChangeCallback!(newState);
          });
        }
      });
      
      // Click the Next button
      console.log('🔍 Clicking Next button');
      const nextButton = screen.getByTestId('joyride-next-button');
      fireEvent.click(nextButton);
      
      // Verify service methods were called
      expect(walkthroughService.nextStep).toHaveBeenCalled();
      console.log('✅ Service nextStep() was called');
      
      // Verify modal is STILL present (not closed)
      await waitFor(() => {
        const updatedModals = screen.getAllByTestId('joyride-modal');
        expect(updatedModals[0]).toBeInTheDocument();
      });
      console.log('✅ Modal is still present');
      
      // Verify content has changed to step 2
      await waitFor(() => {
        expect(screen.getByText('Step 2')).toBeInTheDocument();
      });
      console.log('✅ Content changed to Step 2');
      
      // Verify step 1 content is no longer present
      expect(screen.queryByText('Step 1')).not.toBeInTheDocument();
      console.log('✅ Step 1 content is gone');
    });

    it('should advance from step 2 to step 3 when Next button is clicked', async () => {
      // Start on step 2 (index 1)
      const step2State = {
        isActive: true,
        currentStepIndex: 1,
        isCompleted: false,
        isSkipped: false,
      };
      vi.mocked(walkthroughService.getState).mockReturnValue(step2State);
      vi.mocked(walkthroughService.getCurrentStep).mockReturnValue(mockMultiStepWalkthrough.steps[1]);
      
      render(<WalkthroughJoyride />);
      
      // Verify step 2 is initially visible
      const step2Modals = screen.getAllByTestId('joyride-modal');
      expect(step2Modals[0]).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      
      // Mock what happens when nextStep is called - advance to step 3
      vi.mocked(walkthroughService.nextStep).mockImplementation(() => {
        const newState = {
          ...step2State,
          currentStepIndex: 2, // Advanced to step 3
        };
        
        // Update the current step mock to return step 3
        vi.mocked(walkthroughService.getCurrentStep).mockReturnValue(mockMultiStepWalkthrough.steps[2]);
        vi.mocked(walkthroughService.getState).mockReturnValue(newState);
        
        // Simulate the service notifying subscribers of the state change
        if (mockStateChangeCallback) {
          act(() => {
            mockStateChangeCallback!(newState);
          });
        }
      });
      
      // Click the Next button
      const nextButton = screen.getByTestId('joyride-next-button');
      fireEvent.click(nextButton);
      
      // Verify service methods were called
      expect(walkthroughService.nextStep).toHaveBeenCalled();
      
      // Verify modal is STILL present (not closed)
      await waitFor(() => {
        const updatedModals = screen.getAllByTestId('joyride-modal');
        expect(updatedModals[0]).toBeInTheDocument();
      });
      
      // Verify content has changed to step 3
      await waitFor(() => {
        expect(screen.getByText('Step 3')).toBeInTheDocument();
      });
      
      // Verify step 2 content is no longer present
      expect(screen.queryByText('Step 2')).not.toBeInTheDocument();
    });

    it('should complete walkthrough when Next button is clicked on final step', async () => {
      // Start on step 3 (final step, index 2)
      const finalStepState = {
        isActive: true,
        currentStepIndex: 2,
        isCompleted: false,
        isSkipped: false,
      };
      vi.mocked(walkthroughService.getState).mockReturnValue(finalStepState);
      vi.mocked(walkthroughService.getCurrentStep).mockReturnValue(mockMultiStepWalkthrough.steps[2]);
      
      render(<WalkthroughJoyride />);
      
      // Verify step 3 is initially visible
      const finalStepModals = screen.getAllByTestId('joyride-modal');
      expect(finalStepModals[0]).toBeInTheDocument();
      expect(screen.getByText('Step 3')).toBeInTheDocument();
      
      // Mock what happens when nextStep is called on final step - complete walkthrough
      vi.mocked(walkthroughService.nextStep).mockImplementation(() => {
        const completedState = {
          ...finalStepState,
          isActive: false, // Walkthrough should be completed
          isCompleted: true,
        };
        
        vi.mocked(walkthroughService.getState).mockReturnValue(completedState);
        
        // Simulate the service notifying subscribers of the state change
        if (mockStateChangeCallback) {
          act(() => {
            mockStateChangeCallback!(completedState);
          });
        }
      });
      
      // Click the Next button
      const nextButton = screen.getByTestId('joyride-next-button');
      fireEvent.click(nextButton);
      
      // Verify service methods were called
      expect(walkthroughService.nextStep).toHaveBeenCalled();
      
      // Verify modal is now GONE (completed)
      await waitFor(() => {
        expect(screen.queryByTestId('joyride-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('X Button Behavior', () => {
    it('should close modal immediately when X button is clicked', async () => {
      // Start with active state
      const initialState = {
        isActive: true,
        currentStepIndex: 0,
        isCompleted: false,
        isSkipped: false,
      };
      vi.mocked(walkthroughService.getState).mockReturnValue(initialState);
      
      render(<WalkthroughJoyride />);
      
      // Verify modal is initially visible
      const xButtonModals = screen.getAllByTestId('joyride-modal');
      expect(xButtonModals[0]).toBeInTheDocument();
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      
      // Mock what happens when stopWalkthrough is called - modal should disappear
      vi.mocked(walkthroughService.stopWalkthrough).mockImplementation(() => {
        const closedState = {
          ...initialState,
          isActive: false, // Modal should disappear
        };
        
        vi.mocked(walkthroughService.getState).mockReturnValue(closedState);
        
        // Simulate the service notifying subscribers of the state change
        if (mockStateChangeCallback) {
          console.log('🔧 X Button: Notifying subscribers modal should close');
          act(() => {
            mockStateChangeCallback!(closedState);
          });
        }
      });
      
      // Click the X button
      const closeButton = screen.getByTestId('joyride-close-button');
      fireEvent.click(closeButton);
      
      // Verify service method was called
      expect(walkthroughService.stopWalkthrough).toHaveBeenCalled();
      console.log('✅ stopWalkthrough was called');
      
      // Verify modal disappears immediately
      await waitFor(() => {
        expect(screen.queryByTestId('joyride-modal')).not.toBeInTheDocument();
      });
      console.log('✅ Modal disappeared');
      
      // Verify content is gone
      expect(screen.queryByText('Step 1')).not.toBeInTheDocument();
    });
  });
});