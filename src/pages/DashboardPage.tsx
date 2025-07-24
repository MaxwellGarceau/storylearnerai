import React, { useState, useEffect, useCallback } from 'react'
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
  User as UserIcon,
  Globe,
  Loader2
} from 'lucide-react'
import type { Database } from '../api/supabase/client'

type User = Database['public']['Tables']['users']['Row']

export const DashboardPage: React.FC = () => {
  const { user } = useSupabase()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<User | null>(null)

  const loadDashboardData = useCallback(async () => {
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
  }, [user])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    } else {
      setLoading(false)
    }
  }, [user, loadDashboardData])

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
      <div className="p-6">
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
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <p>Please sign in to access your dashboard</p>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
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
              onClick={() => navigate('/auth?mode=profile')}
              className="flex items-center gap-2"
            >
              <UserIcon className="h-4 w-4" />
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Translations</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Stories translated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Languages</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                {getLanguageName(profile?.preferred_language || 'en')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Level</CardTitle>
              <Badge variant="secondary">Beginner</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Beginner</div>
              <p className="text-xs text-muted-foreground">
                Current difficulty level
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/translate')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  New Translation
                </CardTitle>
                <CardDescription>
                  Start translating a new story
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/saved-translations')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  View Saved
                </CardTitle>
                <CardDescription>
                  Review your saved translations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/auth?mode=profile')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                   Edit Profile
                </CardTitle>
                <CardDescription>
                   Update your preferences
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Card>
            <CardHeader>
              <CardTitle>No recent activity</CardTitle>
              <CardDescription>
                Start translating stories to see your activity here
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
} 