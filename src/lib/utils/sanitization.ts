import DOMPurify from 'dompurify';

/**
 * Sanitization utility for text input security
 * 
 * This module provides comprehensive sanitization functions to prevent:
 * - XSS (Cross-Site Scripting) attacks
 * - HTML injection
 * - Script injection
 * - Other malicious content
 */

interface SanitizationOptions {
  /** Whether to allow HTML tags (default: false) */
  allowHTML?: boolean;
  /** Whether to allow line breaks (default: true) */
  allowLineBreaks?: boolean;
  /** Maximum length of input (default: 10000 characters) */
  maxLength?: number;
  /** Whether to trim whitespace (default: true) */
  trim?: boolean;
  /** Custom allowed HTML tags if allowHTML is true */
  allowedTags?: string[];
  /** Custom allowed HTML attributes if allowHTML is true */
  allowedAttributes?: string[];
}

/**
 * Default sanitization options for story input
 */
const DEFAULT_STORY_OPTIONS: SanitizationOptions = {
  allowHTML: false,
  allowLineBreaks: true,
  maxLength: 10000,
  trim: false, // Don't trim story text to allow spaces at beginning/end
};

/**
 * Default sanitization options for authentication forms
 */
const DEFAULT_AUTH_OPTIONS: SanitizationOptions = {
  allowHTML: false,
  allowLineBreaks: false,
  maxLength: 255,
  trim: true,
};

/**
 * Default sanitization options for email fields
 */
const DEFAULT_EMAIL_OPTIONS: SanitizationOptions = {
  allowHTML: false,
  allowLineBreaks: false,
  maxLength: 254, // RFC 5321 limit
  trim: true,
};

/**
 * Default sanitization options for username fields
 */
const DEFAULT_USERNAME_OPTIONS: SanitizationOptions = {
  allowHTML: false,
  allowLineBreaks: false,
  maxLength: 50,
  trim: true,
};

/**
 * Sanitizes text input to prevent security vulnerabilities
 * 
 * @param input - The raw text input to sanitize
 * @param options - Sanitization options
 * @returns Sanitized text safe for processing
 */
export function sanitizeText(input: string, options: SanitizationOptions = {}): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const opts = { ...DEFAULT_STORY_OPTIONS, ...options };
  let sanitized = input;

  // Trim whitespace if requested
  if (opts.trim) {
    sanitized = sanitized.trim();
  }

  // Check max length (but don't truncate yet, we'll do it after sanitization)
  const maxLength = opts.maxLength;

  // If HTML is not allowed, use DOMPurify to strip all HTML
  if (!opts.allowHTML) {
    // Configure DOMPurify to only allow text content
    const purifyConfig = {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: false,
    };

    sanitized = DOMPurify.sanitize(sanitized, purifyConfig);
  } else {
    // If HTML is allowed, use custom allowed tags and attributes
    const purifyConfig = {
      ALLOWED_TAGS: opts.allowedTags || ['p', 'br', 'strong', 'em', 'u', 'i'],
      ALLOWED_ATTR: opts.allowedAttributes || ['class'],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: false,
    };

    sanitized = DOMPurify.sanitize(sanitized, purifyConfig);
  }

  // Handle line breaks
  if (opts.allowLineBreaks) {
    // Preserve line breaks by converting them to <br> tags if HTML is allowed
    if (opts.allowHTML) {
      sanitized = sanitized.replace(/\n/g, '<br>');
    }
  } else {
    // Remove line breaks if not allowed
    sanitized = sanitized.replace(/\n/g, ' ');
  }

  // Apply max length after all sanitization
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validates text input for basic security checks
 * 
 * @param input - The text input to validate
 * @param options - Validation options
 * @returns Object with validation result and any errors
 */
export function validateTextInput(input: string, options: SanitizationOptions = {}): {
  isValid: boolean;
  errors: string[];
  sanitizedText: string;
} {
  const errors: string[] = [];
  const opts = { ...DEFAULT_STORY_OPTIONS, ...options };

  // Check if input exists
  if (!input || typeof input !== 'string') {
    errors.push('Input must be a non-empty string');
    return { isValid: false, errors, sanitizedText: '' };
  }

  // Check length
  if (opts.maxLength && input.length > opts.maxLength) {
    errors.push(`Input exceeds maximum length of ${opts.maxLength} characters`);
  }

  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      errors.push('Input contains potentially dangerous content');
      break;
    }
  }

  // Sanitize the text
  const sanitizedText = sanitizeText(input, options);

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedText,
  };
}

/**
 * Sanitizes text specifically for story input
 * 
 * @param input - The story text to sanitize
 * @returns Sanitized story text
 */
export function sanitizeStoryText(input: string): string {
  return sanitizeText(input, DEFAULT_STORY_OPTIONS);
}

/**
 * Validates story text input
 * 
 * @param input - The story text to validate
 * @returns Validation result
 */
export function validateStoryText(input: string): {
  isValid: boolean;
  errors: string[];
  sanitizedText: string;
} {
  return validateTextInput(input, DEFAULT_STORY_OPTIONS);
}

/**
 * Sanitizes and validates email input
 * 
 * @param input - The email to sanitize and validate
 * @returns Sanitized email
 */
export function sanitizeEmail(input: string): string {
  return sanitizeText(input, DEFAULT_EMAIL_OPTIONS);
}

/**
 * Validates email input for security and format
 * 
 * @param input - The email to validate
 * @returns Validation result
 */
export function validateEmail(input: string): {
  isValid: boolean;
  errors: string[];
  sanitizedText: string;
} {
  const errors: string[] = [];
  const opts = { ...DEFAULT_EMAIL_OPTIONS };
  
  // Basic validation
  const validation = validateTextInput(input, opts);
  if (!validation.isValid) {
    return validation;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(validation.sanitizedText)) {
    errors.push('Invalid email format');
  }

  return {
    isValid: errors.length === 0,
    errors: [...validation.errors, ...errors],
    sanitizedText: validation.sanitizedText,
  };
}

/**
 * Sanitizes and validates username input
 * 
 * @param input - The username to sanitize and validate
 * @returns Sanitized username
 */
export function sanitizeUsername(input: string): string {
  return sanitizeText(input, DEFAULT_USERNAME_OPTIONS);
}

/**
 * Validates username input for security and format
 * 
 * @param input - The username to validate
 * @returns Validation result
 */
export function validateUsername(input: string): {
  isValid: boolean;
  errors: string[];
  sanitizedText: string;
} {
  const errors: string[] = [];
  const opts = { ...DEFAULT_USERNAME_OPTIONS };
  
  // Basic validation
  const validation = validateTextInput(input, opts);
  if (!validation.isValid) {
    return validation;
  }

  // Username format validation
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  if (!usernameRegex.test(validation.sanitizedText)) {
    errors.push('Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens');
  }

  return {
    isValid: errors.length === 0,
    errors: [...validation.errors, ...errors],
    sanitizedText: validation.sanitizedText,
  };
}

/**
 * Sanitizes and validates display name input
 * 
 * @param input - The display name to sanitize and validate
 * @returns Sanitized display name
 */
export function sanitizeDisplayName(input: string): string {
  return sanitizeText(input, DEFAULT_AUTH_OPTIONS);
}

/**
 * Validates display name input for security and format
 * 
 * @param input - The display name to validate
 * @returns Validation result
 */
export function validateDisplayName(input: string): {
  isValid: boolean;
  errors: string[];
  sanitizedText: string;
} {
  const errors: string[] = [];
  const opts = { ...DEFAULT_AUTH_OPTIONS };
  
  // Basic validation
  const validation = validateTextInput(input, opts);
  if (!validation.isValid) {
    return validation;
  }

  // Display name format validation
  if (validation.sanitizedText.length < 2) {
    errors.push('Display name must be at least 2 characters long');
  }

  if (validation.sanitizedText.length > 100) {
    errors.push('Display name must be 100 characters or less');
  }

  return {
    isValid: errors.length === 0,
    errors: [...validation.errors, ...errors],
    sanitizedText: validation.sanitizedText,
  };
} 