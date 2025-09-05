import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWalkthrough } from '../useWalkthrough';

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/' }),
}));

vi.mock('../../lib/walkthroughService', () => ({
  walkthroughService: {
    startWalkthrough: vi.fn(),
    stopWalkthrough: vi.fn(),
    nextStep: vi.fn(),
    previousStep: vi.fn(),
    skipWalkthrough: vi.fn(),
    isCompleted: vi.fn(() => false),
    isSkipped: vi.fn(() => false),
    resetWalkthrough: vi.fn(),
    resetAllWalkthroughs: vi.fn(),
    getState: vi.fn(() => ({ isActive: false })),
    getCurrentStep: vi.fn(() => null),
    getCurrentConfig: vi.fn(() => null),
  },
}));

vi.mock('../../lib/walkthroughConfigs', () => ({
  walkthroughConfigs: {
    'home-walkthrough': {
      id: 'home-walkthrough',
      title: 'Home',
      autoStart: false,
      steps: [],
    },
  },
}));

describe('useWalkthrough', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exposes walkthrough controls', () => {
    const { result } = renderHook(() => useWalkthrough());
    expect(typeof result.current.startWalkthrough).toBe('function');
    expect(typeof result.current.stopWalkthrough).toBe('function');
    expect(typeof result.current.nextStep).toBe('function');
    expect(typeof result.current.previousStep).toBe('function');
    expect(typeof result.current.skipWalkthrough).toBe('function');
    expect(typeof result.current.resetWalkthrough).toBe('function');
    expect(typeof result.current.resetAllWalkthroughs).toBe('function');

    act(() => {
      result.current.resetAllWalkthroughs();
    });
    // No assertion on side effect; smoke test ensures callable
  });
});
