import { supabase } from '../client'
import type { DatabaseTranslationInsert, DatabaseTranslationUpdate } from '../../../lib/types/database'
import { validateStoryText } from '../../../lib/utils/sanitization'

export interface CreateTranslationData {
  story_id: string
  target_language: string
  translated_content: string
}

export interface UpdateTranslationData {
  target_language?: string
  translated_content?: string
}

export interface ValidationError {
  field: string
  message: string
}

export class TranslationService {
  /**
   * Validate and sanitize translation data for creation
   */
  private static validateCreateTranslationData(data: CreateTranslationData): { 
    isValid: boolean; 
    errors: ValidationError[]; 
    sanitizedData: CreateTranslationData 
  } {
    const errors: ValidationError[] = [];
    const sanitizedData: CreateTranslationData = { ...data };

    // Validate required fields
    if (!data.story_id || typeof data.story_id !== 'string') {
      errors.push({ field: 'story_id', message: 'Story ID is required and must be a string' });
    }

    if (!data.target_language || typeof data.target_language !== 'string') {
      errors.push({ field: 'target_language', message: 'Target language is required and must be a string' });
    } else {
      // Basic language code validation (ISO 639-1)
      const languageRegex = /^[a-z]{2}$/;
      if (!languageRegex.test(data.target_language)) {
        errors.push({ field: 'target_language', message: 'Invalid language code format (use ISO 639-1)' });
      } else {
        sanitizedData.target_language = data.target_language.toLowerCase();
      }
    }

    // Validate and sanitize translated content
    if (!data.translated_content || typeof data.translated_content !== 'string') {
      errors.push({ field: 'translated_content', message: 'Translated content is required and must be a string' });
    } else {
      const contentValidation = validateStoryText(data.translated_content);
      if (!contentValidation.isValid) {
        errors.push({ 
          field: 'translated_content', 
          message: contentValidation.errors[0] || 'Invalid translated content format' 
        });
      } else {
        sanitizedData.translated_content = contentValidation.sanitizedText;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    };
  }

  /**
   * Validate and sanitize translation data for updates
   */
  private static validateUpdateTranslationData(data: UpdateTranslationData): { 
    isValid: boolean; 
    errors: ValidationError[]; 
    sanitizedData: UpdateTranslationData 
  } {
    const errors: ValidationError[] = [];
    const sanitizedData: UpdateTranslationData = { ...data };

    // Validate target language if provided
    if (data.target_language !== undefined) {
      if (typeof data.target_language !== 'string') {
        errors.push({ field: 'target_language', message: 'Target language must be a string' });
      } else {
        // Basic language code validation (ISO 639-1)
        const languageRegex = /^[a-z]{2}$/;
        if (!languageRegex.test(data.target_language)) {
          errors.push({ field: 'target_language', message: 'Invalid language code format (use ISO 639-1)' });
        } else {
          sanitizedData.target_language = data.target_language.toLowerCase();
        }
      }
    }

    // Validate and sanitize translated content if provided
    if (data.translated_content !== undefined) {
      if (typeof data.translated_content !== 'string') {
        errors.push({ field: 'translated_content', message: 'Translated content must be a string' });
      } else {
        const contentValidation = validateStoryText(data.translated_content);
        if (!contentValidation.isValid) {
          errors.push({ 
            field: 'translated_content', 
            message: contentValidation.errors[0] || 'Invalid translated content format' 
          });
        } else {
          sanitizedData.translated_content = contentValidation.sanitizedText;
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
   * Create a new translation with validation and sanitization
   */
  static async createTranslation(data: CreateTranslationData): Promise<DatabaseTranslationInsert> {
    // Validate and sanitize input data
    const validation = this.validateCreateTranslationData(data);
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    const { sanitizedData } = validation;

    const { data: translation, error } = await supabase
      .from('translations')
      .insert({
        story_id: sanitizedData.story_id,
        target_language: sanitizedData.target_language,
        translated_content: sanitizedData.translated_content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create translation: ${error.message}`)
    }

    return translation
  }

  /**
   * Get a translation by ID
   */
  static async getTranslationById(id: string): Promise<DatabaseTranslationInsert | null> {
    // Validate ID
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid translation ID provided');
    }

    const { data: translation, error } = await supabase
      .from('translations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Translation not found
      }
      throw new Error(`Failed to fetch translation: ${error.message}`)
    }

    return translation
  }

  /**
   * Get translations for a specific story
   */
  static async getTranslationsByStoryId(storyId: string): Promise<DatabaseTranslationInsert[]> {
    // Validate story ID
    if (!storyId || typeof storyId !== 'string') {
      throw new Error('Invalid story ID provided');
    }

    const { data: translations, error } = await supabase
      .from('translations')
      .select('*')
      .eq('story_id', storyId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch translations: ${error.message}`)
    }

    return translations || []
  }

  /**
   * Get a specific translation for a story and target language
   */
  static async getTranslationByStoryAndLanguage(
    storyId: string, 
    targetLanguage: string
  ): Promise<DatabaseTranslationInsert | null> {
    // Validate story ID
    if (!storyId || typeof storyId !== 'string') {
      throw new Error('Invalid story ID provided');
    }

    // Validate target language
    if (!targetLanguage || typeof targetLanguage !== 'string') {
      throw new Error('Invalid target language provided');
    }

    // Basic language code validation (ISO 639-1)
    const languageRegex = /^[a-z]{2}$/;
    if (!languageRegex.test(targetLanguage.toLowerCase())) {
      throw new Error('Invalid language code format (use ISO 639-1)');
    }

    const { data: translation, error } = await supabase
      .from('translations')
      .select('*')
      .eq('story_id', storyId)
      .eq('target_language', targetLanguage)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Translation not found
      }
      throw new Error(`Failed to fetch translation: ${error.message}`)
    }

    return translation
  }

  /**
   * Update a translation
   */
  static async updateTranslation(id: string, data: UpdateTranslationData): Promise<DatabaseTranslationInsert> {
    // Validate and sanitize input data
    const validation = this.validateUpdateTranslationData(data);
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    const { sanitizedData } = validation;

    const updateData: DatabaseTranslationUpdate = {
      ...sanitizedData,
      updated_at: new Date().toISOString()
    }

    const { data: translation, error } = await supabase
      .from('translations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update translation: ${error.message}`)
    }

    return translation
  }

  /**
   * Delete a translation
   */
  static async deleteTranslation(id: string): Promise<void> {
    // Validate ID
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid translation ID provided');
    }

    const { error } = await supabase
      .from('translations')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete translation: ${error.message}`)
    }
  }

  /**
   * Delete all translations for a story
   */
  static async deleteTranslationsByStoryId(storyId: string): Promise<void> {
    // Validate story ID
    if (!storyId || typeof storyId !== 'string') {
      throw new Error('Invalid story ID provided');
    }

    const { error } = await supabase
      .from('translations')
      .delete()
      .eq('story_id', storyId)

    if (error) {
      throw new Error(`Failed to delete translations for story: ${error.message}`)
    }
  }

  /**
   * Get all translations with optional filtering
   */
  static async getTranslations(filters?: {
    story_id?: string
    target_language?: string
  }): Promise<DatabaseTranslationInsert[]> {
    // Validate filters if provided
    if (filters?.story_id && (typeof filters.story_id !== 'string' || !filters.story_id)) {
      throw new Error('Invalid story ID in filters');
    }

    if (filters?.target_language) {
      if (typeof filters.target_language !== 'string' || !filters.target_language) {
        throw new Error('Invalid target language in filters');
      }
      // Basic language code validation (ISO 639-1)
      const languageRegex = /^[a-z]{2}$/;
      if (!languageRegex.test(filters.target_language.toLowerCase())) {
        throw new Error('Invalid language code format in filters (use ISO 639-1)');
      }
    }

    let query = supabase.from('translations').select('*')

    if (filters?.story_id) {
      query = query.eq('story_id', filters.story_id)
    }

    if (filters?.target_language) {
      query = query.eq('target_language', filters.target_language.toLowerCase())
    }

    const { data: translations, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch translations: ${error.message}`)
    }

    return translations || []
  }

  /**
   * Check if a translation exists for a story and language
   */
  static async translationExists(storyId: string, targetLanguage: string): Promise<boolean> {
    // Validate story ID
    if (!storyId || typeof storyId !== 'string') {
      throw new Error('Invalid story ID provided');
    }

    // Validate target language
    if (!targetLanguage || typeof targetLanguage !== 'string') {
      throw new Error('Invalid target language provided');
    }

    // Basic language code validation (ISO 639-1)
    const languageRegex = /^[a-z]{2}$/;
    if (!languageRegex.test(targetLanguage.toLowerCase())) {
      throw new Error('Invalid language code format (use ISO 639-1)');
    }

    const { data, error } = await supabase
      .from('translations')
      .select('id')
      .eq('story_id', storyId)
      .eq('target_language', targetLanguage)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return false // Translation doesn't exist
      }
      throw new Error(`Failed to check translation existence: ${error.message}`)
    }

    return !!data
  }
} 