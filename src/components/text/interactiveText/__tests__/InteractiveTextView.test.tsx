import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import InteractiveTextView from '../InteractiveTextView';
import { StoryProvider } from '../../../../contexts/StoryContext';
import type { TranslationToken } from '../../../../types/llm/tokens';
import type { TranslationResponse } from '../../../../lib/translationService';

// Mock WordToken to observe props and interactions
vi.mock('../WordToken', () => ({
  __esModule: true,
  default: ({
    word,
    position,
    punctuation,
    disabled,
    enableTooltips,
  }: {
    word: string;
    position: number;
    punctuation: string;
    disabled: boolean;
    enableTooltips: boolean;
  }) => (
    <span data-testid={`word-token-${word}`} data-position={position}>
      <span data-testid={`word-${word}`}>{word}</span>
      <span data-testid={`punctuation-${word}`}>{punctuation}</span>
      <span data-testid={`disabled-${word}`}>{String(disabled)}</span>
      <span data-testid={`tooltips-${word}`}>{String(enableTooltips)}</span>
    </span>
  ),
}));

describe('InteractiveTextView', () => {
  afterEach(() => {
    cleanup();
  });

  const mockTranslationData: TranslationResponse = {
    fromLanguage: 'en',
    toLanguage: 'es',
    fromText: 'Hello, world!',
    toText: 'Hola, mundo!',
    tokens: [
      {
        type: 'word',
        to_word: 'Hola',
        to_lemma: 'hola',
        from_word: 'Hello',
        from_lemma: 'hello',
        pos: 'interjection',
        difficulty: 'a1',
        from_definition: 'A greeting',
      },
      { type: 'punctuation', value: ',' },
      { type: 'whitespace', value: ' ' },
      {
        type: 'word',
        to_word: 'mundo',
        to_lemma: 'mundo',
        from_word: 'world',
        from_lemma: 'world',
        pos: 'noun',
        difficulty: 'a2',
        from_definition: 'The earth',
      },
      { type: 'punctuation', value: '!' },
    ],
  };

  const baseProps = {
    className: 'test-class',
    enableTooltips: true,
    disabled: false,
  };

  const tokens: TranslationToken[] = mockTranslationData.tokens;

  const renderWithProvider = (
    props: {
      word: string;
      position: number;
      punctuation: string;
      disabled: boolean;
      enableTooltips: boolean;
    },
    isDisplayingFromSide = true
  ) => {
    return render(
      <StoryProvider
        translationData={mockTranslationData}
        isDisplayingFromSide={isDisplayingFromSide}
      >
        <InteractiveTextView {...props} />
      </StoryProvider>
    );
  };

  it('renders non-word tokens directly and word tokens via WordToken', () => {
    renderWithProvider({ ...baseProps, tokens });

    // With isDisplayingFromSide: true, we expect English words
    expect(screen.getByTestId('word-token-Hello')).toBeInTheDocument();
    expect(screen.getByTestId('word-token-world')).toBeInTheDocument();
    // Check that punctuation and whitespace are rendered directly
    expect(screen.getByText(',')).toBeInTheDocument();
    expect(screen.getByText('!')).toBeInTheDocument();
    // Check for whitespace by looking for the span containing it
    const whitespaceSpan = screen.getByText((content, element) => {
      return element?.textContent === ' ';
    });
    expect(whitespaceSpan).toBeInTheDocument();
  });

  it('displays correct words based on isDisplayingFromSide', () => {
    // Test showing from words (original story) - default behavior with isDisplayingFromSide: true
    render(
      <StoryProvider
        translationData={mockTranslationData}
        isDisplayingFromSide={true}
      >
        <InteractiveTextView {...baseProps} tokens={tokens} />
      </StoryProvider>
    );

    expect(screen.getByTestId('word-Hello')).toBeInTheDocument();
    expect(screen.getByTestId('word-world')).toBeInTheDocument();
  });

  it('passes correct props to WordToken', () => {
    renderWithProvider({ ...baseProps, tokens });

    expect(screen.getByTestId('word-Hello')).toBeInTheDocument();
    expect(screen.getByTestId('disabled-Hello')).toHaveTextContent('false');
    expect(screen.getByTestId('tooltips-Hello')).toHaveTextContent('true');
  });

  it('renders empty span when tokens is empty', () => {
    const { container } = renderWithProvider({ ...baseProps, tokens: [] });
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});
