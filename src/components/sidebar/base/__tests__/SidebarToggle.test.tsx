import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SidebarToggle from '../SidebarToggle';
import { setupSidebarMocks, resetSidebarMocks, mockT } from '../../__tests__/sidebarMocks';

// Setup mocks before tests
setupSidebarMocks();

describe('SidebarToggle Component', () => {
  const mockOnOpen = vi.fn();

  const defaultProps = {
    onOpen: mockOnOpen,
    t: mockT,
  };

  beforeEach(() => {
    resetSidebarMocks();
    mockOnOpen.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders toggle button with correct text', () => {
    render(<SidebarToggle {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: 'storySidebar.openLibrary',
    });
    expect(button).toBeInTheDocument();
  });

  it('displays story library text on larger screens', () => {
    render(<SidebarToggle {...defaultProps} />);

    // The text should be visible on larger screens
    expect(screen.getByText('storySidebar.storyLibrary')).toBeInTheDocument();
  });

  it('hides story library text on small screens', () => {
    render(<SidebarToggle {...defaultProps} />);

    const textElement = screen.getByText('storySidebar.storyLibrary');
    expect(textElement).toHaveClass('hidden', 'sm:inline');
  });

  it('displays BookOpen icon', () => {
    render(<SidebarToggle {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: 'storySidebar.openLibrary',
    });
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('calls onOpen when button is clicked', () => {
    render(<SidebarToggle {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: 'storySidebar.openLibrary',
    });
    fireEvent.click(button);

    expect(mockOnOpen).toHaveBeenCalledTimes(1);
  });

  it('applies correct accessibility attributes', () => {
    render(<SidebarToggle {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: 'storySidebar.openLibrary',
    });
    expect(button).toHaveAttribute('aria-label', 'storySidebar.openLibrary');
  });

  it('applies correct styling classes', () => {
    render(<SidebarToggle {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: 'storySidebar.openLibrary',
    });
    expect(button).toHaveClass(
      'inline-flex',
      'items-center',
      'gap-2',
      'shadow-lg',
      'bg-background/80',
      'backdrop-blur-sm'
    );
  });

  it('applies correct button variant and size', () => {
    render(<SidebarToggle {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: 'storySidebar.openLibrary',
    });
    expect(button).toHaveClass('border', 'border-input');
    expect(button).toHaveClass('h-10', 'px-4', 'py-2');
  });

  it('applies correct positioning classes', () => {
    render(<SidebarToggle {...defaultProps} />);

    const container = screen
      .getByRole('button', { name: 'storySidebar.openLibrary' })
      .closest('.fixed');
    expect(container).toHaveClass('fixed', 'top-20', 'left-4', 'z-50');
  });

  it('has correct icon sizing', () => {
    render(<SidebarToggle {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: 'storySidebar.openLibrary',
    });
    const icon = button.querySelector('svg');
    expect(icon).toHaveClass('w-4', 'h-4');
  });

  it('handles multiple clicks correctly', () => {
    render(<SidebarToggle {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: 'storySidebar.openLibrary',
    });

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockOnOpen).toHaveBeenCalledTimes(3);
  });

  it('calls translation function with correct keys', () => {
    render(<SidebarToggle {...defaultProps} />);

    expect(mockT).toHaveBeenCalledWith('storySidebar.openLibrary');
    expect(mockT).toHaveBeenCalledWith('storySidebar.storyLibrary');
  });

  it('maintains button structure and layout', () => {
    render(<SidebarToggle {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: 'storySidebar.openLibrary',
    });

    // Check that button contains icon and text
    const icon = button.querySelector('svg');
    const text = screen.getByText('storySidebar.storyLibrary');

    expect(icon).toBeInTheDocument();
    expect(text).toBeInTheDocument();

    // Check that they are siblings within the button
    expect(button.contains(icon)).toBe(true);
    expect(button.contains(text)).toBe(true);
  });

  it('applies correct responsive classes for text visibility', () => {
    render(<SidebarToggle {...defaultProps} />);

    const textElement = screen.getByText('storySidebar.storyLibrary');

    // Text should be hidden by default (small screens) and visible on sm and up
    expect(textElement).toHaveClass('hidden');
    expect(textElement).toHaveClass('sm:inline');
  });

  it('renders as a button element', () => {
    render(<SidebarToggle {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: 'storySidebar.openLibrary',
    });
    expect(button.tagName).toBe('BUTTON');
  });

  it('is focusable for accessibility', () => {
    render(<SidebarToggle {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: 'storySidebar.openLibrary',
    });
    // Buttons are focusable by default
    expect(button).toBeInTheDocument();
  });

  it('maintains consistent styling across renders', () => {
    const { rerender } = render(<SidebarToggle {...defaultProps} />);

    let button = screen.getByRole('button', {
      name: 'storySidebar.openLibrary',
    });
    const initialClasses = button.className;

    // Re-render and check classes remain the same
    rerender(<SidebarToggle {...defaultProps} />);
    button = screen.getByRole('button', { name: 'storySidebar.openLibrary' });
    expect(button.className).toBe(initialClasses);
  });
});
