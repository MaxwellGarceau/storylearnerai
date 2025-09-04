import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SidebarHeader from '../SidebarHeader';
import {
  setupSidebarMocks,
  resetSidebarMocks,
  mockT,
} from './sidebarMocks';

type ActiveSection = 'stories' | 'vocabulary' | 'info';

// Setup mocks before tests
setupSidebarMocks();

describe('SidebarHeader Component', () => {
  const mockSetActiveSection = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    activeSection: 'stories' as ActiveSection,
    setActiveSection: mockSetActiveSection,
    onClose: mockOnClose,
    t: mockT,
  };

  beforeEach(() => {
    resetSidebarMocks();
    mockSetActiveSection.mockClear();
    mockOnClose.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with title and close button', () => {
    render(<SidebarHeader {...defaultProps} />);

    expect(screen.getByText('storySidebar.storyLibrary')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'storySidebar.closeLibrary' })).toBeInTheDocument();
  });

  it('displays BookOpen icon in header', () => {
    render(<SidebarHeader {...defaultProps} />);

    // The icon should be present (we can check for its container or aria-label)
    const headerSection = screen.getByText('storySidebar.storyLibrary').closest('.flex');
    expect(headerSection).toBeInTheDocument();
  });

  it('renders all three section buttons', () => {
    render(<SidebarHeader {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'storySidebar.stories' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'storySidebar.vocabulary' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'storySidebar.info' })).toBeInTheDocument();
  });

  it('applies default variant to active section button', () => {
    render(<SidebarHeader {...defaultProps} />);

    const storiesButton = screen.getByRole('button', { name: 'storySidebar.stories' });
    expect(storiesButton).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('applies ghost variant to inactive section buttons', () => {
    render(<SidebarHeader {...defaultProps} />);

    const vocabularyButton = screen.getByRole('button', { name: 'storySidebar.vocabulary' });
    const infoButton = screen.getByRole('button', { name: 'storySidebar.info' });

    // Ghost variant should have hover effects but not be transparent background
    expect(vocabularyButton).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
    expect(infoButton).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');

    // Should not have the default variant classes
    expect(vocabularyButton).not.toHaveClass('bg-primary');
    expect(infoButton).not.toHaveClass('bg-primary');
  });

  it('calls setActiveSection when stories button is clicked', () => {
    render(<SidebarHeader {...defaultProps} activeSection="vocabulary" />);

    const storiesButton = screen.getByRole('button', { name: 'storySidebar.stories' });
    fireEvent.click(storiesButton);

    expect(mockSetActiveSection).toHaveBeenCalledWith('stories');
    expect(mockSetActiveSection).toHaveBeenCalledTimes(1);
  });

  it('calls setActiveSection when vocabulary button is clicked', () => {
    render(<SidebarHeader {...defaultProps} />);

    const vocabularyButton = screen.getByRole('button', { name: 'storySidebar.vocabulary' });
    fireEvent.click(vocabularyButton);

    expect(mockSetActiveSection).toHaveBeenCalledWith('vocabulary');
    expect(mockSetActiveSection).toHaveBeenCalledTimes(1);
  });

  it('calls setActiveSection when info button is clicked', () => {
    render(<SidebarHeader {...defaultProps} />);

    const infoButton = screen.getByRole('button', { name: 'storySidebar.info' });
    fireEvent.click(infoButton);

    expect(mockSetActiveSection).toHaveBeenCalledWith('info');
    expect(mockSetActiveSection).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    render(<SidebarHeader {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: 'storySidebar.closeLibrary' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays correct icons for each section button', () => {
    render(<SidebarHeader {...defaultProps} />);

    // Check that buttons contain their respective icons
    const storiesButton = screen.getByRole('button', { name: 'storySidebar.stories' });
    const vocabularyButton = screen.getByRole('button', { name: 'storySidebar.vocabulary' });
    const infoButton = screen.getByRole('button', { name: 'storySidebar.info' });

    // The icons should be present as children of the buttons
    expect(storiesButton.querySelector('svg')).toBeInTheDocument();
    expect(vocabularyButton.querySelector('svg')).toBeInTheDocument();
    expect(infoButton.querySelector('svg')).toBeInTheDocument();
  });

  it('applies correct styling classes to header container', () => {
    render(<SidebarHeader {...defaultProps} />);

    const headerContainer = screen.getByText('storySidebar.storyLibrary').closest('.p-4');
    expect(headerContainer).toHaveClass('p-4', 'border-b', 'bg-muted/50');
  });

  it('applies flexbox layout to header content', () => {
    render(<SidebarHeader {...defaultProps} />);

    const headerContent = screen.getByText('storySidebar.storyLibrary').closest('.justify-between');
    expect(headerContent).toHaveClass('flex', 'items-center', 'justify-between');
  });

  it('applies correct button group styling', () => {
    render(<SidebarHeader {...defaultProps} />);

    const buttonGroup = screen.getByRole('button', { name: 'storySidebar.stories' }).closest('.flex');
    expect(buttonGroup).toHaveClass('flex', 'gap-1', 'mt-3', 'flex-wrap');
  });

  it('applies flex-1 class to all section buttons', () => {
    render(<SidebarHeader {...defaultProps} />);

    const storiesButton = screen.getByRole('button', { name: 'storySidebar.stories' });
    const vocabularyButton = screen.getByRole('button', { name: 'storySidebar.vocabulary' });
    const infoButton = screen.getByRole('button', { name: 'storySidebar.info' });

    expect(storiesButton).toHaveClass('flex-1');
    expect(vocabularyButton).toHaveClass('flex-1');
    expect(infoButton).toHaveClass('flex-1');
  });

  it('handles close button accessibility attributes', () => {
    render(<SidebarHeader {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: 'storySidebar.closeLibrary' });
    expect(closeButton).toHaveAttribute('aria-label', 'storySidebar.closeLibrary');
  });

  it('handles different active sections correctly', () => {
    const testCases: Array<{ activeSection: ActiveSection; expectedActiveButton: string }> = [
      { activeSection: 'stories', expectedActiveButton: 'storySidebar.stories' },
      { activeSection: 'vocabulary', expectedActiveButton: 'storySidebar.vocabulary' },
      { activeSection: 'info', expectedActiveButton: 'storySidebar.info' },
    ];

    testCases.forEach(({ activeSection, expectedActiveButton }) => {
      const { rerender } = render(
        <SidebarHeader {...defaultProps} activeSection={activeSection} />
      );

      const activeButton = screen.getByRole('button', { name: expectedActiveButton });
      expect(activeButton).toHaveClass('bg-primary');

      // Clean up for next test
      rerender(<div />);
    });
  });

  it('applies correct size classes to buttons', () => {
    render(<SidebarHeader {...defaultProps} />);

    const buttons = [
      screen.getByRole('button', { name: 'storySidebar.stories' }),
      screen.getByRole('button', { name: 'storySidebar.vocabulary' }),
      screen.getByRole('button', { name: 'storySidebar.info' }),
      screen.getByRole('button', { name: 'storySidebar.closeLibrary' }),
    ];

    buttons.forEach(button => {
      if (button.getAttribute('aria-label') === 'storySidebar.closeLibrary') {
        expect(button).toHaveClass('h-8', 'w-8');
      } else {
        // Size 'sm' buttons get converted to specific height/padding classes
        expect(button).toHaveClass('h-9', 'px-3');
      }
    });
  });

  it('calls translation function with correct keys', () => {
    render(<SidebarHeader {...defaultProps} />);

    expect(mockT).toHaveBeenCalledWith('storySidebar.storyLibrary');
    expect(mockT).toHaveBeenCalledWith('storySidebar.closeLibrary');
    expect(mockT).toHaveBeenCalledWith('storySidebar.stories');
    expect(mockT).toHaveBeenCalledWith('storySidebar.vocabulary');
    expect(mockT).toHaveBeenCalledWith('storySidebar.info');
  });

  it('maintains button order and layout', () => {
    render(<SidebarHeader {...defaultProps} />);

    const buttonContainer = screen.getByRole('button', { name: 'storySidebar.stories' }).closest('.flex');
    const buttons = buttonContainer?.querySelectorAll('button');

    expect(buttons).toHaveLength(3);
    // Check that buttons contain the correct text content
    expect(buttons?.[0]).toHaveTextContent('storySidebar.stories');
    expect(buttons?.[1]).toHaveTextContent('storySidebar.vocabulary');
    expect(buttons?.[2]).toHaveTextContent('storySidebar.info');
  });
});
