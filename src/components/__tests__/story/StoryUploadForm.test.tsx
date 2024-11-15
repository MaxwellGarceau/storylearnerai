import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StoryUploadForm from '../../story/StoryUploadForm';
import { vi } from 'vitest';

describe('StoryUploadForm', () => {
  it('renders the form with a textarea, language select, difficulty select, and submit button', () => {
    render(<StoryUploadForm onSubmitStory={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: /Story/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Translation Language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Story Difficulty \(CEFR\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });

  it('allows the user to type in the textarea', () => {
    render(<StoryUploadForm onSubmitStory={vi.fn()} />);
    const textArea = screen.getByRole('textbox', { name: /Story/i });

    fireEvent.change(textArea, { target: { value: 'A sample story' } });

    expect(textArea).toHaveValue('A sample story');
  });

  it('triggers onSubmitStory when the form is submitted', () => {
    const onSubmitStoryMock = vi.fn();
    render(<StoryUploadForm onSubmitStory={onSubmitStoryMock} />);
    const textArea = screen.getByRole('textbox', { name: /Story/i });
    const submitButton = screen.getByRole('button', { name: /Submit/i });

    fireEvent.change(textArea, { target: { value: 'Test story' } });
    fireEvent.click(submitButton);

    expect(onSubmitStoryMock).toHaveBeenCalledWith('Test story');
    expect(onSubmitStoryMock).toHaveBeenCalledTimes(1);
  });

  it('handles select changes for language', () => {
    render(<StoryUploadForm onSubmitStory={vi.fn()} />);
  
    const languageSelectTrigger = screen.getByLabelText('Select translation language');
    fireEvent.click(languageSelectTrigger);
  
    // More specific query to select the option
    const languageOption = screen.getByRole('option', { name: 'English' });
    fireEvent.click(languageOption);
  
    expect(screen.getByLabelText('Select translation language')).toHaveTextContent('English');
  });
  
  it('handles select changes for difficulty', () => {
    render(<StoryUploadForm onSubmitStory={vi.fn()} />);
  
    const difficultySelectTrigger = screen.getByLabelText('Select difficulty level');
    fireEvent.click(difficultySelectTrigger);
  
    // More specific query to select the option
    const difficultyOption = screen.getByRole('option', { name: 'B1' });
    fireEvent.click(difficultyOption);
  
    expect(screen.getByLabelText('Select difficulty level')).toHaveTextContent('B1');
  });
  
});
