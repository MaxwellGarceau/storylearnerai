As a demonstration of my skills in building modern web applications, I’d like to highlight several key areas within my StoryLearnerAI project.

_For a comprehensive visual demonstration of the application in action, please see the [main README](https://github.com/MaxwellGarceau/storylearnerai/blob/main/README.md) which includes a video walkthrough showcasing the app's features and user experience._

### TypeScript

I prioritize writing strongly-typed, maintainable code, and I believe my approach to TypeScript reflects that. I've established a comprehensive set of type definitions that not only model the application's data structures but also define clear contracts for different layers of the application.

- **[src/types/dictionary.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/types/dictionary.ts)**: I'm particularly proud of this file as it showcases a holistic approach to type definition. It covers everything from complex, nested data structures for the dictionary feature to interfaces for API clients and services. I also implemented a custom `DictionaryError` class here to ensure consistent error handling across the dictionary feature.
- **[src/types/database/vocabulary.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/types/database/vocabulary.ts)**: Here, I've modeled the database entities for vocabulary words. I created distinct interfaces for reading (`Vocabulary`), inserting (`VocabularyInsert`), and updating (`VocabularyUpdate`) data. This practice ensures type safety throughout all database operations, reducing the likelihood of runtime errors.
- **[src/types/app/translations.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/types/app/translations.ts)**: This file demonstrates my use of more advanced TypeScript features. I used discriminated unions to model the different types of tokens in a translated text, which allows for exhaustive checking and safer code. This approach has been critical for handling the complex data transformations required when processing and storing translations.

### Meaningful React Code

I've focused on writing React code that is not only functional but also clean, scalable, and easy to maintain. This is evident in my approach to data fetching, state management, component architecture, and the creation of custom hooks.

#### Data Fetching

My data fetching architecture is designed to be robust and scalable, with a clear separation of concerns.

- **[src/api/supabase/database/savedTranslationService.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/api/supabase/database/savedTranslationService.ts)**: This service class encapsulates all database interactions for saved translations. By centralizing this logic, I've made the data fetching logic more reusable and easier to test.
- **[src/hooks/useSavedTranslations.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/hooks/useSavedTranslations.ts)**: This custom hook serves as the bridge between the data fetching services and the UI. It handles loading and error states, providing a clean and declarative interface for components to consume.

#### State Management

For state management, I've leveraged React's Context API to create a centralized store for shared state.

- **[src/contexts/StoryContext.tsx](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/contexts/StoryContext.tsx)**: This context provides a single source of truth for all state related to the story reading experience. It manages complex state objects, including `Map` and `Set`, and uses `useCallback` and `useMemo` for performance optimizations. The custom hooks it exports (`useStoryContext` and `useWordState`) provide a simple and ergonomic API for consumer components.

#### Complex Components

I have experience building complex components that manage their own state and logic while remaining composable.

- **[src/components/story/StoryContainer.tsx](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/components/story/StoryContainer.tsx)**: This component is a great example of a "container" component that encapsulates a major piece of functionality. It manages the state of the story input form, handles the asynchronous translation process, and includes robust error handling.
- **[src/components/dictionary/DictionaryEntry](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/components/dictionary/DictionaryEntry)**: This is a composite component that I built using the compound component pattern. It's composed of several smaller, single-responsibility components (`Header`, `Definition`, `Source`, etc.) that work together to display a dictionary entry. The main `Root` component uses a React Context to share state implicitly with all its children, which avoids prop drilling and creates a clean, declarative API for rendering the different parts of the dictionary entry.

#### Custom React Hooks

I frequently create custom hooks to extract and reuse component logic, leading to a cleaner and more maintainable codebase.

- **[src/hooks/useDictionary.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/hooks/useDictionary.ts)**: This hook showcases some more advanced techniques, such as using an `AbortController` to cancel stale network requests, which is crucial for preventing race conditions in a responsive UI.
- **[src/hooks/useAuth.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/hooks/useAuth.ts)**: This is a foundational hook in the application that encapsulates all authentication logic, providing a simple interface for components to interact with the authentication service.

### Automated Testing

I believe that a strong testing culture is essential for building reliable software. I've written comprehensive automated tests for my components, hooks, and services.

- **Component Test: [src/components/story/**tests**/StoryContainer.test.tsx](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/components/story/__tests__/StoryContainer.test.tsx)**: This test file demonstrates how I test complex components by simulating user interactions, mocking dependencies, and asserting on the component's output in various states (loading, success, error).
- **Hook Test: [src/hooks/**tests**/useDictionary.test.tsx](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/hooks/__tests__/useDictionary.test.tsx)**: Here, I've used `@testing-library/react`'s `renderHook` utility to test my custom hook in isolation. This includes testing advanced asynchronous logic and edge cases, such as handling race conditions.
- **Service Test: [src/api/supabase/database/**tests**/savedTranslationService.test.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/api/supabase/database/__tests__/savedTranslationService.test.ts)**: This file shows how I unit test the data access layer. I've created detailed mocks of the database client to isolate the service and test its logic, including input validation and error handling, without making actual database calls.

### LLM Integration & AI Features

The application leverages Large Language Models (LLMs) to provide intelligent translation and language learning features. I've built a robust, extensible LLM system that demonstrates advanced integration patterns and error handling.

#### LLM Service Architecture

I've implemented a comprehensive LLM service system with a clean, provider-agnostic architecture:

- **[src/lib/llm/LLMService.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/lib/llm/LLMService.ts)**: This abstract base class defines the contract for all LLM providers, ensuring consistent interfaces across different AI services. It includes error handling, response processing, and provider metadata management.
- **[src/lib/llm/LLMServiceManager.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/lib/llm/LLMServiceManager.ts)**: A singleton service manager that handles provider initialization, configuration management, and request routing. This pattern allows for easy provider switching and centralized configuration.
- **[src/lib/llm/providers/GeminiService.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/lib/llm/providers/GeminiService.ts)**: A concrete implementation for Google Gemini, showcasing integration with the official Google GenAI SDK. It includes comprehensive error handling, token usage tracking, and response validation.

#### Advanced Translation Features

The LLM integration powers sophisticated translation capabilities with structured output and fallback mechanisms:

- **[src/lib/llm/translationServiceIntegration.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/lib/llm/translationServiceIntegration.ts)**: This integration layer handles the complex process of requesting translations from LLMs, validating structured responses, and implementing fallback strategies when validation fails. It demonstrates advanced error handling and graceful degradation.
- **[src/lib/prompts/config/general.json](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/lib/prompts/config/general.json)**: A sophisticated prompt configuration system that provides detailed instructions to the LLM for maintaining story quality, cultural context, and proper JSON formatting.
- **[src/lib/prompts/config/to-language.json](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/lib/prompts/config/to-language.json)**: CEFR-based difficulty configuration that dynamically adjusts vocabulary complexity, grammar structures, and cultural references based on the target language proficiency level (A1-B2).

#### Intelligent Content Processing

The system includes advanced features for processing and validating LLM responses:

- **Token Validation**: Implements robust validation of structured LLM responses with detailed error reporting and warning systems
- **Fallback Generation**: When structured responses fail validation, the system automatically generates fallback tokens to ensure the application remains functional
- **Performance Monitoring**: Comprehensive logging and timing for LLM requests, including token usage tracking and response analysis
- **Provider Flexibility**: Built with extensibility in mind, allowing easy addition of new LLM providers (OpenAI, Anthropic, etc.) without changing the core application logic

This LLM integration demonstrates my ability to work with AI technologies while maintaining code quality, error handling, and system reliability. The architecture showcases patterns like the Factory pattern, Singleton pattern, and comprehensive error handling strategies.
