import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import StorySidebar from '../StorySidebar';
import {
  setupSidebarMocks,
  resetSidebarMocks,
  mockSavedTranslation,
  mockSampleStories,
  mockUser,
  mockTranslationData,
  mockNavigate,
  mockUseViewport,
  mockUseLanguages,
  mockUseSavedTranslations,
  mockUseAuth,
  mockTranslationService,
} from './sidebarMocks';

// Setup mocks before tests
setupSidebarMocks();

describe('StorySidebar Component', () => {
  const defaultProps = {
    translationData: mockTranslationData,
  };

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  const rerenderWithRouter = (rerender: (component: React.ReactElement) => void, component: React.ReactElement) => {
    return rerender(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    resetSidebarMocks();

    // Setup default hook mocks
    mockUseViewport.mockReturnValue({
      isMobile: false,
    });

    mockUseLanguages.mockReturnValue({
      getLanguageName: vi.fn((code) => code === 'en' ? 'English' : 'Spanish'),
      getLanguageIdByCode: vi.fn((code) => code === 'en' ? 1 : 2),
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

    const sidebar = screen.getByText('storySidebar.storyLibrary').closest('.fixed');
    expect(sidebar).toHaveClass('fixed', 'top-16', 'left-0', 'z-40');
    expect(sidebar).toHaveClass('w-80', 'max-w-[calc(100vw-16px)]');
    expect(sidebar).toHaveClass('bg-background', 'border-r', 'shadow-lg');
  });



  it('closes sidebar when close button is clicked', () => {
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: 'storySidebar.closeLibrary' });
    fireEvent.click(closeButton);

    // The sidebar should be hidden (toggle button should appear)
    expect(screen.getByRole('button', { name: 'storySidebar.openLibrary' })).toBeInTheDocument();
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

    const vocabularyButton = screen.getByRole('button', { name: 'storySidebar.vocabulary' });
    fireEvent.click(vocabularyButton);

    // Vocabulary section should be active
    expect(vocabularyButton).toHaveClass('bg-primary');
  });

  it('switches to info section when info button is clicked', () => {
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    const infoButton = screen.getByRole('button', { name: 'storySidebar.info' });
    fireEvent.click(infoButton);

    // Info section should be active
    expect(infoButton).toHaveClass('bg-primary');
  });

  it('displays info section content when active', () => {
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    const infoButton = screen.getByRole('button', { name: 'storySidebar.info' });
    fireEvent.click(infoButton);

    expect(screen.getByText('storySidebar.storyOptions')).toBeInTheDocument();
    expect(screen.getByText('English → Spanish')).toBeInTheDocument();
  });

  it('displays sample stories', () => {
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    expect(screen.getByText('The Three Little Pigs')).toBeInTheDocument();
    expect(screen.getByText('Little Red Riding Hood')).toBeInTheDocument();
  });


  it('shows vocabulary section when vocabulary button is clicked', () => {
    localStorage.setItem('sidebarOpen', 'true');

    renderWithRouter(<StorySidebar {...defaultProps} />);

    const vocabButton = screen.getByRole('button', { name: 'storySidebar.vocabulary' });
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

    const closeButton = screen.getByRole('button', { name: 'storySidebar.closeLibrary' });
    fireEvent.click(closeButton);

    // The sidebar should be hidden (toggle button should appear)
    expect(screen.getByRole('button', { name: 'storySidebar.openLibrary' })).toBeInTheDocument();
  });
});
