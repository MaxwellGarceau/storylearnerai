import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectField } from '../SelectField';

// Tests added by assistant

describe('SelectField', () => {
  it('renders label and select with children options', () => {
    const onChange = vi.fn();
    render(
      <SelectField id='level' label='form.level' value='a1' onChange={onChange}>
        <option value='a1'>A1</option>
        <option value='a2'>A2</option>
      </SelectField>
    );

    expect(screen.getByLabelText('form.level')).toBeInTheDocument();
    const select = screen.getByLabelText('form.level') as HTMLSelectElement;
    expect(select.value).toBe('a1');
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
  });

  it('calls onChange with string value', () => {
    const onChange = vi.fn();
    render(
      <SelectField
        id='lang'
        label='form.language'
        value='en'
        onChange={onChange}
      >
        <option value='en'>EN</option>
        <option value='es'>ES</option>
      </SelectField>
    );

    fireEvent.change(screen.getByLabelText('form.language'), {
      target: { value: 'es' },
    });
    expect(onChange).toHaveBeenCalledWith('es');
  });

  it('calls onChange with number value when value is number', () => {
    const onChange = vi.fn();
    render(
      <SelectField id='count' label='form.count' value={1} onChange={onChange}>
        <option value={1}>1</option>
        <option value={2}>2</option>
      </SelectField>
    );

    fireEvent.change(screen.getByLabelText('form.count'), {
      target: { value: '2' },
    });
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('shows error border when error provided', () => {
    const onChange = vi.fn();
    render(
      <SelectField
        id='sel'
        label='form.sel'
        value='a'
        onChange={onChange}
        error='form.error'
      >
        <option value='a'>A</option>
      </SelectField>
    );

    const select = screen.getByLabelText('form.sel');
    expect(select).toHaveClass('border-destructive');
  });

  it('applies custom className via FieldWrapper', () => {
    const onChange = vi.fn();
    render(
      <SelectField
        id='x'
        label='form.x'
        value='v'
        onChange={onChange}
        className='extra'
      >
        <option value='v'>V</option>
      </SelectField>
    );

    const container = screen.getByLabelText('form.x').closest('div');
    expect(container).toHaveClass('space-y-2');
    expect(container).toHaveClass('extra');
  });
});
