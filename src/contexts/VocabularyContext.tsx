import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { VocabularyService } from '../lib/vocabularyService';
import type {
  Vocabulary,
  VocabularyInsert,
  VocabularyUpdate,
  VocabularyWithLanguages,
  VocabularyPromise,
  BooleanPromise,
} from '../types/database/vocabulary';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

interface VocabularyContextValue {
  vocabulary: VocabularyWithLanguages[];
  loading: boolean;
  error: string | null;
  saveVocabularyWord: (data: VocabularyInsert) => VocabularyPromise;
  updateVocabularyWord: (
    id: number,
    updates: VocabularyUpdate
  ) => VocabularyPromise;
  deleteVocabularyWord: (id: number) => BooleanPromise;
  checkVocabularyExists: (
    fromWord: string,
    targetWord: string,
    fromLanguageId: number,
    targetLanguageId: number
  ) => BooleanPromise;
}

const VocabularyContext = createContext<VocabularyContextValue | null>(null);

export const useVocabularyContext = () => {
  const context = useContext(VocabularyContext);
  if (!context) {
    throw new Error(
      'useVocabularyContext must be used within a VocabularyProvider'
    );
  }
  return context;
};

export const VocabularyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [vocabulary, setVocabulary] = useState<VocabularyWithLanguages[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadVocabulary = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const basicVocabulary = await VocabularyService.getUserVocabulary(
        user.id
      );
      setVocabulary(basicVocabulary);
      setHasLoaded(true);
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

        // Refresh the vocabulary list to get the full object with language information
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
        // On error, refetch to ensure consistency
        await loadVocabulary();

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
    async (id: number, updates: VocabularyUpdate): VocabularyPromise => {
      setLoading(true);
      setError(null);

      try {
        const updatedWord = await VocabularyService.updateVocabularyWord(
          id,
          updates
        );

        // Refresh the vocabulary list to get the full object with language information
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
        // On error, refetch to ensure consistency
        await loadVocabulary();

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

        // Optimistic update: Remove the word from local state immediately
        setVocabulary(prev => prev.filter(word => word.id !== id));

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
        // On error, refetch to ensure consistency
        await loadVocabulary();

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

  const checkVocabularyExists = useCallback(
    async (
      fromWord: string,
      targetWord: string,
      fromLanguageId: number,
      targetLanguageId: number
    ): BooleanPromise => {
      if (!user?.id) return false;

      try {
        return await VocabularyService.checkVocabularyExists(
          user.id,
          fromWord,
          targetWord,
          fromLanguageId,
          targetLanguageId
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

  // Load vocabulary when user changes, but only if not already loaded
  useEffect(() => {
    if (user?.id && !hasLoaded && !loading) {
      void loadVocabulary();
    } else if (!user?.id) {
      setVocabulary([]);
      setHasLoaded(false);
    }
  }, [user?.id, loadVocabulary, hasLoaded, loading]);

  // Listen for cross-component updates to refresh immediately
  // Note: This is now less critical since we use optimistic updates
  useEffect(() => {
    const handleUpdated = () => {
      if (user?.id) {
        // Only refetch if we don't have vocabulary data yet
        if (vocabulary.length === 0) {
          void loadVocabulary();
        }
      }
    };
    try {
      window.addEventListener('vocabulary:updated', handleUpdated);
      return () =>
        window.removeEventListener('vocabulary:updated', handleUpdated);
    } catch {
      return () => {};
    }
  }, [user?.id, loadVocabulary, vocabulary.length]);

  const contextValue: VocabularyContextValue = {
    vocabulary,
    loading,
    error,
    saveVocabularyWord,
    updateVocabularyWord,
    deleteVocabularyWord,
    checkVocabularyExists,
  };

  return (
    <VocabularyContext.Provider value={contextValue}>
      {children}
    </VocabularyContext.Provider>
  );
};
