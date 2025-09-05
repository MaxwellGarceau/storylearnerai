import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextField } from '../TextField';

// Tests added by assistant

describe('TextField', () => {
  it('renders label and input with default type text', () => {
    const onChange = vi.fn();
    render(
      <TextField id='name' label='form.name' value='John' onChange={onChange} />
    );

    const input = screen.getByLabelText('form.name');
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('text');
    expect(input.value).toBe('John');
  });

  it('passes through inputType prop', () => {
    const onChange = vi.fn();
    render(
      <TextField
        id='pwd'
        label='form.password'
        value='secret'
        onChange={onChange}
        inputType='password'
      />
    );
    const input = screen.getByLabelText('form.password');
    expect(input.type).toBe('password');
  });

  it('calls onChange with new value', () => {
    const onChange = vi.fn();
    render(
      <TextField id='email' label='form.email' value='' onChange={onChange} />
    );

    const input = screen.getByLabelText('form.email');
    fireEvent.change(input, { target: { value: 'a@b.com' } });
    expect(onChange).toHaveBeenCalledWith('a@b.com');
  });

  it('shows placeholder and error styling', () => {
    const onChange = vi.fn();
    render(
      <TextField
        id='x'
        label='form.x'
        value=''
        onChange={onChange}
        placeholder='form.placeholder'
        error='form.error'
      />
    );

    const input = screen.getByPlaceholderText('form.placeholder');
    expect(input).toHaveClass('border-destructive');
  });

  it('applies custom className via FieldWrapper', () => {
    const onChange = vi.fn();
    render(
      <TextField
        id='y'
        label='form.y'
        value='v'
        onChange={onChange}
        className='extra'
      />
    );

    const container = screen.getByLabelText('form.y').closest('div');
    expect(container).toHaveClass('space-y-2');
    expect(container).toHaveClass('extra');
  });
});
