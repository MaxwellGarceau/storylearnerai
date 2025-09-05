import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { Badge } from '../Badge';

describe('Badge Component', () => {
  it('renders with default variant', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('renders with secondary and destructive variants', () => {
    const { rerender } = render(<Badge variant='secondary'>Secondary</Badge>);
    expect(screen.getByText('Secondary')).toHaveClass(
      'bg-secondary',
      'text-secondary-foreground'
    );

    rerender(<Badge variant='destructive'>Danger</Badge>);
    expect(screen.getByText('Danger')).toHaveClass(
      'bg-destructive',
      'text-destructive-foreground'
    );
  });

  it('supports as="span" prop', () => {
    render(
      <Badge as='span' data-testid='badge-span'>
        As Span
      </Badge>
    );
    const badge = screen.getByTestId('badge-span');
    expect(badge.tagName).toBe('SPAN');
  });
});
