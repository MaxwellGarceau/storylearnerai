import { describe, it, expect, beforeEach, vi } from 'vitest';
import { walkthroughService } from '../../../lib/walkthroughService';
import { homeWalkthrough } from '../../../lib/walkthroughConfigs';
import type { WalkthroughId } from '../../../types/app/walkthrough';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('WalkthroughService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    // Reset the service state
    walkthroughService.stopWalkthrough();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = walkthroughService;
      const instance2 = walkthroughService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('State Management', () => {
    it('should have initial state', () => {
      const state = walkthroughService.getState();
      expect(state).toEqual({
        isActive: false,
        currentStepIndex: 0,
        isCompleted: false,
        isSkipped: false,
      });
    });

    it('should update state when walkthrough starts', () => {
      const listener = vi.fn();
      const unsubscribe = walkthroughService.subscribe(listener);

      walkthroughService.startWalkthrough(homeWalkthrough);

      expect(listener).toHaveBeenCalledWith({
        isActive: true,
        currentStepIndex: 0,
        isCompleted: false,
        isSkipped: false,
      });

      unsubscribe();
    });
  });

  describe('Walkthrough Control', () => {
    it('should start walkthrough', () => {
      walkthroughService.startWalkthrough(homeWalkthrough);

      const state = walkthroughService.getState();
      expect(state.isActive).toBe(true);
      expect(state.currentStepIndex).toBe(0);

      const currentStep = walkthroughService.getCurrentStep();
      expect(currentStep).toEqual(homeWalkthrough.steps[0]);
    });

    it('should not start walkthrough if already completed', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          completed: ['home-walkthrough'],
          skipped: [],
        })
      );

      walkthroughService.startWalkthrough(homeWalkthrough);

      const state = walkthroughService.getState();
      expect(state.isActive).toBe(false);
    });

    it('should move to next step', () => {
      walkthroughService.startWalkthrough(homeWalkthrough);
      walkthroughService.nextStep();

      const state = walkthroughService.getState();
      expect(state.isCompleted).toBe(true);
      expect(state.isActive).toBe(false);
    });

    it('should move to previous step', () => {
      walkthroughService.startWalkthrough(homeWalkthrough);
      walkthroughService.nextStep();
      walkthroughService.previousStep();

      const state = walkthroughService.getState();
      expect(state.currentStepIndex).toBe(0);
    });

    it('should skip walkthrough', () => {
      walkthroughService.startWalkthrough(homeWalkthrough);
      walkthroughService.skipWalkthrough();

      const state = walkthroughService.getState();
      expect(state.isSkipped).toBe(true);
      expect(state.isActive).toBe(false);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'storylearnerai-walkthroughs',
        expect.stringContaining('"skipped":["home-walkthrough"]')
      );
    });

    it('should complete walkthrough', () => {
      walkthroughService.startWalkthrough(homeWalkthrough);
      walkthroughService.completeWalkthrough();

      const state = walkthroughService.getState();
      expect(state.isCompleted).toBe(true);
      expect(state.isActive).toBe(false);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'storylearnerai-walkthroughs',
        expect.stringContaining('"completed":["home-walkthrough"]')
      );
    });

    it('should stop walkthrough', () => {
      walkthroughService.startWalkthrough(homeWalkthrough);
      walkthroughService.stopWalkthrough();

      const state = walkthroughService.getState();
      expect(state.isActive).toBe(false);
    });
  });

  describe('Storage Management', () => {
    it('should check if walkthrough is completed', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          completed: ['home-walkthrough'],
          skipped: [],
        })
      );

      expect(
        walkthroughService.isCompleted('home-walkthrough' as WalkthroughId)
      ).toBe(true);
      expect(
        walkthroughService.isCompleted('translate-walkthrough' as WalkthroughId)
      ).toBe(false);
    });

    it('should check if walkthrough is skipped', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          completed: [],
          skipped: ['home-walkthrough'],
        })
      );

      expect(
        walkthroughService.isSkipped('home-walkthrough' as WalkthroughId)
      ).toBe(true);
      expect(
        walkthroughService.isSkipped('translate-walkthrough' as WalkthroughId)
      ).toBe(false);
    });

    it('should reset walkthrough', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          completed: ['home-walkthrough'],
          skipped: ['translate-walkthrough'],
        })
      );

      walkthroughService.resetWalkthrough('home-walkthrough' as WalkthroughId);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'storylearnerai-walkthroughs',
        JSON.stringify({
          completed: [],
          skipped: ['translate-walkthrough'],
        })
      );
    });

    it('should reset all walkthroughs', () => {
      walkthroughService.resetAllWalkthroughs();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'storylearnerai-walkthroughs',
        JSON.stringify({
          completed: [],
          skipped: [],
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw error
      expect(() => {
        walkthroughService.isCompleted('home-walkthrough' as WalkthroughId);
      }).not.toThrow();
    });

    it('should handle localStorage setItem errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw error
      expect(() => {
        walkthroughService.startWalkthrough(homeWalkthrough);
        walkthroughService.completeWalkthrough();
      }).not.toThrow();
    });
  });
});
