import { useState, useEffect, useCallback } from 'react';
import { SavedTranslationService } from '../api/supabase/database/savedTranslationService';
import type { DatabaseSavedTranslationWithDetails } from '../types/database/translation';
import type { VoidPromise } from '../types/common';
import type { TranslationResponse } from '../lib/translationService';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import { TokenConverter } from '../lib/llm/tokenConverter';

// Type alias to avoid duplicate type definition
type LoadTranslationsFunction = () => VoidPromise;

interface UseSavedTranslationsReturn {
  savedTranslations: DatabaseSavedTranslationWithDetails[];
  loading: boolean;
  error: string | null;
  loadTranslations: LoadTranslationsFunction;
  refreshTranslations: LoadTranslationsFunction;
  saveTranslationWithTokens: (
    translationData: TranslationResponse,
    fromText: string,
    title?: string,
    notes?: string
  ) => Promise<number | null>;
  deleteSavedTranslation: (translationId: number) => Promise<boolean>;
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

  const saveTranslationWithTokens = useCallback(
    async (
      translationData: TranslationResponse,
      fromText: string,
      title?: string,
      notes?: string
    ): Promise<number | null> => {
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
        // Convert TranslationToken[] to the format expected by saveTranslationWithTokens
        const convertedTokens = TokenConverter.convertUITokensToDatabaseTokens(
          translationData.tokens
        );
        const tokens = [
          ...convertedTokens.word,
          ...convertedTokens.punctuation,
          ...convertedTokens.whitespace,
        ];

        const translationId =
          await savedTranslationService.saveTranslationWithTokens({
            userId: user.id,
            fromLanguage: translationData.fromLanguage,
            toLanguage: translationData.toLanguage,
            fromText,
            toText: translationData.toText,
            difficultyLevel: translationData.difficulty,
            title,
            notes,
            tokens,
          });

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

        return translationId;
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

  const deleteSavedTranslation = useCallback(
    async (translationId: number): Promise<boolean> => {
      if (!user?.id) {
        toast({
          title: 'Error',
          description: 'You must be logged in to delete translations',
          variant: 'destructive',
        });
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        await savedTranslationService.deleteSavedTranslation(
          translationId,
          user.id
        );

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
          description: 'Translation deleted successfully',
        });

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to delete translation';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return false;
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
    saveTranslationWithTokens,
    deleteSavedTranslation,
  };
}
