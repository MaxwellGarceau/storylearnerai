import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/Card';
import Label from '../ui/Label';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { useAuth } from '../../hooks/useAuth';
import { useLanguages } from '../../hooks/useLanguages';
import { UserService } from '../../api/supabase/database/userProfileService';
import {
  validateUsername,
  validateDisplayName,
  sanitizeText,
} from '../../lib/utils/sanitization';
import type { DatabaseUserInsert } from '../../types/database/user';
import type { LanguageCode } from '../../types/llm/prompts';
import type { VoidFunction } from '../../types/common';

import {
  Loader2,
  User,
  Mail,
  Globe,
  Edit,
  Save,
  X,
  Camera,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserProfileProps {
  onClose?: VoidFunction;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, signOut } = useAuth();
  const { languages } = useLanguages();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<DatabaseUserInsert | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    display_name?: string;
  }>({});
  const [formData, setFormData] = useState<{
    username: string;
    display_name: string;
    native_language: LanguageCode;
  }>({
    username: '',
    display_name: '',
    native_language: 'en',
  });

  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userProfile = await UserService.getOrCreateUser(user.id, {
        username: user.email?.split('@')[0] ?? '',
        display_name:
          (user.user_metadata as { display_name?: string })?.display_name ??
          user.email?.split('@')[0] ??
          '',
      });
      setProfile(userProfile);
      setFormData({
        username: userProfile.username ?? '',
        display_name: userProfile.display_name ?? '',
        // @ts-expect-error migrating field name
        native_language: (userProfile as any).native_language ?? 'en',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      void loadProfile();
    }
  }, [user, loadProfile]);

  const validateField = (field: 'username' | 'display_name', value: string) => {
    let error = '';

    if (field === 'username') {
      const validation = validateUsername(value);
      if (!validation.isValid) {
        error = validation.errors[0] || 'Invalid username';
      }
    } else if (field === 'display_name') {
      const validation = validateDisplayName(value);
      if (!validation.isValid) {
        error = validation.errors[0] || 'Invalid display name';
      }
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: error,
    }));

    return error === '';
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    // Sanitize input
    const sanitizedValue = sanitizeText(value, {
      maxLength: field === 'username' ? 30 : 50,
    });

    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue as never,
    }));

    // Validate if it's a field we validate
    if (field === 'username' || field === 'display_name') {
      validateField(field, sanitizedValue);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate all fields before saving
    const isUsernameValid = validateField('username', formData.username);
    const isDisplayNameValid = validateField(
      'display_name',
      formData.display_name
    );

    if (!isUsernameValid || !isDisplayNameValid) {
      setError('Please fix validation errors before saving');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // @ts-expect-error migrating field name
      const updatedProfile = await UserService.updateUser(user.id, formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      setValidationErrors({}); // Clear validation errors on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: profile?.username ?? '',
      display_name: profile?.display_name ?? '',
      // @ts-expect-error migrating field name
      native_language: (profile as any)?.native_language ?? 'en',
    });
    setIsEditing(false);
    setError(null);
    setValidationErrors({}); // Clear validation errors
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardContent className='flex items-center justify-center p-6'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span className='ml-2'>{t('auth.userProfile.loading')}</span>
        </CardContent>
      </Card>
    );
  }

  if (!user || !profile) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardContent className='p-6'>
          <Alert variant='destructive'>
            <p>{t('auth.userProfile.errors.loadFailed')}</p>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-2xl font-bold'>
            {t('auth.userProfile.title')}
          </CardTitle>
          <div className='flex items-center gap-2'>
            {!isEditing && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsEditing(true)}
                className='flex items-center gap-2'
              >
                <Edit className='h-4 w-4' />
                {t('auth.userProfile.editProfile')}
              </Button>
            )}
            {onClose && (
              <Button
                variant='outline'
                size='sm'
                onClick={onClose}
                className='flex items-center gap-2'
              >
                <X className='h-4 w-4' />
                {t('auth.userProfile.cancel')}
              </Button>
            )}
          </div>
        </div>
        <CardDescription>{t('auth.userProfile.description')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {error && (
          <Alert variant='destructive'>
            <p>{error}</p>
          </Alert>
        )}

        {/* Avatar Section */}
        <div className='flex items-center space-x-4'>
          <div className='relative'>
            <div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center'>
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt='Profile'
                  className='w-16 h-16 rounded-full object-cover'
                />
              ) : (
                <User className='h-8 w-8 text-primary' />
              )}
            </div>
            {isEditing && (
              <button className='absolute -bottom-1 -right-1 p-1 bg-primary text-primary-foreground rounded-full hover:bg-primary/90'>
                <Camera className='h-3 w-3' />
              </button>
            )}
          </div>
          <div>
            {isEditing ? (
              <div>
                <h3 className='text-lg font-semibold mb-2'>
                  {t('auth.userProfile.displayName')}
                </h3>
                <input
                  type='text'
                  value={formData.display_name}
                  onChange={e =>
                    handleInputChange('display_name', e.target.value)
                  }
                  className={`w-full px-2 py-1 border rounded bg-background text-sm ${
                    validationErrors.display_name
                      ? 'border-red-500'
                      : 'border-input'
                  }`}
                  placeholder={t('auth.userProfile.displayName')}
                />
                {validationErrors.display_name && (
                  <p className='text-xs text-red-500 mt-1'>
                    {validationErrors.display_name}
                  </p>
                )}
              </div>
            ) : (
              <h3 className='text-lg font-semibold'>
                {profile.display_name ?? 'No display name'}
              </h3>
            )}
            {isEditing ? (
              <div className='text-sm text-muted-foreground'>
                <input
                  type='text'
                  value={formData.username}
                  onChange={e => handleInputChange('username', e.target.value)}
                  className={`w-full px-2 py-1 border rounded bg-background text-sm ${
                    validationErrors.username
                      ? 'border-red-500'
                      : 'border-input'
                  }`}
                  placeholder={t('auth.userProfile.username')}
                />
                {validationErrors.username && (
                  <p className='text-xs text-red-500 mt-1'>
                    {validationErrors.username}
                  </p>
                )}
              </div>
            ) : (
              <p className='text-sm text-muted-foreground'>
                @{profile.username ?? 'username'}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className='space-y-2'>
          <Label htmlFor='email'>
            <Mail className='h-4 w-4 inline mr-2' />
            {t('auth.email')}
          </Label>
          <p className='text-sm text-muted-foreground'>{user.email}</p>
        </div>

        {/* Native Language */}
        <div className='space-y-2'>
          <Label htmlFor='language'>
            <Globe className='h-4 w-4 inline mr-2' />
            {t('auth.userProfile.nativeLanguage')}
          </Label>
          {isEditing ? (
            <select
              id='language'
              value={formData.native_language}
              onChange={e =>
                handleInputChange('native_language', e.target.value)
              }
              className='w-full px-3 py-2 border border-input rounded-md bg-background text-sm'
            >
              {languages.map(language => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          ) : (
            // @ts-expect-error migrating field name
            (profile as any).native_language && (
              <Badge variant='secondary'>
                {/* @ts-expect-error migrating field name */}
                {languages.find(lang => lang.code === (profile as any).native_language)?.name ?? (profile as any).native_language}
              </Badge>
            )
          )}
        </div>

        {/* Account Info */}
        <div className='space-y-2'>
          <Label htmlFor='account-info'>
            {t('auth.userProfile.accountInformation')}
          </Label>
          <div className='text-sm text-muted-foreground space-y-1'>
            <p>
              {t('auth.userProfile.memberSince')}: {new Date(profile.created_at).toLocaleDateString()}
            </p>
            <p>
              {t('auth.userProfile.lastUpdated')}: {new Date(profile.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing ? (
          <div className='flex gap-2 pt-4'>
            <Button
              onClick={() => void handleSave()}
              disabled={
                saving ||
                Object.keys(validationErrors).some(
                  key => validationErrors[key as keyof typeof validationErrors]
                )
              }
              className='flex-1'
            >
              {saving ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {t('auth.userProfile.saving')}
                </>
              ) : (
                <>
                  <Save className='mr-2 h-4 w-4' />
                  {t('auth.userProfile.saveChanges')}
                </>
              )}
            </Button>
            <Button variant='outline' onClick={handleCancel} disabled={saving}>
              {t('auth.userProfile.cancel')}
            </Button>
          </div>
        ) : (
          <div className='pt-4'>
            <Button
              variant='outline'
              onClick={() => void handleSignOut()}
              className='w-full'
            >
              {t('auth.userProfile.signOut')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
