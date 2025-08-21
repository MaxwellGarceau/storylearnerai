import React from 'react';
import { useAuth } from '../hooks/useAuth';
import SavedTranslationsList from '../components/story/SavedTranslationsList';
import { useTranslation } from 'react-i18next';

export default function SavedTranslationsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // ProtectedRoute ensures user is not null, but TypeScript doesn't know this
  if (!user) return null;

  return (
    <div className='p-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>
            {t('savedTranslations.title')}
          </h1>
          <p className='text-muted-foreground'>
            {t('savedTranslations.subtitle')}
          </p>
        </div>

        <SavedTranslationsList />
      </div>
    </div>
  );
}
