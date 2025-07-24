import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabase } from '../hooks/useSupabase'
import { UserService } from '../api/supabase'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'
import { 
  BookOpen, 
  Plus,
  User,
  Globe,
  Loader2
} from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const { user } = useSupabase()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<User | null>(null)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Load user profile
      const userProfile = await UserService.getUser(user.id)
      setProfile(userProfile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese'
    }
    return languages[code] || code
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <p>Please sign in to access your dashboard</p>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {error && (
          <Alert variant="destructive">
            <p>{error}</p>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {profile?.display_name || user.email?.split('@')[0]}!</h1>
            <p className="text-muted-foreground">Your language learning dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Profile
            </Button>
            <Button
              onClick={() => navigate('/translate')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Translation
            </Button>
          </div>
        </div>

        {/* Quick Start Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Get Started
            </CardTitle>
            <CardDescription>
              Start translating and learning with Story Learner AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Ready to start your language learning journey?</p>
              <Button
                onClick={() => navigate('/translate')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Start Translating
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Profile Information */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Your Profile
              </CardTitle>
              <CardDescription>
                Your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Display Name</h4>
                  <p className="text-muted-foreground">
                    {profile.display_name || 'Not set'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Username</h4>
                  <p className="text-muted-foreground">
                    {profile.username ? `@${profile.username}` : 'Not set'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Preferred Language</h4>
                  <Badge variant="secondary">
                    {getLanguageName(profile.preferred_language)}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Member Since</h4>
                  <p className="text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 