import { describe, it, expect } from 'vitest'
import { getAuthErrorMessage, isInvalidCredentialsError, isRateLimitError, type AuthError } from '../authErrors'

describe('Auth Error Utilities', () => {
  describe('getAuthErrorMessage', () => {
    it('should return empty string for null error', () => {
      expect(getAuthErrorMessage(null)).toBe('')
    })

    it('should return string error as is', () => {
      const error = 'Some error message'
      expect(getAuthErrorMessage(error)).toBe(error)
    })

    it('should map invalid credentials error', () => {
      const error: AuthError = {
        message: 'Invalid login credentials',
        code: 'invalid_credentials',
        status: 400
      }
      expect(getAuthErrorMessage(error)).toBe('Invalid email or password. Please check your credentials and try again.')
    })

    it('should map user not found error', () => {
      const error: AuthError = {
        message: 'User not found',
        code: 'user_not_found',
        status: 404
      }
      expect(getAuthErrorMessage(error)).toBe('No account found with this email address. Please check your email or sign up for a new account.')
    })

    it('should map email not confirmed error', () => {
      const error: AuthError = {
        message: 'Email not confirmed',
        code: 'email_not_confirmed'
      }
      expect(getAuthErrorMessage(error)).toBe('Please check your email and click the confirmation link to verify your account.')
    })

    it('should map weak password error', () => {
      const error: AuthError = {
        message: 'Password is too weak',
        code: 'weak_password'
      }
      expect(getAuthErrorMessage(error)).toBe('Password is too weak. Please choose a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.')
    })

    it('should map email already in use error', () => {
      const error: AuthError = {
        message: 'Email already in use',
        code: 'email_already_in_use'
      }
      expect(getAuthErrorMessage(error)).toBe('An account with this email address already exists. Please sign in instead.')
    })

    it('should map too many requests error', () => {
      const error: AuthError = {
        message: 'Too many requests',
        code: 'too_many_requests',
        status: 429
      }
      expect(getAuthErrorMessage(error)).toBe('Too many login attempts. Please wait a few minutes before trying again.')
    })

    it('should map 400 status code to invalid credentials message', () => {
      const error: AuthError = {
        message: 'Bad Request',
        status: 400
      }
      expect(getAuthErrorMessage(error)).toBe('Invalid email or password. Please check your credentials and try again.')
    })

    it('should map 500 status code to server error message', () => {
      const error: AuthError = {
        message: 'Internal Server Error',
        status: 500
      }
      expect(getAuthErrorMessage(error)).toBe('Server error. Please try again later.')
    })

    it('should fallback to original message for unknown errors', () => {
      const error: AuthError = {
        message: 'Unknown error occurred',
        code: 'unknown_error'
      }
      expect(getAuthErrorMessage(error)).toBe('Unknown error occurred')
    })
  })

  describe('isInvalidCredentialsError', () => {
    it('should return false for null error', () => {
      expect(isInvalidCredentialsError(null)).toBe(false)
    })

    it('should detect invalid credentials error code', () => {
      const error: AuthError = {
        message: 'Invalid login credentials',
        code: 'invalid_credentials'
      }
      expect(isInvalidCredentialsError(error)).toBe(true)
    })

    it('should detect 400 status code', () => {
      const error: AuthError = {
        message: 'Bad Request',
        status: 400
      }
      expect(isInvalidCredentialsError(error)).toBe(true)
    })

    it('should detect invalid credentials in string message', () => {
      expect(isInvalidCredentialsError('Invalid credentials provided')).toBe(true)
    })

    it('should return false for other error types', () => {
      const error: AuthError = {
        message: 'Server error',
        status: 500
      }
      expect(isInvalidCredentialsError(error)).toBe(false)
    })
  })

  describe('isRateLimitError', () => {
    it('should return false for null error', () => {
      expect(isRateLimitError(null)).toBe(false)
    })

    it('should detect too many requests error code', () => {
      const error: AuthError = {
        message: 'Too many requests',
        code: 'too_many_requests'
      }
      expect(isRateLimitError(error)).toBe(true)
    })

    it('should detect 429 status code', () => {
      const error: AuthError = {
        message: 'Too Many Requests',
        status: 429
      }
      expect(isRateLimitError(error)).toBe(true)
    })

    it('should detect rate limit in string message', () => {
      expect(isRateLimitError('Rate limit exceeded')).toBe(true)
    })

    it('should return false for other error types', () => {
      const error: AuthError = {
        message: 'Server error',
        status: 500
      }
      expect(isRateLimitError(error)).toBe(false)
    })
  })
}) 