import { supabase } from '../client';
import type { Language, DifficultyLevel } from '../../../lib/types/database';

export interface LanguagePairPrompt {
  id: string;
  from_language_id: string;
  to_language_id: string;
  difficulty_level_id: string;
  vocabulary?: string;
  grammar?: string;
  cultural?: string;
  style?: string;
  examples?: string;
  grammar_focus?: string;
  pronunciation_notes?: string;
  common_mistakes?: string;
  helpful_patterns?: string;
  native_language_considerations?: string;
  known_languages_benefits?: string;
  created_at: string;
  updated_at: string;
}

export interface LanguagePairPromptWithDetails extends LanguagePairPrompt {
  from_language: Language;
  to_language: Language;
  difficulty_level: DifficultyLevel;
}

export class LanguagePairPromptService {
  /**
   * Get language pair prompt configuration for a specific from->to language combination
   */
  async getLanguagePairPrompt(
    fromLanguageCode: string, 
    toLanguageCode: string, 
    difficultyCode: string
  ): Promise<LanguagePairPromptWithDetails | null> {
    const { data, error } = await supabase
      .from('language_pair_prompts')
      .select(`
        *,
        from_language:languages!language_pair_prompts_from_language_id_fkey(*),
        to_language:languages!language_pair_prompts_to_language_id_fkey(*),
        difficulty_level:difficulty_levels(*)
      `)
      .eq('from_language.code', fromLanguageCode)
      .eq('to_language.code', toLanguageCode)
      .eq('difficulty_level.code', difficultyCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch language pair prompt: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all language pair prompts for a specific from language
   */
  async getLanguagePairPromptsByFromLanguage(fromLanguageCode: string): Promise<LanguagePairPromptWithDetails[]> {
    const { data, error } = await supabase
      .from('language_pair_prompts')
      .select(`
        *,
        from_language:languages!language_pair_prompts_from_language_id_fkey(*),
        to_language:languages!language_pair_prompts_to_language_id_fkey(*),
        difficulty_level:difficulty_levels(*)
      `)
      .eq('from_language.code', fromLanguageCode)
      .order('to_language_id, difficulty_level_id');

    if (error) {
      throw new Error(`Failed to fetch language pair prompts for ${fromLanguageCode}: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get all language pair prompts for a specific to language
   */
  async getLanguagePairPromptsByToLanguage(toLanguageCode: string): Promise<LanguagePairPromptWithDetails[]> {
    const { data, error } = await supabase
      .from('language_pair_prompts')
      .select(`
        *,
        from_language:languages!language_pair_prompts_from_language_id_fkey(*),
        to_language:languages!language_pair_prompts_to_language_id_fkey(*),
        difficulty_level:difficulty_levels(*)
      `)
      .eq('to_language.code', toLanguageCode)
      .order('from_language_id, difficulty_level_id');

    if (error) {
      throw new Error(`Failed to fetch language pair prompts for ${toLanguageCode}: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get all language pair prompts
   */
  async getAllLanguagePairPrompts(): Promise<LanguagePairPromptWithDetails[]> {
    const { data, error } = await supabase
      .from('language_pair_prompts')
      .select(`
        *,
        from_language:languages!language_pair_prompts_from_language_id_fkey(*),
        to_language:languages!language_pair_prompts_to_language_id_fkey(*),
        difficulty_level:difficulty_levels(*)
      `)
      .order('from_language_id, to_language_id, difficulty_level_id');

    if (error) {
      throw new Error(`Failed to fetch all language pair prompts: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Check if a language pair prompt exists
   */
  async hasLanguagePairPrompt(
    fromLanguageCode: string, 
    toLanguageCode: string, 
    difficultyCode: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('language_pair_prompts')
      .select('id')
      .eq('from_language.code', fromLanguageCode)
      .eq('to_language.code', toLanguageCode)
      .eq('difficulty_level.code', difficultyCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false; // No rows returned
      }
      throw new Error(`Failed to check language pair prompt: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Create a new language pair prompt
   */
  async createLanguagePairPrompt(
    fromLanguageId: string,
    toLanguageId: string,
    difficultyLevelId: string,
    prompt: Partial<Omit<LanguagePairPrompt, 'id' | 'from_language_id' | 'to_language_id' | 'difficulty_level_id' | 'created_at' | 'updated_at'>>
  ): Promise<LanguagePairPrompt> {
    const { data, error } = await supabase
      .from('language_pair_prompts')
      .insert({
        from_language_id: fromLanguageId,
        to_language_id: toLanguageId,
        difficulty_level_id: difficultyLevelId,
        ...prompt
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create language pair prompt: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an existing language pair prompt
   */
  async updateLanguagePairPrompt(
    id: string,
    prompt: Partial<Omit<LanguagePairPrompt, 'id' | 'from_language_id' | 'to_language_id' | 'difficulty_level_id' | 'created_at' | 'updated_at'>>
  ): Promise<LanguagePairPrompt> {
    const { data, error } = await supabase
      .from('language_pair_prompts')
      .update(prompt)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update language pair prompt: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a language pair prompt
   */
  async deleteLanguagePairPrompt(id: string): Promise<void> {
    const { error } = await supabase
      .from('language_pair_prompts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete language pair prompt: ${error.message}`);
    }
  }

  /**
   * Get all available from language codes that have language pair prompts
   */
  async getAvailableFromLanguageCodes(): Promise<string[]> {
    const { data, error } = await supabase
      .from('language_pair_prompts')
      .select('from_language:languages!language_pair_prompts_from_language_id_fkey(code)')
      .order('from_language.code');

    if (error) {
      throw new Error(`Failed to fetch available from language codes: ${error.message}`);
    }

    // Extract unique language codes
    const languageCodes = [...new Set(data?.map(item => item.from_language?.code).filter(Boolean))];
    return languageCodes;
  }

  /**
   * Get all available to language codes for a specific from language
   */
  async getAvailableToLanguageCodes(fromLanguageCode: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('language_pair_prompts')
      .select('to_language:languages!language_pair_prompts_to_language_id_fkey(code)')
      .eq('from_language.code', fromLanguageCode)
      .order('to_language.code');

    if (error) {
      throw new Error(`Failed to fetch available to language codes for ${fromLanguageCode}: ${error.message}`);
    }

    // Extract unique language codes
    const languageCodes = [...new Set(data?.map(item => item.to_language?.code).filter(Boolean))];
    return languageCodes;
  }

  /**
   * Get all available difficulty codes for a specific language pair
   */
  async getAvailableDifficultyCodes(fromLanguageCode: string, toLanguageCode: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('language_pair_prompts')
      .select('difficulty_level:difficulty_levels(code)')
      .eq('from_language.code', fromLanguageCode)
      .eq('to_language.code', toLanguageCode)
      .order('difficulty_level.code');

    if (error) {
      throw new Error(`Failed to fetch available difficulty codes for ${fromLanguageCode}->${toLanguageCode}: ${error.message}`);
    }

    // Extract difficulty codes
    const difficultyCodes = data?.map(item => item.difficulty_level?.code).filter(Boolean) || [];
    return difficultyCodes;
  }

  /**
   * Get language pairs that are most similar to a given language pair
   * This can be used for fallback when exact language pair doesn't exist
   */
  async getSimilarLanguagePairs(fromLanguageCode: string, toLanguageCode: string): Promise<LanguagePairPromptWithDetails[]> {
    // This is a simplified implementation - in the future, this could use
    // language family relationships, linguistic similarity algorithms, etc.
    
    // For now, return prompts that share either the from or to language
    const { data, error } = await supabase
      .from('language_pair_prompts')
      .select(`
        *,
        from_language:languages!language_pair_prompts_from_language_id_fkey(*),
        to_language:languages!language_pair_prompts_to_language_id_fkey(*),
        difficulty_level:difficulty_levels(*)
      `)
      .or(`from_language.code.eq.${fromLanguageCode},to_language.code.eq.${toLanguageCode}`)
      .order('from_language_id, to_language_id, difficulty_level_id');

    if (error) {
      throw new Error(`Failed to fetch similar language pairs: ${error.message}`);
    }

    return data || [];
  }
} 