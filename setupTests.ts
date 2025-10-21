import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { server } from './src/__tests__/mocks/supabaseMock';
import 'vitest';
import React from 'react';

// Mock the EnvironmentConfig to avoid environment variable issues
vi.mock('./src/lib/config/env', () => ({
  EnvironmentConfig: {
    getLLMConfig: () => ({
      provider: 'gemini',
      apiKey: 'test-api-key',
      endpoint: 'https://test-endpoint.com',
      model: 'test-model',
      maxTokens: 2000,
      temperature: 0.7,
      projectId: 'test-project',
    }),
    getDictionaryConfig: () => ({
      endpoint: 'https://test-dictionary-endpoint.com',
      apiKey: 'test-dictionary-api-key',
    }),
    isDevelopment: () => false,
    isProduction: () => false,
    isMockTranslationEnabled: () => true,
    isDictionaryDisabled: () => false,
  },
}));

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock VocabularyContext globally
vi.mock('./src/contexts/VocabularyContext', () => ({
  useVocabularyContext: () => ({
    vocabulary: [],
    loading: false,
    error: null,
    saveVocabularyWord: vi.fn().mockResolvedValue({ id: 1 }),
    updateVocabularyWord: vi.fn(),
    deleteVocabularyWord: vi.fn(),
    checkVocabularyExists: vi.fn().mockResolvedValue(false),
  }),
}));

// Mock StoryContext globally
vi.mock('./src/contexts/StoryContext', () => ({
  useStoryContext: () => ({
    fromLanguage: 'es',
    targetLanguage: 'en',
    getWordTranslation: vi.fn(),
         getWordState: vi.fn().mockReturnValue({
           isOpen: false,
           isSaved: false,
           isTranslating: false,
           metadata: {
             from_word: 'Hello',
             from_lemma: 'hello',
             to_word: 'Hola',
             to_lemma: 'hola',
             pos: 'interjection',
             difficulty: 'a1',
             from_definition: 'A greeting',
           },
         }),
    isWordSaved: vi.fn().mockReturnValue(false),
    isWordTranslating: vi.fn().mockReturnValue(false),
    translateWord: vi.fn(),
    saveWord: vi.fn(),
    toggleWordMenu: vi.fn(),
    translationData: {
      fromLanguage: 'es',
      toLanguage: 'en',
      includedVocabulary: [],
    },
    isDisplayingFromSide: (global as any).__mockStoryContext?.isDisplayingFromSide ?? false,
  }),
  StoryProvider: ({ children, isDisplayingFromSide }: { children: React.ReactNode; isDisplayingFromSide?: boolean }) => {
    // Store the isDisplayingFromSide value for the useStoryContext mock to use
    (global as any).__mockStoryContext = {
      isDisplayingFromSide: isDisplayingFromSide ?? false,
    };
    
    // Use a simple div wrapper that provides the context
    return React.createElement('div', { 'data-testid': 'story-provider' }, children);
  },
}));

// Mock useWordActions hook globally
vi.mock('./src/hooks/useWordActions', () => ({
  useWordActions: () => ({
    wordState: {
      isOpen: true,
      isSaved: false,
      isTranslating: false,
      translation: null,
      metadata: {
        from_word: 'test',
        from_lemma: 'test',
        to_word: 'prueba',
        to_lemma: 'prueba',
        pos: 'noun',
        difficulty: 'a1',
        from_definition: 'A test word',
      },
    },
    isTranslating: false,
    handleTranslate: vi.fn(),
    handleToggleMenu: vi.fn(),
    handleSave: vi.fn(),
  }),
}));

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Ensure React Testing Library cleans up between tests to avoid DOM leakage
afterEach(() => cleanup());

// Clean up after the tests are finished.
afterAll(() => server.close());
