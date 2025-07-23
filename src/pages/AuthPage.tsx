import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SignInForm } from '../components/auth/SignInForm'
import { SignUpForm } from '../components/auth/SignUpForm'
import { UserProfile } from '../components/auth/UserProfile'
import { useSupabase } from '../hooks/useSupabase'
import { Button } from '../components/ui/Button'
import { ArrowLeft } from 'lucide-react'

type AuthMode = 'signin' | 'signup' | 'profile'

export const AuthPage: React.FC = () => {
  const { user, loading } = useSupabase()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [mode, setMode] = useState<AuthMode>('signin')

  // Set initial mode based on URL parameter
  useEffect(() => {
    const urlMode = searchParams.get('mode') as AuthMode
    if (urlMode && ['signin', 'signup', 'profile'].includes(urlMode)) {
      setMode(urlMode)
    }
  }, [searchParams])

  // If user is already authenticated, show profile
  if (user && mode !== 'profile') {
    setMode('profile')
  }

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
              console.log('Forgot password clicked')
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