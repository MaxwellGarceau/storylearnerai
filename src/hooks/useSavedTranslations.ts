import { useState, useEffect, useCallback } from 'react';
import { SavedTranslationService } from '../api/supabase/database/savedTranslationService';
import type {
  DatabaseSavedTranslationWithDetails,
  CreateSavedTranslationRequest,
} from '../types/database/translation';
import type { VoidPromise } from '../types/common';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

// Type alias to avoid duplicate type definition
type LoadTranslationsFunction = () => VoidPromise;

interface UseSavedTranslationsReturn {
  savedTranslations: DatabaseSavedTranslationWithDetails[];
  loading: boolean;
  error: string | null;
  loadTranslations: LoadTranslationsFunction;
  refreshTranslations: LoadTranslationsFunction;
  createSavedTranslation: (
    data: CreateSavedTranslationRequest
  ) => Promise<DatabaseSavedTranslationWithDetails | null>;
}

// Create a singleton instance of the service
const savedTranslationService = new SavedTranslationService();

export function useSavedTranslations(): UseSavedTranslationsReturn {
  const { user } = useAuth();
  const { toast } = useToast();
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

  const createSavedTranslation = useCallback(
    async (
      data: CreateSavedTranslationRequest
    ): Promise<DatabaseSavedTranslationWithDetails | null> => {
      if (!user?.id) {
        toast({
          title: 'Error',
          description: 'You must be logged in to save translations',
          variant: 'destructive',
        });
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const savedTranslation =
          await savedTranslationService.createSavedTranslation(data, user.id);

        // Refresh the translations list
        await loadTranslations();

        // Notify other listeners (e.g., sidebars) to refresh immediately
        try {
          window.dispatchEvent(new CustomEvent('saved-translations:updated'));
        } catch {
          // no-op in non-browser/test environments
        }

        toast({
          title: 'Success',
          description: 'Translation saved successfully',
        });

        return savedTranslation;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to save translation';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, toast, loadTranslations]
  );

  useEffect(() => {
    void loadTranslations();
  }, [loadTranslations]);

  return {
    savedTranslations,
    loading,
    error,
    loadTranslations,
    refreshTranslations,
    createSavedTranslation,
  };
}
