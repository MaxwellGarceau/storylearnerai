import { supabase } from '../client'
import type { PostgrestError } from '@supabase/supabase-js';
import type { DatabaseUserInsert } from '../../../types/database/user';
import type { DatabaseUserInsertPromise, DatabaseUserInsertOrNullPromise } from '../../../types/database/promise'
import type { LanguageCode } from '../../../types/llm/prompts'
import type { NullableString, VoidPromise } from '../../../types/common'
import { 
  validateUsername, 
  validateDisplayName
} from '../../../lib/utils/sanitization'

export interface CreateUserData {
  id: string
  username?: NullableString
  display_name?: NullableString
  avatar_url?: NullableString
  preferred_language?: string
}

export interface UpdateUserData {
  username?: NullableString
  display_name?: NullableString
  avatar_url?: NullableString
  preferred_language?: string
}

interface ValidationError {
  field: string
  message: string
}

export class UserService {
  /**
   * Validate and sanitize user data for creation
   */
  private static validateCreateUserData(data: CreateUserData): { 
    isValid: boolean; 
    errors: ValidationError[]; 
    sanitizedData: CreateUserData 
  } {
    const errors: ValidationError[] = [];
    const sanitizedData: CreateUserData = { ...data };

    // Validate required fields
    if (!data.id || typeof data.id !== 'string') {
      errors.push({ field: 'id', message: 'User ID is required and must be a string' });
    }

    // Validate and sanitize username if provided
    if (data.username !== undefined) {
      if (data.username === null || data.username === '') {
        // Username is optional, so null/empty is valid
        sanitizedData.username = null;
      } else {
        const usernameValidation = validateUsername(data.username);
        if (!usernameValidation.isValid) {
          errors.push({ 
            field: 'username', 
            message: usernameValidation.errors[0] || 'Invalid username format' 
          });
        } else {
          sanitizedData.username = usernameValidation.sanitizedText;
        }
      }
    }

    // Validate and sanitize display name if provided
    if (data.display_name !== undefined) {
      if (data.display_name === null || data.display_name === '') {
        // Display name is optional, so null/empty is valid
        sanitizedData.display_name = null;
      } else {
        const displayNameValidation = validateDisplayName(data.display_name);
        if (!displayNameValidation.isValid) {
          errors.push({ 
            field: 'display_name', 
            message: displayNameValidation.errors[0] || 'Invalid display name format' 
          });
        } else {
          sanitizedData.display_name = displayNameValidation.sanitizedText;
        }
      }
    }

    // Validate avatar URL if provided
    if (data.avatar_url !== undefined && data.avatar_url !== null) {
      if (typeof data.avatar_url !== 'string') {
        errors.push({ field: 'avatar_url', message: 'Avatar URL must be a string' });
      } else {
        // Basic URL validation
        try {
          new URL(data.avatar_url);
          // Sanitize URL to prevent XSS
          sanitizedData.avatar_url = data.avatar_url.replace(/[<>"']/g, '');
        } catch {
          errors.push({ field: 'avatar_url', message: 'Invalid URL format' });
        }
      }
    }

    // Validate preferred language
    if (data.preferred_language !== undefined) {
      if (typeof data.preferred_language !== 'string') {
        errors.push({ field: 'preferred_language', message: 'Preferred language must be a string' });
      } else {
        // Basic language code validation (ISO 639-1)
        const languageRegex = /^[a-z]{2}$/;
        if (!languageRegex.test(data.preferred_language)) {
          errors.push({ field: 'preferred_language', message: 'Invalid language code format (use ISO 639-1)' });
        } else {
          sanitizedData.preferred_language = data.preferred_language.toLowerCase();
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
   * Validate and sanitize user data for updates
   */
  private static validateUpdateUserData(data: UpdateUserData): { 
    isValid: boolean; 
    errors: ValidationError[]; 
    sanitizedData: UpdateUserData 
  } {
    const errors: ValidationError[] = [];
    const sanitizedData: UpdateUserData = { ...data };

    // Validate and sanitize username if provided
    if (data.username !== undefined) {
      if (data.username === null || data.username === '') {
        // Username can be set to null/empty
        sanitizedData.username = null;
      } else {
        const usernameValidation = validateUsername(data.username);
        if (!usernameValidation.isValid) {
          errors.push({ 
            field: 'username', 
            message: usernameValidation.errors[0] || 'Invalid username format' 
          });
        } else {
          sanitizedData.username = usernameValidation.sanitizedText;
        }
      }
    }

    // Validate and sanitize display name if provided
    if (data.display_name !== undefined) {
      if (data.display_name === null || data.display_name === '') {
        // Display name can be set to null/empty
        sanitizedData.display_name = null;
      } else {
        const displayNameValidation = validateDisplayName(data.display_name);
        if (!displayNameValidation.isValid) {
          errors.push({ 
            field: 'display_name', 
            message: displayNameValidation.errors[0] || 'Invalid display name format' 
          });
        } else {
          sanitizedData.display_name = displayNameValidation.sanitizedText;
        }
      }
    }

    // Validate avatar URL if provided
    if (data.avatar_url !== undefined) {
      if (data.avatar_url === null) {
        // Avatar URL can be set to null
        sanitizedData.avatar_url = null;
      } else if (typeof data.avatar_url !== 'string') {
        errors.push({ field: 'avatar_url', message: 'Avatar URL must be a string' });
      } else {
        // Basic URL validation
        try {
          new URL(data.avatar_url);
          // Sanitize URL to prevent XSS
          sanitizedData.avatar_url = data.avatar_url.replace(/[<>"']/g, '');
        } catch {
          errors.push({ field: 'avatar_url', message: 'Invalid URL format' });
        }
      }
    }

    // Validate preferred language if provided
    if (data.preferred_language !== undefined) {
      if (typeof data.preferred_language !== 'string') {
        errors.push({ field: 'preferred_language', message: 'Preferred language must be a string' });
      } else {
        // Basic language code validation (ISO 639-1)
        const languageRegex = /^[a-z]{2}$/;
        if (!languageRegex.test(data.preferred_language)) {
          errors.push({ field: 'preferred_language', message: 'Invalid language code format (use ISO 639-1)' });
        } else {
          sanitizedData.preferred_language = data.preferred_language.toLowerCase();
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
   * Get user by user ID
   */
  static async getUser(userId: string): DatabaseUserInsertOrNullPromise {
    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single() as { data: DatabaseUserInsert; error: PostgrestError };

    if (error) {
      if (error.code === 'PGRST116') {
        return null // User not found
      }
      throw new Error(`Failed to fetch user: ${error.message}`)
    }

    return user
  }

  /**
   * Create a new user with validation and sanitization
   */
  static async createUser(data: CreateUserData): DatabaseUserInsertPromise {
    // Validate and sanitize input data
    const validation = this.validateCreateUserData(data);
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    const { sanitizedData } = validation;

    // Check username availability if username is provided
    if (sanitizedData.username && sanitizedData.username !== null) {
      const isAvailable = await this.isUsernameAvailable(sanitizedData.username);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }
    }

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: sanitizedData.id,
        username: sanitizedData.username,
        display_name: sanitizedData.display_name,
        avatar_url: sanitizedData.avatar_url,
        preferred_language: (sanitizedData.preferred_language ?? 'en') as LanguageCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single() as { data: DatabaseUserInsert; error: PostgrestError };

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }

    return user
  }

  /**
   * Update user with validation and sanitization
   */
  static async updateUser(userId: string, data: UpdateUserData): DatabaseUserInsertPromise {
    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }

    // Validate and sanitize input data
    const validation = this.validateUpdateUserData(data);
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    const { sanitizedData } = validation;

    // Check username availability if username is being updated
    if (sanitizedData.username !== undefined && sanitizedData.username !== null) {
      const existingUser = await this.getUserByUsername(sanitizedData.username);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Username is already taken');
      }
    }

    const updateData: DatabaseUserInsert = {
      ...sanitizedData,
      preferred_language: sanitizedData.preferred_language as LanguageCode | null | undefined,
      updated_at: new Date().toISOString()
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single() as { data: DatabaseUserInsert; error: PostgrestError };

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }

    return user
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): VoidPromise {
    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }

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
    // Validate username format
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      throw new Error(`Invalid username format: ${usernameValidation.errors[0]}`);
    }

    const { error } = await supabase
      .from('users')
      .select('id')
      .eq('username', usernameValidation.sanitizedText)
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
    // Validate username format
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      throw new Error(`Invalid username format: ${usernameValidation.errors[0]}`);
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', usernameValidation.sanitizedText)
      .single() as { data: DatabaseUserInsert; error: PostgrestError };

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
  static async updatePreferredLanguage(userId: string, language: string): DatabaseUserInsertPromise {
    return this.updateUser(userId, { preferred_language: language })
  }

  /**
   * Update user's avatar URL
   */
  static async updateAvatarUrl(userId: string, avatarUrl: string): DatabaseUserInsertPromise {
    return this.updateUser(userId, { avatar_url: avatarUrl })
  }

  /**
   * Get or create user (useful for ensuring user exists)
   */
  static async getOrCreateUser(userId: string, userData?: Partial<CreateUserData>): DatabaseUserInsertPromise {
    let user = await this.getUser(userId)
    
    user ??= await this.createUser({
      id: userId,
      username: userData?.username,
      display_name: userData?.display_name,
      avatar_url: userData?.avatar_url,
      preferred_language: userData?.preferred_language
    });

    return user;
  }
} 