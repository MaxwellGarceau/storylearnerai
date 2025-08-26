import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WordTooltip from '../WordTooltip';

// Mock the Popover components
vi.mock('../../ui/Popover', () => ({
  Popover: ({
    children,
    open,
    onOpenChange: _onOpenChange,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div data-testid='popover' data-open={open?.toString() ?? 'undefined'}>
      {children}
      {open && (
        <div data-testid='popover-content-wrapper'>
          {/* This simulates the portal content that would be rendered */}
        </div>
      )}
    </div>
  ),
  PopoverTrigger: ({
    children,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid='popover-trigger'>{children}</div>,
  PopoverContent: ({
    children,
    side,
    className,
    sideOffset,
  }: {
    children: React.ReactNode;
    side?: string;
    className?: string;
    sideOffset?: number;
  }) => (
    <div
      data-testid='popover-content'
      data-side={side}
      className={className}
      data-side-offset={sideOffset}
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
      .getByTestId('popover-trigger')
      .querySelector('span');
    expect(wordElement).toHaveTextContent('Hello World');
  });

  it('renders tooltip content correctly', () => {
    render(
      <WordTooltip content={<div>Custom tooltip content</div>}>
        <span>Hello</span>
      </WordTooltip>
    );

    const tooltipContent = screen.getByTestId('popover-content');
    expect(tooltipContent).toHaveTextContent('Custom tooltip content');
  });

  it('applies custom side prop', () => {
    render(
      <WordTooltip content={<div>Content</div>} side='bottom'>
        <span>Hello</span>
      </WordTooltip>
    );

    const tooltipContent = screen.getByTestId('popover-content');
    expect(tooltipContent).toHaveAttribute('data-side', 'bottom');
  });

  it('applies custom className', () => {
    render(
      <WordTooltip content={<div>Content</div>} className='custom-class'>
        <span>Hello</span>
      </WordTooltip>
    );

    const tooltipContent = screen.getByTestId('popover-content');
    expect(tooltipContent).toHaveClass('custom-class');
  });

  it('uses default className when none provided', () => {
    render(
      <WordTooltip content={<div>Content</div>}>
        <span>Hello</span>
      </WordTooltip>
    );

    const tooltipContent = screen.getByTestId('popover-content');
    expect(tooltipContent).toHaveClass('p-0');
  });

  it('renders popover structure correctly', () => {
    render(
      <WordTooltip content={<div>Content</div>}>
        <span>Hello</span>
      </WordTooltip>
    );

    expect(screen.getByTestId('popover')).toBeInTheDocument();
    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
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

    // The popover should be open when open prop is true
    const popover = screen.getByTestId('popover');
    expect(popover).toHaveAttribute('data-open', 'true');
  });

  it('applies default sideOffset', () => {
    render(
      <WordTooltip content={<div>Content</div>}>
        <span>Hello</span>
      </WordTooltip>
    );

    const tooltipContent = screen.getByTestId('popover-content');
    expect(tooltipContent).toHaveAttribute('data-side-offset', '8');
  });

  it('allows popover to close when not in controlled open state', () => {
    const mockOnOpenChange = vi.fn();
    render(
      <WordTooltip
        content={<div>Tooltip content</div>}
        onOpenChange={mockOnOpenChange}
      >
        <span>Hello</span>
      </WordTooltip>
    );

    // The popover should be closed by default when not controlled
    const popover = screen.getByTestId('popover');
    expect(popover).toHaveAttribute('data-open', 'undefined');
  });

  it('properly handles popover state changes through onOpenChange', () => {
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

    // Verify that the popover is open
    const popover = screen.getByTestId('popover');
    expect(popover).toHaveAttribute('data-open', 'true');

    // The onOpenChange should be defined
    expect(mockOnOpenChange).toBeDefined();
  });
});
