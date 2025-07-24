import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../api/supabase/client'
import type { User } from '@supabase/supabase-js'
import { getAuthErrorMessage, type AuthError } from '../lib/utils/authErrors'

export interface UseSupabaseReturn {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
}

export function useSupabase(): UseSupabaseReturn {
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

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
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

  const signUp = useCallback(async (email: string, password: string): Promise<boolean> => {
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

  const signOut = useCallback(async () => {
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

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
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

// Hook for real-time subscriptions
export function useRealtimeSubscription<T>(
  table: string,
  callback: (payload: T) => void,
  filter?: string
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes' as never,
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        callback
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, callback, filter])
}

// Hook for data fetching with loading and error states
export function useSupabaseQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const executeQuery = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await queryFn()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [queryFn])

  useEffect(() => {
    executeQuery()
  }, [executeQuery, dependencies])

  const refetch = useCallback(() => {
    executeQuery()
  }, [executeQuery])

  return { data, loading, error, refetch }
} 