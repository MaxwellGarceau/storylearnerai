import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import InteractiveTextView from '../InteractiveTextView';
import type { TranslationToken } from '../../../../types/llm/tokens';

interface WordTokenProps {
  actionWordNormalized: string;
  inclusionCheckWord: string;
  cleanWord: string;
  punctuation: string;
  isOpen: boolean;
  isSaved: boolean;
  isTranslating: boolean;
  overlayOppositeWord?: string;
  displaySentenceContext: string;
  overlaySentenceContext?: string;
  onOpenChange: (open: boolean) => void;
  onWordClick: () => void;
  onTranslate: () => void;
  enableTooltips: boolean;
  disabled: boolean;
}

// Mock WordToken to observe props and interactions
vi.mock('../WordToken', () => ({
  __esModule: true,
  default: ({
    actionWordNormalized,
    inclusionCheckWord: _inclusionCheckWord,
    cleanWord,
    punctuation,
    isOpen,
    isSaved,
    isTranslating,
    overlayOppositeWord,
    displaySentenceContext,
    overlaySentenceContext,
    onOpenChange,
    onWordClick,
    onTranslate,
    enableTooltips,
    disabled,
  }: WordTokenProps) => (
    <span data-testid={`word-token-${actionWordNormalized}`} data-open={isOpen}>
      <button
        data-testid={`click-${actionWordNormalized}`}
        onClick={() => onWordClick?.()}
        disabled={disabled}
      >
        {cleanWord}
      </button>
      <button
        data-testid={`translate-${actionWordNormalized}`}
        onClick={() => onTranslate?.()}
        disabled={disabled}
      >
        translate
      </button>
      <span data-testid={`punctuation-${actionWordNormalized}`}>
        {punctuation}
      </span>
      <span data-testid={`saved-${actionWordNormalized}`}>
        {String(isSaved)}
      </span>
      <span data-testid={`translating-${actionWordNormalized}`}>
        {String(isTranslating)}
      </span>
      <span data-testid={`overlay-${actionWordNormalized}`}>
        {overlayOppositeWord ?? ''}
      </span>
      <span data-testid={`orig-${actionWordNormalized}`}>
        {displaySentenceContext}
      </span>
      <span data-testid={`trans-${actionWordNormalized}`}>
        {overlaySentenceContext ?? ''}
      </span>
      <span data-testid={`tooltips-${actionWordNormalized}`}>
        {String(enableTooltips)}
      </span>
      <button
        data-testid={`open-${actionWordNormalized}`}
        onClick={() => onOpenChange?.(!isOpen)}
      >
        toggle-open
      </button>
    </span>
  ),
}));

describe('InteractiveTextView', () => {
  afterEach(() => {
    cleanup();
  });

  const baseProps = {
    className: 'test-class',
    enableTooltips: true,
    disabled: false,
    fromLanguage: 'en' as const,
    targetLanguage: 'es' as const,
    getDisplaySentence: (segmentIndex: number) =>
      segmentIndex === 0 ? 'Hello world.' : 'Goodbye world.',
    getOverlaySentence: (sentence: string) =>
      sentence === 'Hello world.' ? 'Hola mundo.' : undefined,
    isSaved: (w: string) => w === 'hello',
    getOverlayOppositeWord: (w: string) =>
      w === 'world' ? 'mundo' : undefined,
    isTranslating: (w: string) => w === 'helloing',
    onTranslate: vi.fn(),
  };

  const tokens: TranslationToken[] = [
    {
      type: 'word',
      to_word: 'Hello',
      to_lemma: 'hello',
      from_word: 'Hola',
      from_lemma: 'hola',
      pos: 'interjection',
      difficulty: 'a1',
      from_definition: 'A greeting',
    },
    { type: 'punctuation', value: ',' },
    { type: 'whitespace', value: ' ' },
    {
      type: 'word',
      to_word: 'world',
      to_lemma: 'world',
      from_word: 'mundo',
      from_lemma: 'mundo',
      pos: 'noun',
      difficulty: 'a2',
      from_definition: 'The earth',
    },
    { type: 'punctuation', value: '!' },
  ];

  it('renders non-word tokens directly and word tokens via WordToken', () => {
    render(<InteractiveTextView {...baseProps} tokens={tokens} />);

    expect(screen.getByTestId('word-token-hello')).toBeInTheDocument();
    // Second word token acquires overlay (mundo), so action id is mundo
    expect(screen.getByTestId('word-token-mundo')).toBeInTheDocument();
    // whitespace and punctuation should render directly
    // Note: punctuation is now separate, not embedded in word token
    expect(screen.getByTestId('punctuation-hello')).toHaveTextContent('');
    expect(screen.getByTestId('punctuation-mundo')).toHaveTextContent('');
  });

  it('passes saved, translation overlay, and sentences correctly', () => {
    render(<InteractiveTextView {...baseProps} tokens={tokens} />);

    expect(screen.getByTestId('saved-hello')).toHaveTextContent('true');
    expect(screen.getByTestId('overlay-mundo')).toHaveTextContent('mundo');
    expect(screen.getByTestId('orig-hello')).toHaveTextContent('Hello world.');
    expect(screen.getByTestId('trans-hello')).toHaveTextContent('Hola mundo.');
  });

  it('opens and closes token menu by index', () => {
    render(<InteractiveTextView {...baseProps} tokens={tokens} />);

    // Initially closed
    expect(screen.getByTestId('word-token-hello')).toHaveAttribute(
      'data-open',
      'false'
    );

    fireEvent.click(screen.getByTestId('click-hello'));
    expect(screen.getByTestId('word-token-hello')).toHaveAttribute(
      'data-open',
      'true'
    );

    // Toggle closes
    fireEvent.click(screen.getByTestId('click-hello'));
    expect(screen.getByTestId('word-token-hello')).toHaveAttribute(
      'data-open',
      'false'
    );

    // Open second token should close first when switching
    fireEvent.click(screen.getByTestId('click-hello'));
    fireEvent.click(screen.getByTestId('click-mundo'));
    expect(screen.getByTestId('word-token-hello')).toHaveAttribute(
      'data-open',
      'false'
    );
    expect(screen.getByTestId('word-token-mundo')).toHaveAttribute(
      'data-open',
      'true'
    );
  });

  it('delegates translate click to onTranslate with normalized word and index', () => {
    const onTranslate = vi.fn();
    render(
      <InteractiveTextView
        {...baseProps}
        onTranslate={onTranslate}
        tokens={tokens}
      />
    );

    fireEvent.click(screen.getByTestId('translate-hello'));
    // Note: index is now the token array index (0), not segmentIndex
    expect(onTranslate).toHaveBeenCalledWith('hello', 0);
  });

  it('renders empty span when tokens is empty', () => {
    const { container } = render(
      <InteractiveTextView {...baseProps} tokens={[]} />
    );
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});
