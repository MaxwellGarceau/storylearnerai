import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { vi } from 'vitest';
import { UserProfile } from '../UserProfile';
import {
  setupSupabaseMocks,
  mockUseAuth,
} from '../../../__tests__/mocks/supabaseMock';
import type { User } from '@supabase/supabase-js';
import type { LanguageCode } from '../../../types/llm/prompts';

// Mock react-i18next
vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({
      i18n: {
        language: 'en',
        changeLanguage: vi.fn(),
        isLanguageLoadedToLocale: vi.fn().mockReturnValue(true),
      },
      t: vi.fn((key: string) => key),
    }),
  };
});

// Mock the useLanguages hook
vi.mock('../../../hooks/useLanguages', () => ({
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
      const languageMap: Record<LanguageCode, string> = {
        en: 'English',
        es: 'Spanish',
      };
      return languageMap[code as LanguageCode] || code;
    },
    languageMap: new Map([
      ['en', 'English'],
      ['es', 'Spanish'],
    ]),
  }),
}));

// Setup Supabase mocks
setupSupabaseMocks();

// Mock UserService
vi.mock('../../../api/supabase/database/userProfileService', () => ({
  UserService: {
    getOrCreateUser: vi.fn(),
    updateUser: vi.fn(),
    isUsernameAvailable: vi.fn(),
  },
}));

// Import the mocked UserService
import { UserService } from '../../../api/supabase/database/userProfileService';

describe('UserProfile Component', () => {
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: '2023-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
  };

  const mockProfile = {
    id: 'test-user-id',
    username: 'testuser',
    display_name: 'Test User',
    preferred_language: 'en' as LanguageCode,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();

    // Setup default mocks
    mockUseAuth.mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      user: mockUser,
      loading: false,
      error: null,
    });

    vi.mocked(UserService.getOrCreateUser).mockResolvedValue(mockProfile);
    vi.mocked(UserService.updateUser).mockResolvedValue(mockProfile);
    vi.mocked(UserService.isUsernameAvailable).mockResolvedValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders user profile in read-only mode initially', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByText('languages.en')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', {
        name: /auth\.userProfile\.editProfile/i,
      })[0]
    ).toBeInTheDocument();
  });

  it('switches to edit mode when edit button is clicked', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', {
        name: /auth\.userProfile\.saveChanges/i,
      })[0]
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /auth\.userProfile\.cancel/i })[0]
    ).toBeInTheDocument();
  });

  it('handles form input changes in edit mode', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Switch to edit mode
    const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
    fireEvent.click(editButton);

    const usernameInput = screen.getByDisplayValue('testuser');
    const displayNameInput = screen.getByDisplayValue('Test User');
    const languageSelect = screen.getByRole('combobox');

    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    fireEvent.change(displayNameInput, { target: { value: 'New User Name' } });
    fireEvent.change(languageSelect, { target: { value: 'es' } });

    expect(usernameInput).toHaveValue('newusername');
    expect(displayNameInput).toHaveValue('New User Name');
    expect(languageSelect).toHaveValue('es');
  });

  it('saves profile changes when save button is clicked', async () => {
    const updatedProfile = {
      ...mockProfile,
      username: 'newusername',
      display_name: 'New User Name',
      preferred_language: 'es' as LanguageCode, // Make sure the mock returns the updated language
    };
    vi.mocked(UserService.updateUser).mockResolvedValue(updatedProfile);

    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Switch to edit mode
    const editButton = screen.getAllByRole('button', {
      name: /auth\.userProfile\.editProfile/i,
    })[0];
    fireEvent.click(editButton);

    const usernameInput = screen.getByDisplayValue('testuser');
    const displayNameInput = screen.getByDisplayValue('Test User');
    const languageSelect = screen.getByRole('combobox');
    const saveButton = screen.getAllByRole('button', {
      name: /auth\.userProfile\.saveChanges/i,
    })[0];

    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    fireEvent.change(displayNameInput, { target: { value: 'New User Name' } });
    fireEvent.change(languageSelect, { target: { value: 'es' } });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(UserService.updateUser).toHaveBeenCalledWith('test-user-id', {
        username: 'newusername',
        display_name: 'New User Name',
        preferred_language: 'es' as LanguageCode,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('New User Name')).toBeInTheDocument();
      expect(screen.getByText('@newusername')).toBeInTheDocument();
      expect(screen.getByText('languages.es')).toBeInTheDocument();
    });
  });

  it('cancels editing when cancel button is clicked', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Switch to edit mode
    const editButton = screen.getAllByRole('button', {
      name: /auth\.userProfile\.editProfile/i,
    })[0];
    fireEvent.click(editButton);

    const usernameInput = screen.getByDisplayValue('testuser');
    const displayNameInput = screen.getByDisplayValue('Test User');
    const cancelButton = screen.getAllByRole('button', {
      name: /auth\.userProfile\.cancel/i,
    })[0];

    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    fireEvent.change(displayNameInput, { target: { value: 'New User Name' } });

    fireEvent.click(cancelButton);

    // Should be back to read-only view with original values
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('shows loading state while saving', async () => {
    vi.mocked(UserService.updateUser).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Switch to edit mode
    const editButton = screen.getAllByRole('button', {
      name: /auth\.userProfile\.editProfile/i,
    })[0];
    fireEvent.click(editButton);

    const saveButton = screen.getAllByRole('button', {
      name: /auth\.userProfile\.saveChanges/i,
    })[0];
    fireEvent.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(screen.getByText(/auth\.userProfile\.saving/i)).toBeInTheDocument();
  });

  it('handles save errors', async () => {
    const errorMessage = 'Username already taken';
    vi.mocked(UserService.updateUser).mockRejectedValue(
      new Error(errorMessage)
    );

    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Switch to edit mode
    const editButton = screen.getAllByRole('button', {
      name: /auth\.userProfile\.editProfile/i,
    })[0];
    fireEvent.click(editButton);

    const usernameInput = screen.getByDisplayValue('testuser');
    const saveButton = screen.getAllByRole('button', {
      name: /auth\.userProfile\.saveChanges/i,
    })[0];

    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
