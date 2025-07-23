/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSupabase } from '../useSupabase'
import { supabase } from '../../api/supabase/client'

// Mock the supabase client
vi.mock('../../api/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
}))

// Mock the supabase client
const mockedSupabase = vi.mocked(supabase) as any

describe('useSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset all mocks to their default state
    mockedSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })
    mockedSupabase.auth.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => useSupabase())

      expect(result.current.user).toBe(null)
      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBe(null)
      expect(typeof result.current.signIn).toBe('function')
      expect(typeof result.current.signUp).toBe('function')
      expect(typeof result.current.signOut).toBe('function')
      expect(typeof result.current.resetPassword).toBe('function')

      // Wait for initial session check to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should set user when session exists', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
      } as any

      const mockSession = {
        user: mockUser,
        access_token: 'token',
        refresh_token: 'refresh',
      }

      mockedSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.user).toEqual(mockUser)
      })
    })

    it('should handle session error', async () => {
      const mockError = { message: 'Session error' }
      mockedSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError,
      })

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe('Session error')
      })
    })

    it('should handle session exception', async () => {
      mockedSupabase.auth.getSession.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe('Network error')
      })
    })
  })

  describe('Auth State Changes', () => {
    it('should listen for auth state changes', () => {
      renderHook(() => useSupabase())

      expect(mockedSupabase.auth.onAuthStateChange).toHaveBeenCalled()
    })

    it('should update user on auth state change', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      } as any

      const mockSession = {
        user: mockUser,
        access_token: 'token',
        refresh_token: 'refresh',
      }

      let authStateCallback: ((event: string, session: any) => void) | null = null

      mockedSupabase.auth.onAuthStateChange.mockImplementation((callback: any) => {
        authStateCallback = callback
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        }
      })

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Simulate auth state change
      act(() => {
        if (authStateCallback) {
          authStateCallback('SIGNED_IN', mockSession)
        }
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.loading).toBe(false)
    })

    it('should clear user on sign out', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      } as any

      const mockSession = {
        user: mockUser,
        access_token: 'token',
        refresh_token: 'refresh',
      }

      let authStateCallback: ((event: string, session: any) => void) | null = null

      mockedSupabase.auth.onAuthStateChange.mockImplementation((callback: any) => {
        authStateCallback = callback
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        }
      })

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Simulate sign in
      act(() => {
        if (authStateCallback) {
          authStateCallback('SIGNED_IN', mockSession)
        }
      })

      expect(result.current.user).toEqual(mockUser)

      // Simulate sign out
      act(() => {
        if (authStateCallback) {
          authStateCallback('SIGNED_OUT', null)
        }
      })

      expect(result.current.user).toBe(null)
    })
  })

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      } as any

      mockedSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { user: mockUser } },
        error: null,
      })

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signIn('test@example.com', 'password')
      })

      expect(mockedSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      })
      expect(result.current.error).toBe(null)
    })

    it('should handle sign in error', async () => {
      const mockError = { message: 'Invalid credentials' }
      mockedSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      })

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signIn('test@example.com', 'wrong-password')
      })

      expect(result.current.error).toBe('Invalid credentials')
    })

    it('should handle sign in exception', async () => {
      mockedSupabase.auth.signInWithPassword.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signIn('test@example.com', 'password')
      })

      expect(result.current.error).toBe('Network error')
    })
  })

  describe('signUp', () => {
    it('should sign up successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      } as any

      mockedSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: { user: mockUser } },
        error: null,
      })

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signUp('test@example.com', 'password')
      })

      expect(mockedSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      })
      expect(result.current.error).toBe(null)
    })

    it('should handle sign up error', async () => {
      const mockError = { message: 'Email already exists' }
      mockedSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      })

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signUp('existing@example.com', 'password')
      })

      expect(result.current.error).toBe('Email already exists')
    })

    it('should handle sign up exception', async () => {
      mockedSupabase.auth.signUp.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signUp('test@example.com', 'password')
      })

      expect(result.current.error).toBe('Network error')
    })
  })

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockedSupabase.auth.signOut.mockResolvedValue({
        error: null,
      })

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockedSupabase.auth.signOut).toHaveBeenCalled()
      expect(result.current.error).toBe(null)
    })

    it('should handle sign out error', async () => {
      const mockError = { message: 'Sign out failed' }
      mockedSupabase.auth.signOut.mockResolvedValue({
        error: mockError,
      })

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signOut()
      })

      expect(result.current.error).toBe('Sign out failed')
    })

    it('should handle sign out exception', async () => {
      mockedSupabase.auth.signOut.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signOut()
      })

      expect(result.current.error).toBe('Network error')
    })
  })

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      mockedSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      })

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.resetPassword('test@example.com')
      })

      expect(mockedSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com')
      expect(result.current.error).toBe(null)
    })

    it('should handle reset password error', async () => {
      const mockError = { message: 'User not found' }
      mockedSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: mockError,
      })

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.resetPassword('nonexistent@example.com')
      })

      expect(result.current.error).toBe('User not found')
    })

    it('should handle reset password exception', async () => {
      mockedSupabase.auth.resetPasswordForEmail.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.resetPassword('test@example.com')
      })

      expect(result.current.error).toBe('Network error')
    })
  })

  describe('Error Handling', () => {
    it('should clear error when starting new operation', async () => {
      // First, set an error
      const mockError = { message: 'Previous error' }
      mockedSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      })

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signIn('test@example.com', 'password')
      })

      expect(result.current.error).toBe('Previous error')

      // Now try a successful operation
      mockedSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      })

      await act(async () => {
        await result.current.signIn('test@example.com', 'password')
      })

      expect(result.current.error).toBe(null)
    })

    it('should handle non-Error exceptions', async () => {
      mockedSupabase.auth.signInWithPassword.mockRejectedValue('String error')

      const { result } = renderHook(() => useSupabase())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signIn('test@example.com', 'password')
      })

      expect(result.current.error).toBe('An error occurred')
    })
  })

  describe('Cleanup', () => {
    it('should unsubscribe from auth state changes on unmount', () => {
      const mockUnsubscribe = vi.fn()
      mockedSupabase.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      })

      const { unmount } = renderHook(() => useSupabase())

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })
}) 