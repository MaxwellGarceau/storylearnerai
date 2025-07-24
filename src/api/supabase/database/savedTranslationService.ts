import { supabase } from '../client';
import {
  SavedTranslation,
  SavedTranslationWithDetails,
  CreateSavedTranslationRequest,
  UpdateSavedTranslationRequest,
  SavedTranslationFilters,
  Language,
  DifficultyLevel,
} from '../../../lib/types/savedTranslations';

export class SavedTranslationService {
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
   * Get all difficulty levels
   */
  async getDifficultyLevels(): Promise<DifficultyLevel[]> {
    const { data, error } = await supabase
      .from('difficulty_levels')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch difficulty levels: ${error.message}`);
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
   * Get a difficulty level by its code
   */
  async getDifficultyLevelByCode(code: string): Promise<DifficultyLevel | null> {
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
   * Create a new saved translation
   */
  async createSavedTranslation(
    request: CreateSavedTranslationRequest,
    userId: string
  ): Promise<SavedTranslationWithDetails> {
    // Get language and difficulty level IDs from codes
    const [originalLanguage, translatedLanguage, difficultyLevel] = await Promise.all([
      this.getLanguageByCode(request.original_language_code),
      this.getLanguageByCode(request.translated_language_code),
      this.getDifficultyLevelByCode(request.difficulty_level_code),
    ]);

    if (!originalLanguage) {
      throw new Error(`Language not found: ${request.original_language_code}`);
    }
    if (!translatedLanguage) {
      throw new Error(`Language not found: ${request.translated_language_code}`);
    }
    if (!difficultyLevel) {
      throw new Error(`Difficulty level not found: ${request.difficulty_level_code}`);
    }

    const { data, error } = await supabase
      .from('saved_translations')
      .insert({
        user_id: userId,
        original_story: request.original_story,
        translated_story: request.translated_story,
        original_language_id: originalLanguage.id,
        translated_language_id: translatedLanguage.id,
        difficulty_level_id: difficultyLevel.id,
        title: request.title,
        notes: request.notes,
      })
      .select(`
        *,
        original_language:languages!saved_translations_original_language_id_fkey(*),
        translated_language:languages!saved_translations_translated_language_id_fkey(*),
        difficulty_level:difficulty_levels!saved_translations_difficulty_level_id_fkey(*)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create saved translation: ${error.message}`);
    }

    return data as SavedTranslationWithDetails;
  }

  /**
   * Get all saved translations for a user with optional filters
   */
  async getSavedTranslations(
    userId: string,
    filters: SavedTranslationFilters = {}
  ): Promise<SavedTranslationWithDetails[]> {
    let query = supabase
      .from('saved_translations')
      .select(`
        *,
        original_language:languages!saved_translations_original_language_id_fkey(*),
        translated_language:languages!saved_translations_translated_language_id_fkey(*),
        difficulty_level:difficulty_levels!saved_translations_difficulty_level_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.original_language_code) {
      const originalLanguage = await this.getLanguageByCode(filters.original_language_code);
      if (originalLanguage) {
        query = query.eq('original_language_id', originalLanguage.id);
      }
    }

    if (filters.translated_language_code) {
      const translatedLanguage = await this.getLanguageByCode(filters.translated_language_code);
      if (translatedLanguage) {
        query = query.eq('translated_language_id', translatedLanguage.id);
      }
    }

    if (filters.difficulty_level_code) {
      const difficultyLevel = await this.getDifficultyLevelByCode(filters.difficulty_level_code);
      if (difficultyLevel) {
        query = query.eq('difficulty_level_id', difficultyLevel.id);
      }
    }

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,notes.ilike.%${filters.search}%,original_story.ilike.%${filters.search}%,translated_story.ilike.%${filters.search}%`
      );
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch saved translations: ${error.message}`);
    }

    return (data || []) as SavedTranslationWithDetails[];
  }

  /**
   * Get a specific saved translation by ID
   */
  async getSavedTranslation(
    translationId: string,
    userId: string
  ): Promise<SavedTranslationWithDetails | null> {
    const { data, error } = await supabase
      .from('saved_translations')
      .select(`
        *,
        original_language:languages!saved_translations_original_language_id_fkey(*),
        translated_language:languages!saved_translations_translated_language_id_fkey(*),
        difficulty_level:difficulty_levels!saved_translations_difficulty_level_id_fkey(*)
      `)
      .eq('id', translationId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch saved translation: ${error.message}`);
    }

    return data as SavedTranslationWithDetails;
  }

  /**
   * Update a saved translation
   */
  async updateSavedTranslation(
    translationId: string,
    userId: string,
    updates: UpdateSavedTranslationRequest
  ): Promise<SavedTranslationWithDetails> {
    const { data, error } = await supabase
      .from('saved_translations')
      .update(updates)
      .eq('id', translationId)
      .eq('user_id', userId)
      .select(`
        *,
        original_language:languages!saved_translations_original_language_id_fkey(*),
        translated_language:languages!saved_translations_translated_language_id_fkey(*),
        difficulty_level:difficulty_levels!saved_translations_difficulty_level_id_fkey(*)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update saved translation: ${error.message}`);
    }

    return data as SavedTranslationWithDetails;
  }

  /**
   * Delete a saved translation
   */
  async deleteSavedTranslation(translationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_translations')
      .delete()
      .eq('id', translationId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete saved translation: ${error.message}`);
    }
  }

  /**
   * Get count of saved translations for a user
   */
  async getSavedTranslationsCount(
    userId: string,
    filters: SavedTranslationFilters = {}
  ): Promise<number> {
    let query = supabase
      .from('saved_translations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Apply filters (same logic as getSavedTranslations)
    if (filters.original_language_code) {
      const originalLanguage = await this.getLanguageByCode(filters.original_language_code);
      if (originalLanguage) {
        query = query.eq('original_language_id', originalLanguage.id);
      }
    }

    if (filters.translated_language_code) {
      const translatedLanguage = await this.getLanguageByCode(filters.translated_language_code);
      if (translatedLanguage) {
        query = query.eq('translated_language_id', translatedLanguage.id);
      }
    }

    if (filters.difficulty_level_code) {
      const difficultyLevel = await this.getDifficultyLevelByCode(filters.difficulty_level_code);
      if (difficultyLevel) {
        query = query.eq('difficulty_level_id', difficultyLevel.id);
      }
    }

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,notes.ilike.%${filters.search}%,original_story.ilike.%${filters.search}%,translated_story.ilike.%${filters.search}%`
      );
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to get saved translations count: ${error.message}`);
    }

    return count || 0;
  }
} 