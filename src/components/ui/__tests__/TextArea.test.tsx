import { render, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TextArea from '../TextArea';

describe('TextArea Component', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const defaultProps = {
    id: 'test-textarea',
    name: 'test-textarea',
    value: '',
    onChange: vi.fn(),
    label: 'Test Label',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with required props', () => {
    const { container } = render(<TextArea {...defaultProps} />);

    const textarea = within(container).getByRole('textbox', {
      name: 'Test Label',
    });
    const label = within(container).getByText('Test Label');

    expect(textarea).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('sets correct id and name attributes', () => {
    const { container } = render(
      <TextArea {...defaultProps} id='story-input' name='story-field' />
    );

    const textarea = within(container).getByRole('textbox');
    expect(textarea).toHaveAttribute('id', 'story-input');
    expect(textarea).toHaveAttribute('name', 'story-field');
  });

  it('displays the correct value', () => {
    const { container } = render(
      <TextArea {...defaultProps} value='Test content' />
    );

    const textarea = within(container).getByRole('textbox');
    expect(textarea.value).toBe('Test content');
  });

  it('handles onChange events', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <TextArea {...defaultProps} onChange={handleChange} />
    );

    const textarea = within(container).getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New content' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    // Just check that the event was called with a SyntheticEvent-like object
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.any(Object) as HTMLElement,
        type: 'change',
      })
    );
  });

  it('displays placeholder text', () => {
    const { container } = render(
      <TextArea {...defaultProps} placeholder='Enter your text here...' />
    );

    const textarea = within(container).getByRole('textbox');
    expect(textarea).toHaveAttribute('placeholder', 'Enter your text here...');
  });

  it('supports required attribute', () => {
    const { container } = render(<TextArea {...defaultProps} required />);

    const textarea = within(container).getByRole('textbox');
    expect(textarea).toHaveAttribute('required');
  });

  it('displays helper text when provided', () => {
    const { container } = render(
      <TextArea
        {...defaultProps}
        helperText='This is helper text for the textarea'
      />
    );

    const helperText = within(container).getByText(
      'This is helper text for the textarea'
    );
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveAttribute('id', `${defaultProps.id}-helper`);
  });

  it('associates helper text with textarea using aria-describedby', () => {
    const { container } = render(
      <TextArea {...defaultProps} helperText='Helper text' />
    );

    const textarea = within(container).getByRole('textbox');
    expect(textarea).toHaveAttribute(
      'aria-describedby',
      `${defaultProps.id}-helper`
    );
  });

  it('does not set aria-describedby when no helper text', () => {
    const { container } = render(<TextArea {...defaultProps} />);

    const textarea = within(container).getByRole('textbox');
    expect(textarea).not.toHaveAttribute('aria-describedby');
  });

  it('label is properly associated with textarea', () => {
    const { container } = render(
      <TextArea {...defaultProps} label='Story Content' />
    );

    const label = within(container).getByText('Story Content');
    const textarea = within(container).getByLabelText('Story Content');

    expect(label).toHaveAttribute('for', defaultProps.id);
    expect(textarea).toHaveAttribute('id', defaultProps.id);
  });

  it('has correct styling classes', () => {
    const { container } = render(<TextArea {...defaultProps} />);

    const textarea = within(container).getByRole('textbox');
    const label = within(container).getByText('Test Label');

    expect(textarea).toHaveClass(
      'mt-1',
      'block',
      'w-full',
      'p-2',
      'border',
      'border-gray-300',
      'rounded-md',
      'shadow-sm',
      'focus:ring',
      'focus:ring-indigo-200'
    );

    expect(label).toHaveClass(
      'block',
      'text-sm',
      'font-medium',
      'text-gray-700'
    );
  });

  it('helper text has correct styling', () => {
    const { container } = render(
      <TextArea {...defaultProps} helperText='Helper text' />
    );

    const helperText = within(container).getByText('Helper text');
    expect(helperText).toHaveClass('text-sm', 'text-gray-500');
  });

  it('works with complex form scenarios', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <form>
        <TextArea
          id='story-textarea'
          name='story'
          value='Once upon a time...'
          onChange={handleChange}
          placeholder='Write your story here...'
          required
          label='Your Story'
          helperText='Write a compelling story in any language'
        />
      </form>
    );

    const textarea = within(container).getByRole('textbox', {
      name: 'Your Story',
    });
    const label = within(container).getByText('Your Story');
    const helperText = within(container).getByText(
      'Write a compelling story in any language'
    );

    expect(textarea).toHaveValue('Once upon a time...');
    expect(textarea).toHaveAttribute('placeholder', 'Write your story here...');
    expect(textarea).toBeRequired();
    expect(label).toHaveAttribute('for', 'story-textarea');
    expect(textarea).toHaveAttribute(
      'aria-describedby',
      'story-textarea-helper'
    );
    expect(helperText).toHaveAttribute('id', 'story-textarea-helper');

    // Test interaction
    fireEvent.change(textarea, { target: { value: 'New story content' } });
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.any(Object) as HTMLElement,
        type: 'change',
      })
    );
  });

  it('handles empty value correctly', () => {
    const { container } = render(<TextArea {...defaultProps} value='' />);

    const textarea = within(container).getByRole('textbox');
    expect(textarea.value).toBe('');
  });

  it('supports multiline content', () => {
    const multilineContent = 'Line 1\nLine 2\nLine 3';
    const { container } = render(
      <TextArea {...defaultProps} value={multilineContent} />
    );

    const textarea = within(container).getByRole('textbox');
    expect(textarea.value).toBe(multilineContent);
  });
});
