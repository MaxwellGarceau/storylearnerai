import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SavedStoriesSidebar from '../SavedStoriesSidebar';
import { translationService } from '../../../lib/translationService';

// Mock the translation service
vi.mock('../../../lib/translationService', () => ({
  translationService: {
    translate: vi.fn(),
  },
}));

// Mock the saved stories data
vi.mock('../../../data/savedStories.json', () => ({
  default: {
    stories: [
      {
        id: '1',
        title: 'The Three Little Pigs',
        originalText: 'Érase una vez tres cerditos...',
        difficulty: 'a1',
        fromLanguage: 'es',
        toLanguage: 'en',
        description: 'A classic tale about three pigs.',
      },
      {
        id: '2',
        title: 'Little Red Riding Hood',
        originalText: 'Érase una vez una niña...',
        difficulty: 'a2',
        fromLanguage: 'es',
        toLanguage: 'en',
        description: 'The story of a little girl.',
      },
    ],
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SavedStoriesSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sidebar with close button in header', () => {
    renderWithRouter(<SavedStoriesSidebar />);
    
    expect(screen.getByLabelText('Close saved stories')).toBeInTheDocument();
    expect(screen.getByText('Saved Stories')).toBeInTheDocument();
    expect(screen.getByText('Click on a story to read it')).toBeInTheDocument();
  });

  it('displays all saved stories', () => {
    renderWithRouter(<SavedStoriesSidebar />);
    
    const storyTitles = screen.getAllByText('The Three Little Pigs');
    const storyTitles2 = screen.getAllByText('Little Red Riding Hood');
    const descriptions = screen.getAllByText('A classic tale about three pigs.');
    const descriptions2 = screen.getAllByText('The story of a little girl.');
    
    expect(storyTitles[0]).toBeInTheDocument();
    expect(storyTitles2[0]).toBeInTheDocument();
    expect(descriptions[0]).toBeInTheDocument();
    expect(descriptions2[0]).toBeInTheDocument();
  });

  it('shows difficulty badges for each story', () => {
    renderWithRouter(<SavedStoriesSidebar />);
    
    const a1Badges = screen.getAllByText('A1');
    const a2Badges = screen.getAllByText('A2');
    
    expect(a1Badges[0]).toBeInTheDocument();
    expect(a2Badges[0]).toBeInTheDocument();
  });

  it('toggles sidebar visibility when close button is clicked', () => {
    renderWithRouter(<SavedStoriesSidebar />);
    
    const closeButton = screen.getByLabelText('Close saved stories');
    
    // Initially visible
    const savedStoriesHeaders = screen.getAllByText('Saved Stories');
    expect(savedStoriesHeaders[0]).toBeInTheDocument();
    
    // Click to hide
    fireEvent.click(closeButton);
    const showButtons = screen.getAllByLabelText('Show saved stories');
    expect(showButtons[0]).toBeInTheDocument();
    
    // Click to show again
    fireEvent.click(showButtons[0]);
    const closeButtons = screen.getAllByLabelText('Close saved stories');
    expect(closeButtons[0]).toBeInTheDocument();
  });

  it('handles story click and navigates to story page', async () => {
    const mockTranslationResponse = {
      originalText: 'Érase una vez tres cerditos...',
      translatedText: 'Once upon a time there were three little pigs...',
      difficulty: 'a1',
      toLanguage: 'en',
    };

    (translationService.translate as jest.MockedFunction<typeof translationService.translate>).mockResolvedValue(mockTranslationResponse);

    renderWithRouter(<SavedStoriesSidebar />);
    
    const storyCards = screen.getAllByText('The Three Little Pigs');
    const storyCard = storyCards[0].closest('.cursor-pointer');
    expect(storyCard).toBeInTheDocument();
    
    fireEvent.click(storyCard!);
    
    await waitFor(() => {
      expect(translationService.translate).toHaveBeenCalledWith({
        text: 'Érase una vez tres cerditos...',
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/story', {
        state: {
          translationData: mockTranslationResponse,
          isSavedStory: true,
        },
      });
    });
  });

  it('shows loading state when story is being processed', async () => {
    (translationService.translate as jest.MockedFunction<typeof translationService.translate>).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithRouter(<SavedStoriesSidebar />);
    
    const storyCards = screen.getAllByText('The Three Little Pigs');
    const storyCard = storyCards[0].closest('.cursor-pointer');
    fireEvent.click(storyCard!);
    
    await waitFor(() => {
      expect(screen.getByText('Loading story...')).toBeInTheDocument();
    });
  });

  it('handles translation errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (translationService.translate as jest.MockedFunction<typeof translationService.translate>).mockRejectedValue(new Error('Translation failed'));

    renderWithRouter(<SavedStoriesSidebar />);
    
    const storyCards = screen.getAllByText('The Three Little Pigs');
    const storyCard = storyCards[0].closest('.cursor-pointer');
    fireEvent.click(storyCard!);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load story:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('displays footer with demo information', () => {
    renderWithRouter(<SavedStoriesSidebar />);
    
    const footerTexts = screen.getAllByText('Demo stories • Spanish to English');
    expect(footerTexts[0]).toBeInTheDocument();
  });

  it('applies correct difficulty colors', () => {
    renderWithRouter(<SavedStoriesSidebar />);
    
    const a1Badges = screen.getAllByText('A1');
    const a2Badges = screen.getAllByText('A2');
    
    // Check that the badges have the custom difficulty color classes
    expect(a1Badges[0]).toHaveClass('bg-green-100');
    expect(a1Badges[0]).toHaveClass('text-green-800');
    expect(a2Badges[0]).toHaveClass('bg-blue-100');
    expect(a2Badges[0]).toHaveClass('text-blue-800');
  });
}); 