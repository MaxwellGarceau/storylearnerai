// Dictionary system exports
export * from './dictionaryService';
export * from './apiClient';
export * from './dictionaryApiManager';
export { LexicalaDataTransformerImpl } from './transformers/lexicalaTransformer';

// Re-export types for convenience
export type {
  DictionaryWord,
  WordDefinition,
  PartOfSpeech,
  WordFrequency,
  DictionarySearchParams,
  DictionaryResponse,
  DictionaryError,
  DictionaryErrorCode,
  DictionaryDataTransformer,
  DictionaryApiClient,
  DictionaryService,
  UseDictionaryReturn,
} from '../../types/dictionary';
