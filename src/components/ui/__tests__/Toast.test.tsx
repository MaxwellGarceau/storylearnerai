import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastProvider,
  ToastViewport,
} from '../Toast';

describe('Toast Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders toast with title and description', () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Success!</ToastTitle>
          <ToastDescription>
            Your action was completed successfully.
          </ToastDescription>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(
      screen.getByText('Your action was completed successfully.')
    ).toBeInTheDocument();
  });

  it('renders toast with success variant', () => {
    render(
      <ToastProvider>
        <Toast variant='success' open={true}>
          <ToastTitle>Translation Saved!</ToastTitle>
          <ToastDescription>
            Your translation has been saved to your library.
          </ToastDescription>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    // Get all elements with status role and find the visible one (not the hidden accessibility span)
    const statusElements = screen.getAllByRole('status');
    const toast = statusElements.find(el => el.tagName === 'LI');
    expect(toast).toHaveClass(
      'border-green-500/50',
      'bg-green-50',
      'text-green-700'
    );
  });

  it('renders toast with destructive variant', () => {
    render(
      <ToastProvider>
        <Toast variant='destructive' open={true}>
          <ToastTitle>Error!</ToastTitle>
          <ToastDescription>Something went wrong.</ToastDescription>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    // Get all elements with status role and find the visible one (not the hidden accessibility span)
    const statusElements = screen.getAllByRole('status');
    const toast = statusElements.find(el => el.tagName === 'LI');
    expect(toast).toHaveClass(
      'destructive',
      'border-destructive',
      'bg-destructive',
      'text-destructive-foreground'
    );
  });

  it('renders toast with default variant', () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Info</ToastTitle>
          <ToastDescription>This is an informational message.</ToastDescription>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    // Get all elements with status role and find the visible one (not the hidden accessibility span)
    const statusElements = screen.getAllByRole('status');
    const toast = statusElements.find(el => el.tagName === 'LI');
    expect(toast).toHaveClass('border', 'bg-background', 'text-foreground');
  });

  it('renders close button', () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Test Toast</ToastTitle>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute('toast-close', '');
  });
});
