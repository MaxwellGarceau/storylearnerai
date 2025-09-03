import { useState, useEffect, useMemo } from 'react';
import { LanguageService } from '../api/supabase/database/languageService';
import type { DatabaseLanguage } from '../types/database';
import type { LanguageCode } from '../types/llm/prompts';
import { logger } from '../lib/logger';

// Global state for languages to ensure single load across all hook instances
let globalLanguages: DatabaseLanguage[] | null = null;
let globalLoading = true;
let globalError: string | null = null;
let globalLanguagesPromise: Promise<DatabaseLanguage[]> | null = null;
const globalCallbacks = new Set<() => void>();

// Global loading function to ensure languages are loaded once
const loadLanguagesGlobal = async (): Promise<DatabaseLanguage[]> => {
  if (globalLanguages) {
    return globalLanguages;
  }

  if (globalLanguagesPromise) {
    return globalLanguagesPromise;
  }

  globalLanguagesPromise = (async () => {
    try {
      globalLoading = true;
      const service = new LanguageService();
      const languagesData = await service.getLanguages();
      globalLanguages = languagesData;
      globalError = null;

      // Notify all waiting hook instances
      globalCallbacks.forEach(callback => callback());
      globalCallbacks.clear();

      logger.info('general', 'Languages loaded successfully', {
        count: languagesData.length,
      });

      return languagesData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load languages';
      globalError = errorMessage;
      globalLanguages = null;

      logger.error('general', 'Failed to load languages', { error: err });

      throw err;
    } finally {
      globalLoading = false;
    }
  })();

  return globalLanguagesPromise;
};

export const useLanguages = () => {
  const [languages, setLanguages] = useState<DatabaseLanguage[]>(
    globalLanguages ?? []
  );
  const [loading, setLoading] = useState(globalLoading);
  const [error, setError] = useState<string | null>(globalError ?? null);

  // Sync local state with global state
  useEffect(() => {
    const updateLocalState = () => {
      setLanguages(globalLanguages ?? []);
      setLoading(globalLoading);
      setError(globalError ?? null);
    };

    // Update immediately if we already have data
    if (globalLanguages || !globalLoading) {
      updateLocalState();
    }

    // Load languages if not already loading/loaded
    if (!globalLanguages && !globalLanguagesPromise) {
      void loadLanguagesGlobal().then(updateLocalState).catch(updateLocalState);
    }

    // Register callback for future updates
    const callback = () => updateLocalState();
    globalCallbacks.add(callback);

    return () => {
      globalCallbacks.delete(callback);
    };
  }, []);

  // Create a memoized map for quick lookups
  const languageMap = useMemo(() => {
    const map = new Map<LanguageCode, string>();
    languages.forEach(lang => {
      map.set(lang.code, lang.name);
    });
    return map;
  }, [languages]);

  // Create a memoized map for native names
  const nativeLanguageMap = useMemo(() => {
    const map = new Map<LanguageCode, string>();
    languages.forEach(lang => {
      map.set(
        lang.code,
        lang.native_name ?? (lang.code === 'en' ? 'English' : 'Español')
      );
    });
    return map;
  }, [languages]);

  // Create a memoized map for language IDs
  const languageIdMap = useMemo(() => {
    const map = new Map<LanguageCode, number>();
    languages.forEach(lang => {
      map.set(lang.code, lang.id);
    });
    return map;
  }, [languages]);

  // Get language name with fallback
  const getLanguageName = (code: LanguageCode): string => {
    return languageMap.get(code) ?? (code === 'en' ? 'English' : 'Spanish');
  };

  // Get native language name with fallback
  const getNativeLanguageName = (code: LanguageCode): string => {
    return (
      nativeLanguageMap.get(code) ?? (code === 'en' ? 'English' : 'Español')
    );
  };

  // TODO: I don't like that we return undefined here, but this solves the problem of languages not being loaded yet.
  const getLanguageIdByCode = (code: LanguageCode): number | undefined => {
    // If languages haven't loaded yet, return undefined
    if (globalLoading || !globalLanguages || globalLanguages.length === 0) {
      return undefined;
    }

    const languageId = languageIdMap.get(code);
    if (languageId === undefined) {
      throw new Error(
        `Language with code '${code}' not found. Available language codes: ${Array.from(languageIdMap.keys()).join(', ')}`
      );
    }
    return languageId;
  };

  // Get language name by ID - throws error if language not found
  const getLanguageNameById = (id: number): string => {
    const language = languages.find(lang => lang.id === id);
    if (!language) {
      throw new Error(
        `Language with ID ${id} not found. Available language IDs: ${languages.map(l => l.id).join(', ')}`
      );
    }
    return language.name;
  };

  // Map language names to ISO codes
  const getLanguageCode = (languageName: string): LanguageCode | undefined => {
    const normalizedName = languageName.toLowerCase();

    // First try to find by exact code match
    if (languageMap.has(normalizedName as LanguageCode)) {
      return normalizedName as LanguageCode;
    }

    // Then try to find by language name
    for (const [code, name] of languageMap.entries()) {
      if (name.toLowerCase() === normalizedName) {
        return code;
      }
    }

    // Fallback to common mappings
    const fallbackMap: Record<string, LanguageCode> = {
      spanish: 'es',
      english: 'en',
    };

    return fallbackMap[normalizedName];
  };

  return {
    languages,
    loading,
    error,
    getLanguageName,
    getNativeLanguageName,
    getLanguageCode,
    getLanguageIdByCode,
    getLanguageNameById,
    languageMap,
  };
};
