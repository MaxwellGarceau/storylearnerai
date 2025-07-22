import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import TranslatePage from '../TranslatePage';
import { TranslationResponse } from '../../lib/translationService';

// Mock the StoryContainer component
vi.mock('../../components/story/StoryContainer', () => ({
  default: ({ onStoryTranslated }: { onStoryTranslated: (data: TranslationResponse) => void }) => (
    <div data-testid="story-container">
      <button onClick={() => onStoryTranslated({
        originalText: 'Test story',
        translatedText: 'Translated test story',
        fromLanguage: 'Spanish',
        toLanguage: 'English',
        difficulty: 'Intermediate',
        provider: 'test',
        model: 'test-model'
      })}>
        Translate Story
      </button>
    </div>
  )
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('TranslatePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the translate page with correct title and description', () => {
    renderWithRouter(<TranslatePage />);
    
    expect(screen.getByText('Translate Your Story')).toBeInTheDocument();
    expect(screen.getByText(/Enter a story in any language and we'll translate it to English/)).toBeInTheDocument();
  });

  it('renders the StoryContainer component', () => {
    renderWithRouter(<TranslatePage />);
    
    expect(screen.getAllByTestId('story-container')[0]).toBeInTheDocument();
  });

  it('navigates to /story with translation data when story is translated', async () => {
    renderWithRouter(<TranslatePage />);
    
    const translateButton = screen.getAllByText('Translate Story')[0];
    fireEvent.click(translateButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/story', {
        state: {
          translationData: {
            originalText: 'Test story',
            translatedText: 'Translated test story',
            fromLanguage: 'Spanish',
            toLanguage: 'English',
            difficulty: 'Intermediate',
            provider: 'test',
            model: 'test-model'
          }
        }
      });
    });
  });
}); 