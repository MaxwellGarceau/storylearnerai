import { supabase } from '../client'
import type { DatabaseLanguage as Language, LanguageCode } from '../../../types'
import type { Database } from '../../../types/database'
import { logger } from '../../../lib/logger'
import type {
  EnglishLanguageName,
  NativeLanguageName,
} from '../../../types/llm/prompts'

export class LanguageService {
  private mapRowToLanguage(
    row: Database['public']['Tables']['languages']['Row']
  ): Language {
    return {
      id: row.id,
      code: row.code,
      name: row.name as EnglishLanguageName,
      native_name: row.native_name as NativeLanguageName,
      created_at: row.created_at,
    }
  }

  /**
   * Get all languages supported by the application
   */
  async getLanguages(): Promise<Language[]> {
    const result = await supabase
      .from('languages')
      .select('*')
      .order('name');

    if (result.error) {
      throw new Error(`Failed to fetch languages: ${result.error.message}`);
    }

    const rows = (result.data as Database['public']['Tables']['languages']['Row'][]) || []
    return rows.map(r => this.mapRowToLanguage(r))
  }

  /**
   * Get a language by its code
   */
  async getLanguageByCode(code: LanguageCode): Promise<Language | null> {
    const result = await supabase
      .from('languages')
      .select('*')
      .eq('code', code)
      .single();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch language: ${result.error.message}`);
    }

    if (!result.data) {
      return null;
    }

    return this.mapRowToLanguage(
      result.data as Database['public']['Tables']['languages']['Row']
    )
  }

  /**
   * Get language name by code, with fallback to code if not found
   */
  async getLanguageName(code: LanguageCode): Promise<string> {
    try {
      const language = await this.getLanguageByCode(code);
      return language?.name ?? (code === 'en' ? 'English' : 'Spanish');
    } catch (error) {
      logger.warn('database', `Failed to fetch language name for code: ${code}`, { error });
      return code === 'en' ? 'English' : 'Spanish'; // Fallback to appropriate English name
    }
  }
}
