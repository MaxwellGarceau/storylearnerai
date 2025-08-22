import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import InteractiveText from '../InteractiveText';

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

// Mock the WordHighlight component
vi.mock('../WordHighlight', () => ({
  default: ({
    word,
    children,
    disabled,
  }: {
    word: string;
    children?: React.ReactNode;
    disabled?: boolean;
  }) => (
    <span data-testid={`word-highlight-${word}`} data-word={word} data-disabled={disabled}>
      {children}
    </span>
  ),
}));

// Mock the WordTooltip component
vi.mock('../WordTooltip', () => ({
  default: ({
    content,
    children,
    onMouseEnter,
    onMouseLeave,
  }: {
    content: React.ReactNode;
    children: React.ReactNode;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  }) => (
    <div data-testid='word-tooltip' onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
      <div data-testid='tooltip-content'>{content}</div>
    </div>
  ),
}));

// Mock the DictionaryEntry component
vi.mock('../../dictionary/DictionaryEntry', () => ({
  default: {
    Root: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='dictionary-root'>{children}</div>
    ),
    Content: () => <div data-testid='dictionary-content'>Dictionary content</div>,
  },
}));

describe('InteractiveText Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders simple text correctly', () => {
    render(<InteractiveText text='hello world' />);

    expect(screen.getByTestId('word-highlight-hello')).toBeInTheDocument();
    expect(screen.getByTestId('word-highlight-world')).toBeInTheDocument();
    // Check that the words are rendered in the highlights (not in tooltips)
    expect(screen.getByTestId('word-highlight-hello')).toHaveTextContent('hello');
    expect(screen.getByTestId('word-highlight-world')).toHaveTextContent('world');
  });

  it('preserves whitespace between words', () => {
    render(<InteractiveText text='hello  world' />);

    // Check that both words are rendered in highlights
    expect(screen.getByTestId('word-highlight-hello')).toHaveTextContent('hello');
    expect(screen.getByTestId('word-highlight-world')).toHaveTextContent('world');
  });

  it('handles punctuation correctly', () => {
    render(<InteractiveText text='hello, world!' />);

    expect(screen.getByTestId('word-highlight-hello')).toBeInTheDocument();
    expect(screen.getByTestId('word-highlight-world')).toBeInTheDocument();
    expect(screen.getByTestId('word-highlight-hello')).toHaveTextContent('hello');
    expect(screen.getByTestId('word-highlight-world')).toHaveTextContent('world');
    expect(screen.getByText(',')).toBeInTheDocument();
    expect(screen.getByText('!')).toBeInTheDocument();
  });

  it('handles empty text', () => {
    render(<InteractiveText text='' />);
    // For empty text, we should not have any word highlights
    expect(screen.queryByTestId(/word-highlight-/)).not.toBeInTheDocument();
  });

  it('handles text with only punctuation', () => {
    render(<InteractiveText text='!@#$%' />);

    // Should not create any word highlights for pure punctuation
    expect(screen.queryByTestId(/word-highlight-/)).not.toBeInTheDocument();
    expect(screen.getByText('!@#$%')).toBeInTheDocument();
  });

  it('handles mixed content with numbers', () => {
    render(<InteractiveText text='hello123 world' />);

    expect(screen.getByTestId('word-highlight-hello123')).toBeInTheDocument();
    expect(screen.getByTestId('word-highlight-world')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<InteractiveText text='hello world' className='custom-class' />);

    // The className should be applied to the root span
    const container = screen.getByTestId('word-highlight-hello').closest('.custom-class');
    expect(container).toHaveClass('custom-class');
  });

  it('renders with tooltips by default', () => {
    render(<InteractiveText text='hello world' fromLanguage='en' targetLanguage='es' />);

    // Check that individual tooltips are rendered for each word
    const tooltips = screen.getAllByTestId('word-tooltip');
    expect(tooltips).toHaveLength(2); // One tooltip per word
  });

  it('renders without tooltips when enableTooltips is false', () => {
    render(<InteractiveText text='hello world' enableTooltips={false} />);

    expect(screen.queryByTestId('word-tooltip')).not.toBeInTheDocument();
    expect(screen.getByTestId('word-highlight-hello')).toBeInTheDocument();
    expect(screen.getByTestId('word-highlight-world')).toBeInTheDocument();
  });

  it('renders disabled highlights when disabled is true', () => {
    render(<InteractiveText text='hello world' disabled={true} />);

    expect(screen.getByTestId('word-highlight-hello')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('word-highlight-world')).toHaveAttribute('data-disabled', 'true');
  });

  it('renders without tooltips when disabled is true', () => {
    render(<InteractiveText text='hello world' disabled={true} />);

    expect(screen.queryByTestId('word-tooltip')).not.toBeInTheDocument();
  });


});
