import { supabase } from '../client'
import type { DatabaseUserInsert, DatabaseUserUpdate } from '../../../types/database'
import { validateUsername, validateDisplayName, sanitizeText } from '../../../lib/utils/sanitization'
import type { LanguageCode } from '../../../types/llm/prompts'

export interface CreateUserData {
  id: string
  username?: string
  display_name?: string
  avatar_url?: string
  preferred_language?: LanguageCode
}

export interface UpdateUserData {
  username?: string
  display_name?: string
  avatar_url?: string
  preferred_language?: LanguageCode
}

interface ValidationError {
  field: string
  message: string
}

export class UserService {
  /**
   * Validate and sanitize user data for creation
   */
  private static validateCreateUserData(data: CreateUserData): { isValid: boolean; errors: ValidationError[]; sanitizedData: CreateUserData } {
    const errors: ValidationError[] = []
    const sanitizedData: CreateUserData = { ...data }

    // Validate user ID
    if (!data.id || typeof data.id !== 'string' || data.id.trim().length === 0) {
      errors.push({ field: 'id', message: 'Valid user ID is required' })
    }

    // Validate and sanitize username (optional)
    if (data.username !== undefined && data.username !== null) {
      if (typeof data.username !== 'string') {
        errors.push({ field: 'username', message: 'Username must be a string' })
      } else {
        const sanitizedUsername = sanitizeText(data.username, { maxLength: 30 })
        const usernameValidation = validateUsername(sanitizedUsername)
        if (!usernameValidation.isValid) {
          errors.push({ field: 'username', message: usernameValidation.errors[0] || 'Invalid username format' })
        } else {
          sanitizedData.username = usernameValidation.sanitizedText || undefined
        }
      }
    }

    // Validate and sanitize display name (optional)
    if (data.display_name !== undefined && data.display_name !== null) {
      if (typeof data.display_name !== 'string') {
        errors.push({ field: 'display_name', message: 'Display name must be a string' })
      } else {
        const sanitizedDisplayName = sanitizeText(data.display_name, { maxLength: 50 })
        const displayNameValidation = validateDisplayName(sanitizedDisplayName)
        if (!displayNameValidation.isValid) {
          errors.push({ field: 'display_name', message: displayNameValidation.errors[0] || 'Invalid display name format' })
        } else {
          sanitizedData.display_name = displayNameValidation.sanitizedText || undefined
        }
      }
    }

    // Validate avatar URL (optional)
    if (data.avatar_url !== undefined && data.avatar_url !== null) {
      if (typeof data.avatar_url !== 'string') {
        errors.push({ field: 'avatar_url', message: 'Avatar URL must be a string' })
      } else {
        const sanitizedAvatarUrl = sanitizeText(data.avatar_url, { maxLength: 500 })
        // Basic URL validation
        try {
          new URL(sanitizedAvatarUrl)
          sanitizedData.avatar_url = sanitizedAvatarUrl
        } catch {
          errors.push({ field: 'avatar_url', message: 'Invalid avatar URL format' })
        }
      }
    }

    // Validate preferred language (optional)
    if (data.preferred_language !== undefined && data.preferred_language !== null) {
      if (typeof data.preferred_language !== 'string') {
        errors.push({ field: 'preferred_language', message: 'Preferred language must be a string' })
      } else if (!['en', 'es'].includes(data.preferred_language)) {
        errors.push({ field: 'preferred_language', message: 'Preferred language must be one of: en, es' })
      } else {
        sanitizedData.preferred_language = data.preferred_language as LanguageCode
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    }
  }

  /**
   * Validate and sanitize user data for updates
   */
  private static validateUpdateUserData(data: UpdateUserData): { isValid: boolean; errors: ValidationError[]; sanitizedData: UpdateUserData } {
    const errors: ValidationError[] = []
    const sanitizedData: UpdateUserData = { ...data }

    // Validate and sanitize username (optional)
    if (data.username !== undefined && data.username !== null) {
      if (typeof data.username !== 'string') {
        errors.push({ field: 'username', message: 'Username must be a string' })
      } else {
        const sanitizedUsername = sanitizeText(data.username, { maxLength: 30 })
        const usernameValidation = validateUsername(sanitizedUsername)
        if (!usernameValidation.isValid) {
          errors.push({ field: 'username', message: usernameValidation.errors[0] || 'Invalid username format' })
        } else {
          sanitizedData.username = usernameValidation.sanitizedText || undefined
        }
      }
    }

    // Validate and sanitize display name (optional)
    if (data.display_name !== undefined && data.display_name !== null) {
      if (typeof data.display_name !== 'string') {
        errors.push({ field: 'display_name', message: 'Display name must be a string' })
      } else {
        const sanitizedDisplayName = sanitizeText(data.display_name, { maxLength: 50 })
        const displayNameValidation = validateDisplayName(sanitizedDisplayName)
        if (!displayNameValidation.isValid) {
          errors.push({ field: 'display_name', message: displayNameValidation.errors[0] || 'Invalid display name format' })
        } else {
          sanitizedData.display_name = displayNameValidation.sanitizedText || undefined
        }
      }
    }

    // Validate avatar URL (optional)
    if (data.avatar_url !== undefined && data.avatar_url !== null) {
      if (typeof data.avatar_url !== 'string') {
        errors.push({ field: 'avatar_url', message: 'Avatar URL must be a string' })
      } else {
        const sanitizedAvatarUrl = sanitizeText(data.avatar_url, { maxLength: 500 })
        // Basic URL validation
        try {
          new URL(sanitizedAvatarUrl)
          sanitizedData.avatar_url = sanitizedAvatarUrl
        } catch {
          errors.push({ field: 'avatar_url', message: 'Invalid avatar URL format' })
        }
      }
    }

    // Validate preferred language (optional)
    if (data.preferred_language !== undefined && data.preferred_language !== null) {
      if (typeof data.preferred_language !== 'string') {
        errors.push({ field: 'preferred_language', message: 'Preferred language must be a string' })
      } else if (!['en', 'es'].includes(data.preferred_language)) {
        errors.push({ field: 'preferred_language', message: 'Preferred language must be one of: en, es' })
      } else {
        sanitizedData.preferred_language = data.preferred_language as LanguageCode
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    }
  }

  /**
   * Get user by user ID
   */
  static async getUser(userId: string): Promise<DatabaseUserInsert | null> {
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
  static async createUser(data: CreateUserData): Promise<DatabaseUserInsert> {
    // Validate and sanitize input data
    const validation = UserService.validateCreateUserData(data)
    if (!validation.isValid) {
      const errorMessage = validation.errors.map(e => `${e.field}: ${e.message}`).join(', ')
      throw new Error(`Validation failed: ${errorMessage}`)
    }

    const sanitizedData = validation.sanitizedData

    // Check username availability if username is provided
    if (sanitizedData.username && sanitizedData.username !== null) {
      const isAvailable = await this.isUsernameAvailable(sanitizedData.username)
      if (!isAvailable) {
        throw new Error('Username is already taken')
      }
    }

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: sanitizedData.id,
        username: sanitizedData.username,
        display_name: sanitizedData.display_name,
        avatar_url: sanitizedData.avatar_url,
        preferred_language: sanitizedData.preferred_language || 'en',
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
  static async updateUser(userId: string, data: UpdateUserData): Promise<DatabaseUserInsert> {
    // Validate input parameters
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Valid user ID is required')
    }

    // Validate and sanitize update data
    const validation = UserService.validateUpdateUserData(data)
    if (!validation.isValid) {
      const errorMessage = validation.errors.map(e => `${e.field}: ${e.message}`).join(', ')
      throw new Error(`Validation failed: ${errorMessage}`)
    }

    const sanitizedData = validation.sanitizedData

    // Check username availability if username is being updated
    if (sanitizedData.username && sanitizedData.username !== null) {
      const existingUser = await this.getUserByUsername(sanitizedData.username)
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Username is already taken')
      }
    }

    const updateData: DatabaseUserUpdate = {
      ...sanitizedData,
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
    // Validate username input
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      throw new Error('Valid username is required')
    }

    const sanitizedUsername = sanitizeText(username, { maxLength: 30 })
    const usernameValidation = validateUsername(sanitizedUsername)
    if (!usernameValidation.isValid) {
      throw new Error(`Invalid username format: ${usernameValidation.errors[0]}`)
    }
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
  static async getUserByUsername(username: string): Promise<DatabaseUserInsert | null> {
    // Validate username input
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      throw new Error('Valid username is required')
    }

    const sanitizedUsername = sanitizeText(username, { maxLength: 30 })
    const usernameValidation = validateUsername(sanitizedUsername)
    if (!usernameValidation.isValid) {
      throw new Error(`Invalid username format: ${usernameValidation.errors[0]}`)
    }
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
  static async updatePreferredLanguage(userId: string, language: string): Promise<DatabaseUserInsert> {
    // Validate input parameters
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Valid user ID is required')
    }
    if (!language || typeof language !== 'string' || language.trim().length === 0) {
      throw new Error('Valid language is required')
    }
    if (!['en', 'es'].includes(language)) {
      throw new Error('Language must be one of: en, es')
    }

    return this.updateUser(userId, { preferred_language: language as LanguageCode })
  }

  /**
   * Update user's avatar URL
   */
  static async updateAvatarUrl(userId: string, avatarUrl: string): Promise<DatabaseUserInsert> {
    // Validate input parameters
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Valid user ID is required')
    }
    if (!avatarUrl || typeof avatarUrl !== 'string' || avatarUrl.trim().length === 0) {
      throw new Error('Valid avatar URL is required')
    }

    const sanitizedAvatarUrl = sanitizeText(avatarUrl, { maxLength: 500 })
    try {
      new URL(sanitizedAvatarUrl)
    } catch {
      throw new Error('Invalid avatar URL format')
    }

    return this.updateUser(userId, { avatar_url: sanitizedAvatarUrl })
  }

  /**
   * Get or create user (useful for ensuring user exists)
   */
  static async getOrCreateUser(userId: string, userData?: Partial<CreateUserData>): Promise<DatabaseUserInsert> {
    // Validate user ID
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Valid user ID is required')
    }

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