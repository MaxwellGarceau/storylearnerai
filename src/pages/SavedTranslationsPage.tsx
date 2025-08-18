import React from 'react';
import { useAuth } from '../hooks/useAuth';
import SavedTranslationsList from '../components/story/SavedTranslationsList';

export default function SavedTranslationsPage() {
  const { user } = useAuth();

  // ProtectedRoute ensures user is not null, but TypeScript doesn't know this
  if (!user) return null;

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Saved Translations</h1>
          <p className="text-muted-foreground">
            View and manage your saved story translations
          </p>
        </div>
        
        <SavedTranslationsList />
      </div>
    </div>
  );
} 