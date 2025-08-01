import { supabase } from '../client'
import type { DatabaseDifficultyLevel as DifficultyLevel, DifficultyLevel as DifficultyLevelCode } from '../../../types'
import { logger } from '../../../lib/logger'

export class DifficultyLevelService {
  /**
   * Get all difficulty levels supported by the application
   */
  async getDifficultyLevels(): Promise<DifficultyLevel[]> {
    const { data, error } = await supabase
      .from('difficulty_levels')
      .select('*')
      .order('id');

    if (error) {
      throw new Error(`Failed to fetch difficulty levels: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a difficulty level by its code
   */
  async getDifficultyLevelByCode(code: DifficultyLevelCode): Promise<DifficultyLevel | null> {
    const { data, error } = await supabase
      .from('difficulty_levels')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch difficulty level: ${error.message}`);
    }

    return data;
  }

  /**
   * Get difficulty level name by code, with fallback to code if not found
   */
  async getDifficultyLevelName(code: DifficultyLevelCode): Promise<string> {
    try {
      const difficultyLevel = await this.getDifficultyLevelByCode(code);
      return difficultyLevel?.name || code;
    } catch (error) {
      logger.warn('database', `Failed to fetch difficulty level name for code: ${code}`, { error });
      return code; // Fallback to code if fetch fails
    }
  }
} 