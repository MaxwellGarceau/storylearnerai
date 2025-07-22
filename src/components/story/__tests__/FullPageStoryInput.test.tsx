import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import FullPageStoryInput from '../FullPageStoryInput';

describe('FullPageStoryInput Component', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    isTranslating: false,
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with correct title and description', () => {
    render(<FullPageStoryInput {...defaultProps} />);

    expect(screen.getByText('Translate Your Story')).toBeInTheDocument();
    expect(screen.getByText(/Enter a story in Spanish and we'll translate it to English/)).toBeInTheDocument();
  });

  it('renders textarea with correct placeholder', () => {
    render(<FullPageStoryInput {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(/Ingresa tu historia en español aquí/);
    expect(textarea).toBeInTheDocument();
  });

  it('calls onChange when user types in textarea', () => {
    render(<FullPageStoryInput {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test story' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith('Test story');
  });

  it('displays the provided value in textarea', () => {
    const testValue = 'Esta es una historia de prueba.';
    render(<FullPageStoryInput {...defaultProps} value={testValue} />);

    const textarea = screen.getByDisplayValue(testValue);
    expect(textarea).toBeInTheDocument();
  });

  it('renders with custom placeholder when provided', () => {
    const customPlaceholder = 'Custom placeholder text';
    render(<FullPageStoryInput {...defaultProps} placeholder={customPlaceholder} />);

    const textarea = screen.getByPlaceholderText(customPlaceholder);
    expect(textarea).toBeInTheDocument();
  });

  it('renders translate button', () => {
    render(<FullPageStoryInput {...defaultProps} />);

    expect(screen.getByRole('button', { name: /translate story/i })).toBeInTheDocument();
  });

  it('calls onSubmit when translate button is clicked', () => {
    render(<FullPageStoryInput {...defaultProps} value="Test story" />);

    const translateButton = screen.getByRole('button', { name: /translate story/i });
    fireEvent.click(translateButton);

    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables translate button when textarea is empty', () => {
    render(<FullPageStoryInput {...defaultProps} value="" />);

    const translateButton = screen.getByRole('button', { name: /translate story/i });
    expect(translateButton).toBeDisabled();
  });

  it('disables translate button when isTranslating is true', () => {
    render(<FullPageStoryInput {...defaultProps} isTranslating={true} value="Test story" />);

    const translateButton = screen.getByRole('button', { name: /translating/i });
    expect(translateButton).toBeDisabled();
  });

  it('shows loading state when isTranslating is true', () => {
    render(<FullPageStoryInput {...defaultProps} isTranslating={true} value="Test story" />);

    expect(screen.getByText('Translating...')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('renders tip text at the bottom', () => {
    render(<FullPageStoryInput {...defaultProps} />);

    expect(screen.getByText(/💡 Tip: You can paste long stories/)).toBeInTheDocument();
  });

  it('has correct textarea styling classes', () => {
    render(<FullPageStoryInput {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('w-full', 'h-full', 'resize-none', 'border-0');
  });
}); 