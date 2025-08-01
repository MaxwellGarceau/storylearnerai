import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSupabase } from './useSupabase';
import { SavedTranslationService } from '../api/supabase/database/savedTranslationService';
import {
  DatabaseSavedTranslationWithDetails,
  CreateSavedTranslationRequest,
  UpdateSavedTranslationRequest,
  SavedTranslationFilters,
  DatabaseLanguage,
  DatabaseDifficultyLevel,
} from '../types/database';

interface UseSavedTranslationsReturn {
  // Data
  savedTranslations: DatabaseSavedTranslationWithDetails[];
  languages: DatabaseLanguage[];
  difficultyLevels: DatabaseDifficultyLevel[];
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isLoadingLanguages: boolean;
  isLoadingDifficultyLevels: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  createSavedTranslation: (request: CreateSavedTranslationRequest) => Promise<void>;
  updateSavedTranslation: (id: string, updates: UpdateSavedTranslationRequest) => Promise<void>;
  deleteSavedTranslation: (id: string) => Promise<void>;
  refreshSavedTranslations: () => Promise<void>;
  setFilters: (filters: SavedTranslationFilters) => void;
  
  // Pagination
  totalCount: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

const ITEMS_PER_PAGE = 20;

export function useSavedTranslations(): UseSavedTranslationsReturn {
  const { user } = useSupabase();
  const [savedTranslations, setSavedTranslations] = useState<DatabaseSavedTranslationWithDetails[]>([]);
  const [languages, setLanguages] = useState<DatabaseLanguage[]>([]);
  const [difficultyLevels, setDifficultyLevels] = useState<DatabaseDifficultyLevel[]>([]);
  const [filters, setFilters] = useState<SavedTranslationFilters>({});
  const [totalCount, setTotalCount] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  const [isLoadingDifficultyLevels, setIsLoadingDifficultyLevels] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  const service = useMemo(() => new SavedTranslationService(), []);
  
  // Load languages and difficulty levels on mount
  useEffect(() => {
    const loadLookupData = async () => {
      if (!user) return;
      
      try {
        setIsLoadingLanguages(true);
        setIsLoadingDifficultyLevels(true);
        
        const [languagesData, difficultyLevelsData] = await Promise.all([
          service.getLanguages(),
          service.getDifficultyLevels(),
        ]);
        
        setLanguages(languagesData);
        setDifficultyLevels(difficultyLevelsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lookup data');
      } finally {
        setIsLoadingLanguages(false);
        setIsLoadingDifficultyLevels(false);
      }
    };
    
    loadLookupData();
  }, [user, service]);
  
  // Load saved translations when user or filters change
  useEffect(() => {
    const loadSavedTranslations = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const [translationsData, count] = await Promise.all([
          service.getSavedTranslations(user.id, { ...filters, limit: ITEMS_PER_PAGE }),
          service.getSavedTranslationsCount(user.id, filters),
        ]);
        
        setSavedTranslations(translationsData);
        setTotalCount(count);
        setCurrentOffset(ITEMS_PER_PAGE);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load saved translations');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedTranslations();
  }, [user, filters, service]);
  
  const createSavedTranslation = useCallback(async (request: CreateSavedTranslationRequest) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setIsCreating(true);
      setError(null);
      
      const newTranslation = await service.createSavedTranslation(request, user.id);
      setSavedTranslations(prev => [newTranslation, ...prev]);
      setTotalCount(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create saved translation');
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [user, service]);
  
  const updateSavedTranslation = useCallback(async (id: string, updates: UpdateSavedTranslationRequest) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setIsUpdating(true);
      setError(null);
      
      const updatedTranslation = await service.updateSavedTranslation(id, user.id, updates);
      setSavedTranslations(prev => 
        prev.map(translation => 
          translation.id === parseInt(id) ? updatedTranslation : translation
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update saved translation');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [user, service]);
  
  const deleteSavedTranslation = useCallback(async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setIsDeleting(true);
      setError(null);
      
      await service.deleteSavedTranslation(id, user.id);
      setSavedTranslations(prev => prev.filter(translation => translation.id !== parseInt(id)));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete saved translation');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [user, service]);
  
  const refreshSavedTranslations = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const [translationsData, count] = await Promise.all([
        service.getSavedTranslations(user.id, { ...filters, limit: ITEMS_PER_PAGE }),
        service.getSavedTranslationsCount(user.id, filters),
      ]);
      
      setSavedTranslations(translationsData);
      setTotalCount(count);
      setCurrentOffset(ITEMS_PER_PAGE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh saved translations');
    } finally {
      setIsLoading(false);
    }
  }, [user, filters, service]);
  
  const loadMore = useCallback(async () => {
    if (!user || isLoading || savedTranslations.length >= totalCount) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const additionalTranslations = await service.getSavedTranslations(user.id, {
        ...filters,
        limit: ITEMS_PER_PAGE,
        offset: currentOffset,
      });
      
      setSavedTranslations(prev => [...prev, ...additionalTranslations]);
      setCurrentOffset(prev => prev + ITEMS_PER_PAGE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more translations');
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading, savedTranslations.length, totalCount, filters, currentOffset, service]);
  
  const hasMore = savedTranslations.length < totalCount;
  
  return {
    // Data
    savedTranslations,
    languages,
    difficultyLevels,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isLoadingLanguages,
    isLoadingDifficultyLevels,
    
    // Error state
    error,
    
    // Actions
    createSavedTranslation,
    updateSavedTranslation,
    deleteSavedTranslation,
    refreshSavedTranslations,
    setFilters,
    
    // Pagination
    totalCount,
    hasMore,
    loadMore,
  };
} 