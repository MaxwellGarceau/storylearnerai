import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PageLayout from '../PageLayout';
import { vi } from 'vitest';

// Mock Header and PageContainer to focus on structure/props
vi.mock('../Header', () => ({
  default: () => <div data-testid='mock-header' />,
}));

const mockPageContainer = vi.fn(
  ({ children }: { children: React.ReactNode }) => (
    <div data-testid='mock-page-container'>{children}</div>
  )
);

vi.mock('../PageContainer', () => ({
  __esModule: true,
  default: (props: any) => mockPageContainer(props),
}));

describe('PageLayout', () => {
  beforeEach(() => {
    mockPageContainer.mockClear();
  });

  it('renders Header and PageContainer with children', () => {
    render(
      <MemoryRouter>
        <PageLayout>
          <div>Child content</div>
        </PageLayout>
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-page-container')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('passes className and maxWidth to PageContainer', () => {
    render(
      <MemoryRouter>
        <PageLayout className='custom-class' maxWidth='4xl'>
          <div>Child content</div>
        </PageLayout>
      </MemoryRouter>
    );

    // The mocked default export is called as a function component with a single props object
    expect(mockPageContainer).toHaveBeenCalledWith(
      expect.objectContaining({ className: 'custom-class', maxWidth: '4xl' })
    );
  });

  it('applies page shell structure classes', () => {
    const { container } = render(
      <MemoryRouter>
        <PageLayout>
          <div>Child content</div>
        </PageLayout>
      </MemoryRouter>
    );

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass(
      'min-h-screen',
      'flex',
      'flex-col',
      'bg-background'
    );

    const main = container.querySelector('main') as HTMLElement;
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex-1');
  });
});
