import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import StoryReaderPage from '../StoryReaderPage';
import { TranslationResponse } from '../../lib/translationService';
import { TooltipProvider } from '../../components/ui/Tooltip';

// Mock the Walkthrough component
vi.mock('../../components/walkthrough/Walkthrough', () => ({
  Walkthrough: () => null,
}));

// Mock the WalkthroughDebug component
vi.mock('../../components/walkthrough/WalkthroughDebug', () => ({
  WalkthroughDebug: () => null,
}));

// Mock the useWalkthrough hook
vi.mock('../../hooks/useWalkthrough', () => ({
  useWalkthrough: () => ({
    startWalkthroughById: vi.fn(),
    resetWalkthrough: vi.fn(),
  }),
}));

// Mock the StoryRender component
vi.mock('../../components/story/StoryRender', () => ({
  default: ({ translationData }: { translationData: TranslationResponse }) => (
    <div data-testid="story-render">
      <div>Original: {translationData.originalText}</div>
      <div>Translated: {translationData.translatedText}</div>
    </div>
  )
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockLocation: {
  pathname: string;
  search: string;
  hash: string;
  state: { translationData?: TranslationResponse } | null;
} = {
  pathname: '/story',
  search: '',
  hash: '',
  state: null,
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <TooltipProvider>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </TooltipProvider>
  );
};

describe('StoryReaderPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    // Reset mock location state
    mockLocation.state = null;
  });

  it('shows no story message when no translation data is available', () => {
    renderWithRouter(<StoryReaderPage />);
    
    expect(screen.getByText('No Story Found')).toBeInTheDocument();
    expect(screen.getByText('Please translate a story first to view it here.')).toBeInTheDocument();
    expect(screen.getByText('Translate a Story')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
  });

  it('navigates to /translate when Translate a Story button is clicked', () => {
    renderWithRouter(<StoryReaderPage />);
    
    const translateButtons = screen.getAllByText('Translate a Story');
    const translateButton = translateButtons[0];
    fireEvent.click(translateButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/translate');
  });

  it('navigates to / when Home button is clicked', () => {
    renderWithRouter(<StoryReaderPage />);
    
    const homeButtons = screen.getAllByRole('button', { name: 'Home' });
    const homeButton = homeButtons[0];
    fireEvent.click(homeButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders story content when translation data is available', () => {
    const mockTranslationData: TranslationResponse = {
      originalText: 'Test story in Spanish',
      translatedText: 'Test story in English',
      fromLanguage: 'Spanish',
      toLanguage: 'en',
      difficulty: 'Intermediate',
      provider: 'test',
      model: 'test-model'
    };

    mockLocation.state = { translationData: mockTranslationData };
    
    renderWithRouter(<StoryReaderPage />);
    
    expect(screen.getByText('Your Translated Story')).toBeInTheDocument();
    expect(screen.getByText('Enjoy reading your story in English!')).toBeInTheDocument();
    expect(screen.getByTestId('story-render')).toBeInTheDocument();
  });

  it('shows navigation buttons when story is displayed', () => {
    const mockTranslationData: TranslationResponse = {
      originalText: 'Test story in Spanish',
      translatedText: 'Test story in English',
      fromLanguage: 'Spanish',
      toLanguage: 'en',
      difficulty: 'Intermediate',
      provider: 'test',
      model: 'test-model'
    };

    mockLocation.state = { translationData: mockTranslationData };
    
    renderWithRouter(<StoryReaderPage />);
    
    const translateAnotherButtons = screen.getAllByText('Translate Another Story');
    expect(translateAnotherButtons[0]).toBeInTheDocument();
    
    const homeButtons = screen.getAllByRole('button', { name: 'Home' });
    expect(homeButtons[0]).toBeInTheDocument();
  });

  it('navigates to /translate when Translate Another Story button is clicked', () => {
    const mockTranslationData: TranslationResponse = {
      originalText: 'Test story in Spanish',
      translatedText: 'Test story in English',
      fromLanguage: 'Spanish',
      toLanguage: 'en',
      difficulty: 'Intermediate',
      provider: 'test',
      model: 'test-model'
    };

    mockLocation.state = { translationData: mockTranslationData };
    
    renderWithRouter(<StoryReaderPage />);
    
    const translateAnotherButtons = screen.getAllByText('Translate Another Story');
    const translateAnotherButton = translateAnotherButtons[0];
    fireEvent.click(translateAnotherButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/translate');
  });
}); 