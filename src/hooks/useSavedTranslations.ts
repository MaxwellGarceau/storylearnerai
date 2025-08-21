import { useState, useEffect, useCallback } from 'react';
import { SavedTranslationService } from '../api/supabase/database/savedTranslationService';
import type { DatabaseSavedTranslationWithDetails } from '../types/database/translation';
import type { VoidPromise } from '../types/common';
import { useAuth } from './useAuth';

// Type alias to avoid duplicate type definition
type LoadTranslationsFunction = () => VoidPromise;

interface UseSavedTranslationsReturn {
  savedTranslations: DatabaseSavedTranslationWithDetails[];
  loading: boolean;
  error: string | null;
  loadTranslations: LoadTranslationsFunction;
  refreshTranslations: LoadTranslationsFunction;
}

// Create a singleton instance of the service
const savedTranslationService = new SavedTranslationService();

export function useSavedTranslations(): UseSavedTranslationsReturn {
  const { user } = useAuth();
  const [savedTranslations, setSavedTranslations] = useState<
    DatabaseSavedTranslationWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTranslations = useCallback(async () => {
    if (!user) {
      setSavedTranslations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const translations = await savedTranslationService.getSavedTranslations(
        user.id
      );
      setSavedTranslations(translations);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to load saved translations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshTranslations = useCallback(async () => {
    await loadTranslations();
  }, [loadTranslations]);

  useEffect(() => {
    void loadTranslations();
  }, [loadTranslations]);

  return {
    savedTranslations,
    loading,
    error,
    loadTranslations,
    refreshTranslations,
  };
}
