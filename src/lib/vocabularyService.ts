import { supabase } from '../api/supabase/client';
import type {
  Vocabulary,
  VocabularyInsert,
  VocabularyUpdate,
  VocabularyWithLanguages,
  VocabularyWithLanguagesAndStory,
  VocabularyPromise,
  VocabularyArrayPromise,
} from '../types/database/vocabulary';
import { logger } from './logger';

export class VocabularyService {
  /**
   * Type guard to check if an error is a Supabase PostgrestError
   */
  private static isPostgrestError(
    error: unknown
  ): error is { message: string } {
    return typeof error === 'object' && error !== null && 'message' in error;
  }
  /**
   * Save a new vocabulary word
   */
  static async saveVocabularyWord(
    vocabularyData: VocabularyInsert
  ): VocabularyPromise {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .insert(vocabularyData)
        .select()
        .single();

      if (error) {
        logger.error('general', 'Error saving vocabulary word', { error });
        const errorMessage = this.isPostgrestError(error)
          ? error.message
          : 'Unknown error';
        throw new Error(
          `Failed to save vocabulary word: ${String(errorMessage)}`
        );
      }

      if (!data) {
        throw new Error('No data returned when saving vocabulary word');
      }

      return data as Vocabulary;
    } catch (error) {
      logger.error('general', 'Error in saveVocabularyWord', { error });
      if (this.isPostgrestError(error)) {
        throw error;
      }
      throw new Error('Unknown error occurred while saving vocabulary word');
    }
  }

  /**
   * Get all vocabulary words for a user with language information
   */
  static async getUserVocabulary(userId: string): VocabularyArrayPromise {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select(
          `
          *,
          translated_language:languages!vocabulary_translated_language_id_fkey(*),
          from_language:languages!vocabulary_from_language_id_fkey(*)
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching user vocabulary:', error);
        const errorMessage = this.isPostgrestError(error)
          ? error.message
          : 'Unknown error';
        throw new Error(`Failed to fetch vocabulary: ${errorMessage}`);
      }

      return (data ?? []) as VocabularyWithLanguages[];
    } catch (error) {
      logger.error('Error in getUserVocabulary:', error);
      if (this.isPostgrestError(error)) {
        throw error;
      }
      throw new Error('Unknown error occurred while fetching user vocabulary');
    }
  }

  /**
   * Get vocabulary words for a specific language pair
   */
  static async getUserVocabularyByLanguages(
    userId: string,
    fromLanguageId: number,
    translatedLanguageId: number
  ): VocabularyArrayPromise {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select(
          `
          *,
          translated_language:languages!vocabulary_translated_language_id_fkey(*),
          from_language:languages!vocabulary_from_language_id_fkey(*)
        `
        )
        .eq('user_id', userId)
        .eq('from_language_id', fromLanguageId)
        .eq('translated_language_id', translatedLanguageId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching vocabulary by languages:', error);
        const errorMessage = this.isPostgrestError(error)
          ? error.message
          : 'Unknown error';
        throw new Error(`Failed to fetch vocabulary: ${errorMessage}`);
      }

      return (data ?? []) as VocabularyWithLanguages[];
    } catch (error) {
      logger.error('Error in getUserVocabularyByLanguages:', error);
      if (this.isPostgrestError(error)) {
        throw error;
      }
      throw new Error(
        'Unknown error occurred while fetching vocabulary by languages'
      );
    }
  }

  /**
   * Get vocabulary words with story context
   */
  static async getUserVocabularyWithStories(
    userId: string
  ): Promise<VocabularyWithLanguagesAndStory[]> {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select(
          `
          *,
          translated_language:languages!vocabulary_translated_language_id_fkey(*),
          from_language:languages!vocabulary_from_language_id_fkey(*),
          saved_translation:saved_translations(id, title, original_story, translated_story)
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching vocabulary with stories:', error);
        const errorMessage = this.isPostgrestError(error)
          ? error.message
          : 'Unknown error';
        throw new Error(`Failed to fetch vocabulary: ${errorMessage}`);
      }

      return (data ?? []) as VocabularyWithLanguages[];
    } catch (error) {
      logger.error('Error in getUserVocabularyWithStories:', error);
      if (this.isPostgrestError(error)) {
        throw error;
      }
      throw new Error(
        'Unknown error occurred while fetching vocabulary with stories'
      );
    }
  }

  /**
   * Update a vocabulary word
   */
  static async updateVocabularyWord(
    id: number,
    updates: VocabularyUpdate
  ): VocabularyPromise {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating vocabulary word:', error);
        const errorMessage = this.isPostgrestError(error)
          ? error.message
          : 'Unknown error';
        throw new Error(`Failed to update vocabulary word: ${errorMessage}`);
      }

      if (!data) {
        throw new Error('No data returned when updating vocabulary word');
      }

      return data as Vocabulary;
    } catch (error) {
      logger.error('Error in updateVocabularyWord:', error);
      if (this.isPostgrestError(error)) {
        throw error;
      }
      throw new Error('Unknown error occurred while updating vocabulary word');
    }
  }

  /**
   * Delete a vocabulary word
   */
  static async deleteVocabularyWord(id: number): Promise<void> {
    try {
      const { error } = await supabase.from('vocabulary').delete().eq('id', id);

      if (error) {
        logger.error('Error deleting vocabulary word:', error);
        const errorMessage = this.isPostgrestError(error)
          ? error.message
          : 'Unknown error';
        throw new Error(`Failed to delete vocabulary word: ${errorMessage}`);
      }
    } catch (error) {
      logger.error('Error in deleteVocabularyWord:', error);
      if (this.isPostgrestError(error)) {
        throw error;
      }
      throw new Error('Unknown error occurred while deleting vocabulary word');
    }
  }

  /**
   * Check if a vocabulary word already exists for a user
   */
  static async checkVocabularyExists(
    userId: string,
    originalWord: string,
    translatedWord: string,
    fromLanguageId: number,
    translatedLanguageId: number
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('id')
        .eq('user_id', userId)
        .eq('original_word', originalWord)
        .eq('translated_word', translatedWord)
        .eq('from_language_id', fromLanguageId)
        .eq('translated_language_id', translatedLanguageId)
        .single();

      if (error && (error as { code?: string }).code !== 'PGRST116') {
        // PGRST116 is "not found" error
        logger.error('Error checking vocabulary existence:', error);
        const errorMessage = this.isPostgrestError(error)
          ? error.message
          : 'Unknown error';
        throw new Error(
          `Failed to check vocabulary existence: ${String(errorMessage)}`
        );
      }

      return !!data;
    } catch (error) {
      logger.error('Error in checkVocabularyExists:', error);
      if (this.isPostgrestError(error)) {
        throw error;
      }
      throw new Error(
        'Unknown error occurred while checking vocabulary existence'
      );
    }
  }

  /**
   * Search vocabulary words by original or translated word
   */
  static async searchVocabulary(
    userId: string,
    searchTerm: string,
    fromLanguageId?: number,
    translatedLanguageId?: number
  ): VocabularyArrayPromise {
    try {
      let query = supabase
        .from('vocabulary')
        .select(
          `
          *,
          translated_language:languages!vocabulary_translated_language_id_fkey(*),
          from_language:languages!vocabulary_from_language_id_fkey(*)
        `
        )
        .eq('user_id', userId)
        .or(
          `original_word.ilike.%${searchTerm}%,translated_word.ilike.%${searchTerm}%`
        )
        .order('created_at', { ascending: false });

      if (fromLanguageId) {
        query = query.eq('from_language_id', fromLanguageId);
      }

      if (translatedLanguageId) {
        query = query.eq('translated_language_id', translatedLanguageId);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error searching vocabulary:', error);
        const errorMessage = this.isPostgrestError(error)
          ? error.message
          : 'Unknown error';
        throw new Error(`Failed to search vocabulary: ${errorMessage}`);
      }

      return (data ?? []) as VocabularyWithLanguages[];
    } catch (error) {
      logger.error('Error in searchVocabulary:', error);
      if (this.isPostgrestError(error)) {
        throw error;
      }
      throw new Error('Unknown error occurred while searching vocabulary');
    }
  }
}
