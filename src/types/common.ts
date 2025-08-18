/**
 * Common types used throughout the application
 * These types help prevent duplication and maintain consistency
 */

// Nullable types
export type NullableString = string | null;
export type NullableNumber = number | null;
export type NullableBoolean = boolean | null;

// Promise result types
export type PromiseResult<T> = Promise<T>;
export type PromiseResultOrNull<T> = Promise<T | null>;
export type PromiseVoid = Promise<void>;

// Function types
export type VoidCallback = () => void;
export type AsyncVoidCallback = () => Promise<void>;

// Record types
export type RecordString = Record<string, string>;
export type RecordUnknown = Record<string, unknown>;

// React event types
export type TextAreaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedText: string;
}

// Auth function types
export type AuthFunction = (email: string, password: string) => Promise<boolean>;
export type AuthCallback = () => void;
export type AuthSuccessCallback = () => void;
export type AuthErrorCallback = (error: string) => void;

// Database response types
export type DatabaseResponse<T> = {
  data: T;
  error: PostgrestError;
};

// Language and difficulty filter types
export type LanguageFilter = '' | string;
export type DifficultyFilter = '' | string;

// Additional common types
export type OptionalString = string | undefined;
export type HTMLElementOrNull = HTMLElement | null;
export type ViMockFunction = ReturnType<typeof vi.fn>;
export type AuthErrorOrString = AuthError | null | string;
export type WalkthroughStateCallback = (state: WalkthroughState) => void;
export type WalkthroughConfigOrNull = WalkthroughConfig | null;
export type TranslationResponsePromise = Promise<TranslationResponse>;
export type PromptInstructionsOrNull = PromptInstructions | null;
export type RecordUnknownOrUndefined = Record<string, unknown> | undefined;
export type LlamaMessage = { message: { content: string } };
export type LlamaMessageArray = Array<LlamaMessage>;
export type SaveFieldType = 'notes' | 'title';
export type SupabaseEventCallback = (event: string, session: any) => void;
export type SupabaseEventCallbackOrUndefined = SupabaseEventCallback | undefined;
