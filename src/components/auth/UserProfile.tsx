import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import Label from '../ui/Label'
import { Badge } from '../ui/Badge'
import { Alert } from '../ui/Alert'
import { useSupabase } from '../../hooks/useSupabase'
import { UserService } from '../../api/supabase'
import { Loader2, User, Mail, Globe, Edit, Save, X, Camera } from 'lucide-react'

interface UserProfileProps {
  onClose?: () => void
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, signOut } = useSupabase()
  const [profile, setProfile] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    preferred_language: 'en'
  })

  const loadProfile = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const userProfile = await UserService.getOrCreateUser(user.id, {
        username: user.email?.split('@')[0] || '',
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || ''
      })
      setProfile(userProfile)
      setFormData({
        username: userProfile.username || '',
        display_name: userProfile.display_name || '',
        preferred_language: userProfile.preferred_language || 'en'
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user, loadProfile])

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)
      setError(null)
      
      const updatedProfile = await UserService.updateUser(user.id, formData)
      setProfile(updatedProfile)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      username: profile?.username || '',
      display_name: profile?.display_name || '',
      preferred_language: profile?.preferred_language || 'en'
    })
    setIsEditing(false)
    setError(null)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      onClose?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out')
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
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading profile...</span>
        </CardContent>
      </Card>
    )
  }

  if (!user || !profile) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <p>Failed to load user profile</p>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Profile</CardTitle>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Close
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Manage your account settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <p>{error}</p>
          </Alert>
        )}

        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-primary" />
              )}
            </div>
            {isEditing && (
              <button className="absolute -bottom-1 -right-1 p-1 bg-primary text-primary-foreground rounded-full hover:bg-primary/90">
                <Camera className="h-3 w-3" />
              </button>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  className="w-full px-2 py-1 border border-input rounded bg-background text-sm"
                  placeholder="Display name"
                />
              ) : (
                profile.display_name || 'No display name'
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-2 py-1 border border-input rounded bg-background text-sm"
                  placeholder="Username"
                />
              ) : (
                `@${profile.username || 'username'}`
              )}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            <Mail className="h-4 w-4 inline mr-2" />
            Email
          </Label>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        {/* Preferred Language */}
        <div className="space-y-2">
          <Label htmlFor="language">
            <Globe className="h-4 w-4 inline mr-2" />
            Preferred Language
          </Label>
          {isEditing ? (
            <select
              id="language"
              value={formData.preferred_language}
              onChange={(e) => handleInputChange('preferred_language', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="ru">Russian</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="zh">Chinese</option>
            </select>
          ) : (
            <Badge variant="secondary">
              {getLanguageName(profile.preferred_language)}
            </Badge>
          )}
        </div>

        {/* Account Info */}
        <div className="space-y-2">
          <Label htmlFor="account-info">Account Information</Label>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Member since: {new Date(profile.created_at).toLocaleDateString()}</p>
            <p>Last updated: {new Date(profile.updated_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing ? (
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 