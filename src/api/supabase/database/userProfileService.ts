import { supabase } from '../client'
import type { Database } from '../client'

type User = Database['public']['Tables']['users']['Row']
type UserUpdate = Database['public']['Tables']['users']['Update']

export interface CreateUserData {
  id: string
  username?: string
  display_name?: string
  avatar_url?: string
  preferred_language?: string
}

export interface UpdateUserData {
  username?: string
  display_name?: string
  avatar_url?: string
  preferred_language?: string
}

export class UserService {
  /**
   * Get user by user ID
   */
  static async getUser(userId: string): Promise<User | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // User not found
      }
      throw new Error(`Failed to fetch user: ${error.message}`)
    }

    return user
  }

  /**
   * Create a new user
   */
  static async createUser(data: CreateUserData): Promise<User> {
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: data.id,
        username: data.username,
        display_name: data.display_name,
        avatar_url: data.avatar_url,
        preferred_language: data.preferred_language || 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }

    return user
  }

  /**
   * Update user
   */
  static async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    const updateData: UserUpdate = {
      ...data,
      updated_at: new Date().toISOString()
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }

    return user
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  }

  /**
   * Check if username is available
   */
  static async isUsernameAvailable(username: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return true // Username is available
      }
      throw new Error(`Failed to check username availability: ${error.message}`)
    }

    return false // Username is taken
  }

  /**
   * Get user by username
   */
  static async getUserByUsername(username: string): Promise<User | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // User not found
      }
      throw new Error(`Failed to fetch user by username: ${error.message}`)
    }

    return user
  }

  /**
   * Update user's preferred language
   */
  static async updatePreferredLanguage(userId: string, language: string): Promise<User> {
    return this.updateUser(userId, { preferred_language: language })
  }

  /**
   * Update user's avatar URL
   */
  static async updateAvatarUrl(userId: string, avatarUrl: string): Promise<User> {
    return this.updateUser(userId, { avatar_url: avatarUrl })
  }

  /**
   * Get or create user (useful for ensuring user exists)
   */
  static async getOrCreateUser(userId: string, userData?: Partial<CreateUserData>): Promise<User> {
    let user = await this.getUser(userId)
    
    if (!user) {
      user = await this.createUser({
        id: userId,
        username: userData?.username,
        display_name: userData?.display_name,
        avatar_url: userData?.avatar_url,
        preferred_language: userData?.preferred_language
      })
    }

    return user
  }
} 