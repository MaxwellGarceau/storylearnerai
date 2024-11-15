import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import StoryRender from '../StoryRender';

describe('StoryRender Component', () => {
  it('renders the component when content is provided', () => {
    const testContent = 'This is a test story.';

    render(<StoryRender content={testContent} />);

    // Check if the heading and content are present
    expect(screen.getByText('Submitted Story:')).toBeInTheDocument();
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('does not render anything when content is not provided', () => {
    const { container } = render(<StoryRender content="" />);

    // Check if the container is empty
    expect(container.firstChild).toBeNull();
  });

  it('applies the correct classes for styling', () => {
    const testContent = 'Styling test content.';

    render(<StoryRender content={testContent} />);
    
    // Check if the rendered div has the appropriate class names
    const container = screen.getByText('Submitted Story:').closest('div');
    expect(container).toHaveClass('mt-4 p-4 border rounded bg-gray-100');
  });
});
