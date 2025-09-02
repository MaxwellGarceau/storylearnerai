import { useState, useEffect, useCallback } from 'react';
import { VocabularyService } from '../lib/vocabularyService';
import type {
  Vocabulary,
  VocabularyInsert,
  VocabularyUpdate,
  VocabularyWithLanguages,
  VocabularyWithLanguagesAndStory,
} from '../types/database/vocabulary';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

interface UseVocabularyReturn {
  vocabulary: VocabularyWithLanguages[];
  vocabularyWithStories: VocabularyWithLanguagesAndStory[];
  loading: boolean;
  error: string | null;
  saveVocabularyWord: (data: VocabularyInsert) => Promise<Vocabulary | null>;
  updateVocabularyWord: (
    id: number,
    updates: VocabularyUpdate
  ) => Promise<Vocabulary | null>;
  deleteVocabularyWord: (id: number) => Promise<boolean>;
  searchVocabulary: (
    searchTerm: string,
    fromLanguageId?: number,
    translatedLanguageId?: number
  ) => Promise<VocabularyWithLanguages[]>;
  checkVocabularyExists: (
    originalWord: string,
    translatedWord: string,
    fromLanguageId: number,
    translatedLanguageId: number
  ) => Promise<boolean>;
  refreshVocabulary: () => Promise<void>;
  clearError: () => void;
}

export function useVocabulary(): UseVocabularyReturn {
  const { user } = useAuth();
  const { toast } = useToast();

  const [vocabulary, setVocabulary] = useState<VocabularyWithLanguages[]>([]);
  const [vocabularyWithStories, setVocabularyWithStories] = useState<
    VocabularyWithLanguagesAndStory[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadVocabulary = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const [basicVocabulary, vocabularyWithStoriesData] = await Promise.all([
        VocabularyService.getUserVocabulary(user.id),
        VocabularyService.getUserVocabularyWithStories(user.id),
      ]);

      setVocabulary(basicVocabulary);
      setVocabularyWithStories(vocabularyWithStoriesData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load vocabulary';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const saveVocabularyWord = useCallback(
    async (data: VocabularyInsert): Promise<Vocabulary | null> => {
      if (!user?.id) {
        toast({
          title: 'Error',
          description: 'You must be logged in to save vocabulary words',
          variant: 'destructive',
        });
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const vocabularyData = { ...data, user_id: user.id };
        const savedWord =
          await VocabularyService.saveVocabularyWord(vocabularyData);

        // Refresh the vocabulary list
        await loadVocabulary();

        // Notify other listeners (e.g., sidebars) to refresh immediately
        try {
          window.dispatchEvent(new CustomEvent('vocabulary:updated'));
        } catch {
          // no-op in non-browser/test environments
        }

        toast({
          title: 'Success',
          description: 'Vocabulary word saved successfully',
          variant: 'default',
        });

        return savedWord;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to save vocabulary word';
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
    [user?.id, loadVocabulary, toast]
  );

  const updateVocabularyWord = useCallback(
    async (
      id: number,
      updates: VocabularyUpdate
    ): Promise<Vocabulary | null> => {
      setLoading(true);
      setError(null);

      try {
        const updatedWord = await VocabularyService.updateVocabularyWord(
          id,
          updates
        );

        // Refresh the vocabulary list
        await loadVocabulary();

        // Notify other listeners to refresh
        try {
          window.dispatchEvent(new CustomEvent('vocabulary:updated'));
        } catch {
          // no-op
        }

        toast({
          title: 'Success',
          description: 'Vocabulary word updated successfully',
          variant: 'default',
        });

        return updatedWord;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to update vocabulary word';
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
    [loadVocabulary, toast]
  );

  const deleteVocabularyWord = useCallback(
    async (id: number): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        await VocabularyService.deleteVocabularyWord(id);

        // Refresh the vocabulary list
        await loadVocabulary();

        // Notify other listeners to refresh
        try {
          window.dispatchEvent(new CustomEvent('vocabulary:updated'));
        } catch {
          // no-op
        }

        toast({
          title: 'Success',
          description: 'Vocabulary word deleted successfully',
          variant: 'default',
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to delete vocabulary word';
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
    [loadVocabulary, toast]
  );

  const searchVocabulary = useCallback(
    async (
      searchTerm: string,
      fromLanguageId?: number,
      translatedLanguageId?: number
    ): Promise<VocabularyWithLanguages[]> => {
      if (!user?.id) return [];

      try {
        return await VocabularyService.searchVocabulary(
          user.id,
          searchTerm,
          fromLanguageId,
          translatedLanguageId
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to search vocabulary';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return [];
      }
    },
    [user?.id, toast]
  );

  const checkVocabularyExists = useCallback(
    async (
      originalWord: string,
      translatedWord: string,
      fromLanguageId: number,
      translatedLanguageId: number
    ): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        return await VocabularyService.checkVocabularyExists(
          user.id,
          originalWord,
          translatedWord,
          fromLanguageId,
          translatedLanguageId
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to check vocabulary existence';
        setError(errorMessage);
        return false;
      }
    },
    [user?.id]
  );

  const refreshVocabulary = useCallback(async () => {
    await loadVocabulary();
  }, [loadVocabulary]);

  // Load vocabulary when user changes
  useEffect(() => {
    if (user?.id) {
      void loadVocabulary();
    } else {
      setVocabulary([]);
      setVocabularyWithStories([]);
    }
  }, [user?.id, loadVocabulary]);

  // Listen for cross-component updates to refresh immediately
  useEffect(() => {
    const handleUpdated = () => {
      if (user?.id) {
        void loadVocabulary();
      }
    };
    try {
      window.addEventListener('vocabulary:updated', handleUpdated);
      return () =>
        window.removeEventListener('vocabulary:updated', handleUpdated);
    } catch {
      return () => {};
    }
  }, [user?.id, loadVocabulary]);

  return {
    vocabulary,
    vocabularyWithStories,
    loading,
    error,
    saveVocabularyWord,
    updateVocabularyWord,
    deleteVocabularyWord,
    searchVocabulary,
    checkVocabularyExists,
    refreshVocabulary,
    clearError,
  };
}
