import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../Layout';
import { vi } from 'vitest';

// Mock Header to avoid its internal behavior
vi.mock('../Header', () => ({
  default: () => <div data-testid='mock-header' />,
}));

describe('Layout', () => {
  it('renders Header and wraps children in main', () => {
    const { container } = render(
      <MemoryRouter>
        <Layout>
          <div>Child content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('min-h-screen', 'flex', 'flex-col', 'bg-background');

    const main = container.querySelector('main') as HTMLElement;
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex-1');
  });
});


