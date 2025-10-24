import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import GrammarSidebar from '../GrammarSidebar';
import {
  setupSidebarMocks,
  resetSidebarMocks,
  mockUseViewport,
} from '../../__tests__/sidebarMocks';
import { LanguageFilterProvider } from '../../../../hooks/useLanguageFilter';

// Setup mocks before tests
setupSidebarMocks();

// Mock BaseSidebar to focus on GrammarSidebar props behavior
vi.mock('../../base/BaseSidebar', () => ({
  default: ({
    header,
    footerText,
    isOpen,
    onOpen,
    hideToggle,
    toggleButtonText,
    toggleButtonIcon,
    toggleContainerClassName,
    children,
  }: {
    header: React.ReactNode;
    footerText: string;
    isOpen: boolean;
    onOpen: () => void;
    hideToggle?: boolean;
    toggleButtonText?: string;
    toggleButtonIcon?: React.ReactNode;
    toggleContainerClassName?: string;
    children: React.ReactNode;
  }) => (
    <div data-testid='base-sidebar' data-open={String(isOpen)}>
      <div data-testid='header'>{header}</div>
      <div data-testid='footer'>{footerText}</div>
      {!isOpen && !hideToggle && (
        <button
          aria-label='open-toggle'
          className={toggleContainerClassName}
          onClick={onOpen}
        >
          {toggleButtonText}
          <span data-testid='icon'>{toggleButtonIcon}</span>
        </button>
      )}
      <div data-testid='content'>{children}</div>
    </div>
  ),
}));

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<LanguageFilterProvider>{ui}</LanguageFilterProvider>);
};

describe('GrammarSidebar', () => {
  beforeEach(() => {
    resetSidebarMocks();
    mockUseViewport.mockReturnValue({ isMobile: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders header and close button is accessible', () => {
    renderWithProvider(<GrammarSidebar />);
    // Close button label comes from i18n, may be a human string in tests
    const closeBtn = screen.getByRole('button', {
      name: /close/i,
    });
    expect(closeBtn).toBeInTheDocument();
  });

  it('shows toggle with grammar title and icon when closed', () => {
    renderWithProvider(<GrammarSidebar />);

    const base = screen.getByTestId('base-sidebar');
    expect(base.getAttribute('data-open')).toBe('false');

    // Toggle button should appear; title may be translated
    const toggle = screen.getByRole('button', { name: 'open-toggle' });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveTextContent(/Grammar|grammarSidebar.title/i);

    // Icon container present
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    // Positioning class forwarded
    expect(toggle).toHaveClass('top-32');
  });

  it('opens using internal state when toggle clicked', () => {
    renderWithProvider(<GrammarSidebar />);

    // Open via toggle
    fireEvent.click(screen.getByRole('button', { name: 'open-toggle' }));

    // BaseSidebar mock should now reflect open state (controlled by GrammarSidebar internal state)
    expect(screen.getByTestId('base-sidebar').getAttribute('data-open')).toBe(
      'true'
    );
  });

  it('respects controlled isOpen and onOpen props', () => {
    const onOpen = vi.fn();
    const { rerender } = renderWithProvider(
      <GrammarSidebar isOpen={false} onOpen={onOpen} />
    );

    // Closed -> toggle visible
    fireEvent.click(screen.getByRole('button', { name: 'open-toggle' }));
    expect(onOpen).toHaveBeenCalledTimes(1);

    // Open -> toggle hidden
    rerender(
      <LanguageFilterProvider>
        <GrammarSidebar isOpen={true} onOpen={onOpen} />
      </LanguageFilterProvider>
    );
    expect(screen.queryByRole('button', { name: 'open-toggle' })).toBeNull();
  });

  it('forwards hideToggle to BaseSidebar', () => {
    renderWithProvider(<GrammarSidebar hideToggle />);
    expect(screen.queryByRole('button', { name: 'open-toggle' })).toBeNull();
  });
});
