import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import { useAuth } from '../../hooks/useAuth';
import { UserService } from '../../api/supabase/database/userProfileService';
import type { RenderResult } from '@testing-library/react';
import type { DatabaseUserInsert } from '../../types/database';

// Mock react-i18next
vi.mock('react-i18next', () => {
  const translations: Record<string, string> = {
    // Headers
    'auth.userProfile.welcomeBack': 'Welcome back, {{name}}!',
    'dashboard.subtitle': 'Your language learning dashboard',

    // Loading & errors
    'dashboard.loading': 'Loading your dashboard...',
    'dashboard.errors.loadFailed': 'Error loading dashboard data',

    // Header actions
    'dashboard.profile': 'Profile',
    'dashboard.newTranslation': 'New Translation',

    // Stats
    'dashboard.stats.totalTranslations': 'Total Translations',
    'dashboard.stats.storiesTranslated': 'Stories translated',
    'dashboard.stats.languages': 'Languages',
    'dashboard.stats.learningLevel': 'Learning Level',
    'dashboard.stats.beginner': 'Beginner',
    'dashboard.stats.currentDifficulty': 'Your current difficulty',

    // Quick actions
    'dashboard.quickActions.title': 'Quick Actions',
    'dashboard.quickActions.newTranslation.title': 'New Translation',
    'dashboard.quickActions.newTranslation.description':
      'Translate a new story',
    'dashboard.quickActions.viewSaved.title': 'View Saved',
    'dashboard.quickActions.viewSaved.description': 'Browse saved translations',
    'dashboard.quickActions.editProfile.title': 'Edit Profile',
    'dashboard.quickActions.editProfile.description': 'Update your profile',

    // Recent activity
    'dashboard.recentActivity.title': 'Recent Activity',
    'dashboard.recentActivity.noActivity': 'No recent activity',
    'dashboard.recentActivity.noActivityDescription':
      'Start translating stories to see your activity here',
  };

  const stableT = (key: string, options?: Record<string, unknown>) => {
    let translation = translations[key] || key;
    if (
      key === 'auth.userProfile.welcomeBack' &&
      options?.name &&
      typeof options.name === 'string'
    ) {
      translation = translation.replace('{{name}}', options.name);
    }
    return translation;
  };

  return {
    useTranslation: () => ({ t: stableT }),
  };
});

// Mock the useLanguages hook
vi.mock('../../hooks/useLanguages', () => ({
  useLanguages: () => ({
    languages: [
      {
        id: '1',
        code: 'en',
        name: 'English',
        native_name: 'English',
        created_at: '2023-01-01T00:00:00Z',
      },
      {
        id: '2',
        code: 'es',
        name: 'Spanish',
        native_name: 'Español',
        created_at: '2023-01-01T00:00:00Z',
      },
    ],
    loading: false,
    error: null,
    getLanguageName: (code: string) => {
      const languageMap: Record<string, string> = {
        en: 'English',
        es: 'Spanish',
      };
      return languageMap[code] || code;
    },
    languageMap: new Map([
      ['en', 'English'],
      ['es', 'Spanish'],
    ]),
  }),
}));

// Mock the useAuth hook
vi.mock('../../hooks/useAuth');

// Mock the UserService
vi.mock('../../api/supabase/database/userProfileService', () => ({
  UserService: {
    getUser: vi.fn(),
  },
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUserService = vi.mocked(UserService);

// Mock react-router-dom hooks
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement): RenderResult => {
  let result: RenderResult | undefined;
  act(() => {
    result = render(<BrowserRouter>{component}</BrowserRouter>);
  });
  if (!result) {
    throw new Error('Failed to render component');
  }
  return result;
};

describe('DashboardPage Component', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
  } as const;

  const mockProfile = {
    id: 'profile-123',
    user_id: 'user-123',
    display_name: 'Test User',
    username: 'testuser',
    native_language: 'en',
    bio: 'Test bio',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  } as DatabaseUserInsert;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockUseAuth).mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      user: mockUser,
      loading: false,
      error: null,
    } as ReturnType<typeof useAuth>);
    vi.mocked(mockUserService.getUser).mockResolvedValue(mockProfile);
  });

  it('renders quick actions section', async () => {
    void renderWithRouter(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getAllByText('New Translation')).toHaveLength(2);
      expect(screen.getByText('View Saved')).toBeInTheDocument();
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  it('renders stats cards with correct information', async () => {
    void renderWithRouter(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getAllByText('Total Translations')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Languages')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Learning Level')[0]).toBeInTheDocument();
      expect(screen.getAllByText('0')[0]).toBeInTheDocument();
      expect(screen.getAllByText('1')[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Beginner/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays correct language names in stats', async () => {
    const spanishProfile = {
      ...mockProfile,
      native_language: 'es',
    } as DatabaseUserInsert;
    vi.mocked(mockUserService.getUser).mockResolvedValue(spanishProfile);
    void renderWithRouter(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Spanish')).toBeInTheDocument();
    });
  });

  it('shows raw code when an unknown language is mocked (invariant enforced)', async () => {
    const unknownLanguageProfile = {
      ...mockProfile,
      native_language: 'xx',
    } as DatabaseUserInsert;
    vi.mocked(mockUserService.getUser).mockResolvedValue(
      unknownLanguageProfile
    );
    void renderWithRouter(<DashboardPage />);
    await waitFor(() => {
      // With DB NOT NULL + validated codes, unknowns shouldn't occur in prod.
      // If a test mocks an unknown code, we display the raw code.
      expect(screen.getByText('xx')).toBeInTheDocument();
    });
  });

  it('renders recent activity section', async () => {
    void renderWithRouter(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getAllByText('Recent Activity')).toBeTruthy();
      const recentActivitySections = screen.getAllByText('Recent Activity');
      const recentActivitySection = recentActivitySections[0].closest('div');
      const noActivityHeading = recentActivitySection?.querySelector('h3');
      expect(noActivityHeading).toHaveTextContent('No recent activity');
      expect(
        screen.getAllByText(
          'Start translating stories to see your activity here'
        )
      ).toBeTruthy();
    });
  });

  it('calls getUser with correct user ID', async () => {
    void renderWithRouter(<DashboardPage />);
    await waitFor(() => {
      expect(mockUserService.getUser).toHaveBeenCalledWith('user-123');
    });
  });

  it('handles loading state correctly', async () => {
    // Mock a delayed response to test loading state
    vi.mocked(mockUserService.getUser).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockProfile), 100))
    );

    void renderWithRouter(<DashboardPage />);

    // Check that loading state is shown initially
    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();

    // Wait for the loading to finish
    await waitFor(() => {
      expect(
        screen.queryByText('Loading your dashboard...')
      ).not.toBeInTheDocument();
    });
  });

  it('displays error alert when there is an error', async () => {
    vi.mocked(mockUserService.getUser).mockRejectedValue(
      new Error('Database error')
    );
    void renderWithRouter(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Database error')).toBeInTheDocument();
    });
  });

  it('displays welcome message with user name', async () => {
    void renderWithRouter(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getAllByText('Welcome back, Test User!')).toBeTruthy();
      // Check that the dashboard subtitle is present
      expect(
        screen.getAllByText('Your language learning dashboard')
      ).toBeTruthy();
    });
  });
});
