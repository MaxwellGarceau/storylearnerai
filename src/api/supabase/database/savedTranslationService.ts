import { supabase } from '../client';
import type {
  DatabaseSavedTranslationWithDetails,
  UpdateSavedTranslationRequest,
  SavedTranslationFilters,
  DatabaseLanguage,
  DatabaseDifficultyLevel,
} from '../../../types/database';
import type { DatabaseSavedTranslationWithDetailsPromise } from '../../../types/database/promise';
import type { LanguageCode } from '../../../types/llm/prompts';
import { validateStoryText, sanitizeText } from '../../../lib/utils/sanitization';
import type { VoidPromise } from '../../../types/common';
import { LanguageService } from './languageService';
import { DifficultyLevelService } from './difficultyLevelService';
import { logger } from '@/lib/logger';
import type { NullableString } from '../../../types/common';

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Type for saved translation filters with optional language codes
 * Makes from_language_code and target_language_code optional while keeping other filters required
 */
type SavedTranslationFiltersWithOptionalLanguages = Omit<SavedTranslationFilters, 'from_language_code' | 'to_language_code'> & {
  from_language_code?: LanguageCode;
  to_language_code?: LanguageCode;
};

// Use centralized app translation types
import type {
  SaveTranslationParams,
  LoadedTranslationToken,
  LoadedTranslation,
} from '../../../types/app/translations';

export class SavedTranslationService {
  private languageService = new LanguageService();
  private difficultyLevelService = new DifficultyLevelService();

  /**
   * Save a translation and its token stream using the new schema:
   * - Insert into saved_translations
   * - Insert ordered tokens into translation_tokens
   * Returns the created translation id
   */
  async saveTranslationWithTokens(params: SaveTranslationParams): Promise<number> {
    const { userId, fromLanguage, toLanguage, fromText, toText, difficultyLevel, title, notes, tokens } = params;

    // Get language and difficulty level IDs from codes
    const [fromLanguageData, toLanguageData, difficultyLevelData] = await Promise.all([
      this.languageService.getLanguageByCode(fromLanguage),
      this.languageService.getLanguageByCode(toLanguage),
      this.difficultyLevelService.getDifficultyLevelByCode(difficultyLevel),
    ]);

    if (!fromLanguageData) {
      throw new Error(`Language not found: ${fromLanguage}`);
    }
    if (!toLanguageData) {
      throw new Error(`Language not found: ${toLanguage}`);
    }
    if (!difficultyLevelData) {
      throw new Error(`Difficulty level not found: ${difficultyLevel}`);
    }

    // 1) Insert main translation
    const insertResult = await supabase
      .from('saved_translations')
      .insert({
        user_id: userId,
        from_language_id: fromLanguageData.id,
        to_language_id: toLanguageData.id,
        from_text: fromText,
        to_text: toText,
        difficulty_level_id: difficultyLevelData.id,
        title: title,
        notes: notes,
      })
      .select('id')
      .single();

    if (insertResult.error || !insertResult.data) {
      throw new Error(`Failed to create translation: ${insertResult.error?.message ?? 'unknown error'}`);
    }

    const translationId = insertResult.data.id as number;

    if (!Array.isArray(tokens) || tokens.length === 0) {
      return translationId; // no tokens to insert
    }

    // 2) Insert tokens in order
    const tokenInserts = tokens.map((token, index) => {
      if (token.type === 'word') {
        const word = token;
        return {
          translation_id: translationId,
          token_index: index,
          token_type: 'word',
          to_word: word.to_word,
          to_lemma: word.to_lemma,
          from_word: word.from_word,
          from_lemma: word.from_lemma,
          pos: word.pos ?? null,
          difficulty: word.difficulty ?? null,
          from_definition: word.from_definition ?? null,
          token_value: null,
        };
      }
      const generic = token;
      return {
        translation_id: translationId,
        token_index: index,
        token_type: generic.type,
        to_word: null,
        to_lemma: null,
        from_word: null,
        from_lemma: null,
        pos: null,
        difficulty: null,
        from_definition: null,
        token_value: generic.value,
      };
    });

    const tokensResult = await supabase
      .from('translation_tokens')
      .insert(tokenInserts);

    if (tokensResult.error) {
      throw new Error(`Failed to insert translation tokens: ${tokensResult.error.message}`);
    }

    return translationId;
  }

  /**
   * Load a translation and its ordered token stream and rehydrate token objects
   */
  async loadTranslationWithTokens(translationId: number): Promise<LoadedTranslation | null> {
    // 1) Load main translation with language and difficulty data
    const translationResult = await supabase
      .from('saved_translations')
      .select(`
        *,
        from_language:languages!saved_translations_from_language_id_fkey(*),
        to_language:languages!saved_translations_to_language_id_fkey(*),
        difficulty_level:difficulty_levels!saved_translations_difficulty_level_id_fkey(*)
      `)
      .eq('id', translationId)
      .single();

    if (translationResult.error) {
      if (translationResult.error.code === 'PGRST116') {
        return null; // not found
      }
      throw new Error(`Failed to load translation: ${translationResult.error.message}`);
    }

    const translationRow = translationResult.data as unknown as {
      id: number;
      user_id: string;
      from_language_id: number;
      to_language_id: number;
      from_text: string;
      to_text: string;
      difficulty_level_id: number;
      title?: string | null;
      notes?: string | null;
      created_at: string;
      updated_at: string;
      from_language: DatabaseLanguage;
      to_language: DatabaseLanguage;
      difficulty_level: DatabaseDifficultyLevel;
    };

    // 2) Load ordered tokens
    type TokenRow = {
      token_type: 'word' | 'punctuation' | 'whitespace';
      to_word: NullableString;
      to_lemma: NullableString;
      from_word: NullableString;
      from_lemma: NullableString;
      pos: NullableString;
      difficulty: NullableString;
      from_definition: NullableString;
      token_value: NullableString;
    };

    const tokensResult = await supabase
      .from('translation_tokens')
      .select('*')
      .eq('translation_id', translationId)
      .order('token_index', { ascending: true });

    logger.debug('database', 'translation tokensResult', tokensResult);

    if (tokensResult.error) {
      throw new Error(`Failed to load translation tokens: ${tokensResult.error.message}`);
    }

    const reconstructedTokens: LoadedTranslationToken[] = (tokensResult.data as unknown as TokenRow[] | null ?? []).map((row: TokenRow) => {
      if (row.token_type === 'word') {
        return {
          type: 'word',
          to_word: row.to_word ?? '',
          to_lemma: row.to_lemma ?? '',
          from_word: row.from_word ?? '',
          from_lemma: row.from_lemma ?? '',
          pos: row.pos ?? undefined,
          difficulty: row.difficulty ?? undefined,
          from_definition: row.from_definition ?? undefined,
        };
      }
      return {
        type: row.token_type,
        value: row.token_value ?? '',
      };
    });

    return {
      id: translationRow.id,
      user_id: translationRow.user_id,
      from_language_id: translationRow.from_language_id,
      to_language_id: translationRow.to_language_id,
      from_text: translationRow.from_text,
      to_text: translationRow.to_text,
      difficulty_level_id: translationRow.difficulty_level_id,
      title: translationRow.title ?? null,
      notes: translationRow.notes ?? null,
      created_at: translationRow.created_at,
      updated_at: translationRow.updated_at,
      tokens: reconstructedTokens,
      from_language: translationRow.from_language,
      to_language: translationRow.to_language,
      difficulty_level: translationRow.difficulty_level,
    };
  }

  /**
   * Validate and sanitize update data
   */
  private static validateUpdateSavedTranslationData(
    updates: UpdateSavedTranslationRequest
  ): { isValid: boolean; errors: ValidationError[]; sanitizedData: UpdateSavedTranslationRequest } {
    const errors: ValidationError[] = [];
    const sanitizedData: UpdateSavedTranslationRequest = { ...updates };

    // Validate and sanitize title (optional)
    if (updates.title !== undefined && updates.title !== null) {
      if (typeof updates.title !== 'string') {
        errors.push({ field: 'title', message: 'Title must be a string' });
      } else {
        const sanitizedTitle = sanitizeText(updates.title, { maxLength: 200 });
        const titleValidation = validateStoryText(sanitizedTitle);
        if (!titleValidation.isValid) {
          errors.push({ field: 'title', message: titleValidation.errors[0] || 'Invalid title content' });
        } else {
          sanitizedData.title = titleValidation.sanitizedText || undefined;
        }
      }
    }

    // Validate and sanitize notes (optional)
    if (updates.notes !== undefined && updates.notes !== null) {
      if (typeof updates.notes !== 'string') {
        errors.push({ field: 'notes', message: 'Notes must be a string' });
      } else {
        const sanitizedNotes = sanitizeText(updates.notes, { maxLength: 1000 });
        const notesValidation = validateStoryText(sanitizedNotes);
        if (!notesValidation.isValid) {
          errors.push({ field: 'notes', message: notesValidation.errors[0] || 'Invalid notes content' });
        } else {
          sanitizedData.notes = notesValidation.sanitizedText || undefined;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    };
  }




  /**
   * Get all saved translations for a user with optional filters
   */
  async getSavedTranslations(
    userId: string,
    filters: SavedTranslationFiltersWithOptionalLanguages = {}
  ): Promise<DatabaseSavedTranslationWithDetails[]> {
    // Validate user ID
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Valid user ID is required');
    }

    // Validate search parameter if provided
    if (filters.search && typeof filters.search !== 'string') {
      throw new Error('Search parameter must be a string');
    }
    let query = supabase
      .from('saved_translations')
      .select(`
        *,
        from_language:languages!saved_translations_from_language_id_fkey(*),
        to_language:languages!saved_translations_to_language_id_fkey(*),
        difficulty_level:difficulty_levels!saved_translations_difficulty_level_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.from_language_code) {
      const fromLanguage = await this.languageService.getLanguageByCode(filters.from_language_code);
      if (fromLanguage) {
        query = query.eq('from_language_id', fromLanguage.id);
      }
    }

    if (filters.to_language_code) {
      const toLanguage = await this.languageService.getLanguageByCode(filters.to_language_code);
      if (toLanguage) {
        query = query.eq('to_language_id', toLanguage.id);
      }
    }

    if (filters.difficulty_level_code) {
      const difficultyLevel = await this.difficultyLevelService.getDifficultyLevelByCode(filters.difficulty_level_code);
      if (difficultyLevel) {
        query = query.eq('difficulty_level_id', difficultyLevel.id);
      }
    }

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,notes.ilike.%${filters.search}%,from_text.ilike.%${filters.search}%,to_text.ilike.%${filters.search}%`
      );
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit ?? 50) - 1);
    }

    const result = await query;

    if (result.error) {
      throw new Error(`Failed to fetch saved translations: ${result.error.message}`);
    }

    return (result.data ?? []) as DatabaseSavedTranslationWithDetails[];
  }


  /**
   * Update a saved translation
   */
  async updateSavedTranslation(
    translationId: string,
    userId: string,
    updates: UpdateSavedTranslationRequest
  ): DatabaseSavedTranslationWithDetailsPromise {
    // Validate input parameters
    if (!translationId || typeof translationId !== 'string' || translationId.trim().length === 0) {
      throw new Error('Valid translation ID is required');
    }
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Valid user ID is required');
    }

    // Validate and sanitize update data
    const validation = SavedTranslationService.validateUpdateSavedTranslationData(updates);
    if (!validation.isValid) {
      const errorMessage = validation.errors.map(e => `${e.field}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }

    const sanitizedUpdates = validation.sanitizedData;

    const result = await supabase
      .from('saved_translations')
      .update(sanitizedUpdates)
      .eq('id', translationId)
      .eq('user_id', userId)
      .select(`
        *,
        from_language:languages!saved_translations_from_language_id_fkey(*),
        to_language:languages!saved_translations_to_language_id_fkey(*),
        difficulty_level:difficulty_levels!saved_translations_difficulty_level_id_fkey(*)
      `)
      .single();

    if (result.error) {
      throw new Error(`Failed to update saved translation: ${result.error.message}`);
    }

    return result.data as unknown as DatabaseSavedTranslationWithDetails;
  }

  /**
   * Delete a saved translation
   */
  async deleteSavedTranslation(translationId: number, userId: string): VoidPromise {
    // Validate input parameters
    if (!translationId || typeof translationId !== 'number' || translationId <= 0) {
      throw new Error('Valid translation ID is required');
    }
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Valid user ID is required');
    }
    const result = await supabase
      .from('saved_translations')
      .delete()
      .eq('id', translationId)
      .eq('user_id', userId);

    if (result.error) {
      throw new Error(`Failed to delete saved translation: ${result.error.message}`);
    }
  }

  /**
   * Get count of saved translations for a user
   */
  async getSavedTranslationsCount(
    userId: string,
    filters: SavedTranslationFiltersWithOptionalLanguages = {}
  ): Promise<number> {
    // Validate user ID
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Valid user ID is required');
    }

    // Validate search parameter if provided
    if (filters.search && typeof filters.search !== 'string') {
      throw new Error('Search parameter must be a string');
    }
    let query = supabase
      .from('saved_translations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Apply filters (same logic as getSavedTranslations)
    if (filters.from_language_code) {
      const fromLanguage = await this.languageService.getLanguageByCode(filters.from_language_code);
      if (fromLanguage) {
        query = query.eq('from_language_id', fromLanguage.id);
      }
    }

    if (filters.to_language_code) {
      const toLanguage = await this.languageService.getLanguageByCode(filters.to_language_code);
      if (toLanguage) {
        query = query.eq('to_language_id', toLanguage.id);
      }
    }

    if (filters.difficulty_level_code) {
      const difficultyLevel = await this.difficultyLevelService.getDifficultyLevelByCode(filters.difficulty_level_code);
      if (difficultyLevel) {
        query = query.eq('difficulty_level_id', difficultyLevel.id);
      }
    }

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,notes.ilike.%${filters.search}%,from_text.ilike.%${filters.search}%,to_text.ilike.%${filters.search}%`
      );
    }

    const result = await query;

    if (result.error) {
      throw new Error(`Failed to get saved translations count: ${result.error.message}`);
    }

    return result.count ?? 0;
  }
}
