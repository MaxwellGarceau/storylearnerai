# Dictionary System

## Overview

The dictionary system provides real-time word lookup functionality when users hover over words in translated stories. It follows a clean, layered architecture that makes it easy to switch between different data sources and extend functionality.

## Architecture

The system follows this layered architecture:

```
useDictionary React hook ↔︎ dictionaryService ↔︎ Data transformation layer ↔︎ API Client ↔︎ External API
```

### Components

1. **React Hook (`useDictionary`)**: Provides a clean interface for components to interact with the dictionary service
2. **Dictionary Service**: Orchestrates API calls, data transformation, and caching
3. **Data Transformation Layer**: Converts raw API responses to standardized format
4. **API Client**: Handles HTTP requests to external dictionary APIs
5. **External API**: Currently uses Free Dictionary API (https://dictionaryapi.dev/)

## Key Features

- **Real-time word lookup** on hover
- **Intelligent caching** with 30-minute expiration
- **Error handling** with user-friendly messages
- **Multi-language support** (currently English, easily extensible)
- **Rich word information** including definitions, parts of speech, synonyms, antonyms, and more
- **Responsive UI** with loading states and error handling

## Usage

### Basic Usage in Components

```tsx
import { useDictionary } from '../hooks/useDictionary';

function MyComponent() {
  const { wordInfo, isLoading, error, searchWord } = useDictionary();

  const handleWordHover = async (word: string) => {
    await searchWord(word, 'en');
  };

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {wordInfo && (
        <div>
          <h3>{wordInfo.word}</h3>
          {wordInfo.definitions.map((def, index) => (
            <p key={index}>{def.definition}</p>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Using WordHighlight Component

The `WordHighlight` component automatically handles dictionary lookups:

```tsx
import WordHighlight from '../components/text/WordHighlight';

function StoryText({ text, language }) {
  return (
    <div>
      {text.split(' ').map((word, index) => (
        <WordHighlight key={index} word={word} language={language}>
          {word}
        </WordHighlight>
      ))}
    </div>
  );
}
```

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

No environment variables are currently required as the Free Dictionary API is free and doesn't require authentication.

### Service Configuration

You can configure the dictionary service with different options:

```typescript
import { createDictionaryService } from '../lib/dictionary/dictionaryService';

// Create service with mock data for testing
const mockService = createDictionaryService({
  useMock: true,
  mockData: {
    hello: {
      /* mock word data */
    },
  },
});

// Create service with custom cache timeout
const customService = createDictionaryService({
  cacheTimeout: 60 * 60 * 1000, // 1 hour
});
```

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

The system handles various error scenarios:

- **Network errors**: When the API is unavailable
- **Word not found**: When a word doesn't exist in the dictionary
- **Rate limiting**: When API limits are exceeded
- **Invalid responses**: When the API returns unexpected data

All errors are standardized and include:

- Error code
- User-friendly message
- Additional details for debugging

## Caching Strategy

- **Cache duration**: 30 minutes by default
- **Cache key**: `word:language` format
- **Automatic cleanup**: Expired entries are removed automatically
- **Memory efficient**: Uses Map for O(1) lookups

## Performance Considerations

- **Debounced requests**: Prevents excessive API calls during rapid hovering
- **Request cancellation**: Cancels previous requests when new ones are made
- **Caching**: Reduces API calls for frequently looked-up words
- **Lazy loading**: Only fetches data when needed

## Testing

The system includes comprehensive tests:

- **Unit tests** for all service layers
- **Hook tests** for React integration
- **Component tests** for UI behavior
- **Mock data** for reliable testing

Run tests with:

```bash
npm run test:once -- src/lib/dictionary/
npm run test:once -- src/hooks/__tests__/useDictionary.test.tsx
npm run test:once -- src/components/story/__tests__/WordHighlight.test.tsx
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
3. **Caching issues**: Clear cache using `service.clearCache()`
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
  searchWord: (word: string, language?: string) => Promise<void>;
  clearError: () => void;
}
```

### DictionaryService

```typescript
interface DictionaryService {
  getWordInfo(word: string, language?: string): Promise<DictionaryWord>;
  searchWord(params: DictionarySearchParams): Promise<DictionaryWord>;
  getCachedWord(word: string): DictionaryWord | null;
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
