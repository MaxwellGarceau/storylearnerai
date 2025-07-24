import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { Toast, ToastTitle, ToastDescription, ToastClose, ToastProvider } from '../Toast';

describe('Toast Component', () => {
  it('renders toast with title and description', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastTitle>Success!</ToastTitle>
          <ToastDescription>Your action was completed successfully.</ToastDescription>
          <ToastClose />
        </Toast>
      </ToastProvider>
    );

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Your action was completed successfully.')).toBeInTheDocument();
  });

  it('renders toast with success variant', () => {
    render(
      <ToastProvider>
        <Toast variant="success">
          <ToastTitle>Translation Saved!</ToastTitle>
          <ToastDescription>Your translation has been saved to your library.</ToastDescription>
          <ToastClose />
        </Toast>
      </ToastProvider>
    );

    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('border-green-500/50', 'bg-green-50', 'text-green-700');
  });

  it('renders toast with destructive variant', () => {
    render(
      <ToastProvider>
        <Toast variant="destructive">
          <ToastTitle>Error!</ToastTitle>
          <ToastDescription>Something went wrong.</ToastDescription>
          <ToastClose />
        </Toast>
      </ToastProvider>
    );

    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('destructive', 'border-destructive', 'bg-destructive', 'text-destructive-foreground');
  });

  it('renders toast with default variant', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastTitle>Info</ToastTitle>
          <ToastDescription>This is an informational message.</ToastDescription>
          <ToastClose />
        </Toast>
      </ToastProvider>
    );

    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('border', 'bg-background', 'text-foreground');
  });

  it('renders close button', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastTitle>Test Toast</ToastTitle>
          <ToastClose />
        </Toast>
      </ToastProvider>
    );

    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute('aria-label', 'Close');
  });
}); 