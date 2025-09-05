import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { Alert, AlertDescription, AlertIcon } from '../Alert';

describe('Alert Component', () => {
  it('renders with default variant and role', () => {
    render(
      <Alert data-testid='alert'>
        <AlertDescription>Default alert</AlertDescription>
      </Alert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('bg-background', 'text-foreground');
    expect(screen.getByText('Default alert')).toBeInTheDocument();
  });

  it('applies success variant styles', () => {
    render(
      <Alert variant='success'>
        <AlertDescription>Saved successfully</AlertDescription>
      </Alert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-green-500/50', 'text-green-700');
  });

  it('applies destructive variant styles', () => {
    render(
      <Alert variant='destructive'>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-destructive/50');
  });

  it('renders appropriate icon component mapping', () => {
    const SuccessIcon = AlertIcon.success;
    render(
      <Alert>
        <SuccessIcon data-testid='icon' />
        <div>With icon</div>
      </Alert>
    );

    const icon = screen.getByTestId('icon');
    expect(icon.tagName.toLowerCase()).toBe('svg');
  });
});
