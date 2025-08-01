import { supabase } from '../client'
import type { Database } from '../../../types/database'
import { DifficultyLevel } from '../../../types/llm/prompts'

type Story = Database['public']['Tables']['stories']['Row']
type StoryUpdate = Database['public']['Tables']['stories']['Update']

export interface CreateStoryData {
  title: string
  content: string
  language: string
  difficulty_level: DifficultyLevel
  user_id?: string
}

export interface UpdateStoryData {
  title?: string
  content?: string
  language?: string
  difficulty_level?: DifficultyLevel
}

export class StoryService {
  /**
   * Create a new story
   */
  static async createStory(data: CreateStoryData): Promise<Story> {
    const { data: story, error } = await supabase
      .from('stories')
      .insert({
        title: data.title,
        content: data.content,
        language: data.language,
        difficulty_level: data.difficulty_level,
        user_id: data.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create story: ${error.message}`)
    }

    return story
  }

  /**
   * Get a story by ID
   */
  static async getStoryById(id: string): Promise<Story | null> {
    const { data: story, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Story not found
      }
      throw new Error(`Failed to fetch story: ${error.message}`)
    }

    return story
  }

  /**
   * Get all stories with optional filtering
   */
  static async getStories(filters?: {
    language?: string
    difficulty_level?: string
    user_id?: string
  }): Promise<Story[]> {
    let query = supabase.from('stories').select('*')

    if (filters?.language) {
      query = query.eq('language', filters.language)
    }

    if (filters?.difficulty_level) {
      query = query.eq('difficulty_level', filters.difficulty_level)
    }

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id)
    }

    const { data: stories, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch stories: ${error.message}`)
    }

    return stories || []
  }

  /**
   * Update a story
   */
  static async updateStory(id: string, data: UpdateStoryData): Promise<Story> {
    const updateData: StoryUpdate = {
      ...data,
      updated_at: new Date().toISOString()
    }

    const { data: story, error } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update story: ${error.message}`)
    }

    return story
  }

  /**
   * Delete a story
   */
  static async deleteStory(id: string): Promise<void> {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete story: ${error.message}`)
    }
  }

  /**
   * Search stories by title or content
   */
  static async searchStories(searchTerm: string): Promise<Story[]> {
    const { data: stories, error } = await supabase
      .from('stories')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to search stories: ${error.message}`)
    }

    return stories || []
  }

  /**
   * Get stories by difficulty level
   */
  static async getStoriesByDifficulty(difficulty: DifficultyLevel): Promise<Story[]> {
    const { data: stories, error } = await supabase
      .from('stories')
      .select('*')
      .eq('difficulty_level', difficulty)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch stories by difficulty: ${error.message}`)
    }

    return stories || []
  }

  /**
   * Get stories by language
   */
  static async getStoriesByLanguage(language: string): Promise<Story[]> {
    const { data: stories, error } = await supabase
      .from('stories')
      .select('*')
      .eq('language', language)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch stories by language: ${error.message}`)
    }

    return stories || []
  }
} 