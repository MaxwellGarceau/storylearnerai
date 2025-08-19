/**
 * Maps Supabase authentication errors to user-friendly messages
 */

export interface AuthError {
  message: string
  code?: string
  status?: number
}

export function getAuthErrorMessage(error: AuthError): string {
  const { message, code, status } = error

  // Handle specific error codes and status codes
  switch (code) {
    case 'invalid_credentials':
    case 'Invalid login credentials':
      return 'Invalid email or password. Please check your credentials and try again.'
    
    case 'user_not_found':
      return 'No account found with this email address. Please check your email or sign up for a new account.'
    
    case 'email_not_confirmed':
      return 'Please check your email and click the confirmation link to verify your account.'
    
    case 'weak_password':
      return 'Password is too weak. Please choose a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.'
    
    case 'email_already_in_use':
      return 'An account with this email address already exists. Please sign in instead.'
    
    case 'too_many_requests':
      return 'Too many login attempts. Please wait a few minutes before trying again.'
    
    case 'invalid_email':
      return 'Please enter a valid email address.'
    
    case 'password_mismatch':
      return 'Passwords do not match. Please try again.'
    
    default:
      // Handle by status code if no specific code is provided
      switch (status) {
        case 400:
          return 'Invalid email or password. Please check your credentials and try again.'
        
        case 401:
          return 'Authentication failed. Please check your credentials and try again.'
        
        case 403:
          return 'Access denied. Please check your credentials and try again.'
        
        case 404:
          return 'Account not found. Please check your email address or sign up for a new account.'
        
        case 429:
          return 'Too many requests. Please wait a few minutes before trying again.'
        
        case 500:
        case 502:
        case 503:
        case 504:
          return 'Server error. Please try again later.'
        
        default:
          // Fallback to original message if we can't map it
          return message || 'An unexpected error occurred. Please try again.'
      }
  }
} 