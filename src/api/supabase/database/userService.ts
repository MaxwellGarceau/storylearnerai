import { supabase } from '../client'
import type { DatabaseUserInsert, DatabaseUserUpdate } from '../../../types/database/user';
import type { DatabaseUserInsertPromise, DatabaseUserInsertOrNullPromise } from '../../../types/database/promise'
import type { LanguageCode } from '../../../types/llm/prompts'
import type { NullableString, VoidPromise } from '../../../types/common'
import {
  validateUsername,
  validateDisplayName
} from '../../../lib/utils/sanitization'

export interface CreateUserData {
  id: string
  username?: string
  display_name?: string
  avatar_url?: NullableString
  native_language?: string
}

export interface UpdateUserData {
  username?: string
  display_name?: string
  avatar_url?: NullableString
  native_language?: string
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
      if (data.username === '') {
        errors.push({ field: 'username', message: 'Username cannot be empty' });
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
      if (data.display_name === '') {
        errors.push({ field: 'display_name', message: 'Display name cannot be empty' });
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

    // Validate native language
    if (data.native_language !== undefined) {
      if (typeof data.native_language !== 'string') {
        errors.push({ field: 'native_language', message: 'Native language must be a string' });
      } else {
        // Basic language code validation (ISO 639-1)
        const languageRegex = /^[a-z]{2}$/;
        if (!languageRegex.test(data.native_language)) {
          errors.push({ field: 'native_language', message: 'Invalid language code format (use ISO 639-1)' });
        } else {
          // @ts-expect-error migrating field name
          sanitizedData.native_language = data.native_language.toLowerCase();
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
      if (data.username === '') {
        errors.push({ field: 'username', message: 'Username cannot be empty' });
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
      if (data.display_name === '') {
        errors.push({ field: 'display_name', message: 'Display name cannot be empty' });
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

    // Validate native language if provided
    if (data.native_language !== undefined) {
      if (typeof data.native_language !== 'string') {
        errors.push({ field: 'native_language', message: 'Native language must be a string' });
      } else {
        // Basic language code validation (ISO 639-1)
        const languageRegex = /^[a-z]{2}$/;
        if (!languageRegex.test(data.native_language)) {
          errors.push({ field: 'native_language', message: 'Invalid language code format (use ISO 639-1)' });
        } else {
          // @ts-expect-error migrating field name
          sanitizedData.native_language = data.native_language.toLowerCase();
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
   * Get user by ID
   */
  static async getUser(userId: string): DatabaseUserInsertOrNullPromise {
    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }

    const result = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null // User not found
      }
      throw new Error(`Failed to fetch user: ${result.error.message}`)
    }

    return result.data as DatabaseUserInsert
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
    if (sanitizedData.username && sanitizedData.username !== '') {
      const isAvailable = await this.isUsernameAvailable(sanitizedData.username);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }
    }

    const result = await supabase
      .from('users')
      .insert({
        id: sanitizedData.id,
        username: sanitizedData.username,
        display_name: sanitizedData.display_name,
        avatar_url: sanitizedData.avatar_url,
        // @ts-expect-error migrating field name
        native_language: (sanitizedData.native_language ?? 'en') as LanguageCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (result.error) {
      throw new Error(`Failed to create user: ${result.error.message}`)
    }

    return result.data as DatabaseUserInsert
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
    if (sanitizedData.username !== undefined && sanitizedData.username !== '') {
      const existingUser = await this.getUserByUsername(sanitizedData.username);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Username is already taken');
      }
    }

    const updateData: DatabaseUserUpdate = {
      ...sanitizedData,
      // @ts-expect-error migrating field name
      native_language: (sanitizedData.native_language ?? undefined) as LanguageCode | undefined,
      updated_at: new Date().toISOString()
    }

    const result = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (result.error) {
      throw new Error(`Failed to update user: ${result.error.message}`)
    }

    return result.data as DatabaseUserInsert
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): VoidPromise {
    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }

    const result = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (result.error) {
      throw new Error(`Failed to delete user: ${result.error.message}`)
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

    const result = await supabase
      .from('users')
      .select('id')
      .eq('username', usernameValidation.sanitizedText)
      .single()

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return true // Username is available
      }
      throw new Error(`Failed to check username availability: ${result.error.message}`)
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

    const result = await supabase
      .from('users')
      .select('*')
      .eq('username', usernameValidation.sanitizedText)
      .single();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null // User not found
      }
      throw new Error(`Failed to fetch user by username: ${result.error.message}`)
    }

    return result.data as DatabaseUserInsert
  }

  /**
   * Update user's preferred language
   */
  static async updatePreferredLanguage(userId: string, language: string): DatabaseUserInsertPromise {
    // @ts-expect-error migrating field name
    return this.updateUser(userId, { native_language: language })
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
      // @ts-expect-error migrating field name
      native_language: (userData as { native_language?: string })?.native_language
    });

    return user;
  }
}
