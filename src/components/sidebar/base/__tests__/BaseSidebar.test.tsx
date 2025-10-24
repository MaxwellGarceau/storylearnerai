import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, type MockInstance } from 'vitest';
import BaseSidebar from '../BaseSidebar';
import {
  setupSidebarMocks,
  resetSidebarMocks,
  mockUseViewport,
} from '../../__tests__/sidebarMocks';

// Setup mocks before tests
setupSidebarMocks();

// Mock SidebarToggle to control and assert its rendering without coupling
type SidebarToggleMockProps = {
  onOpen: () => void;
  t: (key: string) => string;
  customText?: string;
  customIcon?: React.ReactNode;
  containerClassName?: string;
};
vi.mock('../SidebarToggle', () => ({
  default: ({
    onOpen,
    t,
    customText,
    customIcon,
    containerClassName,
  }: SidebarToggleMockProps) => (
    <div data-testid='sidebar-toggle' className={containerClassName}>
      <button aria-label={t('storySidebar.openLibrary')} onClick={onOpen}>
        {customIcon}
        <span>{customText}</span>
      </button>
    </div>
  ),
}));

describe('BaseSidebar', () => {
  const header = <div>Header</div>;
  const footerText = 'Footer text';
  const children = <div>Content</div>;

  beforeEach(() => {
    resetSidebarMocks();
    mockUseViewport.mockReturnValue({ isMobile: false });
    // Ensure no persisted sidebar state leaks from other tests
    (localStorage.getItem as unknown as MockInstance).mockReturnValue(null);
    (localStorage.setItem as unknown as MockInstance).mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('is open by default on desktop (toggle hidden)', () => {
    mockUseViewport.mockReturnValue({ isMobile: false });
    const { unmount } = render(
      <BaseSidebar header={header} footerText={footerText}>
        {children}
      </BaseSidebar>
    );
    expect(screen.queryByTestId('sidebar-toggle')).toBeNull();
    unmount();
  });

  it('renders toggle when explicitly closed (controlled, mobile)', () => {
    mockUseViewport.mockReturnValue({ isMobile: true });
    render(
      <BaseSidebar header={header} footerText={footerText} isOpen={false}>
        {children}
      </BaseSidebar>
    );
    expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();
  });

  it('writes state to localStorage on mount', () => {
    mockUseViewport.mockReturnValue({ isMobile: true });
    (localStorage.getItem as unknown as MockInstance).mockReturnValue(null);
    render(
      <BaseSidebar header={header} footerText={footerText}>
        {children}
      </BaseSidebar>
    );
    // Either true (desktop) or false (mobile) depending on viewport; we only assert it was written
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'sidebarOpen',
      expect.any(String)
    );
  });

  it('uses controlled isOpen when provided and shows toggle when closed', () => {
    const { rerender } = render(
      <BaseSidebar header={header} footerText={footerText} isOpen={false}>
        {children}
      </BaseSidebar>
    );

    // Closed -> toggle visible
    expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();

    // Open -> toggle hidden
    rerender(
      <BaseSidebar header={header} footerText={footerText} isOpen={true}>
        {children}
      </BaseSidebar>
    );
    expect(screen.queryByTestId('sidebar-toggle')).toBeNull();
  });

  it('respects hideToggle prop', () => {
    render(
      <BaseSidebar header={header} footerText={footerText} hideToggle>
        {children}
      </BaseSidebar>
    );
    // Toggle should not render even if sidebar is closed
    expect(screen.queryByTestId('sidebar-toggle')).toBeNull();
  });

  it('passes custom text, icon, and container class to the toggle', () => {
    mockUseViewport.mockReturnValue({ isMobile: true });
    const CustomIcon = <svg data-testid='custom-icon' />;
    render(
      <BaseSidebar
        header={header}
        footerText={footerText}
        toggleButtonText='Custom Text'
        toggleButtonIcon={CustomIcon}
        toggleContainerClassName='top-32'
        isOpen={false}
      >
        {children}
      </BaseSidebar>
    );

    const toggle = screen.getByTestId('sidebar-toggle');
    expect(toggle).toHaveClass('top-32');
    expect(screen.getByText('Custom Text')).toBeInTheDocument();
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders header, children, and footer text with correct container structure', () => {
    mockUseViewport.mockReturnValue({ isMobile: false });
    render(
      <BaseSidebar header={header} footerText={footerText}>
        {children}
      </BaseSidebar>
    );

    // The sidebar container should exist with fixed positioning classes
    const sidebar = document.querySelector('.fixed.top-16.left-0.z-40');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass('w-80', 'bg-background', 'border-r');

    // Header, content, and footer should render
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });
});
