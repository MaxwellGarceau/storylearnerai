export interface SanitizationOptions {
  allowHTML?: boolean;
  allowLineBreaks?: boolean;
  maxLength?: number;
  trim?: boolean;
  allowedTags?: string[];
  allowedAttributes?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedText: string;
}
