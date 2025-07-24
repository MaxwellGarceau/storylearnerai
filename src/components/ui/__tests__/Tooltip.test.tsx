import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../Tooltip';

describe('Tooltip Component', () => {
  it('renders tooltip with content', () => {
    render(
      <TooltipProvider>
        <Tooltip>
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
    expect(screen.getByText('This is a tooltip')).toBeInTheDocument();
  });

  it('renders tooltip with custom styling', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent className="custom-class">
            Custom styled tooltip
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const tooltipContent = screen.getByText('Custom styled tooltip');
    expect(tooltipContent).toHaveClass('custom-class');
  });

  it('renders tooltip with side offset', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            Tooltip with offset
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const tooltipContent = screen.getByText('Tooltip with offset');
    expect(tooltipContent).toBeInTheDocument();
  });
}); 