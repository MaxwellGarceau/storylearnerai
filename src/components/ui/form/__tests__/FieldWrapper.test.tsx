import React from 'react';
import { render, screen } from '@testing-library/react';
import { FieldWrapper } from '../FieldWrapper';

// Tests added by assistant

describe('FieldWrapper', () => {
  it('renders label, children, and no error by default', () => {
    render(
      <FieldWrapper id="username" label="form.username">
        <input id="username" />
      </FieldWrapper>
    );

    expect(screen.getByLabelText('form.username')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByText('*')).not.toBeInTheDocument();
    expect(screen.queryByText(/text-destructive/)).not.toBeInTheDocument();
  });

  it('shows required indicator when required is true', () => {
    render(
      <FieldWrapper id="email" label="form.email" required>
        <input id="email" />
      </FieldWrapper>
    );

    // Input is labelled correctly
    expect(screen.getByLabelText(/form.email/)).toBeInTheDocument();
    // Find the label element robustly and assert it contains an asterisk
    const labelNode = screen.getByText((content, node) => {
      return (
        node?.tagName.toLowerCase() === 'label' &&
        (node.textContent || '').includes('form.email')
      );
    });
    expect(labelNode).toBeInTheDocument();
    expect(labelNode).toHaveTextContent(/\*/);
  });

  it('renders error message and styling when error provided', () => {
    render(
      <FieldWrapper id="pwd" label="form.password" error="form.error.required">
        <input id="pwd" />
      </FieldWrapper>
    );

    expect(screen.getByText('form.error.required')).toBeInTheDocument();
    const error = screen.getByText('form.error.required');
    expect(error).toHaveClass('text-sm', 'text-destructive');
  });

  it('applies custom className to container', () => {
    render(
      <FieldWrapper id="x" label="form.x" className="my-extra">
        <input id="x" />
      </FieldWrapper>
    );

    const container = screen.getByLabelText('form.x').closest('div');
    expect(container).toHaveClass('space-y-2');
    expect(container).toHaveClass('my-extra');
  });
});


