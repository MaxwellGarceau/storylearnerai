/**
 * Common database types used across database services
 * These types help prevent duplication in database operations
 */

import type { PostgrestError } from '@supabase/supabase-js';

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
export type UserInsertResult = Promise<any>;
export type UserSelectResult = Promise<any | null>;
export type UserUpdateResult = Promise<any>;

// Translation-related database types
export type TranslationInsertResult = Promise<any>;
export type TranslationSelectResult = Promise<any | null>;
export type TranslationUpdateResult = Promise<any>;

// Saved translation types
export type SavedTranslationResult = Promise<any>;
