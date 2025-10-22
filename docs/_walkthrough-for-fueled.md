As a demonstration of my skills in building modern web applications, I’d like to highlight several key areas within my StoryLearnerAI project.

_For a comprehensive visual demonstration of the application in action, please see the [main README](https://github.com/MaxwellGarceau/storylearnerai/blob/main/README.md) which includes a video walkthrough showcasing the app's features and user experience._

### TypeScript

I prioritize writing strongly-typed, maintainable code, and I believe my approach to TypeScript reflects that. I've established a comprehensive set of type definitions that not only model the application's data structures but also define clear contracts for different layers of the application.

*   **[src/types/dictionary.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/types/dictionary.ts)**: I'm particularly proud of this file as it showcases a holistic approach to type definition. It covers everything from complex, nested data structures for the dictionary feature to interfaces for API clients and services. I also implemented a custom `DictionaryError` class here to ensure consistent error handling across the dictionary feature.
*   **[src/types/database/vocabulary.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/types/database/vocabulary.ts)**: Here, I've modeled the database entities for vocabulary words. I created distinct interfaces for reading (`Vocabulary`), inserting (`VocabularyInsert`), and updating (`VocabularyUpdate`) data. This practice ensures type safety throughout all database operations, reducing the likelihood of runtime errors.
*   **[src/types/app/translations.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/types/app/translations.ts)**: This file demonstrates my use of more advanced TypeScript features. I used discriminated unions to model the different types of tokens in a translated text, which allows for exhaustive checking and safer code. This approach has been critical for handling the complex data transformations required when processing and storing translations.

### Meaningful React Code

I've focused on writing React code that is not only functional but also clean, scalable, and easy to maintain. This is evident in my approach to data fetching, state management, component architecture, and the creation of custom hooks.

#### Data Fetching

My data fetching architecture is designed to be robust and scalable, with a clear separation of concerns.

*   **[src/api/supabase/database/savedTranslationService.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/api/supabase/database/savedTranslationService.ts)**: This service class encapsulates all database interactions for saved translations. By centralizing this logic, I've made the data fetching logic more reusable and easier to test.
*   **[src/hooks/useSavedTranslations.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/hooks/useSavedTranslations.ts)**: This custom hook serves as the bridge between the data fetching services and the UI. It handles loading and error states, providing a clean and declarative interface for components to consume.

#### State Management

For state management, I've leveraged React's Context API to create a centralized store for shared state.

*   **[src/contexts/StoryContext.tsx](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/contexts/StoryContext.tsx)**: This context provides a single source of truth for all state related to the story reading experience. It manages complex state objects, including `Map` and `Set`, and uses `useCallback` and `useMemo` for performance optimizations. The custom hooks it exports (`useStoryContext` and `useWordState`) provide a simple and ergonomic API for consumer components.

#### Complex Components

I have experience building complex components that manage their own state and logic while remaining composable.

*   **[src/components/story/StoryContainer.tsx](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/components/story/StoryContainer.tsx)**: This component is a great example of a "container" component that encapsulates a major piece of functionality. It manages the state of the story input form, handles the asynchronous translation process, and includes robust error handling.
*   **[src/components/dictionary/DictionaryEntry](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/components/dictionary/DictionaryEntry)**: This is a composite component that I built using the compound component pattern. It's composed of several smaller, single-responsibility components (`Header`, `Definition`, `Source`, etc.) that work together to display a dictionary entry. The main `Root` component uses a React Context to share state implicitly with all its children, which avoids prop drilling and creates a clean, declarative API for rendering the different parts of the dictionary entry.

#### Custom React Hooks

I frequently create custom hooks to extract and reuse component logic, leading to a cleaner and more maintainable codebase.

*   **[src/hooks/useDictionary.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/hooks/useDictionary.ts)**: This hook showcases some more advanced techniques, such as using an `AbortController` to cancel stale network requests, which is crucial for preventing race conditions in a responsive UI.
*   **[src/hooks/useAuth.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/hooks/useAuth.ts)**: This is a foundational hook in the application that encapsulates all authentication logic, providing a simple interface for components to interact with the authentication service.

### Automated Testing

I believe that a strong testing culture is essential for building reliable software. I've written comprehensive automated tests for my components, hooks, and services.

*   **Component Test: [src/components/story/__tests__/StoryContainer.test.tsx](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/components/story/__tests__/StoryContainer.test.tsx)**: This test file demonstrates how I test complex components by simulating user interactions, mocking dependencies, and asserting on the component's output in various states (loading, success, error).
*   **Hook Test: [src/hooks/__tests__/useDictionary.test.tsx](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/hooks/__tests__/useDictionary.test.tsx)**: Here, I've used `@testing-library/react`'s `renderHook` utility to test my custom hook in isolation. This includes testing advanced asynchronous logic and edge cases, such as handling race conditions.
*   **Service Test: [src/api/supabase/database/__tests__/savedTranslationService.test.ts](https://github.com/MaxwellGarceau/storylearnerai/blob/main/src/api/supabase/database/__tests__/savedTranslationService.test.ts)**: This file shows how I unit test the data access layer. I've created detailed mocks of the database client to isolate the service and test its logic, including input validation and error handling, without making actual database calls.
