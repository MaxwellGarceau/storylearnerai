import { supabase } from '../api/supabase/client';
import type {
  Vocabulary,
  VocabularyInsert,
  VocabularyUpdate,
  VocabularyWithLanguages,
  VocabularyPromise,
  VocabularyArrayPromise,
} from '../types/database/vocabulary';
import type { SupabaseResponse } from '../types/database/common';
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
      const { data, error }: SupabaseResponse<Vocabulary> = await supabase
        .from('vocabulary')
        .upsert(vocabularyData, {
          onConflict:
            'user_id,original_word,translated_word,translated_language_id,from_language_id',
          ignoreDuplicates: false,
        })
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

      // If a saved_translation_id was provided but not persisted (e.g., existing row without link), update it
      if (
        typeof (vocabularyData as { saved_translation_id?: number })
          .saved_translation_id === 'number' &&
        data.saved_translation_id == null
      ) {
        const desiredId = (vocabularyData as { saved_translation_id: number })
          .saved_translation_id;
        const {
          data: updated,
          error: updateError,
        }: SupabaseResponse<Vocabulary> = await supabase
          .from('vocabulary')
          .update({ saved_translation_id: desiredId })
          .eq('id', data.id)
          .select()
          .single();

        if (updateError) {
          logger.error(
            'database',
            'Failed to set saved_translation_id on update',
            {
              error: updateError,
            }
          );
        } else if (updated) {
          return updated;
        }
      }

      return data;
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
      const { data, error }: SupabaseResponse<VocabularyWithLanguages[]> =
        await supabase
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
        logger.error('database', 'Error fetching user vocabulary', { error });
        const errorMessage = this.isPostgrestError(error)
          ? error.message
          : 'Unknown error';
        throw new Error(`Failed to fetch vocabulary: ${errorMessage}`);
      }

      return data ?? [];
    } catch (error) {
      logger.error('database', 'Error in getUserVocabulary', { error });
      if (this.isPostgrestError(error)) {
        throw error;
      }
      throw new Error('Unknown error occurred while fetching user vocabulary');
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
      const { data, error }: SupabaseResponse<Vocabulary> = await supabase
        .from('vocabulary')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('database', 'Error updating vocabulary word', { error });
        const errorMessage = this.isPostgrestError(error)
          ? error.message
          : 'Unknown error';
        throw new Error(`Failed to update vocabulary word: ${errorMessage}`);
      }

      if (!data) {
        throw new Error('No data returned when updating vocabulary word');
      }

      return data;
    } catch (error) {
      logger.error('database', 'Error in updateVocabularyWord', { error });
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
        logger.error('database', 'Error deleting vocabulary word', { error });
        const errorMessage = this.isPostgrestError(error)
          ? error.message
          : 'Unknown error';
        throw new Error(`Failed to delete vocabulary word: ${errorMessage}`);
      }
    } catch (error) {
      logger.error('database', 'Error in deleteVocabularyWord', { error });
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
      const { data, error }: SupabaseResponse<{ id: number }> = await supabase
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
        logger.error('database', 'Error checking vocabulary existence', {
          error,
        });
        const errorMessage = this.isPostgrestError(error)
          ? error.message
          : 'Unknown error';
        throw new Error(
          `Failed to check vocabulary existence: ${String(errorMessage)}`
        );
      }

      return !!data;
    } catch (error) {
      logger.error('database', 'Error in checkVocabularyExists', { error });
      if (this.isPostgrestError(error)) {
        throw error;
      }
      throw new Error(
        'Unknown error occurred while checking vocabulary existence'
      );
    }
  }
}
