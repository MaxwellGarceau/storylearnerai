import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../Tooltip';

describe('Tooltip Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders tooltip with content', () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger asChild>
            <button>Hover me</button>
          </TooltipTrigger>
          <TooltipContent>
            This is a tooltip
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.getByText('Hover me')).toBeInTheDocument();
    // Use getAllByText to handle multiple elements (visible + hidden for accessibility)
    const tooltipElements = screen.getAllByText('This is a tooltip');
    expect(tooltipElements.length).toBeGreaterThan(0);
  });

  it('renders tooltip with custom styling', () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger asChild>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent className="custom-class">
            Custom styled tooltip
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    // Find the visible tooltip content (not the hidden accessibility one)
    const tooltipElements = screen.getAllByText('Custom styled tooltip');
    const visibleTooltip = tooltipElements.find(el => !el.style.clip && !el.style.overflow?.includes('hidden'));
    expect(visibleTooltip).toHaveClass('custom-class');
  });

  it('renders tooltip with side offset', () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger asChild>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            Tooltip with offset
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    // Use getAllByText to handle multiple elements
    const tooltipElements = screen.getAllByText('Tooltip with offset');
    expect(tooltipElements.length).toBeGreaterThan(0);
  });
}); 