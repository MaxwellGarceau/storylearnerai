import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Mock the auth service module BEFORE importing it anywhere
vi.mock('../../lib/authService', () => ({
  authService: {
    getInitialSession: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
}));

// Import after mocking
import { authService } from '../../lib/authService';
import { useAuth } from '../useAuth';

const mockUser = {
  id: '123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00Z',
} as unknown as any;

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('hook structure', () => {
    it('should return the expected interface', async () => {
      vi.mocked(authService.getInitialSession).mockResolvedValue({
        user: null,
        loading: false,
        error: null,
      });
      vi.mocked(authService.onAuthStateChange).mockReturnValue(vi.fn());

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current).toHaveProperty('user');
      });

      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('signIn');
      expect(result.current).toHaveProperty('signUp');
      expect(result.current).toHaveProperty('signOut');
      expect(result.current).toHaveProperty('resetPassword');
    });

    it('should initialize with correct default values', async () => {
      vi.mocked(authService.getInitialSession).mockResolvedValue({
        user: null,
        loading: false,
        error: null,
      });
      vi.mocked(authService.onAuthStateChange).mockReturnValue(vi.fn());

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.user).toBe(null);
      });
      expect(result.current.error).toBe(null);
    });

    it.skip('updates state when onAuthStateChange emits new state', async () => {
      let capturedCallback: (state: {
        user: any;
        loading: boolean;
        error: string | null;
      }) => void = () => {};
      vi.mocked(authService.getInitialSession).mockResolvedValue({
        user: null,
        loading: false,
        error: null,
      });
      vi.mocked(authService.onAuthStateChange).mockImplementation(cb => {
        capturedCallback = cb;
        return vi.fn();
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        capturedCallback({ user: mockUser, loading: false, error: null });
      });

      await waitFor(() => {
        expect(result.current.user).not.toBe(null);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
      });
    });
  });

  describe('auth service integration', () => {
    it.skip('calls auth service signIn and updates state', async () => {});
    it.skip('handles signIn error state and returns false', async () => {});
    it.skip('calls auth service signUp', async () => {});
    it.skip('calls auth service signOut', async () => {});
    it.skip('calls auth service resetPassword', async () => {});
  });
});
