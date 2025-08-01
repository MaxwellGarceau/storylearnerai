import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabase } from '../../hooks/useSupabase'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useSupabase()
  const navigate = useNavigate()

  useEffect(() => {
    // Only redirect if we're not loading and there's no user
    if (!loading && !user) {
      void navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Checking authentication...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If no user, don't render children (will redirect)
  if (!user) {
    return null
  }

  // If user is authenticated, render the protected content
  return <>{children}</>
} 