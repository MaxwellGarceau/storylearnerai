import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../api/supabase/client'
import type { User } from '@supabase/supabase-js'
import { getAuthErrorMessage, type AuthError } from '../lib/utils/authErrors'
import type { BooleanPromise, VoidPromise } from '../types/common'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => BooleanPromise
  signUp: (email: string, password: string) => BooleanPromise
  signOut: () => VoidPromise
  resetPassword: (email: string) => BooleanPromise
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          const authError: AuthError = {
            message: error.message,
            code: error.name,
            status: error.status
          }
          setError(getAuthErrorMessage(authError))
        } else {
          setUser(session?.user ?? null)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(getAuthErrorMessage({ message: errorMessage }))
      } finally {
        setLoading(false)
      }
    }

    void getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string): BooleanPromise => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        const authError: AuthError = {
          message: error.message,
          code: error.name,
          status: error.status
        }
        setError(getAuthErrorMessage(authError))
        return false
      }
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(getAuthErrorMessage({ message: errorMessage }))
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string): BooleanPromise => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        const authError: AuthError = {
          message: error.message,
          code: error.name,
          status: error.status
        }
        setError(getAuthErrorMessage(authError))
        return false
      }
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(getAuthErrorMessage({ message: errorMessage }))
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async (): VoidPromise => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (email: string): BooleanPromise => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) {
        const authError: AuthError = {
          message: error.message,
          code: error.name,
          status: error.status
        }
        setError(getAuthErrorMessage(authError))
        return false
      }
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(getAuthErrorMessage({ message: errorMessage }))
      return false
    } finally {
      setLoading(false)
    }
  }, [])

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

 