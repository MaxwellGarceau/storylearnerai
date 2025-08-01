import { useState, useEffect, useMemo } from 'react'
import { LanguageService } from '../api/supabase/database/languageService'
import type { DatabaseLanguage, LanguageCode } from '../types'
import { logger } from '../lib/logger'

export const useLanguages = () => {
  const [languages, setLanguages] = useState<DatabaseLanguage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create a memoized map for quick lookups
  const languageMap = useMemo(() => {
    const map = new Map<LanguageCode, string>()
    languages.forEach(lang => {
      map.set(lang.code as LanguageCode, lang.name)
    })
    return map
  }, [languages])

  // Get language name with fallback
  const getLanguageName = (code: LanguageCode): string => {
    return languageMap.get(code) || code
  }

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
      'spanish': 'es',
      'english': 'en',
    };
    
    return fallbackMap[normalizedName];
  };

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        setLoading(true)
        setError(null)
        const service = new LanguageService()
        const languagesData = await service.getLanguages()
        setLanguages(languagesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load languages')
        logger.error('general', 'Failed to load languages', { error: err })
      } finally {
        setLoading(false)
      }
    }

    loadLanguages()
  }, [])

  return {
    languages,
    loading,
    error,
    getLanguageName,
    getLanguageCode,
    languageMap
  }
} 