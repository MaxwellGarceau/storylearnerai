import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import FullPageStoryInput from '../FullPageStoryInput';

describe('FullPageStoryInput Component', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with correct title and description', () => {
    const mockOnChange = vi.fn();
    render(<FullPageStoryInput value="" onChange={mockOnChange} />);

    expect(screen.getByText('Translate Your Story')).toBeInTheDocument();
    expect(screen.getByText(/Enter a story in Spanish and we'll translate it to English/)).toBeInTheDocument();
  });

  it('renders textarea with correct placeholder', () => {
    const mockOnChange = vi.fn();
    render(<FullPageStoryInput value="" onChange={mockOnChange} />);

    const textarea = screen.getByPlaceholderText(/Ingresa tu historia en español aquí/);
    expect(textarea).toBeInTheDocument();
  });

  it('calls onChange when user types in textarea', () => {
    const mockOnChange = vi.fn();
    render(<FullPageStoryInput value="" onChange={mockOnChange} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test story' } });

    expect(mockOnChange).toHaveBeenCalledWith('Test story');
  });

  it('displays the provided value in textarea', () => {
    const mockOnChange = vi.fn();
    const testValue = 'Esta es una historia de prueba.';
    render(<FullPageStoryInput value={testValue} onChange={mockOnChange} />);

    const textarea = screen.getByDisplayValue(testValue);
    expect(textarea).toBeInTheDocument();
  });

  it('renders with custom placeholder when provided', () => {
    const mockOnChange = vi.fn();
    const customPlaceholder = 'Custom placeholder text';
    render(<FullPageStoryInput value="" onChange={mockOnChange} placeholder={customPlaceholder} />);

    const textarea = screen.getByPlaceholderText(customPlaceholder);
    expect(textarea).toBeInTheDocument();
  });

  it('renders tip text at the bottom', () => {
    const mockOnChange = vi.fn();
    render(<FullPageStoryInput value="" onChange={mockOnChange} />);

    expect(screen.getByText(/💡 Tip: You can paste long stories/)).toBeInTheDocument();
  });

  it('has correct textarea styling classes', () => {
    const mockOnChange = vi.fn();
    render(<FullPageStoryInput value="" onChange={mockOnChange} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('w-full', 'h-full', 'resize-none', 'border-0');
  });
}); 