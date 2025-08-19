import { supabase } from '../api/supabase/client'
import type { User } from '@supabase/supabase-js'
import { getAuthErrorMessage, type AuthError } from './utils/authErrors'

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// Type aliases to avoid duplicate type definitions
type AuthStatePromise = Promise<AuthState>
type AuthStateCallback = (state: AuthState) => void
type UnsubscribeFunction = () => void

export interface AuthService {
  getInitialSession(): AuthStatePromise
  signIn(email: string, password: string): AuthStatePromise
  signUp(email: string, password: string): AuthStatePromise
  signOut(): AuthStatePromise
  resetPassword(email: string): AuthStatePromise
  onAuthStateChange(callback: AuthStateCallback): UnsubscribeFunction
}

class AuthServiceImpl implements AuthService {
  async getInitialSession(): AuthStatePromise {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        const authError: AuthError = {
          message: error.message,
          code: error.name,
          status: error.status
        }
        return {
          user: null,
          loading: false,
          error: getAuthErrorMessage(authError)
        }
      }
      return {
        user: session?.user ?? null,
        loading: false,
        error: null
      }
    } catch (err) {
      const authError: AuthError = {
        message: err instanceof Error ? err.message : 'An error occurred',
        code: 'unknown_error',
        status: 500
      }
      return {
        user: null,
        loading: false,
        error: getAuthErrorMessage(authError)
      }
    }
  }

  async signIn(email: string, password: string): AuthStatePromise {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        const authError: AuthError = {
          message: error.message,
          code: error.name,
          status: error.status
        }
        return {
          user: null,
          loading: false,
          error: getAuthErrorMessage(authError)
        }
      }
      return {
        user: data.user,
        loading: false,
        error: null
      }
    } catch (err) {
      const authError: AuthError = {
        message: err instanceof Error ? err.message : 'An error occurred',
        code: 'unknown_error',
        status: 500
      }
      return {
        user: null,
        loading: false,
        error: getAuthErrorMessage(authError)
      }
    }
  }

  async signUp(email: string, password: string): AuthStatePromise {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        const authError: AuthError = {
          message: error.message,
          code: error.name,
          status: error.status
        }
        return {
          user: null,
          loading: false,
          error: getAuthErrorMessage(authError)
        }
      }
      return {
        user: data.user,
        loading: false,
        error: null
      }
    } catch (err) {
      const authError: AuthError = {
        message: err instanceof Error ? err.message : 'An error occurred',
        code: 'unknown_error',
        status: 500
      }
      return {
        user: null,
        loading: false,
        error: getAuthErrorMessage(authError)
      }
    }
  }

  async signOut(): AuthStatePromise {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        const authError: AuthError = {
          message: error.message,
          code: error.name,
          status: error.status
        }
        return {
          user: null,
          loading: false,
          error: getAuthErrorMessage(authError)
        }
      }
      return {
        user: null,
        loading: false,
        error: null
      }
    } catch (err) {
      const authError: AuthError = {
        message: err instanceof Error ? err.message : 'An error occurred',
        code: 'unknown_error',
        status: 500
      }
      return {
        user: null,
        loading: false,
        error: getAuthErrorMessage(authError)
      }
    }
  }

  async resetPassword(email: string): AuthStatePromise {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) {
        const authError: AuthError = {
          message: error.message,
          code: error.name,
          status: error.status
        }
        return {
          user: null,
          loading: false,
          error: getAuthErrorMessage(authError)
        }
      }
      return {
        user: null,
        loading: false,
        error: null
      }
    } catch (err) {
      const authError: AuthError = {
        message: err instanceof Error ? err.message : 'An error occurred',
        code: 'unknown_error',
        status: 500
      }
      return {
        user: null,
        loading: false,
        error: getAuthErrorMessage(authError)
      }
    }
  }

  onAuthStateChange(callback: AuthStateCallback): UnsubscribeFunction {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const state: AuthState = {
          user: session?.user ?? null,
          loading: false,
          error: null
        }
        callback(state)
      }
    )

    return () => subscription.unsubscribe()
  }
}

// Export singleton instance
export const authService = new AuthServiceImpl()
