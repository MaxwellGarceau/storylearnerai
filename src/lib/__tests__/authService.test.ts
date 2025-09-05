import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../authService';
import { supabase } from '../../api/supabase/client';

// Mock Supabase client
vi.mock('../../api/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getInitialSession', () => {
    it('should return user when session exists', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { user: mockUser };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as Awaited<ReturnType<typeof supabase.auth.getSession>>);

      const result = await authService.getInitialSession();

      expect(result).toEqual({
        user: mockUser,
        loading: false,
        error: null,
      });
    });

    it('should return null user when no session exists', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as Awaited<ReturnType<typeof supabase.auth.getSession>>);

      const result = await authService.getInitialSession();

      expect(result).toEqual({
        user: null,
        loading: false,
        error: null,
      });
    });

    it('should handle authentication errors', async () => {
      const mockError = {
        message: 'Invalid session',
        name: 'AuthError',
        status: 401,
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: mockError,
      } as Awaited<ReturnType<typeof supabase.auth.getSession>>);

      const result = await authService.getInitialSession();

      expect(result).toEqual({
        user: null,
        loading: false,
        error:
          'Authentication failed. Please check your credentials and try again.',
      });
    });

    it('should handle unexpected errors', async () => {
      vi.mocked(supabase.auth.getSession).mockRejectedValue(
        new Error('Network error')
      );

      const result = await authService.getInitialSession();

      expect(result).toEqual({
        user: null,
        loading: false,
        error: 'Server error. Please try again later.',
      });
    });
  });

  describe('signIn', () => {
    it('should return user on successful sign in', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { user: mockUser };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      } as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>);

      const result = await authService.signIn('test@example.com', 'password');

      expect(result).toEqual({
        user: mockUser,
        loading: false,
        error: null,
      });
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should handle sign in errors', async () => {
      const mockError = {
        message: 'Invalid credentials',
        name: 'AuthError',
        status: 400,
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      } as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>);

      const result = await authService.signIn(
        'test@example.com',
        'wrong-password'
      );

      expect(result).toEqual({
        user: null,
        loading: false,
        error:
          'Invalid email or password. Please check your credentials and try again.',
      });
    });
  });

  describe('signUp', () => {
    it('should return user on successful sign up', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { user: mockUser };

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      } as Awaited<ReturnType<typeof supabase.auth.signUp>>);

      const result = await authService.signUp('test@example.com', 'password');

      expect(result).toEqual({
        user: mockUser,
        loading: false,
        error: null,
      });
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should handle sign up errors', async () => {
      const mockError = {
        message: 'Email already exists',
        name: 'AuthError',
        status: 400,
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      } as Awaited<ReturnType<typeof supabase.auth.signUp>>);

      const result = await authService.signUp(
        'existing@example.com',
        'password'
      );

      expect(result).toEqual({
        user: null,
        loading: false,
        error:
          'Invalid email or password. Please check your credentials and try again.',
      });
    });
  });

  describe('signOut', () => {
    it('should return null user on successful sign out', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      } as Awaited<ReturnType<typeof supabase.auth.signOut>>);

      const result = await authService.signOut();

      expect(result).toEqual({
        user: null,
        loading: false,
        error: null,
      });
    });

    it('should handle sign out errors', async () => {
      const mockError = {
        message: 'Sign out failed',
        name: 'AuthError',
        status: 500,
      };

      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: mockError,
      } as Awaited<ReturnType<typeof supabase.auth.signOut>>);

      const result = await authService.signOut();

      expect(result).toEqual({
        user: null,
        loading: false,
        error: 'Server error. Please try again later.',
      });
    });
  });

  describe('resetPassword', () => {
    it('should return success on password reset', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      } as Awaited<ReturnType<typeof supabase.auth.resetPasswordForEmail>>);

      const result = await authService.resetPassword('test@example.com');

      expect(result).toEqual({
        user: null,
        loading: false,
        error: null,
      });
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
    });

    it('should handle password reset errors', async () => {
      const mockError = {
        message: 'User not found',
        name: 'AuthError',
        status: 404,
      };

      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: null,
        error: mockError,
      } as Awaited<ReturnType<typeof supabase.auth.resetPasswordForEmail>>);

      const result = await authService.resetPassword('nonexistent@example.com');

      expect(result).toEqual({
        user: null,
        loading: false,
        error:
          'Account not found. Please check your email address or sign up for a new account.',
      });
    });
  });

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      const mockSubscription = { unsubscribe: mockUnsubscribe };

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription },
      } as unknown as ReturnType<typeof supabase.auth.onAuthStateChange>);

      const unsubscribe = authService.onAuthStateChange(mockCallback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback with auth state when auth changes', () => {
      const mockCallback = vi.fn();
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { user: mockUser };
      const mockUnsubscribe = vi.fn();
      const mockSubscription = { unsubscribe: mockUnsubscribe };

      let authChangeCallback:
        | ((event: string, session: unknown) => void)
        | undefined;

      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(
        callback => {
          authChangeCallback = callback as (
            event: string,
            session: unknown
          ) => void;
          return {
            data: { subscription: mockSubscription },
          } as unknown as ReturnType<typeof supabase.auth.onAuthStateChange>;
        }
      );

      authService.onAuthStateChange(mockCallback);

      // Simulate auth state change
      if (authChangeCallback) {
        authChangeCallback('SIGNED_IN', mockSession);
      }

      expect(mockCallback).toHaveBeenCalledWith({
        user: mockUser,
        loading: false,
        error: null,
      });
    });
  });
});
