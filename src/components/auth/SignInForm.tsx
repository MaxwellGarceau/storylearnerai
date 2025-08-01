import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import Label from '../ui/Label'
import { useSupabase } from '../../hooks/useSupabase'
import { Alert } from '../ui/Alert'
import { Loader2, Mail, Lock } from 'lucide-react'
import { validateEmail } from '../../lib/utils/sanitization'

interface SignInFormProps {
  onSuccess?: () => void
  onSwitchToSignUp?: () => void
  onForgotPassword?: () => void
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onSuccess,
  onSwitchToSignUp,
  onForgotPassword
}) => {
  const { signIn, loading, error } = useSupabase()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({})
  const [hasValidationErrors, setHasValidationErrors] = useState(false)

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    // Validate and sanitize input
    if (field === 'email') {
      const validation = validateEmail(value)
      if (validation.isValid) {
        setValidationErrors(prev => ({ ...prev, email: undefined }))
        setFormData(prev => ({ ...prev, email: validation.sanitizedText }))
        setHasValidationErrors(false)
      } else {
        setValidationErrors(prev => ({ 
          ...prev, 
          email: validation.errors[0] || 'Invalid email format'
        }))
        setFormData(prev => ({ ...prev, email: validation.sanitizedText }))
        setHasValidationErrors(true)
      }
    } else {
      // For password, just sanitize without validation (password validation is handled by Supabase)
      setValidationErrors(prev => ({ ...prev, password: undefined }))
      setFormData(prev => ({ ...prev, password: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if there are any validation errors
    if (hasValidationErrors) {
      return
    }
    
    // Final validation before submission
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) {
      setValidationErrors(prev => ({ 
        ...prev, 
        email: emailValidation.errors[0] || 'Invalid email format'
      }))
      setHasValidationErrors(true)
      return
    }
    
    // Clear any validation errors if validation passes
    setValidationErrors({})
    setHasValidationErrors(false)
    
    const success = await signIn(formData.email, formData.password)
    
    if (success) {
      onSuccess?.()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <p>{error}</p>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  validationErrors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-input'
                }`}
                required
                disabled={loading}
              />
            </div>
            {validationErrors.email && (
              <p className="text-sm text-red-500">{validationErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-primary hover:underline"
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-primary hover:underline font-medium"
              disabled={loading}
            >
              Sign up
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 