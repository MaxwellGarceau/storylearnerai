import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { useToast } from '../useToast';

describe('useToast Hook', () => {
  it('should have initial state with empty toasts', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toasts).toEqual([]);
  });

  it('should add a toast when toast function is called', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'This is a test toast',
        variant: 'success',
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Test Toast');
    expect(result.current.toasts[0].description).toBe('This is a test toast');
    expect(result.current.toasts[0].variant).toBe('success');
    expect(result.current.toasts[0].open).toBe(true);
  });

  it('should dismiss a toast when dismiss is called', () => {
    const { result } = renderHook(() => useToast());

    let toastId: string;

    act(() => {
      const toast = result.current.toast({
        title: 'Test Toast',
        description: 'This is a test toast',
      });
      toastId = toast.id;
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(true);

    act(() => {
      result.current.dismiss(toastId);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should dismiss all toasts when dismiss is called without id', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Toast 1',
        description: 'First toast',
      });
      result.current.toast({
        title: 'Toast 2',
        description: 'Second toast',
      });
    });

    // Due to TOAST_LIMIT = 1, only the most recent toast should be kept
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(true);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should limit toasts to TOAST_LIMIT', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      // Add more toasts than the limit (which is 1)
      result.current.toast({
        title: 'Toast 1',
        description: 'First toast',
      });
      result.current.toast({
        title: 'Toast 2',
        description: 'Second toast',
      });
      result.current.toast({
        title: 'Toast 3',
        description: 'Third toast',
      });
    });

    // Should only keep the most recent toast
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Toast 3');
  });
}); 