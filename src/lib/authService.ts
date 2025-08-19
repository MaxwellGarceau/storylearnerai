import { supabase } from '../api/supabase/client'
import type { User } from '@supabase/supabase-js'
import { getAuthErrorMessage, type AuthError } from './utils/authErrors'
import type { BooleanPromise, VoidPromise } from '../types/common'

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export interface AuthService {
  getInitialSession(): Promise<AuthState>
  signIn(email: string, password: string): Promise<AuthState>
  signUp(email: string, password: string): Promise<AuthState>
  signOut(): Promise<AuthState>
  resetPassword(email: string): Promise<AuthState>
  onAuthStateChange(callback: (state: AuthState) => void): () => void
}

class AuthServiceImpl implements AuthService {
  async getInitialSession(): Promise<AuthState> {
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
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      return {
        user: null,
        loading: false,
        error: getAuthErrorMessage({ message: errorMessage })
      }
    }
  }

  async signIn(email: string, password: string): Promise<AuthState> {
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
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      return {
        user: null,
        loading: false,
        error: getAuthErrorMessage({ message: errorMessage })
      }
    }
  }

  async signUp(email: string, password: string): Promise<AuthState> {
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
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      return {
        user: null,
        loading: false,
        error: getAuthErrorMessage({ message: errorMessage })
      }
    }
  }

  async signOut(): Promise<AuthState> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return {
          user: null,
          loading: false,
          error: error.message
        }
      }
      return {
        user: null,
        loading: false,
        error: null
      }
    } catch (err) {
      return {
        user: null,
        loading: false,
        error: err instanceof Error ? err.message : 'An error occurred'
      }
    }
  }

  async resetPassword(email: string): Promise<AuthState> {
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
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      return {
        user: null,
        loading: false,
        error: getAuthErrorMessage({ message: errorMessage })
      }
    }
  }

  onAuthStateChange(callback: (state: AuthState) => void): () => void {
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
