// Import all the individual components
import DictionaryEntryRoot from './Root';
import DictionaryEntryHeader from './Header';
import DictionaryEntryDefinition from './Definition';
import DictionaryEntryAdditionalInfo from './AdditionalInfo';
import DictionaryEntrySource from './Source';
import DictionaryEntryLoadingMessage from './LoadingMessage';
import DictionaryEntryErrorMessage from './ErrorMessage';
import DictionaryEntryDefaultMessage from './DefaultMessage';
import DictionaryEntryContent from './Content';

// Export individual component types for external use
export type { DictionaryEntryRootProps } from './Root';
export type { DictionaryEntryHeaderProps } from './Header';
export type { DictionaryEntryDefinitionProps } from './Definition';
export type { DictionaryEntryAdditionalInfoProps } from './AdditionalInfo';
export type { DictionaryEntrySourceProps } from './Source';
export type { DictionaryEntryLoadingMessageProps } from './LoadingMessage';
export type { DictionaryEntryErrorMessageProps } from './ErrorMessage';
export type { DictionaryEntryDefaultMessageProps } from './DefaultMessage';
export type { DictionaryEntryContentProps } from './Content';

// Export context and hook
export { DictionaryEntryContext, useDictionaryEntryContext } from './Context';
export type { DictionaryEntryContextValue } from './Context';

// Compound component export
const DictionaryEntry = {
  Root: DictionaryEntryRoot,
  Header: DictionaryEntryHeader,
  Definition: DictionaryEntryDefinition,
  AdditionalInfo: DictionaryEntryAdditionalInfo,
  Source: DictionaryEntrySource,
  LoadingMessage: DictionaryEntryLoadingMessage,
  ErrorMessage: DictionaryEntryErrorMessage,
  DefaultMessage: DictionaryEntryDefaultMessage,
  Content: DictionaryEntryContent,
};

export default DictionaryEntry;
