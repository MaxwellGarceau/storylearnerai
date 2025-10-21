import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WordToken from '../interactiveText/WordToken';
import type { LanguageCode } from '../../../types/llm/prompts';
import { MemoryRouter } from 'react-router-dom';
import * as useAuthModule from '../../../hooks/useAuth';
import { LanguageFilterProvider } from '../../../hooks/useLanguageFilter';

// Tests in this file were added by the assistant.

// Mock language id lookup used by WordMenu → VocabularySaveButton
vi.mock('../../../hooks/useLanguages', () => ({
  __esModule: true,
  useLanguages: () => ({
    getLanguageIdByCode: (code: string) =>
      code === 'en' ? 1 : code === 'es' ? 2 : 0,
    getLanguageName: (code: string) =>
      code === 'en' ? 'English' : code === 'es' ? 'Spanish' : code,
    languages: [
      { id: 1, code: 'en', name: 'English', native_name: 'English' },
      { id: 2, code: 'es', name: 'Spanish', native_name: 'Español' },
    ],
  }),
}));

// Mock UserService to prevent database calls
vi.mock('../../../api/supabase/database/userProfileService', () => ({
  UserService: {
    getOrCreateUser: vi.fn().mockResolvedValue({
      id: 'test-user-id',
      native_language: 'en',
    }),
  },
}));

// Mock useAuth to provide a user
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    isAuthenticated: true,
  }),
}));

// Mock StoryContext to provide the necessary context
let isDisplayingFromSide = true;

vi.mock('../../../contexts/StoryContext', () => ({
  useStoryContext: () => ({
    fromLanguage: 'en' as LanguageCode,
    targetLanguage: 'es' as LanguageCode,
    translationData: {
      fromLanguage: 'en' as LanguageCode,
      toLanguage: 'es' as LanguageCode,
      includedVocabulary: [],
    },
    isDisplayingFromSide,
  }),
}));

// Mock useWordActions hook
vi.mock('../../../hooks/useWordActions', () => ({
  useWordActions: () => ({
    isSaved: false,
    isTranslating: false,
    translation: null,
    isOpen: true,
    handleToggleMenu: vi.fn(),
    handleTranslate: vi.fn(),
    handleSave: vi.fn(),
    metadata: {
      from_word: 'hello',
      from_lemma: 'hello',
      to_word: 'hola',
      to_lemma: 'hola',
      pos: 'interjection',
      difficulty: 'a1',
      from_definition: 'A greeting',
    },
  }),
}));

// Mock useSavedWords hook
vi.mock('../../../hooks/interactiveText/useSavedWords', () => ({
  useSavedWords: () => ({
    savedOriginalWords: new Set<string>(),
    savedTargetWords: new Set<string>(),
    loading: false,
  }),
}));

// Ensure user is logged in so VocabularySaveButton renders
beforeEach(() => {
  vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
    user: { id: 'test-user' },
  } as unknown as ReturnType<typeof useAuthModule.useAuth>);
});

// Mock VocabularySaveButton to expose what WordMenu passes into it
vi.mock('../../vocabulary/buttons/VocabularySaveButton', () => ({
  __esModule: true,
  VocabularySaveButton: (props: {
    fromWord: string;
    targetWord: string;
    fromContext?: string;
    targetContext?: string;
    fromLanguageId: number;
    targetLanguageId: number;
  }) => {
    const {
      fromWord,
      targetWord,
      fromContext,
      targetContext,
      fromLanguageId,
      targetLanguageId,
    } = props;
    return (
      <div
        data-testid='mock-save-button'
        data-from-word={fromWord}
        data-target-word={targetWord}
        data-from-context={fromContext ?? ''}
        data-target-context={targetContext ?? ''}
        data-from-lang-id={fromLanguageId}
        data-target-lang-id={targetLanguageId}
      />
    );
  },
}));

describe('Canonical save mapping (from → target) passed to save button', () => {
  it('from-side (displaying from-language): passes fromWord=display, targetWord=overlay', () => {
    isDisplayingFromSide = true;

    // Displayed token is from-language (en): "hello"
    render(
      <MemoryRouter>
        <LanguageFilterProvider>
          <WordToken
            word='hello'
            position={0}
            punctuation=''
            enableTooltips={true}
            disabled={false}
          />
        </LanguageFilterProvider>
      </MemoryRouter>
    );

    const save = screen.getByTestId('mock-save-button');
    expect(save).toHaveAttribute('data-from-word', 'hello');
    expect(save).toHaveAttribute('data-target-word', 'hola');
  });

  it('target-side (displaying target-language): passes fromWord=overlay, targetWord=display', () => {
    isDisplayingFromSide = false;

    // Displayed token is target-language (es): "hola"
    render(
      <MemoryRouter>
        <LanguageFilterProvider>
          <WordToken
            word='hola'
            position={0}
            punctuation=''
            enableTooltips={true}
            disabled={false}
          />
        </LanguageFilterProvider>
      </MemoryRouter>
    );

    const save = screen.getByTestId('mock-save-button');
    expect(save).toHaveAttribute('data-from-word', 'hello');
    expect(save).toHaveAttribute('data-target-word', 'hola');
  });
});
