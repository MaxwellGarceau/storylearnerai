import { supabase } from '../client'
import type { Language } from '../../../lib/types/database'

export class LanguageService {
  /**
   * Get all languages supported by the application
   */
  async getLanguages(): Promise<Language[]> {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch languages: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a language by its code
   */
  async getLanguageByCode(code: string): Promise<Language | null> {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch language: ${error.message}`);
    }

    return data;
  }

  /**
   * Get language name by code, with fallback to code if not found
   */
  async getLanguageName(code: string): Promise<string> {
    try {
      const language = await this.getLanguageByCode(code);
      return language?.name || code;
    } catch (error) {
      console.warn(`Failed to fetch language name for code: ${code}`, error);
      return code; // Fallback to code if fetch fails
    }
  }
} 