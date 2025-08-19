/**
 * Database-specific promise types
 * These types help prevent duplication in database operations
 */

import type { DatabaseUserInsert } from './user';
import type { DatabaseTranslationInsert, DatabaseSavedTranslationWithDetails } from './translation';

// User-related promise types
export type DatabaseUserInsertPromise = Promise<DatabaseUserInsert>;
export type DatabaseUserInsertOrNullPromise = Promise<DatabaseUserInsert | null>;

// Translation-related promise types
export type DatabaseTranslationInsertPromise = Promise<DatabaseTranslationInsert>;
export type DatabaseTranslationInsertOrNullPromise = Promise<DatabaseTranslationInsert | null>;
export type DatabaseTranslationInsertArrayPromise = Promise<DatabaseTranslationInsert[]>;

// Saved translation promise types
export type DatabaseSavedTranslationWithDetailsPromise = Promise<DatabaseSavedTranslationWithDetails>;
