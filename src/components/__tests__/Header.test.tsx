import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Header from '../Header';

// Mock i18n
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

// Mock LanguageSelector (shadcn/radix UI composition not needed here)
vi.mock('../ui/LanguageSelector', () => ({
  LanguageSelector: ({ variant }: { variant: string }) => (
    <button data-testid={`language-selector-${variant}`}>Lang</button>
  ),
}));

// Mock auth hook
type AuthLikeUser = { id: string; email?: string };
const mockSignOut = vi.fn();
const mockUseAuth = vi.fn(() => ({
  user: null as AuthLikeUser | null,
  signOut: mockSignOut,
}));
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({ user: null, signOut: mockSignOut });
  });

  it('renders app name and public navigation', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText('header.appName')).toBeInTheDocument();
    expect(screen.getAllByText('navigation.home')[0]).toBeInTheDocument();
    expect(screen.getAllByText('navigation.translate')[0]).toBeInTheDocument();

    // Auth buttons when logged out
    expect(screen.getAllByTestId('sign-in-link')[0]).toBeInTheDocument();
    expect(screen.getAllByTestId('sign-up-link')[0]).toBeInTheDocument();

    // Language selector present (desktop and/or mobile)
    expect(screen.getAllByTestId(/language-selector-/).length).toBeGreaterThan(
      0
    );
  });

  it('highlights active route in desktop navigation', () => {
    render(
      <MemoryRouter initialEntries={['/translate']}>
        <Header />
      </MemoryRouter>
    );

    const translateLink = screen.getAllByText('navigation.translate')[0];
    const homeLink = screen.getAllByText('navigation.home')[0];

    const translateClasses = translateLink.className.split(/\s+/);
    const homeClasses = homeLink.className.split(/\s+/);

    // Active link has exact bg-accent class
    expect(translateClasses).toContain('bg-accent');
    // Inactive link should not have the exact bg-accent class
    expect(homeClasses).not.toContain('bg-accent');
    // But it can include the hover variant
    expect(homeLink.className).toMatch(/hover:bg-accent\/50/);
  });

  it('shows authenticated links and user menu; allows sign out', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'test@example.com' } as AuthLikeUser,
      signOut: mockSignOut,
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // Desktop nav shows dashboard and saved translations
    expect(screen.getAllByText('navigation.dashboard')[0]).toBeInTheDocument();
    expect(screen.getAllByText('navigation.saved')[0]).toBeInTheDocument();

    // Open user menu
    const userMenuButton = screen
      .getAllByRole('button')
      .find(
        btn =>
          btn.className.includes('rounded-md') &&
          btn.textContent?.includes('test')
      );
    if (!userMenuButton) throw new Error('User menu button not found');
    fireEvent.click(userMenuButton);

    // Menu items
    expect(screen.getByText('navigation.profile')).toBeInTheDocument();
    expect(screen.getByText('story.savedTranslations')).toBeInTheDocument();
    expect(screen.getAllByText('navigation.dashboard')[0]).toBeInTheDocument();

    // Sign out via menu
    const signOutBtn = screen
      .getAllByText('navigation.signOut')
      .at(-1) as HTMLElement;
    fireEvent.click(signOutBtn);
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('toggles mobile menu and shows appropriate items', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const toggle = screen.getByLabelText('header.toggleMobileMenu');
    fireEvent.click(toggle);

    // Mobile links visible
    expect(screen.getAllByText('navigation.home')[0]).toBeInTheDocument();
    expect(screen.getAllByText('navigation.translate')[0]).toBeInTheDocument();

    // Auth buttons visible on mobile when logged out
    expect(screen.getAllByTestId('sign-in-link')[0]).toBeInTheDocument();
    expect(screen.getAllByTestId('sign-up-link')[0]).toBeInTheDocument();
  });
});
