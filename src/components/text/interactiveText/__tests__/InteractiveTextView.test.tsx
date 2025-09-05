import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import InteractiveTextView from '../InteractiveTextView';
import type { Token } from '../../../../hooks/interactiveText/useTokenizedText';

interface WordTokenProps {
  normalizedWord: string;
  cleanWord: string;
  punctuation: string;
  isOpen: boolean;
  isSaved: boolean;
  isTranslating: boolean;
  translatedWord?: string;
  originalSentence: string;
  translatedSentence?: string;
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
    normalizedWord,
    cleanWord,
    punctuation,
    isOpen,
    isSaved,
    isTranslating,
    translatedWord,
    originalSentence,
    translatedSentence,
    onOpenChange,
    onWordClick,
    onTranslate,
    enableTooltips,
    disabled,
  }: WordTokenProps) => (
    <span data-testid={`word-token-${normalizedWord}`} data-open={isOpen}>
      <button
        data-testid={`click-${normalizedWord}`}
        onClick={() => onWordClick?.()}
        disabled={disabled}
      >
        {cleanWord}
      </button>
      <button
        data-testid={`translate-${normalizedWord}`}
        onClick={() => onTranslate?.()}
        disabled={disabled}
      >
        translate
      </button>
      <span data-testid={`punctuation-${normalizedWord}`}>{punctuation}</span>
      <span data-testid={`saved-${normalizedWord}`}>{String(isSaved)}</span>
      <span data-testid={`translating-${normalizedWord}`}>
        {String(isTranslating)}
      </span>
      <span data-testid={`overlay-${normalizedWord}`}>
        {translatedWord ?? ''}
      </span>
      <span data-testid={`orig-${normalizedWord}`}>{originalSentence}</span>
      <span data-testid={`trans-${normalizedWord}`}>
        {translatedSentence ?? ''}
      </span>
      <span data-testid={`tooltips-${normalizedWord}`}>
        {String(enableTooltips)}
      </span>
      <button
        data-testid={`open-${normalizedWord}`}
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
    getOriginalSentence: (segmentIndex: number) =>
      segmentIndex === 0 ? 'Hello world.' : 'Goodbye world.',
    getTranslatedSentence: (sentence: string) =>
      sentence === 'Hello world.' ? 'Hola mundo.' : undefined,
    isSaved: (w: string) => w === 'hello',
    getDisplayTranslation: (w: string) => (w === 'world' ? 'mundo' : undefined),
    isTranslating: (w: string) => w === 'helloing',
    onTranslate: vi.fn(),
  };

  const tokens: Token[] = [
    {
      kind: 'word',
      segmentIndex: 0,
      raw: 'Hello',
      cleanWord: 'Hello',
      normalizedWord: 'hello',
      punctuation: ',',
    },
    { kind: 'whitespace', segmentIndex: 1, text: ' ' },
    {
      kind: 'word',
      segmentIndex: 2,
      raw: 'world!',
      cleanWord: 'world',
      normalizedWord: 'world',
      punctuation: '!',
    },
  ];

  it('renders non-word tokens directly and word tokens via WordToken', () => {
    render(<InteractiveTextView {...baseProps} tokens={tokens} />);

    expect(screen.getByTestId('word-token-hello')).toBeInTheDocument();
    expect(screen.getByTestId('word-token-world')).toBeInTheDocument();
    // whitespace should render as-is (no token testid created)
    // punctuation forwarded into token component
    expect(screen.getByTestId('punctuation-hello')).toHaveTextContent(',');
    expect(screen.getByTestId('punctuation-world')).toHaveTextContent('!');
  });

  it('passes saved, translation overlay, and sentences correctly', () => {
    render(<InteractiveTextView {...baseProps} tokens={tokens} />);

    expect(screen.getByTestId('saved-hello')).toHaveTextContent('true');
    expect(screen.getByTestId('overlay-world')).toHaveTextContent('mundo');
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
    fireEvent.click(screen.getByTestId('click-world'));
    expect(screen.getByTestId('word-token-hello')).toHaveAttribute(
      'data-open',
      'false'
    );
    expect(screen.getByTestId('word-token-world')).toHaveAttribute(
      'data-open',
      'true'
    );
  });

  it('delegates translate click to onTranslate with normalized word and segment', () => {
    const onTranslate = vi.fn();
    render(
      <InteractiveTextView
        {...baseProps}
        onTranslate={onTranslate}
        tokens={tokens}
      />
    );

    fireEvent.click(screen.getByTestId('translate-hello'));
    expect(onTranslate).toHaveBeenCalledWith('hello', 0);
  });

  it('renders empty span when tokens is empty', () => {
    const { container } = render(
      <InteractiveTextView {...baseProps} tokens={[]} />
    );
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});
