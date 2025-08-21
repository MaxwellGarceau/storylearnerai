import { useState, useEffect, useMemo } from 'react';
import { DifficultyLevelService } from '../api/supabase/database/difficultyLevelService';
import type {
  DatabaseDifficultyLevel,
  DifficultyLevel,
  DifficultyLevelDisplay,
} from '../types';
import { logger } from '../lib/logger';
import { useTranslation } from 'react-i18next';

export const useDifficultyLevels = () => {
  const [difficultyLevels, setDifficultyLevels] = useState<
    DatabaseDifficultyLevel[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Create a memoized map for quick lookups
  const difficultyMap = useMemo(() => {
    const map = new Map<DifficultyLevel, string>();
    difficultyLevels.forEach(level => {
      map.set(level.code, level.name);
    });
    return map;
  }, [difficultyLevels]);

  // Create a memoized map for display names using translations
  const difficultyDisplayMap = useMemo(() => {
    const map = new Map<DifficultyLevel, DifficultyLevelDisplay>();
    const displayMap: Record<DifficultyLevel, DifficultyLevelDisplay> = {
      a1: t('difficultyLevels.a1.label') as DifficultyLevelDisplay,
      a2: t('difficultyLevels.a2.label') as DifficultyLevelDisplay,
      b1: t('difficultyLevels.b1.label') as DifficultyLevelDisplay,
      b2: t('difficultyLevels.b2.label') as DifficultyLevelDisplay,
    };
    difficultyLevels.forEach(level => {
      map.set(level.code, displayMap[level.code]);
    });
    return map;
  }, [difficultyLevels, t]);

  // Get difficulty level name with fallback
  const getDifficultyLevelName = (code: DifficultyLevel): string => {
    return difficultyMap.get(code) ?? code;
  };

  // Get difficulty level display name (A1, A2, B1, B2)
  const getDifficultyLevelDisplay = (
    code: DifficultyLevel
  ): DifficultyLevelDisplay => {
    return (
      difficultyDisplayMap.get(code) ??
      (code.toUpperCase() as DifficultyLevelDisplay)
    );
  };

  // Map difficulty level names to codes
  const getDifficultyLevelCode = (
    difficultyName: string
  ): DifficultyLevel | undefined => {
    const normalizedName = difficultyName.toLowerCase();

    // First try to find by exact code match
    if (difficultyMap.has(normalizedName as DifficultyLevel)) {
      return normalizedName as DifficultyLevel;
    }

    // Then try to find by difficulty level name
    for (const [code, name] of difficultyMap.entries()) {
      if (name.toLowerCase() === normalizedName) {
        return code;
      }
    }

    // Fallback to common mappings
    const fallbackMap: Record<string, DifficultyLevel> = {
      beginner: 'a1',
      elementary: 'a2',
      intermediate: 'b1',
      'upper intermediate': 'b2',
      advanced: 'b2',
    };

    return fallbackMap[normalizedName];
  };

  // Convert display name to code
  const getDifficultyLevelCodeFromDisplay = (
    display: DifficultyLevelDisplay
  ): DifficultyLevel => {
    const displayToCode: Record<DifficultyLevelDisplay, DifficultyLevel> = {
      [t('difficultyLevels.a1.label')]: 'a1',
      [t('difficultyLevels.a2.label')]: 'a2',
      [t('difficultyLevels.b1.label')]: 'b1',
      [t('difficultyLevels.b2.label')]: 'b2',
    } as Record<DifficultyLevelDisplay, DifficultyLevel>;
    return displayToCode[display];
  };

  useEffect(() => {
    const loadDifficultyLevels = async () => {
      try {
        setLoading(true);
        setError(null);
        const service = new DifficultyLevelService();
        const difficultyLevelsData = await service.getDifficultyLevels();
        setDifficultyLevels(difficultyLevelsData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load difficulty levels'
        );
        logger.error('general', 'Failed to load difficulty levels', {
          error: err,
        });
      } finally {
        setLoading(false);
      }
    };

    void loadDifficultyLevels();
  }, []);

  return {
    difficultyLevels,
    loading,
    error,
    getDifficultyLevelName,
    getDifficultyLevelDisplay,
    getDifficultyLevelCode,
    getDifficultyLevelCodeFromDisplay,
    difficultyMap,
    difficultyDisplayMap,
  };
};
