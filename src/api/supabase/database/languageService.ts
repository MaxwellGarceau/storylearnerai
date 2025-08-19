import { supabase } from '../client'
import type { DatabaseLanguage as Language, LanguageCode, EnglishLanguageName, NativeLanguageName } from '../../../types'
import type { Database } from '../../../types/database'
import { logger } from '../../../lib/logger'

export class LanguageService {
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

    // Cast the raw database types to our typed interface
    return ((result.data as Database['public']['Tables']['languages']['Row'][]) || []).map(lang => ({
      ...lang,
      name: lang.name as EnglishLanguageName,
      native_name: lang.native_name as NativeLanguageName
    }));
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

    // Cast the raw database type to our typed interface
    return {
      ...result.data,
      name: result.data.name as EnglishLanguageName,
      native_name: result.data.native_name as NativeLanguageName
    };
  }

  /**
   * Get language name by code, with fallback to code if not found
   */
  async getLanguageName(code: LanguageCode): Promise<EnglishLanguageName> {
    try {
      const language = await this.getLanguageByCode(code);
      return language?.name ?? (code === 'en' ? 'English' : 'Spanish');
    } catch (error) {
      logger.warn('database', `Failed to fetch language name for code: ${code}`, { error });
      return code === 'en' ? 'English' : 'Spanish'; // Fallback to appropriate English name
    }
  }
} 