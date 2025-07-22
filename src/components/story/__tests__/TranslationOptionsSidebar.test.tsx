import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TranslationOptionsSidebar from '../TranslationOptionsSidebar';

describe('TranslationOptionsSidebar Component', () => {
  const defaultProps = {
    formData: {
      language: 'English',
      difficulty: 'A1',
    },
    onFormDataChange: vi.fn(),
    onSubmit: vi.fn(),
    isTranslating: false,
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the toggle button with correct text', () => {
    render(<TranslationOptionsSidebar {...defaultProps} />);

    expect(screen.getByRole('button', { name: /open translation options/i })).toBeInTheDocument();
    expect(screen.getByText('Options')).toBeInTheDocument();
  });

  it('shows sidebar panel when toggle button is clicked', () => {
    render(<TranslationOptionsSidebar {...defaultProps} />);

    const toggleButton = screen.getByRole('button', { name: /open translation options/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText('Translation Options')).toBeInTheDocument();
    expect(screen.getByText('Configure your translation settings')).toBeInTheDocument();
  });

  it('displays current form data values', () => {
    render(<TranslationOptionsSidebar {...defaultProps} />);

    const toggleButton = screen.getByRole('button', { name: /open translation options/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
  });

  it('calls onSubmit when translate button is clicked', () => {
    render(<TranslationOptionsSidebar {...defaultProps} />);

    const toggleButton = screen.getByRole('button', { name: /open translation options/i });
    fireEvent.click(toggleButton);

    const translateButton = screen.getByText('Translate Story');
    fireEvent.click(translateButton);

    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isTranslating is true', () => {
    render(<TranslationOptionsSidebar {...defaultProps} isTranslating={true} />);

    const toggleButton = screen.getByRole('button', { name: /open translation options/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText('Translating...')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('disables translate button when isTranslating is true', () => {
    render(<TranslationOptionsSidebar {...defaultProps} isTranslating={true} />);

    const toggleButton = screen.getByRole('button', { name: /open translation options/i });
    fireEvent.click(toggleButton);

    const translateButton = screen.getByText('Translating...').closest('button');
    expect(translateButton).toBeDisabled();
  });

  it('displays translation info box', () => {
    render(<TranslationOptionsSidebar {...defaultProps} />);

    const toggleButton = screen.getByRole('button', { name: /open translation options/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText('Translation:')).toBeInTheDocument();
    expect(screen.getByText('Spanish → English')).toBeInTheDocument();
  });

  it('displays language selection with correct options', () => {
    render(<TranslationOptionsSidebar {...defaultProps} />);

    const toggleButton = screen.getByRole('button', { name: /open translation options/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText('Target Language')).toBeInTheDocument();
    expect(screen.getByText('Currently only English translation is supported.')).toBeInTheDocument();
  });

  it('displays difficulty selection with correct options', () => {
    render(<TranslationOptionsSidebar {...defaultProps} />);

    const toggleButton = screen.getByRole('button', { name: /open translation options/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText('Target Difficulty (CEFR)')).toBeInTheDocument();
    expect(screen.getByText('The story will be adapted to this English proficiency level.')).toBeInTheDocument();
  });
}); 