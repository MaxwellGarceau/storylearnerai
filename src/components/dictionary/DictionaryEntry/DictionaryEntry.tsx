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

// Types and context re-exports moved to index.ts to satisfy react-refresh rule

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

// Named export to satisfy react-refresh rule; default preserved for convenience
export { DictionaryEntry };
export default DictionaryEntry;
