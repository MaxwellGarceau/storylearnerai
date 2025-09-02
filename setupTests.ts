import '@testing-library/jest-dom';
import { server } from './src/__tests__/mocks/supabaseMock';
import 'vitest';

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

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());
