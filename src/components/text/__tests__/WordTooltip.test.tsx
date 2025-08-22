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
  }: {
    children: React.ReactNode;
    side?: string;
    className?: string;
  }) => (
    <div data-testid='tooltip-content' data-side={side} className={className}>
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
});
