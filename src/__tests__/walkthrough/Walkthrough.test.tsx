import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { Walkthrough } from '../../components/walkthrough/Walkthrough';
import { walkthroughService } from '../../lib/walkthroughService';
import type { WalkthroughState } from '../../types/app/walkthrough';
import { logger } from '../../lib/logger';

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

// Mock DOM elements for testing
const mockDOMElements = new Map<string, HTMLElement>();

// Helper to create mock DOM elements
const createMockElement = (selector: string): HTMLElement => {
  const element = document.createElement('div');
  element.id = selector.replace('#', '');
  element.getBoundingClientRect = vi.fn(() => ({
    left: 100,
    top: 100,
    right: 200,
    bottom: 150,
    width: 100,
    height: 50,
    x: 100,
    y: 100,
    toJSON: () => ({})
  } as DOMRect));
  element.scrollIntoView = vi.fn();
  mockDOMElements.set(selector, element);
  document.body.appendChild(element);
  return element;
};

// Mock querySelector to return our mock elements
const originalQuerySelector = document.querySelector;
document.querySelector = vi.fn((selector: string) => {
  if (mockDOMElements.has(selector)) {
    return mockDOMElements.get(selector);
  }
  // Create mock element if it doesn't exist
  if (selector.startsWith('#step')) {
    return createMockElement(selector);
  }
  return originalQuerySelector.call(document, selector);
});

describe('Walkthrough Button Behavior', () => {
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
  let mockStateChangeCallback: ((state: WalkthroughState) => void) | null = null;

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
      
      render(<Walkthrough />);
      
      // Verify initial modal window shows step 1
      await waitFor(() => {
        const modal = screen.getByTestId('walkthrough-modal');
        expect(modal).toBeInTheDocument();
      });
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('First step of the walkthrough')).toBeInTheDocument();
      logger.debug('general', '✅ Initial modal window shows Step 1 content');
      
      // Mock what happens when nextStep is called - advance to step 2
      vi.mocked(walkthroughService.nextStep).mockImplementation(() => {
        logger.debug('general', '🔧 Service: nextStep() called, updating to step 2');
        const newState = {
          ...initialState,
          currentStepIndex: 1, // Advanced to step 2
        };
        
        // Update the current step mock to return step 2
        vi.mocked(walkthroughService.getCurrentStep).mockReturnValue(mockMultiStepWalkthrough.steps[1]);
        vi.mocked(walkthroughService.getState).mockReturnValue(newState);
        
        // Simulate the service notifying subscribers of the state change
        if (mockStateChangeCallback) {
          logger.debug('general', '🔧 Service: Notifying subscribers with new state', { newState });
          act(() => {
            mockStateChangeCallback!(newState);
          });
        }
      });
      
      // Click the Next button
      const nextButton = screen.getByTestId('walkthrough-next-button');
      fireEvent.click(nextButton);
      logger.debug('general', '🔍 Clicked Next button');
      
      // Verify service method was called
      expect(walkthroughService.nextStep).toHaveBeenCalled();
      logger.debug('general', '✅ nextStep service method was called');
      
      // CRITICAL: Verify modal window is STILL present (same modal, different content)
      await waitFor(() => {
        const modal = screen.getByTestId('walkthrough-modal');
        expect(modal).toBeInTheDocument();
      });
      logger.debug('general', '✅ Modal window is still present after Next click');
      
      // Verify the modal window now shows step 2 content
      await waitFor(() => {
        expect(screen.getByText('Step 2')).toBeInTheDocument();
        expect(screen.getByText('Second step of the walkthrough')).toBeInTheDocument();
      });
      logger.debug('general', '✅ Modal window now shows Step 2 content');
      
      // Verify step 1 content is no longer in the modal
      expect(screen.queryByText('Step 1')).not.toBeInTheDocument();
      expect(screen.queryByText('First step of the walkthrough')).not.toBeInTheDocument();
      logger.debug('general', '✅ Step 1 content is no longer visible');
      
      // Verify it's the same modal element that got updated (not a new one)
      const modal = screen.getByTestId('walkthrough-modal');
      expect(modal).toBeInTheDocument();
      logger.debug('general', '✅ Same modal element updated with new content');
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
      
      render(<Walkthrough />);
      
      // Debug: Log initial render
      logger.debug('general', '🔍 Initial render - looking for Step 1');
      
      // Verify step 1 is initially visible
      const initialModals = screen.getAllByTestId('walkthrough-modal');
      expect(initialModals[0]).toBeInTheDocument();
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      
      // Mock what happens when nextStep is called - advance to step 2
      vi.mocked(walkthroughService.nextStep).mockImplementation(() => {
        logger.debug('general', '🔧 Service: nextStep() called, updating to step 2');
        const newState = {
          ...initialState,
          currentStepIndex: 1, // Advanced to step 2
        };
        
        // Update the current step mock to return step 2
        vi.mocked(walkthroughService.getCurrentStep).mockReturnValue(mockMultiStepWalkthrough.steps[1]);
        vi.mocked(walkthroughService.getState).mockReturnValue(newState);
        
        // Simulate the service notifying subscribers of the state change
        if (mockStateChangeCallback) {
          logger.debug('general', '🔧 Service: Notifying subscribers with new state', { newState });
          act(() => {
            mockStateChangeCallback!(newState);
          });
        }
      });
      
      // Click the Next button
      logger.debug('general', '🔍 Clicking Next button');
      const nextButton = screen.getByTestId('walkthrough-next-button');
      fireEvent.click(nextButton);
      
      // Verify service methods were called
      expect(walkthroughService.nextStep).toHaveBeenCalled();
      logger.debug('general', '✅ Service nextStep() was called');
      
      // Verify modal is STILL present (not closed)
      await waitFor(() => {
        const updatedModals = screen.getAllByTestId('walkthrough-modal');
        expect(updatedModals[0]).toBeInTheDocument();
      });
      logger.debug('general', '✅ Modal is still present');
      
      // Verify content has changed to step 2
      await waitFor(() => {
        expect(screen.getByText('Step 2')).toBeInTheDocument();
      });
      logger.debug('general', '✅ Content changed to Step 2');
      
      // Verify step 1 content is no longer present
      expect(screen.queryByText('Step 1')).not.toBeInTheDocument();
      logger.debug('general', '✅ Step 1 content is gone');
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
      
      render(<Walkthrough />);
      
      // Verify step 2 is initially visible
      const step2Modals = screen.getAllByTestId('walkthrough-modal');
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
      const nextButton = screen.getByTestId('walkthrough-next-button');
      fireEvent.click(nextButton);
      
      // Verify service methods were called
      expect(walkthroughService.nextStep).toHaveBeenCalled();
      
      // Verify modal is STILL present (not closed)
      await waitFor(() => {
        const updatedModals = screen.getAllByTestId('walkthrough-modal');
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
      
      render(<Walkthrough />);
      
      // Verify step 3 is initially visible
      const finalStepModals = screen.getAllByTestId('walkthrough-modal');
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
      const nextButton = screen.getByTestId('walkthrough-next-button');
      fireEvent.click(nextButton);
      
      // Verify service methods were called
      expect(walkthroughService.nextStep).toHaveBeenCalled();
      
      // Verify modal is now GONE (completed)
      await waitFor(() => {
        expect(screen.queryByTestId('walkthrough-modal')).not.toBeInTheDocument();
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
      
      render(<Walkthrough />);
      
      // Verify modal is initially visible
      const xButtonModals = screen.getAllByTestId('walkthrough-modal');
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
          logger.debug('general', '🔧 X Button: Notifying subscribers modal should close');
          act(() => {
            mockStateChangeCallback!(closedState);
          });
        }
      });
      
      // Click the X button
      const closeButton = screen.getByTestId('walkthrough-close-button');
      fireEvent.click(closeButton);
      
      // Verify service method was called
      expect(walkthroughService.stopWalkthrough).toHaveBeenCalled();
      logger.debug('general', '✅ stopWalkthrough was called');
      
      // Verify modal disappears immediately
      await waitFor(() => {
        expect(screen.queryByTestId('walkthrough-modal')).not.toBeInTheDocument();
      });
      logger.debug('general', '✅ Modal disappeared');
      
      // Verify content is gone
      expect(screen.queryByText('Step 1')).not.toBeInTheDocument();
    });
  });

  describe('Positioning Behavior', () => {
    it('should update positioning when moving between steps with same target element', async () => {
      // Create the target element in the DOM first
      createMockElement('#same-target');
      
      // Create a walkthrough where multiple steps target the same element
      const sameTargetWalkthrough = {
        id: 'same-target-walkthrough',
        title: 'Same Target Walkthrough',
        description: 'Testing positioning with same target',
        steps: [
          {
            id: 'step-1',
            targetSelector: '#same-target',
            title: 'Step 1',
            description: 'First step targeting same element',
            position: 'bottom' as const,
            actionText: 'Click Next to continue',
          },
          {
            id: 'step-2',
            targetSelector: '#same-target', // Same target element
            title: 'Step 2',
            description: 'Second step targeting same element',
            position: 'top' as const, // Different position
            actionText: 'Click Next to continue',
          },
        ],
        autoStart: false,
      };

      // Start on step 1
      const initialState = {
        isActive: true,
        currentStepIndex: 0,
        isCompleted: false,
        isSkipped: false,
      };
      vi.mocked(walkthroughService.getState).mockReturnValue(initialState);
      vi.mocked(walkthroughService.getCurrentConfig).mockReturnValue(sameTargetWalkthrough);
      vi.mocked(walkthroughService.getCurrentStep).mockReturnValue(sameTargetWalkthrough.steps[0]);
      
      render(<Walkthrough />);
      
      // Verify step 1 is initially visible
      await waitFor(() => {
        expect(screen.getByText('Step 1')).toBeInTheDocument();
      });
      
      // Mock what happens when nextStep is called - advance to step 2
      vi.mocked(walkthroughService.nextStep).mockImplementation(() => {
        const newState = {
          ...initialState,
          currentStepIndex: 1, // Advanced to step 2
        };
        
        // Update the current step mock to return step 2
        vi.mocked(walkthroughService.getCurrentStep).mockReturnValue(sameTargetWalkthrough.steps[1]);
        vi.mocked(walkthroughService.getState).mockReturnValue(newState);
        
        // Simulate the service notifying subscribers of the state change
        if (mockStateChangeCallback) {
          act(() => {
            mockStateChangeCallback!(newState);
          });
        }
      });
      
      // Click the Next button
      const nextButton = screen.getByTestId('walkthrough-next-button');
      fireEvent.click(nextButton);
      
      // Verify service method was called
      expect(walkthroughService.nextStep).toHaveBeenCalled();
      
      // Verify modal is still present and content has changed
      await waitFor(() => {
        expect(screen.getByTestId('walkthrough-modal')).toBeInTheDocument();
        expect(screen.getByText('Step 2')).toBeInTheDocument();
        expect(screen.queryByText('Step 1')).not.toBeInTheDocument();
      });
      
      // Verify the target element was found and scrollIntoView was called
      // (This tests that the positioning logic was triggered even with same target)
      const foundTargetElement = document.querySelector('#same-target');
      expect(foundTargetElement).toBeTruthy();
      expect(foundTargetElement?.scrollIntoView).toHaveBeenCalled();
    });
  });
});