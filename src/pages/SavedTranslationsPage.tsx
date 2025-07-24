import React from 'react';
import { useSupabase } from '../hooks/useSupabase';
import SavedTranslationsList from '../components/story/SavedTranslationsList';
import PageContainer from '../components/PageContainer';

export default function SavedTranslationsPage() {
  const { user } = useSupabase();

  if (!user) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground">
              Please sign in to view your saved translations.
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Saved Translations</h1>
          <p className="text-muted-foreground">
            View and manage your saved story translations
          </p>
        </div>
        
        <SavedTranslationsList />
      </div>
    </PageContainer>
  );
} 