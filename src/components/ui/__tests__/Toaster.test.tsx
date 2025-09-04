import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { Toaster } from '../Toaster';

// Mock useToast hook to control toasts
vi.mock('../../../hooks/useToast', () => ({
  useToast: () => ({
    toasts: [
      {
        id: '1',
        title: 'Test Title',
        description: 'Test Description',
        open: true,
      },
    ],
  }),
}));

describe('Toaster', () => {
  it('renders toasts from hook', () => {
    render(<Toaster />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});
