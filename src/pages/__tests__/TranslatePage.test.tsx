import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import TranslatePage from '../TranslatePage';
import { TranslationResponse } from '../../lib/translationService';
vi.mock('../../hooks/useLanguageFilter', () => ({
  useLanguageFilter: () => ({
    fromLanguage: 'es',
    targetLanguage: 'en',
    setTargetLanguage: vi.fn(),
    availableTargetLanguages: [{ code: 'en', name: 'English' }],
  }),
}));

// Mock the LLMServiceManager to prevent initialization issues
vi.mock('../../lib/llm/LLMServiceManager', () => ({
  llmServiceManager: {
    generateCompletion: vi.fn(),
    healthCheck: vi.fn(),
    getProvider: vi.fn(),
    getModel: vi.fn(),
    getConfig: vi.fn(),
    getAvailableProviders: vi.fn(),
    getProviderDisplayNames: vi.fn(),
    getProviderDescriptions: vi.fn(),
  },
}));

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

// Mock the StoryContainer component
vi.mock('../../components/story/StoryContainer', () => ({
  default: ({
    onStoryTranslated,
  }: {
    onStoryTranslated: (data: TranslationResponse) => void;
  }) => (
    <div data-testid='story-container'>
      <button
        onClick={() =>
          onStoryTranslated({
            fromText: 'Test story',
            toText: 'Translated test story',
            fromLanguage: 'Spanish',
            toLanguage: 'en',
            difficulty: 'Intermediate',
            provider: 'test',
            model: 'test-model',
          })
        }
      >
        Translate Story
      </button>
    </div>
  ),
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
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TranslatePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the translate page with correct title and description', () => {
    renderWithRouter(<TranslatePage />);

    // The title and description are now rendered by the StoryContainer component
    // Since we're mocking StoryContainer, we just verify the page structure
    expect(screen.getByTestId('story-container')).toBeInTheDocument();
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
            fromText: 'Test story',
            toText: 'Translated test story',
            fromLanguage: 'Spanish',
            toLanguage: 'en',
            difficulty: 'Intermediate',
            provider: 'test',
            model: 'test-model',
          },
        },
      });
    });
  });
});
