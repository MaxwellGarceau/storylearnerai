import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import InteractiveText from '../InteractiveText';

// Mock the WordHighlight component
vi.mock('../WordHighlight', () => ({
  default: ({
    word,
    children,
  }: {
    word: string;
    children?: React.ReactNode;
  }) => (
    <span data-testid={`word-highlight-${word}`} data-word={word}>
      {children}
    </span>
  ),
}));

describe('InteractiveText Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders simple text correctly', () => {
    render(<InteractiveText text='hello world' />);

    expect(screen.getByTestId('word-highlight-hello')).toBeInTheDocument();
    expect(screen.getByTestId('word-highlight-world')).toBeInTheDocument();
    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByText('world')).toBeInTheDocument();
  });

  it('preserves whitespace between words', () => {
    render(<InteractiveText text='hello  world' />);

    const container = screen.getByTestId('word-highlight-hello').parentElement
      ?.parentElement;
    expect(container).toBeInTheDocument();

    // Check that there are multiple child elements (words + spaces)
    const childElements = container?.children;
    expect(childElements?.length).toBeGreaterThan(1);
  });

  it('handles punctuation correctly', () => {
    render(<InteractiveText text='hello, world!' />);

    expect(screen.getByTestId('word-highlight-hello')).toBeInTheDocument();
    expect(screen.getByTestId('word-highlight-world')).toBeInTheDocument();
    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByText('world')).toBeInTheDocument();
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

    const container = screen.getByText('hello').parentElement?.parentElement;
    expect(container).toHaveClass('custom-class');
  });
});
