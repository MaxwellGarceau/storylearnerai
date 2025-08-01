import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SignInForm } from '../components/auth/SignInForm'
import { SignUpForm } from '../components/auth/SignUpForm'
import { UserProfile } from '../components/auth/UserProfile'
import { useSupabase } from '../hooks/useSupabase'
import { Button } from '../components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import { logger } from '../lib/logger'

type AuthMode = 'signin' | 'signup' | 'profile'

export const AuthPage: React.FC = () => {
  const { user, loading } = useSupabase()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [mode, setMode] = useState<AuthMode>('signin')
  const hasSetProfileMode = useRef(false)

  // Set initial mode based on URL parameter and user state
  useEffect(() => {
    const urlMode = searchParams.get('mode') as AuthMode
    
    // If user is already authenticated and we haven't set profile mode yet, show profile
    if (user && !hasSetProfileMode.current) {
      setMode('profile')
      hasSetProfileMode.current = true
    }
    // Otherwise, use URL parameter if valid
    else if (urlMode && ['signin', 'signup', 'profile'].includes(urlMode)) {
      setMode(urlMode)
    }
  }, [searchParams, user])

  const handleAuthSuccess = () => {
    navigate('/dashboard')
  }

  const handleClose = () => {
    navigate('/')
  }

  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setSearchParams({ mode: newMode })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Auth Content */}
        {mode === 'signin' && (
          <SignInForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignUp={() => handleSwitchMode('signup')}
            onForgotPassword={() => {
              // TODO: Implement forgot password functionality
              logger.info('auth', 'Forgot password clicked')
            }}
          />
        )}

        {mode === 'signup' && (
          <SignUpForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignIn={() => handleSwitchMode('signin')}
          />
        )}

        {mode === 'profile' && user && (
          <UserProfile onClose={handleClose} />
        )}
      </div>
    </div>
  )
} 