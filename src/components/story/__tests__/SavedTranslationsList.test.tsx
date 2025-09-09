import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SavedTranslationsList from '../SavedTranslationsList';
import type { DatabaseSavedTranslationWithDetails } from '../../../types/database/translation';

// Mock i18n
const mockT = (key: string, params?: Record<string, string | number>) => {
  const map: Record<string, string> = {
    'story.loadingTranslation': 'Loading translation...',
    'savedTranslations.filters.title': 'Filters',
    'savedTranslations.filters.description': 'Filter your saved translations',
    'savedTranslations.filters.targetLanguage': 'Target Language',
    'savedTranslations.filters.allLanguages': 'All languages',
    'savedTranslations.filters.difficultyLevel': 'Difficulty Level',
    'savedTranslations.filters.allLevels': 'All levels',
    'savedTranslations.filters.search': 'Search',
    'savedTranslations.filters.searchPlaceholder':
      'Search by title or notes...',
    'savedTranslations.filters.applyFilters': 'Apply Filters',
    'savedTranslations.results.count': `${params?.count ?? 0} results`,
    'savedTranslations.results.untitled': 'Untitled',
    'savedTranslations.results.viewStory': 'View Story',
    'savedTranslations.results.delete': 'Delete',
    'savedTranslations.content.notes': 'Notes',
    'savedTranslations.content.originalStory': 'Original Story',
    'savedTranslations.content.translatedStory': 'Translated Story',
    'savedTranslations.emptyState.title': 'No saved translations yet',
    'savedTranslations.emptyState.description':
      'Your saved translations will appear here.',
    'savedTranslations.deleteConfirm':
      'Are you sure you want to delete this translation?',
    'difficultyLevels.a1.description': 'Beginner level',
    'difficultyLevels.a2.description': 'Elementary level',
    'difficultyLevels.b1.description': 'Intermediate level',
    'difficultyLevels.b2.description': 'Upper intermediate level',
  };
  return map[key] ?? key;
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock router navigation
const navigateMock = vi.fn();
vi.mock(
  'react-router-dom',
  async (actual: () => Promise<Record<string, unknown>>) => {
    const mod = await actual();
    return {
      ...mod,
      useNavigate: () => navigateMock,
    };
  }
);

// Mock logger
const infoMock = vi.fn();
const errorMock = vi.fn();
vi.mock('../../../lib/logger', () => ({
  logger: {
    info: (...args: unknown[]) => {
      infoMock(...args);
      return undefined;
    },
    error: (...args: unknown[]) => {
      errorMock(...args);
      return undefined;
    },
  },
}));

// Utilities
const makeSaved = (
  overrides: Partial<DatabaseSavedTranslationWithDetails> = {}
): DatabaseSavedTranslationWithDetails => ({
  id: overrides.id ?? 1,
  user_id: 'user-1',
  from_story: overrides.from_story ?? 'Hola mundo',
  target_story: overrides.target_story ?? 'Hello world',
  from_language_id: 1,
  target_language_id: 2,
  difficulty_level_id: 1,
  title: overrides.title ?? 'Sample Title',
  notes: overrides.notes ?? 'Some helpful notes',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  from_language: {
    id: 1,
    code: 'es',
    name: 'Spanish',
    native_name: 'Español',
    created_at: '2023-01-01T00:00:00.000Z',
  },
  target_language: {
    id: 2,
    code: 'en',
    name: 'English',
    native_name: 'English',
    created_at: '2023-01-01T00:00:00.000Z',
  },
  difficulty_level: {
    id: 1,
    code: 'a1',
    name: 'A1 (Beginner)',
    description: 'Beginner level',
    created_at: '2023-01-01T00:00:00.000Z',
  },
});

// Default mocks for hooks
const useSavedTranslationsMock = {
  savedTranslations: [] as DatabaseSavedTranslationWithDetails[],
  loading: false,
  error: null as string | null,
};

const useLanguagesMock = {
  languages: [
    {
      id: 1,
      code: 'es',
      name: 'Spanish',
      native_name: 'Español',
      created_at: '2023-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      code: 'en',
      name: 'English',
      native_name: 'English',
      created_at: '2023-01-01T00:00:00.000Z',
    },
  ],
  loading: false,
};

vi.mock('../../../hooks/useSavedTranslations', () => ({
  useSavedTranslations: () => useSavedTranslationsMock,
}));

vi.mock('../../../hooks/useLanguages', () => ({
  useLanguages: () => useLanguagesMock,
}));

vi.mock('../../../hooks/useDifficultyLevels', () => ({
  useDifficultyLevels: () => ({
    getDifficultyLevelDisplay: (code: string) => {
      const m: Record<string, string> = {
        a1: 'A1 (Beginner)',
        a2: 'A2 (Elementary)',
        b1: 'B1 (Intermediate)',
        b2: 'B2 (Upper Intermediate)',
      };
      return m[code] ?? code;
    },
  }),
}));

describe('SavedTranslationsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSavedTranslationsMock.savedTranslations = [];
    useSavedTranslationsMock.loading = false;
    useSavedTranslationsMock.error = null;
    useLanguagesMock.loading = false;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('shows loading state when fetching', () => {
    useSavedTranslationsMock.loading = true;
    render(<SavedTranslationsList />);

    expect(screen.getByText('Loading translation...')).toBeInTheDocument();
  });

  it('renders empty state when there are no saved translations', () => {
    render(<SavedTranslationsList />);

    expect(screen.getByText('No saved translations yet')).toBeInTheDocument();
    expect(
      screen.getByText('Your saved translations will appear here.')
    ).toBeInTheDocument();
  });

  it('renders list items and allows navigating to a story by clicking card', async () => {
    const item = makeSaved();
    useSavedTranslationsMock.savedTranslations = [item];

    render(<SavedTranslationsList />);

    // Results count
    expect(screen.getByText('1 results')).toBeInTheDocument();

    // Title and languages
    expect(screen.getByText('Sample Title')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();

    // Difficulty badge (appears both in select option and as a badge). Ensure at least one badge exists.
    expect(screen.getAllByText('A1 (Beginner)').length).toBeGreaterThan(0);

    // Click the card to navigate
    fireEvent.click(screen.getByText('Sample Title'));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/story?id=1', {
        state: expect.objectContaining({
          translationData: expect.objectContaining({
            originalText: 'Hola mundo',
            translatedText: 'Hello world',
            fromLanguage: 'es',
            toLanguage: 'en',
            difficulty: 'a1',
          } as Record<string, unknown>),
          isSavedStory: true,
          savedTranslationId: 1,
        } as Record<string, unknown>),
      } as Record<string, unknown>);
    });
  });

  it('uses fallback title when title is null and supports View Story button', async () => {
    const item = makeSaved({ id: 2 });
    // Ensure title is explicitly null to trigger fallback
    item.title = null;
    useSavedTranslationsMock.savedTranslations = [item];

    render(<SavedTranslationsList />);

    expect(screen.getByText('Untitled')).toBeInTheDocument();

    const viewButton = screen.getByRole('button', { name: 'View Story' });
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/story?id=2', expect.anything());
    });
  });

  it('applies filters and logs info', () => {
    useSavedTranslationsMock.savedTranslations = [makeSaved()];
    render(<SavedTranslationsList />);

    // Change language filter
    const selects = screen.getAllByRole('combobox');
    // Language select is first
    fireEvent.change(selects[0], { target: { value: 'en' } });

    // Change difficulty filter
    // Difficulty select is second
    fireEvent.change(selects[1], { target: { value: 'a1' } });

    // Enter search term
    const searchInput = screen.getByPlaceholderText(
      'Search by title or notes...'
    );
    fireEvent.change(searchInput, { target: { value: 'sample' } });

    // Apply
    fireEvent.click(screen.getByText('Apply Filters'));

    expect(infoMock).toHaveBeenCalled();
  });

  it('prompts for delete and logs when confirmed', () => {
    useSavedTranslationsMock.savedTranslations = [makeSaved({ id: 3 })];
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<SavedTranslationsList />);

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(infoMock).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
