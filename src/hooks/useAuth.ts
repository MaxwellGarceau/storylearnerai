import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { authService, type AuthState } from '../lib/authService'
import type { BooleanPromise, VoidPromise } from '../types/common'

// Type aliases to avoid duplicate type definitions
type AuthSignInFunction = (email: string, password: string) => BooleanPromise
type AuthSignUpFunction = (email: string, password: string) => BooleanPromise

interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: string | null
  signIn: AuthSignInFunction
  signUp: AuthSignUpFunction
  signOut: () => VoidPromise
  resetPassword: (email: string) => BooleanPromise
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const updateState = useCallback((state: AuthState) => {
    setUser(state.user)
    setLoading(state.loading)
    setError(state.error)
  }, [])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const state = await authService.getInitialSession()
      updateState(state)
    }

    void getInitialSession()

    // Listen for auth changes
    const unsubscribe = authService.onAuthStateChange(updateState)

    return unsubscribe
  }, [updateState])

  const signIn = useCallback(async (email: string, password: string): BooleanPromise => {
    setLoading(true)
    setError(null)
    const state = await authService.signIn(email, password)
    updateState(state)
    return !state.error
  }, [updateState])

  const signUp = useCallback(async (email: string, password: string): BooleanPromise => {
    setLoading(true)
    setError(null)
    const state = await authService.signUp(email, password)
    updateState(state)
    return !state.error
  }, [updateState])

  const signOut = useCallback(async (): VoidPromise => {
    setLoading(true)
    setError(null)
    const state = await authService.signOut()
    updateState(state)
  }, [updateState])

  const resetPassword = useCallback(async (email: string): BooleanPromise => {
    setLoading(true)
    setError(null)
    const state = await authService.resetPassword(email)
    updateState(state)
    return !state.error
  }, [updateState])

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}

 