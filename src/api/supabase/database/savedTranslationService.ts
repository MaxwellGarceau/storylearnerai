import { supabase } from '../client';
import type {
  DatabaseSavedTranslationWithDetails,
  CreateSavedTranslationRequest,
  UpdateSavedTranslationRequest,
  SavedTranslationFilters,
  DatabaseLanguage,
  DatabaseDifficultyLevel,
} from '../../../types/database';
import type { DatabaseSavedTranslationWithDetailsPromise } from '../../../types/database/promise';
import type { Database } from '../../../types/database';
import type { LanguageCode } from '../../../types/llm/prompts';
import type {
  EnglishLanguageName,
  NativeLanguageName,
  DifficultyLevelDisplay,
  DifficultyLevel as DifficultyLevelCode,
} from '../../../types/llm/prompts';
import { validateStoryText, sanitizeText } from '../../../lib/utils/sanitization';
import type { VoidPromise } from '../../../types/common';

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Type for saved translation filters with optional language codes
 * Makes original_language_code and translated_language_code optional while keeping other filters required
 */
type SavedTranslationFiltersWithOptionalLanguages = Omit<SavedTranslationFilters, 'original_language_code' | 'translated_language_code'> & {
  original_language_code?: LanguageCode;
  translated_language_code?: LanguageCode;
};

export class SavedTranslationService {
  /**
   * Validate and sanitize saved translation data
   */
  private static validateCreateSavedTranslationData(
    request: CreateSavedTranslationRequest,
    userId: string
  ): { isValid: boolean; errors: ValidationError[]; sanitizedData: CreateSavedTranslationRequest } {
    const errors: ValidationError[] = [];
    const sanitizedData: CreateSavedTranslationRequest = { ...request };

    // Validate user ID
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      errors.push({ field: 'user_id', message: 'Valid user ID is required' });
    }

    // Validate and sanitize original story
    if (!request.original_story || typeof request.original_story !== 'string') {
      errors.push({ field: 'original_story', message: 'Original story is required' });
    } else {
      const storyValidation = validateStoryText(request.original_story);
      if (!storyValidation.isValid) {
        errors.push({ field: 'original_story', message: storyValidation.errors[0] || 'Invalid original story content' });
      } else {
        sanitizedData.original_story = storyValidation.sanitizedText;
      }
    }

    // Validate and sanitize translated story
    if (!request.translated_story || typeof request.translated_story !== 'string') {
      errors.push({ field: 'translated_story', message: 'Translated story is required' });
    } else {
      const storyValidation = validateStoryText(request.translated_story);
      if (!storyValidation.isValid) {
        errors.push({ field: 'translated_story', message: storyValidation.errors[0] || 'Invalid translated story content' });
      } else {
        sanitizedData.translated_story = storyValidation.sanitizedText;
      }
    }

    // Validate language codes
    if (!request.original_language_code || typeof request.original_language_code !== 'string') {
      errors.push({ field: 'original_language_code', message: 'Original language code is required' });
    } else if (!/^[a-z]{2}$/.test(request.original_language_code)) {
      errors.push({ field: 'original_language_code', message: 'Original language code must be a valid ISO 639-1 code' });
    }

    if (!request.translated_language_code || typeof request.translated_language_code !== 'string') {
      errors.push({ field: 'translated_language_code', message: 'Translated language code is required' });
    } else if (!/^[a-z]{2}$/.test(request.translated_language_code)) {
      errors.push({ field: 'translated_language_code', message: 'Translated language code must be a valid ISO 639-1 code' });
    }

    // Validate difficulty level code
    if (!request.difficulty_level_code || typeof request.difficulty_level_code !== 'string') {
      errors.push({ field: 'difficulty_level_code', message: 'Difficulty level code is required' });
    } else if (!/^[a-z][1-2]$/.test(request.difficulty_level_code)) {
      errors.push({ field: 'difficulty_level_code', message: 'Difficulty level code must be a valid CEFR level (a1, a2, b1, b2)' });
    }

    // Validate and sanitize title (optional)
    if (request.title !== undefined && request.title !== null) {
      if (typeof request.title !== 'string') {
        errors.push({ field: 'title', message: 'Title must be a string' });
      } else {
        const sanitizedTitle = sanitizeText(request.title, { maxLength: 200 });
        const titleValidation = validateStoryText(sanitizedTitle);
        if (!titleValidation.isValid) {
          errors.push({ field: 'title', message: titleValidation.errors[0] || 'Invalid title content' });
        } else {
          sanitizedData.title = titleValidation.sanitizedText || undefined;
        }
      }
    }

    // Validate and sanitize notes (optional)
    if (request.notes !== undefined && request.notes !== null) {
      if (typeof request.notes !== 'string') {
        errors.push({ field: 'notes', message: 'Notes must be a string' });
      } else {
        const sanitizedNotes = sanitizeText(request.notes, { maxLength: 1000 });
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
   * Get all languages
   */
  async getLanguages(): Promise<DatabaseLanguage[]> {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch languages: ${error.message}`);
    }

    const rows = (data as Database['public']['Tables']['languages']['Row'][]) ?? []
    return rows.map(r => {
      const native: NativeLanguageName = (r.native_name ?? (r.code === 'en' ? 'English' : 'Español')) as NativeLanguageName
      return {
        id: r.id,
        code: r.code,
        name: r.name as EnglishLanguageName,
        native_name: native,
        created_at: r.created_at,
      }
    })
  }

  /**
   * Get all difficulty levels
   */
  async getDifficultyLevels(): Promise<DatabaseDifficultyLevel[]> {
    const { data, error } = await supabase
      .from('difficulty_levels')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch difficulty levels: ${error.message}`);
    }

    const rows = (data as Database['public']['Tables']['difficulty_levels']['Row'][]) ?? []
    const displayMap: Record<DifficultyLevelCode, DifficultyLevelDisplay> = {
      a1: 'A1 (Beginner)',
      a2: 'A2 (Elementary)',
      b1: 'B1 (Intermediate)',
      b2: 'B2 (Upper Intermediate)',
    }
    return rows.map(r => {
      const display: DifficultyLevelDisplay =
        (r.name as DifficultyLevelDisplay) ?? displayMap[r.code]
      return {
        id: r.id,
        code: r.code,
        name: display,
        description: r.description,
        created_at: r.created_at,
      }
    })
  }

  /**
   * Get a language by its code
   */
  async getLanguageByCode(code: LanguageCode): Promise<DatabaseLanguage | null> {
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

    if (!result.data) return null
    const r = result.data as Database['public']['Tables']['languages']['Row']
    const native: NativeLanguageName = (r.native_name ?? (r.code === 'en' ? 'English' : 'Español')) as NativeLanguageName
    return {
      id: r.id,
      code: r.code,
      name: r.name as EnglishLanguageName,
      native_name: native,
      created_at: r.created_at,
    }
  }

  /**
   * Get a difficulty level by its code
   */
  async getDifficultyLevelByCode(code: string): Promise<DatabaseDifficultyLevel | null> {
    const result = await supabase
      .from('difficulty_levels')
      .select('*')
      .eq('code', code)
      .single();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch difficulty level: ${result.error.message}`);
    }

    if (!result.data) return null
    const r = result.data as Database['public']['Tables']['difficulty_levels']['Row']
    const displayMap: Record<DifficultyLevelCode, DifficultyLevelDisplay> = {
      a1: 'A1 (Beginner)',
      a2: 'A2 (Elementary)',
      b1: 'B1 (Intermediate)',
      b2: 'B2 (Upper Intermediate)',
    }
    const display: DifficultyLevelDisplay =
      (r.name as DifficultyLevelDisplay) ?? displayMap[r.code]
    return {
      id: r.id,
      code: r.code,
      name: display,
      description: r.description,
      created_at: r.created_at,
    }
  }

  /**
   * Create a new saved translation
   */
  async createSavedTranslation(
    request: CreateSavedTranslationRequest,
    userId: string
  ): DatabaseSavedTranslationWithDetailsPromise {
    // Validate and sanitize input data
    const validation = SavedTranslationService.validateCreateSavedTranslationData(request, userId);
    if (!validation.isValid) {
      const errorMessage = validation.errors.map(e => `${e.field}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }

    const sanitizedRequest = validation.sanitizedData;

    // Get language and difficulty level IDs from codes
    const [originalLanguage, translatedLanguage, difficultyLevel] = await Promise.all([
      this.getLanguageByCode(sanitizedRequest.original_language_code),
      this.getLanguageByCode(sanitizedRequest.translated_language_code),
      this.getDifficultyLevelByCode(sanitizedRequest.difficulty_level_code),
    ]);

    if (!originalLanguage) {
      throw new Error(`Language not found: ${sanitizedRequest.original_language_code}`);
    }
    if (!translatedLanguage) {
      throw new Error(`Language not found: ${sanitizedRequest.translated_language_code}`);
    }
    if (!difficultyLevel) {
      throw new Error(`Difficulty level not found: ${sanitizedRequest.difficulty_level_code}`);
    }

    const result = await supabase
      .from('saved_translations')
      .insert({
        user_id: userId,
        original_story: sanitizedRequest.original_story,
        translated_story: sanitizedRequest.translated_story,
        original_language_id: originalLanguage.id,
        translated_language_id: translatedLanguage.id,
        difficulty_level_id: difficultyLevel.id,
        title: sanitizedRequest.title,
        notes: sanitizedRequest.notes,
      })
      .select(`
        *,
        original_language:languages!saved_translations_original_language_id_fkey(*),
        translated_language:languages!saved_translations_translated_language_id_fkey(*),
        difficulty_level:difficulty_levels!saved_translations_difficulty_level_id_fkey(*)
      `)
      .single();

    if (result.error) {
      throw new Error(`Failed to create saved translation: ${result.error.message}`);
    }

    return result.data as DatabaseSavedTranslationWithDetails;
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
      query = query.range(filters.offset, filters.offset + (filters.limit ?? 50) - 1);
    }

    const result = await query;

    if (result.error) {
      throw new Error(`Failed to fetch saved translations: ${result.error.message}`);
    }

    return (result.data ?? []) as DatabaseSavedTranslationWithDetails[];
  }

  /**
   * Get a specific saved translation by ID
   */
  async getSavedTranslation(
    translationId: string,
    userId: string
  ): Promise<DatabaseSavedTranslationWithDetails | null> {
    // Validate input parameters
    if (!translationId || typeof translationId !== 'string' || translationId.trim().length === 0) {
      throw new Error('Valid translation ID is required');
    }
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Valid user ID is required');
    }
    const result = await supabase
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

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch saved translation: ${result.error.message}`);
    }

    return result.data as unknown as DatabaseSavedTranslationWithDetails;
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
        original_language:languages!saved_translations_original_language_id_fkey(*),
        translated_language:languages!saved_translations_translated_language_id_fkey(*),
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

    const result = await query;

    if (result.error) {
      throw new Error(`Failed to get saved translations count: ${result.error.message}`);
    }

    return result.count ?? 0;
  }
}