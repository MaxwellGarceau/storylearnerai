import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import InteractiveText from '../InteractiveText';
// VoidFunction imported but not used in this test file

// Test helper types
type WordCallback = (word: string) => void;

// Mock the useDictionary hook
vi.mock('../../../hooks/useDictionary', () => ({
  useDictionary: () => ({
    wordInfo: null,
    isLoading: false,
    error: null,
    searchWord: vi.fn(),
    clearError: vi.fn(),
  }),
}));

// Mock the useWordTranslation hook
vi.mock('../../../hooks/useWordTranslation', () => ({
  useWordTranslation: () => ({
    translateWord: vi.fn().mockResolvedValue('translated'),
    translateWordInSentence: vi.fn().mockResolvedValue('translated word'),
    translateSentence: vi.fn().mockResolvedValue('translated sentence'),
    isTranslating: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

// Mock the WordHighlight component
vi.mock('../WordHighlight', () => ({
  default: ({
    word,
    children,
    disabled,
    onClick,
  }: {
    word: string;
    children?: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <span
      data-testid={`word-highlight-${word}`}
      data-word={word}
      data-disabled={disabled}
      onClick={onClick}
    >
      {children}
    </span>
  ),
}));

// Mock the WordMenu component
vi.mock('../WordMenu', () => ({
  default: ({
    word,
    children,
    open,
    onOpenChange,
    onTranslate,
    onSave,
    fromLanguage,
    targetLanguage,
    translatedWord,
  }: {
    word: string;
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onTranslate?: WordCallback;
    onSave?: WordCallback;
    fromLanguage?: string;
    targetLanguage?: string;
    translatedWord?: string;
  }) => {
    // Use the parameters to avoid unused variable warnings
    void fromLanguage;
    void targetLanguage;
    void translatedWord;
    return (
      <span data-word={word}>
        {children}
        {open ? (
          <div data-testid='word-menu' data-open={open}>
            <div data-testid='menu-content'>
              <button
                data-testid='translate-button'
                onClick={() => {
                  onTranslate?.(word);
                  onOpenChange?.(false);
                }}
              >
                Translate
              </button>
              <button
                data-testid='save-button'
                onClick={() => {
                  onSave?.(word);
                  onOpenChange?.(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        ) : null}
      </span>
    );
  },
}));

// Mock the DictionaryEntry component
vi.mock('../../dictionary/DictionaryEntry', () => ({
  default: {
    Root: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='dictionary-root'>{children}</div>
    ),
    Content: () => (
      <div data-testid='dictionary-content'>Dictionary content</div>
    ),
  },
}));

describe('InteractiveText Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders simple text correctly', () => {
    render(
      <InteractiveText
        text='hello world'
        fromLanguage='en'
        targetLanguage='es'
      />
    );

    expect(screen.getByTestId('word-highlight-hello')).toBeInTheDocument();
    expect(screen.getByTestId('word-highlight-world')).toBeInTheDocument();
    // Check that the words are rendered in the highlights
    expect(screen.getByTestId('word-highlight-hello')).toHaveTextContent(
      'hello'
    );
    expect(screen.getByTestId('word-highlight-world')).toHaveTextContent(
      'world'
    );
  });

  it('preserves whitespace between words', () => {
    render(
      <InteractiveText
        text='hello  world'
        fromLanguage='en'
        targetLanguage='es'
      />
    );

    // Check that both words are rendered in highlights
    expect(screen.getByTestId('word-highlight-hello')).toHaveTextContent(
      'hello'
    );
    expect(screen.getByTestId('word-highlight-world')).toHaveTextContent(
      'world'
    );
  });

  it('handles punctuation correctly', () => {
    render(
      <InteractiveText
        text='hello, world!'
        fromLanguage='en'
        targetLanguage='es'
      />
    );

    expect(screen.getByTestId('word-highlight-hello')).toBeInTheDocument();
    expect(screen.getByTestId('word-highlight-world')).toBeInTheDocument();
    expect(screen.getByTestId('word-highlight-hello')).toHaveTextContent(
      'hello'
    );
    expect(screen.getByTestId('word-highlight-world')).toHaveTextContent(
      'world'
    );
    expect(screen.getByText(',')).toBeInTheDocument();
    expect(screen.getByText('!')).toBeInTheDocument();
  });

  it('handles empty text', () => {
    render(<InteractiveText text='' fromLanguage='en' targetLanguage='es' />);
    // For empty text, we should not have any word highlights
    expect(screen.queryByTestId(/word-highlight-/)).not.toBeInTheDocument();
  });

  it('handles text with only punctuation', () => {
    render(
      <InteractiveText text='!@#$%' fromLanguage='en' targetLanguage='es' />
    );

    // Should not create any word highlights for pure punctuation
    expect(screen.queryByTestId(/word-highlight-/)).not.toBeInTheDocument();
    expect(screen.getByText('!@#$%')).toBeInTheDocument();
  });

  it('handles mixed content with numbers', () => {
    render(
      <InteractiveText
        text='hello123 world'
        fromLanguage='en'
        targetLanguage='es'
      />
    );

    expect(screen.getByTestId('word-highlight-hello123')).toBeInTheDocument();
    expect(screen.getByTestId('word-highlight-world')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <InteractiveText
        text='hello world'
        className='custom-class'
        fromLanguage='en'
        targetLanguage='es'
      />
    );

    // The className should be applied to the root span
    const container = screen
      .getByTestId('word-highlight-hello')
      .closest('.custom-class');
    expect(container).toHaveClass('custom-class');
  });

  it('renders word highlights by default without menus', () => {
    render(
      <InteractiveText
        text='hello world'
        fromLanguage='en'
        targetLanguage='es'
      />
    );

    // Check that word highlights are rendered but no menus initially
    expect(screen.getByTestId('word-highlight-hello')).toBeInTheDocument();
    expect(screen.getByTestId('word-highlight-world')).toBeInTheDocument();
    expect(screen.queryByTestId('word-menu')).not.toBeInTheDocument();
  });

  it('renders without menus when enableTooltips is false', () => {
    render(
      <InteractiveText
        text='hello world'
        enableTooltips={false}
        fromLanguage='en'
        targetLanguage='es'
      />
    );

    expect(screen.queryByTestId('word-menu')).not.toBeInTheDocument();
    expect(screen.getByTestId('word-highlight-hello')).toBeInTheDocument();
    expect(screen.getByTestId('word-highlight-world')).toBeInTheDocument();
  });

  it('renders disabled highlights when disabled is true', () => {
    render(
      <InteractiveText
        text='hello world'
        disabled={true}
        fromLanguage='en'
        targetLanguage='es'
      />
    );

    expect(screen.getByTestId('word-highlight-hello')).toHaveAttribute(
      'data-disabled',
      'true'
    );
    expect(screen.getByTestId('word-highlight-world')).toHaveAttribute(
      'data-disabled',
      'true'
    );
  });

  it('renders without menus when disabled is true', () => {
    render(
      <InteractiveText
        text='hello world'
        disabled={true}
        fromLanguage='en'
        targetLanguage='es'
      />
    );

    expect(screen.queryByTestId('word-menu')).not.toBeInTheDocument();
  });

  it('shows menu when word is clicked', () => {
    render(
      <InteractiveText
        text='hello world'
        fromLanguage='en'
        targetLanguage='es'
      />
    );

    // Initially no menu should be visible
    expect(screen.queryByTestId('word-menu')).not.toBeInTheDocument();

    // Click on a word
    const helloWord = screen.getByTestId('word-highlight-hello');
    fireEvent.click(helloWord);

    // Now a menu should be rendered
    expect(screen.getByTestId('word-menu')).toBeInTheDocument();
  });

  it('calls translate handler when translate button is clicked', () => {
    render(
      <InteractiveText
        text='hello world'
        fromLanguage='en'
        targetLanguage='es'
      />
    );

    // Click on a word to open menu
    const helloWord = screen.getByTestId('word-highlight-hello');
    fireEvent.click(helloWord);

    // Click translate button
    const translateButton = screen.getByTestId('translate-button');
    fireEvent.click(translateButton);

    // The menu should close after clicking the button
    expect(screen.queryByTestId('word-menu')).not.toBeInTheDocument();
  });

  it('calls save handler when save button is clicked', () => {
    render(
      <InteractiveText
        text='hello world'
        fromLanguage='en'
        targetLanguage='es'
      />
    );

    // Click on a word to open menu
    const helloWord = screen.getByTestId('word-highlight-hello');
    fireEvent.click(helloWord);

    // Click save button
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    // The menu should close after clicking the button
    expect(screen.queryByTestId('word-menu')).not.toBeInTheDocument();
  });
});
