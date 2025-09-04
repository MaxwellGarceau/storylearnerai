import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormActions } from '../FormActions';

// Tests added by assistant

describe('FormActions', () => {
  it('renders Cancel and Save by default', () => {
    const onCancel = vi.fn();
    render(<FormActions onCancel={onCancel} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(<FormActions onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('uses submit type when no onSubmit provided', () => {
    const onCancel = vi.fn();
    render(<FormActions onCancel={onCancel} />);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton.getAttribute('type')).toBe('submit');
  });

  it('uses button type and calls onSubmit when provided', () => {
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    render(<FormActions onCancel={onCancel} onSubmit={onSubmit} />);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton.getAttribute('type')).toBe('button');
    fireEvent.click(saveButton);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows custom labels', () => {
    const onCancel = vi.fn();
    render(
      <FormActions
        onCancel={onCancel}
        submitLabel="form.save"
        cancelLabel="form.cancel"
      />
    );

    expect(screen.getByRole('button', { name: 'form.cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'form.save' })).toBeInTheDocument();
  });

  it('disables buttons while submitting and shows Saving...', () => {
    const onCancel = vi.fn();
    render(<FormActions onCancel={onCancel} isSubmitting />);

    const cancel = screen.getByRole('button', { name: 'Cancel' });
    const save = screen.getByRole('button', { name: 'Saving...' });
    expect(cancel).toBeDisabled();
    expect(save).toBeDisabled();
  });

  it('disables submit button when isDisabled', () => {
    const onCancel = vi.fn();
    render(<FormActions onCancel={onCancel} isDisabled />);

    const save = screen.getByRole('button', { name: 'Save' });
    expect(save).toBeDisabled();
  });

  it('applies layout classes to container', () => {
    const onCancel = vi.fn();
    render(<FormActions onCancel={onCancel} className="extra" />);

    const container = screen.getByRole('button', { name: 'Cancel' }).closest('div');
    expect(container).toHaveClass('flex', 'justify-end', 'space-x-2', 'pt-4', 'p-6');
    expect(container).toHaveClass('extra');
  });
});


