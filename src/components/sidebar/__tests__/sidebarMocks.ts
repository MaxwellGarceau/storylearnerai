import React from 'react';
import { vi } from 'vitest';
import type { TFunction } from 'i18next';
import type { User } from '@supabase/supabase-js';
import type { DatabaseSavedTranslationWithDetails } from '../../../types/database/translation';
import type { TranslationResponse } from '../../../lib/translationService';
import type { DifficultyLevel, LanguageCode } from '../../../types/llm/prompts';

// Mock react-i18next
export const mockT: TFunction = vi.fn((key: string, options?: any) => {
  if (typeof options === 'object' && options !== null) {
    return `${key}_with_options`;
  }
  return key;
}) as unknown as TFunction;

// Mock react-router-dom
export const mockNavigate = vi.fn();
export const mockLocation = { hash: '', pathname: '/', search: '', state: null };

// Mock hooks
export const mockUseViewport = vi.fn();
export const mockUseLanguages = vi.fn();
export const mockUseSavedTranslations = vi.fn();
export const mockUseAuth = vi.fn();
export const mockUseTranslation = vi.fn();

// Mock React Router components
const mockLink = ({ to, children, className, ...props }: any) => {
  return React.createElement('a', { href: to, className, ...props }, children);
};
mockLink.displayName = 'Link';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock translation service
export const mockTranslationService = {
  translate: vi.fn(),
};

// Sample data for tests
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: { display_name: 'Test User' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  role: 'authenticated',
  confirmation_sent_at: undefined,
  recovery_sent_at: undefined,
  email_change_sent_at: undefined,
  new_email: undefined,
  invited_at: undefined,
  action_link: undefined,
  email_confirmed_at: '2024-01-01T00:00:00Z',
  phone_confirmed_at: undefined,
  confirmed_at: '2024-01-01T00:00:00Z',
  last_sign_in_at: '2024-01-01T00:00:00Z',
  phone: undefined,
  identities: [],
} as User;

export const mockTranslationData: TranslationResponse = {
  originalText: 'Hello world',
  translatedText: 'Hola mundo',
  difficulty: 'a1' as DifficultyLevel,
  fromLanguage: 'en' as LanguageCode,
  toLanguage: 'es' as LanguageCode,
  selectedVocabulary: ['hello', 'world', 'good', 'morning'],
  includedVocabulary: ['hello', 'world'],
  missingVocabulary: ['good', 'morning'],
};

export const mockTranslationDataNoVocabulary: TranslationResponse = {
  originalText: 'Hello world',
  translatedText: 'Hola mundo',
  difficulty: 'a1' as DifficultyLevel,
  fromLanguage: 'en' as LanguageCode,
  toLanguage: 'es' as LanguageCode,
  selectedVocabulary: [],
  includedVocabulary: [],
  missingVocabulary: [],
};

export const mockTranslationDataAllIncluded: TranslationResponse = {
  originalText: 'Hello world',
  translatedText: 'Hola mundo',
  difficulty: 'a1' as DifficultyLevel,
  fromLanguage: 'en' as LanguageCode,
  toLanguage: 'es' as LanguageCode,
  selectedVocabulary: ['hello', 'world'],
  includedVocabulary: ['hello', 'world'],
  missingVocabulary: [],
};

export const mockSavedTranslation: DatabaseSavedTranslationWithDetails = {
  id: 1,
  user_id: 'test-user-id',
  original_story: 'This is the original story text',
  translated_story: 'Este es el texto de la historia original',
  original_language_id: 1,
  translated_language_id: 2,
  difficulty_level_id: 1,
  title: 'Test Story',
  notes: 'Sample story notes',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  original_language: {
    id: 1,
    code: 'en' as LanguageCode,
    name: 'English' as const,
    native_name: 'English' as const,
    created_at: '2024-01-01T00:00:00Z',
  },
  translated_language: {
    id: 2,
    code: 'es' as LanguageCode,
    name: 'Spanish' as const,
    native_name: 'Español' as const,
    created_at: '2024-01-01T00:00:00Z',
  },
  difficulty_level: {
    id: 1,
    code: 'a1' as DifficultyLevel,
    name: 'A1 (Beginner)' as const,
    description:
      'Basic level - Can understand and use familiar everyday expressions and very basic phrases',
    created_at: '2024-01-01T00:00:00Z',
  },
};

export const mockSampleStories: DatabaseSavedTranslationWithDetails[] = [
  {
    id: 1,
    user_id: 'sample-user-id',
    original_story: 'Érase una vez tres cerditos...',
    translated_story: '',
    original_language_id: 1,
    translated_language_id: 2,
    difficulty_level_id: 1,
    title: 'The Three Little Pigs',
    notes:
      'A classic tale about three pigs who build different houses and learn the value of hard work.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    original_language: {
      id: 1,
      code: 'es' as LanguageCode,
      name: 'Spanish' as const,
      native_name: 'Español' as const,
      created_at: '2020-01-01T00:00:00Z',
    },
    translated_language: {
      id: 2,
      code: 'en' as LanguageCode,
      name: 'English' as const,
      native_name: 'English' as const,
      created_at: '2020-01-01T00:00:00Z',
    },
    difficulty_level: {
      id: 1,
      code: 'a1' as DifficultyLevel,
      name: 'A1 (Beginner)' as const,
      description: 'Beginner level',
      created_at: '2020-01-01T00:00:00Z',
    },
  },
  {
    id: 2,
    user_id: 'sample-user-id',
    original_story: 'Érase una vez una niña...',
    translated_story: '',
    original_language_id: 1,
    translated_language_id: 2,
    difficulty_level_id: 2,
    title: 'Little Red Riding Hood',
    notes:
      'The story of a little girl who visits her grandmother and encounters a cunning wolf.',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    original_language: {
      id: 1,
      code: 'es' as LanguageCode,
      name: 'Spanish' as const,
      native_name: 'Español' as const,
      created_at: '2020-01-01T00:00:00Z',
    },
    translated_language: {
      id: 2,
      code: 'en' as LanguageCode,
      name: 'English' as const,
      native_name: 'English' as const,
      created_at: '2020-01-01T00:00:00Z',
    },
    difficulty_level: {
      id: 2,
      code: 'a2' as DifficultyLevel,
      name: 'A2 (Elementary)' as const,
      description: 'Elementary level',
      created_at: '2020-01-01T00:00:00Z',
    },
  },
];

// Setup function for common mocks
export const setupSidebarMocks = () => {
  // Mock react-i18next
  mockUseTranslation.mockReturnValue({
    t: mockT,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  });

  // Mock react-router-dom
  vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    Link: mockLink,
    BrowserRouter: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', null, children),
    Routes: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', null, children),
    Route: ({ element }: { element: React.ReactNode }) => element,
  }));

  // Mock hooks
  vi.mock('../../../hooks/useViewport', () => ({
    useViewport: mockUseViewport,
  }));

  vi.mock('../../../hooks/useLanguages', () => ({
    useLanguages: mockUseLanguages,
  }));

  vi.mock('../../../hooks/useSavedTranslations', () => ({
    useSavedTranslations: mockUseSavedTranslations,
  }));

  vi.mock('../../../hooks/useAuth', () => ({
    useAuth: mockUseAuth,
  }));

  vi.mock('react-i18next', () => ({
    useTranslation: mockUseTranslation,
  }));

  // Mock translation service
  vi.mock('../../../lib/translationService', () => ({
    translationService: mockTranslationService,
  }));

  // Mock saved stories data
  vi.mock('../../../data/savedStories.json', () => ({
    default: { stories: mockSampleStories },
  }));
};

// Helper to reset all mocks
export const resetSidebarMocks = () => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
};
