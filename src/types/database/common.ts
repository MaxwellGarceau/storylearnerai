/**
 * Common database types used across database services
 * These types help prevent duplication in database operations
 */

import type { PostgrestError } from '@supabase/supabase-js';
import type { DatabaseUserInsert } from './user';
import type { DatabaseTranslationInsert, DatabaseSavedTranslationWithDetails } from './translation';

// Database operation result types
export type DatabaseInsertResult<T> = Promise<T>;
export type DatabaseSelectResult<T> = Promise<T | null>;
export type DatabaseUpdateResult<T> = Promise<T>;
export type DatabaseDeleteResult = Promise<void>;

// Supabase response types
export type SupabaseResponse<T> = {
  data: T;
  error: PostgrestError;
};

// Common database field types
export type DatabaseId = string;
export type DatabaseTimestamp = string;
export type DatabaseNullableString = string | null;
export type DatabaseNullableNumber = number | null;

// Database operation types
export type DatabaseOperation<T> = Promise<T>;
export type DatabaseOperationOrNull<T> = Promise<T | null>;

// User-related database types
export type UserInsertResult = Promise<unknown>;
export type UserSelectResult = Promise<unknown>;
export type UserUpdateResult = Promise<unknown>;

// Translation-related database types
export type TranslationInsertResult = Promise<unknown>;
export type TranslationSelectResult = Promise<unknown>;
export type TranslationUpdateResult = Promise<unknown>;

// Saved translation types
export type SavedTranslationResult = Promise<unknown>;

// Specific database promise types are now in promise.ts
// Import from '../../../types/database/promise' instead
