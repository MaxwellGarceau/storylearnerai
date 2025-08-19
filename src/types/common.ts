/**
 * Common types used throughout the application
 * These types help prevent duplication and maintain consistency
 */

// Nullable types
export type NullableString = string | null;

// Function types
export type VoidFunction = () => void;

// Promise types
export type BooleanPromise = Promise<boolean>;
export type VoidPromise = Promise<void>;
export type UnknownPromise = Promise<unknown>;

// React event types
export type TextAreaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;

// Record types
export type RecordString = Record<string, string>;

// Union types
export type SaveFieldType = 'notes' | 'title';
