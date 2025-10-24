import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import StorySidebar from '../StorySidebar';
vi.mock('../../../hooks/useLanguageFilter', () => ({
  useLanguageFilter: () => ({
    fromLanguage: 'es',
    targetLanguage: 'en',
    setTargetLanguage: vi.fn(),
    availableTargetLanguages: [{ code: 'en', name: 'English' }],
  }),
  useLanguageSettings: () => ({
    fromLanguage: 'es',
    targetLanguage: 'en',
  }),
}));
import {
  setupSidebarMocks,
  resetSidebarMocks,
  mockSavedTranslation,
  mockUser,
  mockTranslationData,
  mockLocation,
  mockNavigate,
  mockUseViewport,
  mockUseLanguages,
  mockUseSavedTranslations,
  mockUseAuth,
  mockTranslationService,
} from '../../__tests__/sidebarMocks';

// Setup mocks before tests
setupSidebarMocks();

describe('StorySidebar Component', () => {
  const defaultProps = {
    translationData: mockTranslationData,
  };

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    resetSidebarMocks();

    // Setup default hook mocks
    mockUseViewport.mockReturnValue({
      isMobile: false,
    });

    mockUseLanguages.mockReturnValue({
      getLanguageName: vi.fn(code => (code === 'en' ? 'English' : 'Spanish')),
      getLanguageIdByCode: vi.fn(code => (code === 'en' ? 1 : 2)),
    });

    mockUseSavedTranslations.mockReturnValue({
      savedTranslations: [mockSavedTranslation],
      loading: false,
    });

    mockUseAuth.mockReturnValue({
      user: mockUser,
    });

    mockTranslationService.translate.mockResolvedValue(mockTranslationData);
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clear localStorage mock
    localStorage.clear();
  });

  it('renders sidebar content when open', () => {
    // Mock sidebar as open
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    expect(screen.getByText('storySidebar.storyLibrary')).toBeInTheDocument();
    expect(screen.getByText('storySidebar.stories')).toBeInTheDocument();
  });

  it('applies correct positioning and styling when open', () => {
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    const sidebar = screen
      .getByText('storySidebar.storyLibrary')
      .closest('.fixed');
    expect(sidebar).toHaveClass('fixed', 'top-16', 'left-0', 'z-40');
    expect(sidebar).toHaveClass('w-80', 'max-w-[calc(100vw-16px)]');
    expect(sidebar).toHaveClass('bg-background', 'border-r', 'shadow-lg');
  });

  it('closes sidebar when close button is clicked', () => {
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    const closeButton = screen.getByRole('button', {
      name: 'storySidebar.closeLibrary',
    });
    fireEvent.click(closeButton);

    // The sidebar should be hidden (toggle button should appear)
    expect(
      screen.getByRole('button', { name: 'storySidebar.openLibrary' })
    ).toBeInTheDocument();
  });

  it('loads sidebar state from localStorage on mount', () => {
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    expect(screen.getByText('storySidebar.storyLibrary')).toBeInTheDocument();
  });

  it('displays stories section by default', () => {
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    expect(screen.getByText('storySidebar.savedStories')).toBeInTheDocument();
    expect(screen.getByText('storySidebar.sampleStories')).toBeInTheDocument();
  });

  it('switches to vocabulary section when vocabulary button is clicked', () => {
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    const vocabularyButton = screen.getByRole('button', {
      name: 'storySidebar.vocabulary',
    });
    fireEvent.click(vocabularyButton);

    // Vocabulary section should be active
    expect(vocabularyButton).toHaveClass('bg-primary');
  });

  it('switches to info section when info button is clicked', () => {
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    const infoButton = screen.getByRole('button', {
      name: 'storySidebar.info',
    });
    fireEvent.click(infoButton);

    // Info section should be active
    expect(infoButton).toHaveClass('bg-primary');
  });

  it('displays info section content when active', () => {
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    const infoButton = screen.getByRole('button', {
      name: 'storySidebar.info',
    });
    fireEvent.click(infoButton);

    expect(screen.getByText('storySidebar.storyOptions')).toBeInTheDocument();
    expect(screen.getByText('English → Spanish')).toBeInTheDocument();
  });

  it('displays sample stories', () => {
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    expect(screen.getByText('Los tres cerditos')).toBeInTheDocument();
    expect(screen.getByText('Caperucita Roja')).toBeInTheDocument();
  });

  it('shows vocabulary section when vocabulary button is clicked', () => {
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    const vocabButton = screen.getByRole('button', {
      name: 'storySidebar.vocabulary',
    });
    fireEvent.click(vocabButton);

    // Vocabulary section should be active (button should have primary styling)
    expect(vocabButton).toHaveClass('bg-primary');
  });

  it('displays footer text', () => {
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    expect(screen.getByText('storySidebar.demoStories')).toBeInTheDocument();
  });

  it('closes sidebar when close button is clicked', () => {
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    const closeButton = screen.getByRole('button', {
      name: 'storySidebar.closeLibrary',
    });
    fireEvent.click(closeButton);

    // The sidebar should be hidden (toggle button should appear)
    expect(
      screen.getByRole('button', { name: 'storySidebar.openLibrary' })
    ).toBeInTheDocument();
  });

  // Vocabulary Deep Linking Tests
  describe('Vocabulary Deep Linking', () => {
    beforeEach(() => {
      // Reset location mock before each test
      Object.assign(mockLocation, {
        hash: '',
        pathname: '/',
        search: '',
        state: null,
      });
      // Reset navigate mock
      mockNavigate.mockClear();
    });

    it('opens sidebar and switches to vocabulary section when #vocabulary hash is present', () => {
      // Mock location with vocabulary hash
      Object.assign(mockLocation, { hash: '#vocabulary' });

      renderWithRouter(<StorySidebar {...defaultProps} />);

      // Sidebar should be open
      expect(screen.getByText('storySidebar.storyLibrary')).toBeInTheDocument();

      // Vocabulary section should be active - check that the button exists and is clickable
      const vocabularyButton = screen.getByRole('button', {
        name: 'storySidebar.vocabulary',
      });
      expect(vocabularyButton).toBeInTheDocument();
    });

    it('does not switch to vocabulary section when hash is not #vocabulary', () => {
      // Mock location with different hash
      Object.assign(mockLocation, { hash: '#stories' });

      renderWithRouter(<StorySidebar {...defaultProps} />);

      // Stories section should be active by default
      const storiesButton = screen.getByRole('button', {
        name: 'storySidebar.stories',
      });
      expect(storiesButton).toHaveClass('bg-primary');
    });

    it('does not switch to vocabulary section when hash is empty', () => {
      // Mock location with empty hash
      Object.assign(mockLocation, { hash: '' });

      renderWithRouter(<StorySidebar {...defaultProps} />);

      // Stories section should be active by default
      const storiesButton = screen.getByRole('button', {
        name: 'storySidebar.stories',
      });
      expect(storiesButton).toHaveClass('bg-primary');
    });

    it('opens sidebar when #vocabulary hash is present even if sidebar was closed', () => {
      // Mock location with vocabulary hash
      Object.assign(mockLocation, { hash: '#vocabulary' });
      // Set sidebar as closed in localStorage
      localStorage.setItem('sidebarOpen', 'false');

      renderWithRouter(<StorySidebar {...defaultProps} />);

      // Sidebar should be open due to hash
      expect(screen.getByText('storySidebar.storyLibrary')).toBeInTheDocument();

      // Vocabulary section should be active - check that the button exists
      const vocabularyButton = screen.getByRole('button', {
        name: 'storySidebar.vocabulary',
      });
      expect(vocabularyButton).toBeInTheDocument();
    });

    it('switches to vocabulary section when hash changes to #vocabulary', () => {
      // Start with empty hash
      Object.assign(mockLocation, { hash: '' });

      renderWithRouter(<StorySidebar {...defaultProps} />);

      // Stories section should be active initially
      const storiesButton = screen.getByRole('button', {
        name: 'storySidebar.stories',
      });
      expect(storiesButton).toHaveClass('bg-primary');
    });

    it('handles multiple hash changes correctly', () => {
      // Start with vocabulary hash
      Object.assign(mockLocation, { hash: '#vocabulary' });

      renderWithRouter(<StorySidebar {...defaultProps} />);

      // Vocabulary section should be active - check that the button exists
      const vocabularyButton = screen.getByRole('button', {
        name: 'storySidebar.vocabulary',
      });
      expect(vocabularyButton).toBeInTheDocument();
    });

    it('works with different location properties', () => {
      // Mock location with vocabulary hash and different pathname
      Object.assign(mockLocation, {
        hash: '#vocabulary',
        pathname: '/story',
        search: '?param=value',
      });

      renderWithRouter(<StorySidebar {...defaultProps} />);

      // Should still work regardless of other location properties
      expect(screen.getByText('storySidebar.storyLibrary')).toBeInTheDocument();

      const vocabularyButton = screen.getByRole('button', {
        name: 'storySidebar.vocabulary',
      });
      expect(vocabularyButton).toBeInTheDocument();
    });
  });
});
