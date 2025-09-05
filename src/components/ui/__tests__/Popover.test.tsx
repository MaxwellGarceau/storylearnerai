import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';

describe('Popover', () => {
  it('renders trigger and content (content rendered in portal)', () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <button>Open</button>
        </PopoverTrigger>
        <PopoverContent side='top'>Content</PopoverContent>
      </Popover>
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
    // Content may render in portal; assert by text existence
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
