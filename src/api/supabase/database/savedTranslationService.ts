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
 * Makes from_language_code and target_language_code optional while keeping other filters required
 */
type SavedTranslationFiltersWithOptionalLanguages = Omit<SavedTranslationFilters, 'from_language_code' | 'to_language_code'> & {
  from_language_code?: LanguageCode;
  to_language_code?: LanguageCode;
};

// New translation/token types for the translations + translation_tokens schema
export type WordTokenInput = {
  type: 'word';
  to_word: string;
  to_lemma: string;
  from_word: string;
  from_lemma: string;
  pos?: string;
  difficulty?: string;
  from_definition?: string;
};

export type PunctuationOrWhitespaceTokenInput = {
  type: 'punctuation' | 'whitespace';
  value: string;
};

export type TranslationTokenInput =
  | WordTokenInput
  | PunctuationOrWhitespaceTokenInput;

export interface SaveTranslationParams {
  userId: string;
  fromLanguage: LanguageCode;
  toLanguage: LanguageCode;
  fromText: string;
  toText: string;
  difficultyLevel: string; // e.g., a1, a2, b1, b2 (required in new schema)
  title?: string;
  notes?: string;
  tokens: TranslationTokenInput[];
}

export type LoadedWordToken = {
  type: 'word';
  to_word: string;
  to_lemma: string;
  from_word: string;
  from_lemma: string;
  pos?: string;
  difficulty?: string;
  from_definition?: string;
};

export type LoadedNonWordToken = {
  type: 'punctuation' | 'whitespace';
  value: string;
};

export type LoadedTranslationToken = LoadedWordToken | LoadedNonWordToken;

export interface LoadedTranslation {
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
  tokens: LoadedTranslationToken[];
}

export class SavedTranslationService {

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
      this.getLanguageByCode(fromLanguage),
      this.getLanguageByCode(toLanguage),
      this.getDifficultyLevelByCode(difficultyLevel),
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
        const word = token as WordTokenInput;
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
      const generic = token as PunctuationOrWhitespaceTokenInput;
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
    // 1) Load main translation
    const translationResult = await supabase
      .from('saved_translations')
      .select('*')
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
    };

    // 2) Load ordered tokens
    const tokensResult = await supabase
      .from('translation_tokens')
      .select('*')
      .eq('translation_id', translationId)
      .order('token_index', { ascending: true });

    if (tokensResult.error) {
      throw new Error(`Failed to load translation tokens: ${tokensResult.error.message}`);
    }

    const reconstructedTokens: LoadedTranslationToken[] = (tokensResult.data ?? []).map(row => {
      if (row.token_type === 'word') {
        return {
          type: 'word',
          to_word: row.to_word as string,
          to_lemma: row.to_lemma as string,
          from_word: row.from_word as string,
          from_lemma: row.from_lemma as string,
          pos: (row.pos ?? undefined) as string | undefined,
          difficulty: (row.difficulty ?? undefined) as string | undefined,
          from_definition: (row.from_definition ?? undefined) as string | undefined,
        };
      }
      return {
        type: row.token_type as 'punctuation' | 'whitespace',
        value: row.token_value as string,
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
    };
  }
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

    // Validate and sanitize from text
    if (!request.from_text || typeof request.from_text !== 'string') {
      errors.push({ field: 'from_text', message: 'From text is required' });
    } else {
      const storyValidation = validateStoryText(request.from_text);
      if (!storyValidation.isValid) {
        errors.push({ field: 'from_text', message: storyValidation.errors[0] || 'Invalid from text content' });
      } else {
        sanitizedData.from_text = storyValidation.sanitizedText;
      }
    }

    // Validate and sanitize to text
    if (!request.to_text || typeof request.to_text !== 'string') {
      errors.push({ field: 'to_text', message: 'To text is required' });
    } else {
      const storyValidation = validateStoryText(request.to_text);
      if (!storyValidation.isValid) {
        errors.push({ field: 'to_text', message: storyValidation.errors[0] || 'Invalid to text content' });
      } else {
        sanitizedData.to_text = storyValidation.sanitizedText;
      }
    }

    // Validate language codes
    if (!request.from_language_code || typeof request.from_language_code !== 'string') {
      errors.push({ field: 'from_language_code', message: 'Original language code is required' });
    } else if (!/^[a-z]{2}$/.test(request.from_language_code)) {
      errors.push({ field: 'from_language_code', message: 'Original language code must be a valid ISO 639-1 code' });
    }

    if (!request.to_language_code || typeof request.to_language_code !== 'string') {
      errors.push({ field: 'to_language_code', message: 'Target language code is required' });
    } else if (!/^[a-z]{2}$/.test(request.to_language_code)) {
      errors.push({ field: 'to_language_code', message: 'Target language code must be a valid ISO 639-1 code' });
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
    const displayMap: Partial<Record<DifficultyLevelCode, DifficultyLevelDisplay>> = {
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
    const displayMap: Partial<Record<DifficultyLevelCode, DifficultyLevelDisplay>> = {
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
    const [fromLanguage, toLanguage, difficultyLevel] = await Promise.all([
      this.getLanguageByCode(sanitizedRequest.from_language_code),
      this.getLanguageByCode(sanitizedRequest.to_language_code),
      this.getDifficultyLevelByCode(sanitizedRequest.difficulty_level_code),
    ]);

    if (!fromLanguage) {
      throw new Error(`Language not found: ${sanitizedRequest.from_language_code}`);
    }
    if (!toLanguage) {
      throw new Error(`Language not found: ${sanitizedRequest.to_language_code}`);
    }
    if (!difficultyLevel) {
      throw new Error(`Difficulty level not found: ${sanitizedRequest.difficulty_level_code}`);
    }

    const result = await supabase
      .from('saved_translations')
      .insert({
        user_id: userId,
        from_text: sanitizedRequest.from_text,
        to_text: sanitizedRequest.to_text,
        from_language_id: fromLanguage.id,
        to_language_id: toLanguage.id,
        difficulty_level_id: difficultyLevel.id,
        title: sanitizedRequest.title,
        notes: sanitizedRequest.notes,
      })
      .select(`
        *,
        from_language:languages!saved_translations_from_language_id_fkey(*),
        to_language:languages!saved_translations_to_language_id_fkey(*),
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
        from_language:languages!saved_translations_from_language_id_fkey(*),
        to_language:languages!saved_translations_to_language_id_fkey(*),
        difficulty_level:difficulty_levels!saved_translations_difficulty_level_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.from_language_code) {
      const fromLanguage = await this.getLanguageByCode(filters.from_language_code);
      if (fromLanguage) {
        query = query.eq('from_language_id', fromLanguage.id);
      }
    }

    if (filters.to_language_code) {
      const toLanguage = await this.getLanguageByCode(filters.to_language_code);
      if (toLanguage) {
        query = query.eq('to_language_id', toLanguage.id);
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
        from_language:languages!saved_translations_from_language_id_fkey(*),
        to_language:languages!saved_translations_to_language_id_fkey(*),
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
      const fromLanguage = await this.getLanguageByCode(filters.from_language_code);
      if (fromLanguage) {
        query = query.eq('from_language_id', fromLanguage.id);
      }
    }

    if (filters.to_language_code) {
      const toLanguage = await this.getLanguageByCode(filters.to_language_code);
      if (toLanguage) {
        query = query.eq('to_language_id', toLanguage.id);
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
