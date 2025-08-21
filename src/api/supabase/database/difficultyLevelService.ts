import { supabase } from '../client'
import type { DatabaseDifficultyLevel as DifficultyLevel, DifficultyLevel as DifficultyLevelCode } from '../../../types'
import type { Database } from '../../../types/database'
import { logger } from '../../../lib/logger'
import type { DifficultyLevelDisplay } from '../../../types/llm/prompts'

export class DifficultyLevelService {
  private mapRowToDifficulty(
    row: Database['public']['Tables']['difficulty_levels']['Row']
  ): DifficultyLevel {
    return {
      id: row.id,
      code: row.code,
      name: this.toDifficultyDisplay(row.code, row.name),
      description: row.description,
      created_at: row.created_at,
    }
  }

  private toDifficultyDisplay(
    code: DifficultyLevelCode,
    name: string
  ): DifficultyLevelDisplay {
    const map: Record<DifficultyLevelCode, DifficultyLevelDisplay> = {
      a1: 'A1 (Beginner)',
      a2: 'A2 (Elementary)',
      b1: 'B1 (Intermediate)',
      b2: 'B2 (Upper Intermediate)',
    }
    if (
      name === 'A1 (Beginner)' ||
      name === 'A2 (Elementary)' ||
      name === 'B1 (Intermediate)' ||
      name === 'B2 (Upper Intermediate)'
    ) {
      return name
    }
    return map[code]
  }
  /**
   * Get all difficulty levels supported by the application
   */
  async getDifficultyLevels(): Promise<DifficultyLevel[]> {
    const result = await supabase
      .from('difficulty_levels')
      .select('*')
      .order('id');

    if (result.error) {
      throw new Error(`Failed to fetch difficulty levels: ${result.error.message}`);
    }

    const rows = (result.data as Database['public']['Tables']['difficulty_levels']['Row'][]) ?? []
    return rows.map(r => this.mapRowToDifficulty(r))
  }

  /**
   * Get a difficulty level by its code
   */
  async getDifficultyLevelByCode(code: DifficultyLevelCode): Promise<DifficultyLevel | null> {
    const result = await supabase
      .from('difficulty_levels')
      .select('*')
      .eq('code', code)
      .single();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch difficulty level: ${result.error.message}`);
    }

    if (!result.data) return null
    return this.mapRowToDifficulty(
      result.data as Database['public']['Tables']['difficulty_levels']['Row']
    )
  }

  /**
   * Get difficulty level name by code, with fallback to code if not found
   */
  async getDifficultyLevelName(code: DifficultyLevelCode): Promise<string> {
    try {
      const difficultyLevel = await this.getDifficultyLevelByCode(code);
      return difficultyLevel?.name ?? code;
    } catch (error) {
      logger.warn('database', `Failed to fetch difficulty level name for code: ${code}`, { error });
      return code; // Fallback to code if fetch fails
    }
  }
} 