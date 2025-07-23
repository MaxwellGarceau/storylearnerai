import { supabase } from '../client'
import type { Database } from '../client'

type Translation = Database['public']['Tables']['translations']['Row']
type TranslationUpdate = Database['public']['Tables']['translations']['Update']

export interface CreateTranslationData {
  story_id: string
  target_language: string
  translated_content: string
}

export interface UpdateTranslationData {
  target_language?: string
  translated_content?: string
}

export class TranslationService {
  /**
   * Create a new translation
   */
  static async createTranslation(data: CreateTranslationData): Promise<Translation> {
    const { data: translation, error } = await supabase
      .from('translations')
      .insert({
        story_id: data.story_id,
        target_language: data.target_language,
        translated_content: data.translated_content,
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
  static async getTranslationById(id: string): Promise<Translation | null> {
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
  static async getTranslationsByStoryId(storyId: string): Promise<Translation[]> {
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
  ): Promise<Translation | null> {
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
  static async updateTranslation(id: string, data: UpdateTranslationData): Promise<Translation> {
    const updateData: TranslationUpdate = {
      ...data,
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
  }): Promise<Translation[]> {
    let query = supabase.from('translations').select('*')

    if (filters?.story_id) {
      query = query.eq('story_id', filters.story_id)
    }

    if (filters?.target_language) {
      query = query.eq('target_language', filters.target_language)
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