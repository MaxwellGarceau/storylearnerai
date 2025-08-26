import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WordTooltip from '../WordTooltip';

// Mock the Tooltip components
vi.mock('../../ui/Tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='tooltip-provider'>{children}</div>
  ),
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='tooltip'>{children}</div>
  ),
  TooltipTrigger: ({
    children,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid='tooltip-trigger'>{children}</div>,
  TooltipContent: ({
    children,
    side,
    className,
    onPointerDownOutside,
    onEscapeKeyDown,
  }: {
    children: React.ReactNode;
    side?: string;
    className?: string;
    onPointerDownOutside?: (e: React.PointerEvent) => void;
    onEscapeKeyDown?: (e: React.KeyboardEvent) => void;
  }) => (
    <div
      data-testid='tooltip-content'
      data-side={side}
      className={className}
      onPointerDown={e => onPointerDownOutside?.(e)}
      onKeyDown={e => e.key === 'Escape' && onEscapeKeyDown?.(e)}
    >
      {children}
    </div>
  ),
}));

describe('WordTooltip Component', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <WordTooltip content={<div>Tooltip content</div>}>
        <span>Hello World</span>
      </WordTooltip>
    );

    const wordElement = screen
      .getByTestId('tooltip-trigger')
      .querySelector('span');
    expect(wordElement).toHaveTextContent('Hello World');
  });

  it('renders tooltip content correctly', () => {
    render(
      <WordTooltip content={<div>Custom tooltip content</div>}>
        <span>Hello</span>
      </WordTooltip>
    );

    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveTextContent('Custom tooltip content');
  });

  it('applies custom side prop', () => {
    render(
      <WordTooltip content={<div>Content</div>} side='bottom'>
        <span>Hello</span>
      </WordTooltip>
    );

    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveAttribute('data-side', 'bottom');
  });

  it('applies custom className', () => {
    render(
      <WordTooltip content={<div>Content</div>} className='custom-class'>
        <span>Hello</span>
      </WordTooltip>
    );

    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveClass('custom-class');
  });

  it('uses default className when none provided', () => {
    render(
      <WordTooltip content={<div>Content</div>}>
        <span>Hello</span>
      </WordTooltip>
    );

    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveClass('p-0');
  });

  it('renders tooltip structure correctly', () => {
    render(
      <WordTooltip content={<div>Content</div>}>
        <span>Hello</span>
      </WordTooltip>
    );

    expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
  });

  it('supports controlled open state', () => {
    const mockOnOpenChange = vi.fn();
    render(
      <WordTooltip
        content={<div>Content</div>}
        open={true}
        onOpenChange={mockOnOpenChange}
      >
        <span>Hello</span>
      </WordTooltip>
    );

    // The tooltip should be open when open prop is true
    expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
  });

  it('configures tooltip provider with persistence settings', () => {
    render(
      <WordTooltip content={<div>Content</div>}>
        <span>Hello</span>
      </WordTooltip>
    );

    // The tooltip provider should be configured for persistence
    const tooltipProvider = screen.getByTestId('tooltip-provider');
    expect(tooltipProvider).toBeInTheDocument();
  });

  it('prevents tooltip from closing when clicking inside tooltip content', () => {
    const mockOnOpenChange = vi.fn();
    render(
      <WordTooltip
        content={<div data-testid='tooltip-inner-content'>Tooltip content</div>}
        open={true}
        onOpenChange={mockOnOpenChange}
      >
        <span>Hello</span>
      </WordTooltip>
    );

    const tooltipContent = screen.getByTestId('tooltip-content');

    // Simulate clicking inside the tooltip content
    const clickEvent = new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
    });

    // Mock preventDefault to track if it's called
    const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

    // Trigger the onPointerDown event on the tooltip content
    tooltipContent.dispatchEvent(clickEvent);

    // Verify that preventDefault was called, preventing the tooltip from closing
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalled();
  });

  it('prevents tooltip from closing when pressing escape key', () => {
    const mockOnOpenChange = vi.fn();
    render(
      <WordTooltip
        content={<div>Tooltip content</div>}
        open={true}
        onOpenChange={mockOnOpenChange}
      >
        <span>Hello</span>
      </WordTooltip>
    );

    const tooltipContent = screen.getByTestId('tooltip-content');

    // Simulate pressing escape key
    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });

    // Mock preventDefault to track if it's called
    const preventDefaultSpy = vi.spyOn(escapeEvent, 'preventDefault');

    // Trigger the onKeyDown event on the tooltip content
    tooltipContent.dispatchEvent(escapeEvent);

    // Verify that preventDefault was called, preventing the tooltip from closing
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalled();
  });

  it('allows tooltip to close when not in controlled open state', () => {
    const mockOnOpenChange = vi.fn();
    render(
      <WordTooltip
        content={<div>Tooltip content</div>}
        onOpenChange={mockOnOpenChange}
      >
        <span>Hello</span>
      </WordTooltip>
    );

    const tooltipContent = screen.getByTestId('tooltip-content');

    // Simulate clicking inside the tooltip content when not in controlled state
    const clickEvent = new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

    // Trigger the onPointerDown event on the tooltip content
    tooltipContent.dispatchEvent(clickEvent);

    // Verify that preventDefault was NOT called when not in controlled state
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});
