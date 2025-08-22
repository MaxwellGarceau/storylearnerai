import React from 'react';
import {
  render,
  fireEvent,
  screen,
  within,
  cleanup,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WordHighlight from '../WordHighlight';

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
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='tooltip-content'>{children}</div>
  ),
}));

describe('WordHighlight Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the word correctly', () => {
    render(<WordHighlight word='hello' />);
    const wordElement = screen
      .getByTestId('tooltip-trigger')
      .querySelector('span');
    expect(wordElement).toHaveTextContent('hello');
  });

  it('renders children when provided', () => {
    render(<WordHighlight word='hello'>Hello World</WordHighlight>);
    const wordElement = screen
      .getByTestId('tooltip-trigger')
      .querySelector('span');
    expect(wordElement).toHaveTextContent('Hello World');
  });

  it('applies hover styles on mouse enter', () => {
    render(<WordHighlight word='hello' />);
    const wordElement = screen
      .getByTestId('tooltip-trigger')
      .querySelector('span') as HTMLElement;

    fireEvent.mouseEnter(wordElement);
    expect(wordElement).toHaveClass('bg-blue-100');
  });

  it('removes hover styles on mouse leave', () => {
    render(<WordHighlight word='hello' />);
    const wordElement = screen
      .getByTestId('tooltip-trigger')
      .querySelector('span') as HTMLElement;

    fireEvent.mouseEnter(wordElement);
    fireEvent.mouseLeave(wordElement);
    expect(wordElement).not.toHaveClass('bg-blue-100');
  });

  it('has correct base styling classes', () => {
    render(<WordHighlight word='hello' />);
    const wordElement = screen
      .getByTestId('tooltip-trigger')
      .querySelector('span');

    expect(wordElement).toHaveClass(
      'inline-block',
      'cursor-pointer',
      'transition-colors',
      'duration-200',
      'rounded',
      'px-0.5'
    );
  });

  it('renders tooltip structure correctly', () => {
    render(<WordHighlight word='hello' />);

    expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
  });

  it('displays word in tooltip content', () => {
    render(<WordHighlight word='hello' />);

    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(within(tooltipContent).getByText('hello')).toBeInTheDocument();
    expect(
      within(tooltipContent).getByText('Dictionary info coming soon...')
    ).toBeInTheDocument();
  });
});
