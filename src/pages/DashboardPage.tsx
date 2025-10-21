import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguages } from '../hooks/useLanguages';
import { useSavedTranslations } from '../hooks/useSavedTranslations';
import { UserService } from '../api/supabase/database/userProfileService';
import { Button } from '../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import {
  BookOpen,
  Plus,
  User as UserIcon,
  Globe,
  Loader2,
  Trash2,
} from 'lucide-react';
import type { DatabaseUser } from '../types/database/user';
import type { NullableString } from '../types/common';
import { useTranslation } from 'react-i18next';
import { DeleteTranslationModal } from '../components/story/DeleteTranslationModal';
import type { DatabaseSavedTranslationWithDetails } from '../types/database';

// Removed fallback guard; native_language is enforced as NOT NULL in DB

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { getLanguageName } = useLanguages();
  const {
    savedTranslations,
    loading: isLoadingSavedTranslations,
    deleteSavedTranslation,
  } = useSavedTranslations();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<NullableString>(null);
  const [profile, setProfile] = useState<DatabaseUser | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [translationToDelete, setTranslationToDelete] =
    useState<DatabaseSavedTranslationWithDetails | null>(null);
  const { t } = useTranslation();

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Load user profile, create if doesn't exist
      let userProfile = await UserService.getUser(user.id);
      userProfile =
        userProfile ??
        (await UserService.getOrCreateUser(user.id, {
          display_name: user.email?.split('@')[0] ?? 'User',
          username: user.email?.split('@')[0] ?? 'user',
        }));
      setProfile(userProfile as unknown as DatabaseUser);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('dashboard.errors.loadFailed')
      );
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    if (user) {
      void loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user, loadDashboardData]);

  const handleDeleteClick = (
    translation: DatabaseSavedTranslationWithDetails
  ) => {
    setTranslationToDelete(translation);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<boolean> => {
    if (!translationToDelete) return false;

    try {
      const success = await deleteSavedTranslation(translationToDelete.id);
      return success;
    } catch (err) {
      console.error('Failed to delete translation:', err);
      return false;
    }
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    setTranslationToDelete(null);
  };

  if (loading) {
    return (
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center justify-center h-64'>
            <div className='text-center'>
              <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
              <p className='text-muted-foreground'>{t('dashboard.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ProtectedRoute ensures user is not null, but TypeScript doesn't know this
  if (!user) return null;

  return (
    <div className='p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {error && (
          <Alert variant='destructive'>
            <p>{error}</p>
          </Alert>
        )}

        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>
              {t('auth.userProfile.welcomeBack', {
                name:
                  profile?.display_name ??
                  profile?.username ??
                  user.email?.split('@')[0] ??
                  'User',
              })}
            </h1>
            <p className='text-muted-foreground'>{t('dashboard.subtitle')}</p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={() => void navigate('/auth?mode=profile')}
              className='flex items-center gap-2'
            >
              <UserIcon className='h-4 w-4' />
              {t('dashboard.profile')}
            </Button>
            <Button
              onClick={() => void navigate('/translate')}
              className='flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              {t('dashboard.newTranslation')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('dashboard.stats.totalTranslations')}
              </CardTitle>
              <BookOpen className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {isLoadingSavedTranslations ? (
                  <Loader2 className='h-6 w-6 animate-spin' />
                ) : (
                  savedTranslations.length
                )}
              </div>
              <p className='text-xs text-muted-foreground'>
                {t('dashboard.stats.storiesTranslated')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('dashboard.stats.languages')}
              </CardTitle>
              <Globe className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>1</div>
              <p className='text-xs text-muted-foreground'>
                {profile ? getLanguageName(profile.native_language) : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('dashboard.stats.learningLevel')}
              </CardTitle>
              <Badge variant='secondary'>{t('dashboard.stats.beginner')}</Badge>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {t('dashboard.stats.beginner')}
              </div>
              <p className='text-xs text-muted-foreground'>
                {t('dashboard.stats.currentDifficulty')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>
            {t('dashboard.quickActions.title')}
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <Card
              className='hover:shadow-md transition-shadow cursor-pointer'
              onClick={() => void navigate('/translate')}
            >
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Plus className='h-5 w-5' />
                  {t('dashboard.quickActions.newTranslation.title')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.quickActions.newTranslation.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className='hover:shadow-md transition-shadow cursor-pointer'
              onClick={() => void navigate('/saved-translations')}
            >
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BookOpen className='h-5 w-5' />
                  {t('dashboard.quickActions.viewSaved.title')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.quickActions.viewSaved.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className='hover:shadow-md transition-shadow cursor-pointer'
              onClick={() => void navigate('/auth?mode=profile')}
            >
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <UserIcon className='h-5 w-5' />
                  {t('dashboard.quickActions.editProfile.title')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.quickActions.editProfile.description')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>
            {t('dashboard.recentActivity.title')}
          </h2>
          {isLoadingSavedTranslations ? (
            <Card>
              <CardHeader>
                <div className='flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <CardTitle>{t('dashboard.recentActivity.loading')}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          ) : savedTranslations.length > 0 ? (
            <div className='space-y-3'>
              {savedTranslations.slice(0, 3).map(translation => (
                <Card
                  key={translation.id}
                  className='hover:shadow-md transition-shadow'
                >
                  <CardHeader className='pb-2'>
                    <div className='flex items-start justify-between'>
                      <div
                        className='flex-1 cursor-pointer'
                        onClick={() => navigate(`/story?id=${translation.id}`)}
                      >
                        <CardTitle className='text-base leading-tight'>
                          {translation.title ??
                            t('dashboard.recentActivity.untitledStory')}
                        </CardTitle>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge variant='secondary' className='text-xs'>
                          {getLanguageName(translation.from_language.code)} →{' '}
                          {getLanguageName(translation.to_language.code)}
                        </Badge>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteClick(translation);
                          }}
                          className='h-6 w-6 p-0'
                        >
                          <Trash2 className='h-3 w-3' />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent
                    className='pt-0 cursor-pointer'
                    onClick={() => navigate(`/story?id=${translation.id}`)}
                  >
                    <p className='text-sm text-muted-foreground line-clamp-2'>
                      {translation.from_text.substring(0, 100)}...
                    </p>
                    <p className='text-xs text-muted-foreground mt-2'>
                      {new Date(translation.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {savedTranslations.length > 3 && (
                <div className='text-center'>
                  <Button
                    variant='outline'
                    onClick={() => navigate('/saved-translations')}
                    className='text-sm'
                  >
                    {t('dashboard.recentActivity.viewAll', {
                      count: savedTranslations.length,
                    })}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('dashboard.recentActivity.noActivity')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.recentActivity.noActivityDescription')}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteTranslationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        translation={translationToDelete}
      />
    </div>
  );
};
