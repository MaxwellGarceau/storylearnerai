import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWalkthrough } from '../../hooks/useWalkthrough';
import { walkthroughService } from '../../lib/walkthroughService';
import { homeWalkthrough } from '../../lib/walkthroughConfigs';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/' }),
}));

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

// Mock the walkthrough service
vi.mock('../../lib/walkthroughService', () => ({
  walkthroughService: {
    startWalkthrough: vi.fn(),
    stopWalkthrough: vi.fn(),
    nextStep: vi.fn(),
    previousStep: vi.fn(),
    skipWalkthrough: vi.fn(),
    isCompleted: vi.fn(),
    isSkipped: vi.fn(),
    resetWalkthrough: vi.fn(),
    resetAllWalkthroughs: vi.fn(),
    getState: vi.fn(),
    getCurrentStep: vi.fn(),
    getCurrentConfig: vi.fn(),
  },
}));

describe('useWalkthrough', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    vi.mocked(walkthroughService.isCompleted).mockReturnValue(false);
    vi.mocked(walkthroughService.isSkipped).mockReturnValue(false);
    vi.mocked(walkthroughService.getState).mockReturnValue({
      isActive: false,
      currentStepIndex: 0,
      isCompleted: false,
      isSkipped: false,
    });
  });

  describe('Hook Initialization', () => {
    it('should return walkthrough functions', () => {
      const { result } = renderHook(() => useWalkthrough());

      expect(result.current.startWalkthrough).toBeDefined();
      expect(result.current.startWalkthroughById).toBeDefined();
      expect(result.current.stopWalkthrough).toBeDefined();
      expect(result.current.nextStep).toBeDefined();
      expect(result.current.previousStep).toBeDefined();
      expect(result.current.skipWalkthrough).toBeDefined();
      expect(result.current.isCompleted).toBeDefined();
      expect(result.current.isSkipped).toBeDefined();
      expect(result.current.resetWalkthrough).toBeDefined();
      expect(result.current.resetAllWalkthroughs).toBeDefined();
    });
  });

  describe('Walkthrough Control Functions', () => {
    it('should call startWalkthrough', () => {
      const { result } = renderHook(() => useWalkthrough());

      act(() => {
        result.current.startWalkthrough(homeWalkthrough);
      });

      expect(walkthroughService.startWalkthrough).toHaveBeenCalledWith(homeWalkthrough);
    });

    it('should call startWalkthroughById', () => {
      const { result } = renderHook(() => useWalkthrough());

      act(() => {
        result.current.startWalkthroughById('home-walkthrough');
      });

      expect(walkthroughService.startWalkthrough).toHaveBeenCalledWith(homeWalkthrough);
    });

    it('should call stopWalkthrough', () => {
      const { result } = renderHook(() => useWalkthrough());

      act(() => {
        result.current.stopWalkthrough();
      });

      expect(walkthroughService.stopWalkthrough).toHaveBeenCalled();
    });

    it('should call nextStep', () => {
      const { result } = renderHook(() => useWalkthrough());

      act(() => {
        result.current.nextStep();
      });

      expect(walkthroughService.nextStep).toHaveBeenCalled();
    });

    it('should call previousStep', () => {
      const { result } = renderHook(() => useWalkthrough());

      act(() => {
        result.current.previousStep();
      });

      expect(walkthroughService.previousStep).toHaveBeenCalled();
    });

    it('should call skipWalkthrough', () => {
      const { result } = renderHook(() => useWalkthrough());

      act(() => {
        result.current.skipWalkthrough();
      });

      expect(walkthroughService.skipWalkthrough).toHaveBeenCalled();
    });

    it('should call isCompleted', () => {
      const { result } = renderHook(() => useWalkthrough());

      act(() => {
        result.current.isCompleted('home-walkthrough');
      });

      expect(walkthroughService.isCompleted).toHaveBeenCalledWith('home-walkthrough');
    });

    it('should call isSkipped', () => {
      const { result } = renderHook(() => useWalkthrough());

      act(() => {
        result.current.isSkipped('home-walkthrough');
      });

      expect(walkthroughService.isSkipped).toHaveBeenCalledWith('home-walkthrough');
    });

    it('should call resetWalkthrough', () => {
      const { result } = renderHook(() => useWalkthrough());

      act(() => {
        result.current.resetWalkthrough('home-walkthrough');
      });

      expect(walkthroughService.resetWalkthrough).toHaveBeenCalledWith('home-walkthrough');
    });

    it('should call resetAllWalkthroughs', () => {
      const { result } = renderHook(() => useWalkthrough());

      act(() => {
        result.current.resetAllWalkthroughs();
      });

      expect(walkthroughService.resetAllWalkthroughs).toHaveBeenCalled();
    });
  });

  describe('Auto-start Functionality', () => {
    it('should auto-start home walkthrough on home page', async () => {
      // Mock useLocation to return home path
      vi.doMock('react-router-dom', () => ({
        useLocation: () => ({ pathname: '/' }),
      }));

      renderHook(() => useWalkthrough());

      // Wait for the auto-start delay
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(walkthroughService.startWalkthrough).toHaveBeenCalledWith(homeWalkthrough);
    });

    it('should not auto-start if walkthrough is already completed', async () => {
      vi.mocked(walkthroughService.isCompleted).mockReturnValue(true);

      renderHook(() => useWalkthrough());

      // Wait for the auto-start delay
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(walkthroughService.startWalkthrough).not.toHaveBeenCalled();
    });

    it('should not auto-start if walkthrough is already skipped', async () => {
      vi.mocked(walkthroughService.isSkipped).mockReturnValue(true);

      renderHook(() => useWalkthrough());

      // Wait for the auto-start delay
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(walkthroughService.startWalkthrough).not.toHaveBeenCalled();
    });
  });

  describe('Service Method Binding', () => {
    it('should bind getState method', () => {
      const { result } = renderHook(() => useWalkthrough());

      result.current.getState();

      expect(walkthroughService.getState).toHaveBeenCalled();
    });

    it('should bind getCurrentStep method', () => {
      const { result } = renderHook(() => useWalkthrough());

      result.current.getCurrentStep();

      expect(walkthroughService.getCurrentStep).toHaveBeenCalled();
    });

    it('should bind getCurrentConfig method', () => {
      const { result } = renderHook(() => useWalkthrough());

      result.current.getCurrentConfig();

      expect(walkthroughService.getCurrentConfig).toHaveBeenCalled();
    });
  });
}); 