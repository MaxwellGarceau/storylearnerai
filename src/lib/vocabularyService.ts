import { supabase } from '../api/supabase/client';
import type {
  Vocabulary,
  VocabularyInsert,
  VocabularyUpdate,
  VocabularyWithLanguages,
  VocabularyWithLanguagesAndStory,
} from '../types/database/vocabulary';
import { logger } from './logger';

export class VocabularyService {
  /**
   * Save a new vocabulary word
   */
  static async saveVocabularyWord(
    vocabularyData: VocabularyInsert
  ): Promise<Vocabulary> {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .insert(vocabularyData)
        .select()
        .single();

      if (error) {
        logger.error('general', 'Error saving vocabulary word', { error });
        throw new Error(`Failed to save vocabulary word: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned when saving vocabulary word');
      }

      return data;
    } catch (error) {
      logger.error('general', 'Error in saveVocabularyWord', { error });
      throw error;
    }
  }

  /**
   * Get all vocabulary words for a user with language information
   */
  static async getUserVocabulary(
    userId: string
  ): Promise<VocabularyWithLanguages[]> {
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
        throw new Error(`Failed to fetch vocabulary: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getUserVocabulary:', error);
      throw error;
    }
  }

  /**
   * Get vocabulary words for a specific language pair
   */
  static async getUserVocabularyByLanguages(
    userId: string,
    fromLanguageId: number,
    translatedLanguageId: number
  ): Promise<VocabularyWithLanguages[]> {
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
        throw new Error(`Failed to fetch vocabulary: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getUserVocabularyByLanguages:', error);
      throw error;
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
        throw new Error(`Failed to fetch vocabulary: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getUserVocabularyWithStories:', error);
      throw error;
    }
  }

  /**
   * Update a vocabulary word
   */
  static async updateVocabularyWord(
    id: number,
    updates: VocabularyUpdate
  ): Promise<Vocabulary> {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating vocabulary word:', error);
        throw new Error(`Failed to update vocabulary word: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned when updating vocabulary word');
      }

      return data;
    } catch (error) {
      logger.error('Error in updateVocabularyWord:', error);
      throw error;
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
        throw new Error(`Failed to delete vocabulary word: ${error.message}`);
      }
    } catch (error) {
      logger.error('Error in deleteVocabularyWord:', error);
      throw error;
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

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error
        logger.error('Error checking vocabulary existence:', error);
        throw new Error(
          `Failed to check vocabulary existence: ${error.message}`
        );
      }

      return !!data;
    } catch (error) {
      logger.error('Error in checkVocabularyExists:', error);
      throw error;
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
  ): Promise<VocabularyWithLanguages[]> {
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
        throw new Error(`Failed to search vocabulary: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Error in searchVocabulary:', error);
      throw error;
    }
  }
}
