import { DictionaryError, DictionaryErrorCode } from '../../types/dictionary';

/**
 * Creates a standardized dictionary error
 */
export function createDictionaryError(
  code: DictionaryErrorCode,
  message: string,
  details?: Record<string, unknown>
): DictionaryError {
  return new DictionaryError(code, message, {
    ...details,
    timestamp: new Date().toISOString(),
  });
}
