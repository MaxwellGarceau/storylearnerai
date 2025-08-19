import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import Label from '../ui/Label'
import { useAuth } from '../../hooks/useAuth'
import { Alert } from '../ui/Alert'
import { Loader2, Mail, Lock, User, Check, X } from 'lucide-react'
import { validateEmail, validateUsername, validateDisplayName } from '../../lib/utils/sanitization'
import type { VoidFunction } from '../../types/common'

interface SignUpFormProps {
  onSuccess?: VoidFunction
  onSwitchToSignIn?: VoidFunction
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSuccess,
  onSwitchToSignIn
}) => {
  const { signUp, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: ''
  })
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    username?: string;
    displayName?: string;
  }>({})

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    // Validate and sanitize input based on field type
    if (field === 'email') {
      const validation = validateEmail(value)
      if (validation.isValid) {
        setValidationErrors(prev => ({ ...prev, email: undefined }))
        setFormData(prev => ({ ...prev, email: validation.sanitizedText }))
      } else {
        setValidationErrors(prev => ({ 
          ...prev, 
          email: validation.errors[0] || 'Invalid email format'
        }))
        setFormData(prev => ({ ...prev, email: validation.sanitizedText }))
      }
    } else if (field === 'username') {
      const validation = validateUsername(value)
      if (validation.isValid) {
        setValidationErrors(prev => ({ ...prev, username: undefined }))
        setFormData(prev => ({ ...prev, username: validation.sanitizedText }))
      } else {
        setValidationErrors(prev => ({ 
          ...prev, 
          username: validation.errors[0] || 'Invalid username format'
        }))
        setFormData(prev => ({ ...prev, username: validation.sanitizedText }))
      }
    } else if (field === 'displayName') {
      const validation = validateDisplayName(value)
      if (validation.isValid) {
        setValidationErrors(prev => ({ ...prev, displayName: undefined }))
        setFormData(prev => ({ ...prev, displayName: validation.sanitizedText }))
      } else {
        setValidationErrors(prev => ({ 
          ...prev, 
          displayName: validation.errors[0] || 'Invalid display name format'
        }))
        setFormData(prev => ({ ...prev, displayName: validation.sanitizedText }))
      }
    } else {
      // For password fields, just update the value
      setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Check password strength when password changes
    if (field === 'password') {
      setPasswordStrength({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      })
    }
  }

  const isPasswordValid = Object.values(passwordStrength).every(Boolean)
  const doPasswordsMatch = formData.password === formData.confirmPassword
  const hasValidationErrors = Object.values(validationErrors).some(error => error !== undefined)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Final validation before submission
    const emailValidation = validateEmail(formData.email)
    const usernameValidation = validateUsername(formData.username)
    const displayNameValidation = validateDisplayName(formData.displayName)
    
    if (!emailValidation.isValid || !usernameValidation.isValid || !displayNameValidation.isValid) {
      setValidationErrors({
        email: emailValidation.isValid ? undefined : emailValidation.errors[0],
        username: usernameValidation.isValid ? undefined : usernameValidation.errors[0],
        displayName: displayNameValidation.isValid ? undefined : displayNameValidation.errors[0],
      })
      return
    }
    
    if (!isPasswordValid) {
      return
    }

    if (!doPasswordsMatch) {
      return
    }
    
    const success = await signUp(formData.email, formData.password)
    
    if (success) {
      onSuccess?.()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
        <CardDescription className="text-center">
          Enter your details to create your account
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
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  validationErrors.username ? 'border-red-500 focus-visible:ring-red-500' : 'border-input'
                }`}
                required
                disabled={loading}
              />
            </div>
            {validationErrors.username && (
              <p className="text-sm text-red-500">{validationErrors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="displayName"
                type="text"
                placeholder="Enter your display name"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  validationErrors.displayName ? 'border-red-500 focus-visible:ring-red-500' : 'border-input'
                }`}
                required
                disabled={loading}
              />
            </div>
            {validationErrors.displayName && (
              <p className="text-sm text-red-500">{validationErrors.displayName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={loading}
              />
            </div>
            
            {/* Password strength indicator */}
            {formData.password && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {passwordStrength.length ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                  <span>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordStrength.uppercase ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                  <span>One uppercase letter</span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordStrength.lowercase ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                  <span>One lowercase letter</span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordStrength.number ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                  <span>One number</span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordStrength.special ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                  <span>One special character</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  formData.confirmPassword && !doPasswordsMatch 
                    ? 'border-red-500 focus-visible:ring-red-500' 
                    : 'border-input'
                }`}
                required
                disabled={loading}
              />
            </div>
            {formData.confirmPassword && !doPasswordsMatch && (
              <p className="text-sm text-red-500">Passwords do not match</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !isPasswordValid || !doPasswordsMatch || hasValidationErrors}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-primary hover:underline font-medium"
              disabled={loading}
            >
              Sign in
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 