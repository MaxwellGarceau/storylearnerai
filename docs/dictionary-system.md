# Dictionary System

## Overview

The dictionary system provides real-time word lookup with caching, error handling, and language-aware search. It uses the Lexicala API (via RapidAPI) by default and can be disabled at runtime via environment variables.

## Architecture

The system follows this layered architecture:

```
useDictionary React hook ↔︎ DictionaryServiceImpl ↔︎ DictionaryApiManager ↔︎ LexicalaApiClient ↔︎ RapidAPI (Lexicala)
```

### Components

1. **React Hook (`useDictionary`)**: Provides loading, error, and result state and a `searchWord` function
2. **Dictionary Service (`DictionaryServiceImpl`)**: Orchestrates API calls, transformation, and 30‑minute caching
3. **DictionaryApiManager**: Chooses and mediates between API clients (primary: `lexicala`)
4. **API Client (`LexicalaApiClient`)**: Calls Lexicala via RapidAPI with consistent response shape
5. **External API**: Lexicala (`https://lexicala1.p.rapidapi.com` via RapidAPI)

## Key Features

- **Real-time word lookup** via `useDictionary().searchWord`
- **Language-aware search**: `fromLanguage` and `targetLanguage` parameters
- **Caching**: 30 minutes with automatic cleanup
- **Error handling**: Standardized `DictionaryError` and disabled-state signaling
- **Rich word information**: definitions, parts of speech, examples (when available)

## Usage

### Basic Hook Usage

```tsx
import { useDictionary } from '@/hooks/useDictionary';

function MyComponent() {
  const { wordInfo, isLoading, error, searchWord } = useDictionary();

  const handleLookup = async (word: string) => {
    // fromLanguage optional, targetLanguage defaults to 'en'
    await searchWord(word, 'es', 'en');
  };

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {wordInfo && (
        <div>
          <h3>{wordInfo.word}</h3>
          {wordInfo.definitions.map((def, i) => (
            <p key={i}>{def.definition}</p>
          ))}
        </div>
      )}
      <button onClick={() => handleLookup('casa')}>Lookup</button>
    </div>
  );
}
```

### Integrated UI

Interactive word actions (Translate, Dictionary, Save) are provided by `WordMenu` and are auth‑gated. See `src/components/text/WordMenu.tsx` for integration with `useDictionary()` and vocabulary saving.

## Data Structure

### DictionaryWord Interface

```typescript
interface DictionaryWord {
  word: string;
  phonetic?: string;
  definitions: WordDefinition[];
  partsOfSpeech?: PartOfSpeech[];
  etymology?: string;
  examples?: string[];
  synonyms?: string[];
  antonyms?: string[];
  frequency?: WordFrequency;
  difficulty?: DifficultyLevel;
  audioUrl?: string;
  source?: string;
  lastUpdated?: string;
}
```

### WordDefinition Interface

```typescript
interface WordDefinition {
  definition: string;
  partOfSpeech?: string;
  examples?: string[];
  synonyms?: string[];
  antonyms?: string[];
  context?: string;
}
```

## Configuration

### Environment Variables

Set in `.env` (see `env.example`):

```env
VITE_DICTIONARY_API_ENDPOINT=https://lexicala1.p.rapidapi.com
VITE_DICTIONARY_API_KEY=your-rapidapi-key
VITE_DISABLE_DICTIONARY=false
```

### Service Notes

- The default instance is exported as `dictionaryService`.
- If `VITE_DISABLE_DICTIONARY=true`, calls will short‑circuit with a standardized error.
- Cache duration is 30 minutes by default.

## Extending the System

### Adding New API Providers

1. **Create a new API client**:

```typescript
import {
  DictionaryApiClient,
  DictionarySearchParams,
  DictionaryResponse,
} from '../../types/dictionary';

export class NewDictionaryApiClient implements DictionaryApiClient {
  async searchWord(
    params: DictionarySearchParams
  ): Promise<DictionaryResponse> {
    // Implement API call logic
  }

  async getWordDetails(
    word: string,
    language?: string
  ): Promise<DictionaryResponse> {
    // Implement details call logic
  }

  isAvailable(): boolean {
    // Check if API is available
  }
}
```

2. **Update the data transformer** to handle the new API format:

```typescript
export class DictionaryDataTransformer {
  transformNewApiResponse(rawData: unknown): DictionaryWord {
    // Transform new API format to DictionaryWord
  }
}
```

3. **Update the service** to use the new client:

```typescript
const service = new DictionaryService(new NewDictionaryApiClient());
```

### Adding Database Support

To switch from API calls to database queries:

1. **Create a database client** that implements the `DictionaryApiClient` interface
2. **Update the data transformer** to handle database responses
3. **Configure the service** to use the database client

### Adding Parts of Speech Detection

The system is designed to easily integrate parts of speech detection:

1. **Add a POS detection service** (e.g., using spaCy, NLTK, or a cloud service)
2. **Extend the data transformation layer** to include POS information
3. **Update the UI** to display POS information

## Error Handling

Errors are normalized to `DictionaryError` with fields: `code`, `message`, and optional `details`. When disabled via env, an `API_ERROR` is returned with a descriptive message.

## Caching Strategy

- **Cache duration**: 30 minutes
- **Cache key**: `word:fromLanguage:targetLanguage`
- **Automatic cleanup** of expired entries

## Performance Considerations

- **Debounced requests**: Prevents excessive API calls during rapid hovering
- **Request cancellation**: Cancels previous requests when new ones are made
- **Caching**: Reduces API calls for frequently looked-up words
- **Lazy loading**: Only fetches data when needed

## Testing

Run tests with:

```bash
npm run test:once -- src/lib/dictionary/
npm run test:once -- src/hooks/useDictionary.ts
npm run test:once -- src/components/text/WordMenu.tsx
```

## Future Enhancements

- **Offline support** with local dictionary database
- **Audio pronunciation** playback
- **Word frequency analysis** for learning recommendations
- **Custom word lists** for vocabulary building
- **Integration with learning management systems**
- **Multi-language dictionary support**
- **Advanced parts of speech detection**
- **Etymology visualization**
- **Word relationship graphs**

## Troubleshooting

### Common Issues

1. **Words not found**: Check if the word exists in the dictionary API
2. **Slow responses**: Verify network connectivity and API status
3. **Caching issues**: Clear cache using `dictionaryService.clearCache()`
4. **UI not updating**: Ensure proper React state management

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
import { logger } from '../lib/logger';

// Debug logs will show API calls, cache hits, and errors
logger.debug('dictionary', 'Debug message', { data });
```

## API Reference

### useDictionary Hook

```typescript
interface UseDictionaryReturn {
  wordInfo: DictionaryWord | null;
  isLoading: boolean;
  error: DictionaryError | null;
  searchWord: (
    word: string,
    fromLanguage?: LanguageCode,
    targetLanguage?: LanguageCode
  ) => Promise<void>;
  clearError: () => void;
}
```

### DictionaryService

```typescript
interface DictionaryService {
  getWordInfo(
    word: string,
    fromLanguage?: LanguageCode,
    targetLanguage?: LanguageCode
  ): Promise<DictionaryWord>;
  searchWord(params: DictionarySearchParams): Promise<DictionaryWord>;
  getCachedWord(
    word: string,
    fromLanguage?: LanguageCode,
    targetLanguage?: LanguageCode
  ): DictionaryWord | null;
  clearCache(): void;
}
```

### DictionaryApiClient

```typescript
interface DictionaryApiClient {
  searchWord(params: DictionarySearchParams): Promise<DictionaryResponse>;
  getWordDetails(word: string, language?: string): Promise<DictionaryResponse>;
  isAvailable(): boolean;
}
```
