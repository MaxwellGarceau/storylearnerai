import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextareaField } from '../TextareaField';

// Tests added by assistant

describe('TextareaField', () => {
  it('renders label and textarea with default rows', () => {
    const onChange = vi.fn();
    render(
      <TextareaField id="bio" label="form.bio" value="hello" onChange={onChange} />
    );

    const textarea = screen.getByLabelText('form.bio') as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.rows).toBe(3);
    expect(textarea.value).toBe('hello');
  });

  it('respects rows prop', () => {
    const onChange = vi.fn();
    render(
      <TextareaField id="desc" label="form.desc" value="" onChange={onChange} rows={5} />
    );

    const textarea = screen.getByLabelText('form.desc') as HTMLTextAreaElement;
    expect(textarea.rows).toBe(5);
  });

  it('calls onChange with new value', () => {
    const onChange = vi.fn();
    render(
      <TextareaField id="notes" label="form.notes" value="" onChange={onChange} />
    );

    const textarea = screen.getByLabelText('form.notes');
    fireEvent.change(textarea, { target: { value: 'abc' } });
    expect(onChange).toHaveBeenCalledWith('abc');
  });

  it('shows placeholder and applies wrapper classes', () => {
    const onChange = vi.fn();
    render(
      <TextareaField id="x" label="form.x" value="" onChange={onChange} placeholder="form.placeholder" className="extra" />
    );

    const textarea = screen.getByPlaceholderText('form.placeholder');
    expect(textarea).toHaveClass('resize-none');
    const container = screen.getByLabelText('form.x').closest('div');
    expect(container).toHaveClass('space-y-2');
    expect(container).toHaveClass('extra');
  });
});


