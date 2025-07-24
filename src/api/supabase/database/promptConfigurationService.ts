import { supabase } from '../client';
import type { Language, DifficultyLevel } from '../../../lib/types/database';

export interface PromptConfiguration {
  id: string;
  language_id: string;
  difficulty_level_id: string;
  vocabulary?: string;
  grammar?: string;
  cultural?: string;
  style?: string;
  examples?: string;
  created_at: string;
  updated_at: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  general_instructions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromptConfigurationWithDetails extends PromptConfiguration {
  language: Language;
  difficulty_level: DifficultyLevel;
}

export class PromptConfigurationService {
  /**
   * Get all prompt configurations with language and difficulty details
   */
  async getPromptConfigurations(): Promise<PromptConfigurationWithDetails[]> {
    const { data, error } = await supabase
      .from('prompt_configurations')
      .select(`
        *,
        language:languages(*),
        difficulty_level:difficulty_levels(*)
      `)
      .order('language_id, difficulty_level_id');

    if (error) {
      throw new Error(`Failed to fetch prompt configurations: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get prompt configuration for a specific language and difficulty
   */
  async getPromptConfiguration(languageCode: string, difficultyCode: string): Promise<PromptConfigurationWithDetails | null> {
    const { data, error } = await supabase
      .from('prompt_configurations')
      .select(`
        *,
        language:languages(*),
        difficulty_level:difficulty_levels(*)
      `)
      .eq('language.code', languageCode)
      .eq('difficulty_level.code', difficultyCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch prompt configuration: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all prompt configurations for a specific language
   */
  async getPromptConfigurationsByLanguage(languageCode: string): Promise<PromptConfigurationWithDetails[]> {
    const { data, error } = await supabase
      .from('prompt_configurations')
      .select(`
        *,
        language:languages(*),
        difficulty_level:difficulty_levels(*)
      `)
      .eq('language.code', languageCode)
      .order('difficulty_level_id');

    if (error) {
      throw new Error(`Failed to fetch prompt configurations for language ${languageCode}: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get prompt template by name
   */
  async getPromptTemplate(name: string): Promise<PromptTemplate | null> {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('name', name)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch prompt template: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all active prompt templates
   */
  async getPromptTemplates(): Promise<PromptTemplate[]> {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch prompt templates: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a new prompt configuration
   */
  async createPromptConfiguration(
    languageId: string,
    difficultyLevelId: string,
    configuration: Partial<Omit<PromptConfiguration, 'id' | 'language_id' | 'difficulty_level_id' | 'created_at' | 'updated_at'>>
  ): Promise<PromptConfiguration> {
    const { data, error } = await supabase
      .from('prompt_configurations')
      .insert({
        language_id: languageId,
        difficulty_level_id: difficultyLevelId,
        ...configuration
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create prompt configuration: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an existing prompt configuration
   */
  async updatePromptConfiguration(
    id: string,
    configuration: Partial<Omit<PromptConfiguration, 'id' | 'language_id' | 'difficulty_level_id' | 'created_at' | 'updated_at'>>
  ): Promise<PromptConfiguration> {
    const { data, error } = await supabase
      .from('prompt_configurations')
      .update(configuration)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update prompt configuration: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a prompt configuration
   */
  async deletePromptConfiguration(id: string): Promise<void> {
    const { error } = await supabase
      .from('prompt_configurations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete prompt configuration: ${error.message}`);
    }
  }

  /**
   * Check if a language/difficulty combination has a prompt configuration
   */
  async hasPromptConfiguration(languageCode: string, difficultyCode: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('prompt_configurations')
      .select('id')
      .eq('language.code', languageCode)
      .eq('difficulty_level.code', difficultyCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false; // No rows returned
      }
      throw new Error(`Failed to check prompt configuration: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Get all available language codes that have prompt configurations
   */
  async getAvailableLanguageCodes(): Promise<string[]> {
    const { data, error } = await supabase
      .from('prompt_configurations')
      .select('language:languages(code)')
      .order('language.code');

    if (error) {
      throw new Error(`Failed to fetch available language codes: ${error.message}`);
    }

    // Extract unique language codes
    const languageCodes = [...new Set(data?.map(item => item.language?.code).filter(Boolean))];
    return languageCodes;
  }

  /**
   * Get all available difficulty codes for a specific language
   */
  async getAvailableDifficultyCodes(languageCode: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('prompt_configurations')
      .select('difficulty_level:difficulty_levels(code)')
      .eq('language.code', languageCode)
      .order('difficulty_level.code');

    if (error) {
      throw new Error(`Failed to fetch available difficulty codes: ${error.message}`);
    }

    // Extract difficulty codes
    const difficultyCodes = data?.map(item => item.difficulty_level?.code).filter(Boolean) || [];
    return difficultyCodes;
  }
} 