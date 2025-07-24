import { useState, useEffect, useMemo } from 'react'
import { LanguageService } from '../api/supabase/database/languageService'
import type { Language } from '../lib/types/database'

export const useLanguages = () => {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create a memoized map for quick lookups
  const languageMap = useMemo(() => {
    const map = new Map<string, string>()
    languages.forEach(lang => {
      map.set(lang.code, lang.name)
    })
    return map
  }, [languages])

  // Get language name with fallback
  const getLanguageName = (code: string): string => {
    return languageMap.get(code) || code
  }

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
        console.error('Failed to load languages:', err)
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
    languageMap
  }
} 