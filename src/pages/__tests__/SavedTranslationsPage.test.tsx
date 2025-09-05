import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
import SavedTranslationsPage from '../SavedTranslationsPage';

// Indicate authorship of these tests
// Tests in this file were added by the AI assistant.

// Mock i18n keys used in the page and list component
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      const map: Record<string, string> = {
        'savedTranslations.title': 'Saved Translations',
        'savedTranslations.subtitle': 'Your previously saved translations',
        'savedTranslations.filters.title': 'Filters',
        'savedTranslations.filters.description': 'Narrow down your results',
        'savedTranslations.results.count': `0`,
      };
      if (
        key === 'savedTranslations.results.count' &&
        opts &&
        typeof opts.count === 'number'
      ) {
        return String(opts.count);
      }
      return map[key] || key;
    },
  }),
}));

// Mock hooks consumed by SavedTranslationsList to keep this page test focused
vi.mock('../../hooks/useLanguages', () => ({
  useLanguages: () => ({
    languages: [],
    loading: false,
    error: null,
    getLanguageName: (code: string) => code,
    languageMap: new Map(),
  }),
}));

vi.mock('../../hooks/useDifficultyLevels', () => ({
  useDifficultyLevels: () => ({
    getDifficultyLevelDisplay: (code: string) => code.toUpperCase(),
  }),
}));

vi.mock('../../hooks/useSavedTranslations', () => ({
  useSavedTranslations: () => ({
    savedTranslations: [],
    loading: false,
    error: null,
    loadTranslations: vi.fn(),
    refreshTranslations: vi.fn(),
    createSavedTranslation: vi.fn(),
  }),
}));

// Mock UI components used implicitly by list (minimal to avoid rendering complexity)
vi.mock('../../components/ui/Alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertIcon: { destructive: () => null },
}));

vi.mock('../../lib/utils/dateUtils', () => ({
  DateUtils: { formatDate: () => 'Jan 1, 2024' },
}));

// Mock Card and Button used inside list to keep markup simple
vi.mock('../../components/ui/Card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3>{children}</h3>
  ),
}));

vi.mock('../../components/ui/Badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

vi.mock('../../components/ui/Button', () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

// Mock useAuth with variants per test
vi.mock('../../hooks/useAuth');
import { useAuth } from '../../hooks/useAuth';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SavedTranslationsPage', () => {
  const mockedUseAuth = vi.mocked(useAuth);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when user is not authenticated', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderWithRouter(<SavedTranslationsPage />);

    // Page returns null -> no title present
    expect(screen.queryByText('Saved Translations')).toBeNull();
  });

  it('renders title and subtitle when user is authenticated', () => {
    const mockUser = {
      id: 'user-1',
      email: 'user@example.com',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {},
    };

    mockedUseAuth.mockReturnValue({
      user: mockUser as User,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderWithRouter(<SavedTranslationsPage />);

    expect(screen.getByText('Saved Translations')).toBeInTheDocument();
    expect(
      screen.getByText('Your previously saved translations')
    ).toBeInTheDocument();
  });
});
