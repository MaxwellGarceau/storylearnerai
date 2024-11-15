import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import StoryContainer from '../../story/StoryContainer';

describe('StoryContainer Component', () => {
  it('renders StoryRender when a story is submitted', () => {
    render(<StoryContainer />);

    // Find the textarea and submit button
    const textArea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /submit/i });

    // Simulate entering a story and submitting
    fireEvent.change(textArea, { target: { value: 'This is a test story.' } });
    fireEvent.click(submitButton);

    // Query specifically within the StoryRender container
    const storyRenderContainer = screen.getByText('Submitted Story:').closest('div');
    if (storyRenderContainer) {
      const { getByText } = within(storyRenderContainer);
      expect(getByText('This is a test story.')).toBeInTheDocument();
    } else {
      throw new Error('StoryRender container not found');
    }
  });

  it('integrates StoryUploadForm and StoryRender properly', () => {
    render(<StoryContainer />);

    // Simulate user input and submission
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Another story test.' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Query specifically within the StoryRender container
    const storyRenderContainer = screen.getByText('Submitted Story:').closest('div');
    if (storyRenderContainer) {
      const { getByText } = within(storyRenderContainer);
      expect(getByText('Another story test.')).toBeInTheDocument();
    } else {
      throw new Error('StoryRender container not found');
    }
  });
});
