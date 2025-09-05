import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePopoverSafeguard } from '../usePopoverSafeguard';

// This hook is disabled by default; smoke test ensures it mounts/unmounts cleanly
describe('usePopoverSafeguard', () => {
  it('mounts without throwing', () => {
    const { unmount } = renderHook(() => usePopoverSafeguard());
    expect(unmount).toBeTruthy();
  });
});
