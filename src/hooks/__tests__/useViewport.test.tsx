import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useViewport } from '../useViewport';

// Mock window object
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: mockWindow.innerWidth,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: mockWindow.innerHeight,
});

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  configurable: true,
  value: mockWindow.addEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  configurable: true,
  value: mockWindow.removeEventListener,
});

describe('useViewport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window dimensions to default
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    Object.defineProperty(window, 'innerHeight', { value: 768 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial viewport dimensions', () => {
    const { result } = renderHook(() => useViewport());

    expect(result.current).toEqual({
      width: 1024,
      height: 768,
      isLandscape: true,
      isPortrait: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isSmallLandscape: false,
    });
  });

  it('should detect mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', { value: 375 });
    Object.defineProperty(window, 'innerHeight', { value: 667 });

    const { result } = renderHook(() => useViewport());

    expect(result.current).toEqual({
      width: 375,
      height: 667,
      isLandscape: false,
      isPortrait: true,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isSmallLandscape: false,
    });
  });

  it('should detect tablet viewport', () => {
    Object.defineProperty(window, 'innerWidth', { value: 768 });
    Object.defineProperty(window, 'innerHeight', { value: 1024 });

    const { result } = renderHook(() => useViewport());

    expect(result.current).toEqual({
      width: 768,
      height: 1024,
      isLandscape: false,
      isPortrait: true,
      isMobile: false,
      isTablet: true,
      isDesktop: false,
      isSmallLandscape: false,
    });
  });

  it('should detect landscape orientation', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    Object.defineProperty(window, 'innerHeight', { value: 768 });

    const { result } = renderHook(() => useViewport());

    expect(result.current.isLandscape).toBe(true);
    expect(result.current.isPortrait).toBe(false);
  });

  it('should detect portrait orientation', () => {
    Object.defineProperty(window, 'innerWidth', { value: 768 });
    Object.defineProperty(window, 'innerHeight', { value: 1024 });

    const { result } = renderHook(() => useViewport());

    expect(result.current.isLandscape).toBe(false);
    expect(result.current.isPortrait).toBe(true);
  });

  it('should add event listeners on mount', () => {
    renderHook(() => useViewport());

    expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
  });

  it('should remove event listeners on unmount', () => {
    const { unmount } = renderHook(() => useViewport());

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(window.removeEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
  });
}); 