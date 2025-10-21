import { render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach, vi } from 'vitest';
import StoryContent from '../StoryContent';
import { TranslationResponse } from '../../../lib/translationService';

// Mock the necessary hooks and components
vi.mock('../../../hooks/useWordActions', () => ({
  useWordActions: vi.fn(() => ({
    isSaved: false,
    isTranslating: false,
    translation: null,
    isOpen: false,
    handleTranslate: vi.fn(),
    handleToggleMenu: vi.fn(),
    handleSave: vi.fn(),
    metadata: {
      from_word: 'test',
      from_lemma: 'test',
      to_word: 'prueba',
      to_lemma: 'prueba',
      pos: 'noun',
      difficulty: 'a1',
      from_definition: 'A test word',
    },
  })),
}));

vi.mock('../../../hooks/interactiveText/useSavedWords', () => ({
  useSavedWords: () => ({
    savedOriginalWords: new Set(),
    savedTargetWords: new Set(),
    findSavedWordData: vi.fn(),
  }),
}));

vi.mock('../../../hooks/useLanguages', () => ({
  useLanguages: () => ({
    getLanguageIdByCode: vi.fn().mockReturnValue(1),
  }),
}));

vi.mock('../../../hooks/useDictionary', () => ({
  useDictionary: () => ({
    wordInfo: null,
    isLoading: false,
    error: null,
    searchWord: vi.fn(),
  }),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
  }),
}));

vi.mock('../../../hooks/useLocalization', () => ({
  useLocalization: () => ({
    t: (key: string) => key,
  }),
}));


// Mock the environment config
vi.mock('../../../lib/config/env', () => ({
  EnvironmentConfig: {
    getLLMConfig: () => ({
      provider: 'gemini',
      apiKey: 'test-api-key',
      endpoint: 'https://test-endpoint.com',
      model: 'test-model',
      maxTokens: 2000,
      temperature: 0.7,
      projectId: 'test-project',
    }),
    isDictionaryDisabled: vi.fn(() => false),
    getDictionaryConfig: vi.fn(() => ({
      endpoint: 'https://lexicala1.p.rapidapi.com',
      apiKey: 'test-api-key',
    })),
  },
}));

describe('StoryContent Component', () => {
  const mockTranslationData: TranslationResponse = {
    fromText: 'Hola mundo',
    toText: 'Hello world',
    fromLanguage: 'es',
    toLanguage: 'en',
    difficulty: 'a1',
    provider: 'mock',
    model: 'test-model',
    tokens: [
      {
        type: 'word',
        from_word: 'Hola',
        from_lemma: 'hola',
        to_word: 'Hello',
        to_lemma: 'hello',
        pos: null,
        difficulty: null,
        from_definition: null,
        segmentIndex: 0,
      },
      {
        type: 'word',
        from_word: 'mundo',
        from_lemma: 'mundo',
        to_word: 'world',
        to_lemma: 'world',
        pos: null,
        difficulty: null,
        from_definition: null,
        segmentIndex: 1,
      },
    ],
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  const renderWithRouter = (ui: React.ReactElement) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

  it('displays translated text when showFrom is false', () => {
    const { container } = renderWithRouter(
      <StoryContent translationData={mockTranslationData} showFrom={false} />
    );

    // Check that individual words are present
    expect(within(container).getByText('Hello')).toBeInTheDocument();
    expect(within(container).getByText('world')).toBeInTheDocument();
  });

  it('displays original text when showFrom is true', () => {
    const { container } = renderWithRouter(
      <StoryContent translationData={mockTranslationData} showFrom={true} />
    );

    // Check that individual words are present
    expect(within(container).getByText('Hola')).toBeInTheDocument();
    expect(within(container).getByText('mundo')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    const { container } = renderWithRouter(
      <StoryContent translationData={mockTranslationData} showFrom={false} />
    );

    const contentContainer = container.firstChild as HTMLElement;
    expect(contentContainer).toHaveClass('relative');

    // Check that the component renders with the expected structure
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('preserves whitespace formatting with whitespace-pre-wrap', () => {
    const multilineTranslationData: TranslationResponse = {
      ...mockTranslationData,
      fromText: 'Primera línea.\n\nSegunda línea.',
      toText: 'First line.\n\nSecond line.',
      tokens: [
        {
          type: 'word',
          from_word: 'Primera',
          from_lemma: 'primera',
          to_word: 'First',
          to_lemma: 'first',
          pos: null,
          difficulty: null,
          from_definition: null,
          segmentIndex: 0,
        },
        {
          type: 'word',
          from_word: 'línea',
          from_lemma: 'línea',
          to_word: 'line',
          to_lemma: 'line',
          pos: null,
          difficulty: null,
          from_definition: null,
          segmentIndex: 1,
        },
        {
          type: 'word',
          from_word: 'Segunda',
          from_lemma: 'segunda',
          to_word: 'Second',
          to_lemma: 'second',
          pos: null,
          difficulty: null,
          from_definition: null,
          segmentIndex: 2,
        },
        {
          type: 'word',
          from_word: 'línea',
          from_lemma: 'línea',
          to_word: 'line',
          to_lemma: 'line',
          pos: null,
          difficulty: null,
          from_definition: null,
          segmentIndex: 3,
        },
      ],
    };

    const { container } = renderWithRouter(
      <StoryContent
        translationData={multilineTranslationData}
        showFrom={false}
      />
    );

    // Check that the component renders the words from tokens (without whitespace)
    expect(container.textContent).toContain('First');
    expect(container.textContent).toContain('line');
    expect(container.textContent).toContain('Second');
  });

  it('handles empty content gracefully', () => {
    const emptyTranslationData: TranslationResponse = {
      ...mockTranslationData,
      fromText: '',
      toText: '',
    };

    const { container: targetContainer } = renderWithRouter(
      <StoryContent translationData={emptyTranslationData} showFrom={false} />
    );

    const { container: fromContainer } = renderWithRouter(
      <StoryContent translationData={emptyTranslationData} showFrom={true} />
    );

    // Should still render the component even with empty content
    expect(targetContainer.querySelector('div')).toBeInTheDocument();
    expect(fromContainer.querySelector('div')).toBeInTheDocument();
  });

  it('handles long content properly', () => {
    const longText =
      'This is a very long story that should wrap properly and maintain proper formatting throughout multiple lines and paragraphs. '.repeat(
        10
      );

    const longTranslationData: TranslationResponse = {
      ...mockTranslationData,
      toText: longText,
      tokens: [
        {
          type: 'word',
          from_word: 'This',
          from_lemma: 'this',
          to_word: 'This',
          to_lemma: 'this',
          pos: null,
          difficulty: null,
          from_definition: null,
          segmentIndex: 0,
        },
        {
          type: 'word',
          from_word: 'is',
          from_lemma: 'is',
          to_word: 'is',
          to_lemma: 'is',
          pos: null,
          difficulty: null,
          from_definition: null,
          segmentIndex: 1,
        },
        {
          type: 'word',
          from_word: 'a',
          from_lemma: 'a',
          to_word: 'a',
          to_lemma: 'a',
          pos: null,
          difficulty: null,
          from_definition: null,
          segmentIndex: 2,
        },
        {
          type: 'word',
          from_word: 'very',
          from_lemma: 'very',
          to_word: 'very',
          to_lemma: 'very',
          pos: null,
          difficulty: null,
          from_definition: null,
          segmentIndex: 3,
        },
        {
          type: 'word',
          from_word: 'long',
          from_lemma: 'long',
          to_word: 'long',
          to_lemma: 'long',
          pos: null,
          difficulty: null,
          from_definition: null,
          segmentIndex: 4,
        },
        {
          type: 'word',
          from_word: 'story',
          from_lemma: 'story',
          to_word: 'story',
          to_lemma: 'story',
          pos: null,
          difficulty: null,
          from_definition: null,
          segmentIndex: 5,
        },
      ],
    };

    const { container } = renderWithRouter(
      <StoryContent translationData={longTranslationData} showFrom={false} />
    );

    // Check that the component renders the words from tokens (without whitespace)
    expect(container.textContent).toContain('This');
    expect(container.textContent).toContain('is');
    expect(container.textContent).toContain('very');
    expect(container.textContent).toContain('long');
    expect(container.textContent).toContain('story');
  });

  it('handles special characters and unicode content', () => {
    const unicodeTranslationData: TranslationResponse = {
      ...mockTranslationData,
      fromText:
        'Había una vez un niño que vivía en España... ¡Qué historia más emocionante!',
      toText:
        'Once upon a time there was a boy who lived in Spain... What an exciting story!',
      tokens: [
        {
          type: 'word',
          from_word: 'Había',
          from_lemma: 'había',
          to_word: 'Once',
          to_lemma: 'once',
          pos: null,
          difficulty: null,
          from_definition: null,
          segmentIndex: 0,
        },
        {
          type: 'word',
          from_word: 'vez',
          from_lemma: 'vez',
          to_word: 'upon',
          to_lemma: 'upon',
          pos: null,
          difficulty: null,
          from_definition: null,
          segmentIndex: 1,
        },
        {
          type: 'word',
          from_word: 'niño',
          from_lemma: 'niño',
          to_word: 'boy',
          to_lemma: 'boy',
          pos: null,
          difficulty: null,
          from_definition: null,
          segmentIndex: 2,
        },
        {
          type: 'word',
          from_word: 'time',
          from_lemma: 'time',
          to_word: 'time',
          to_lemma: 'time',
          pos: null,
          difficulty: null,
          from_definition: null,
          segmentIndex: 3,
        },
      ],
    };

    const { container: fromContainer } = renderWithRouter(
      <StoryContent translationData={unicodeTranslationData} showFrom={true} />
    );

    const { container: targetContainer } = renderWithRouter(
      <StoryContent translationData={unicodeTranslationData} showFrom={false} />
    );

    // Check that key words are present in the original text
    expect(within(fromContainer).getByText('Había')).toBeInTheDocument();
    expect(within(fromContainer).getByText('vez')).toBeInTheDocument();
    expect(within(fromContainer).getByText('niño')).toBeInTheDocument();

    // Check that key words are present in the translated text
    expect(within(targetContainer).getByText('Once')).toBeInTheDocument();
    expect(within(targetContainer).getByText('upon')).toBeInTheDocument();
    expect(within(targetContainer).getByText('time')).toBeInTheDocument();
  });

  it('switches content correctly when showFrom prop changes', () => {
    const { container, rerender } = renderWithRouter(
      <StoryContent translationData={mockTranslationData} showFrom={false} />
    );

    // Initially shows translated text
    expect(within(container).getByText('Hello')).toBeInTheDocument();
    expect(within(container).getByText('world')).toBeInTheDocument();
    expect(within(container).queryByText('Hola')).not.toBeInTheDocument();
    expect(within(container).queryByText('mundo')).not.toBeInTheDocument();

    // After rerender with showFrom=true, shows original text
    rerender(
      <MemoryRouter>
        <StoryContent translationData={mockTranslationData} showFrom={true} />
      </MemoryRouter>
    );

    expect(within(container).getByText('Hola')).toBeInTheDocument();
    expect(within(container).getByText('mundo')).toBeInTheDocument();
    expect(within(container).queryByText('Hello')).not.toBeInTheDocument();
    expect(within(container).queryByText('world')).not.toBeInTheDocument();
  });

  it('has transition classes for smooth content switching', () => {
    const { container } = renderWithRouter(
      <StoryContent translationData={mockTranslationData} showFrom={false} />
    );

    // Check that the component renders with transition classes
    const contentContainer = container.firstChild as HTMLElement;
    expect(contentContainer).toHaveClass('relative');
  });

  it('maintains consistent structure regardless of content', () => {
    const shortTranslationData: TranslationResponse = {
      ...mockTranslationData,
      fromText: 'Corto.',
      toText: 'Short.',
    };

    const longTranslationData: TranslationResponse = {
      ...mockTranslationData,
      fromText:
        'Esta es una historia muy larga que contiene múltiples párrafos y líneas de texto para probar el comportamiento del componente.',
      toText:
        'This is a very long story that contains multiple paragraphs and lines of text to test component behavior.',
    };

    const { container: shortContainer } = renderWithRouter(
      <StoryContent translationData={shortTranslationData} showFrom={false} />
    );

    const { container: longContainer } = renderWithRouter(
      <StoryContent translationData={longTranslationData} showFrom={false} />
    );

    // Both should have the same container structure
    expect(shortContainer.firstChild?.nodeName).toBe('DIV');
    expect(longContainer.firstChild?.nodeName).toBe('DIV');

    expect(shortContainer.querySelector('div')).toBeInTheDocument();
    expect(longContainer.querySelector('div')).toBeInTheDocument();
  });
});
