import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StoryUploadForm from '../StoryUploadForm';
import { vi } from 'vitest';

describe('StoryUploadForm', () => {
  it('renders the form with correct Spanish to English translation context', () => {
    render(<StoryUploadForm onSubmitStory={vi.fn()} />);

    // Check for Spanish to English translation info
    expect(screen.getByText('Translation:')).toBeInTheDocument();
    expect(screen.getByText('Spanish → English')).toBeInTheDocument();
    expect(screen.getByText(/Enter your Spanish story below/)).toBeInTheDocument();

    // Check form elements
    expect(screen.getByRole('textbox', { name: /Spanish Story/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Difficulty \(CEFR\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Translate Story/i })).toBeInTheDocument();
  });

  it('has correct placeholder text for Spanish input', () => {
    render(<StoryUploadForm onSubmitStory={vi.fn()} />);
    const textArea = screen.getByRole('textbox', { name: /Spanish Story/i });

    expect(textArea).toHaveAttribute('placeholder', 'Ingresa tu historia en español aquí... (Enter your Spanish story here...)');
  });

  it('allows the user to type in the textarea', () => {
    render(<StoryUploadForm onSubmitStory={vi.fn()} />);
    const textArea = screen.getByRole('textbox', { name: /Spanish Story/i });

    fireEvent.change(textArea, { target: { value: 'Una historia de ejemplo' } });

    expect(textArea).toHaveValue('Una historia de ejemplo');
  });

  it('triggers onSubmitStory with complete form data when the form is submitted', () => {
    const onSubmitStoryMock = vi.fn();
    render(<StoryUploadForm onSubmitStory={onSubmitStoryMock} />);
    const textArea = screen.getByRole('textbox', { name: /Spanish Story/i });
    const submitButton = screen.getByRole('button', { name: /Translate Story/i });

    fireEvent.change(textArea, { target: { value: 'Historia de prueba' } });
    fireEvent.click(submitButton);

    expect(onSubmitStoryMock).toHaveBeenCalledWith({
      story: 'Historia de prueba',
      language: 'English',
      difficulty: 'A1',
    });
    expect(onSubmitStoryMock).toHaveBeenCalledTimes(1);
  });

  it('displays enhanced difficulty options with descriptions', () => {
    render(<StoryUploadForm onSubmitStory={vi.fn()} />);
    
    const difficultySelectTrigger = screen.getByLabelText('Select difficulty level');
    fireEvent.click(difficultySelectTrigger);

    // Check for enhanced difficulty options
    expect(screen.getByRole('option', { name: 'A1 (Beginner)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'A2 (Elementary)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'B1 (Intermediate)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'B2 (Upper Intermediate)' })).toBeInTheDocument();
  });

  it('handles select changes for difficulty', () => {
    render(<StoryUploadForm onSubmitStory={vi.fn()} />);
  
    const difficultySelectTrigger = screen.getByLabelText('Select difficulty level');
    fireEvent.click(difficultySelectTrigger);
  
    const difficultyOption = screen.getByRole('option', { name: 'B1 (Intermediate)' });
    fireEvent.click(difficultyOption);
  
    expect(screen.getByLabelText('Select difficulty level')).toHaveTextContent('B1');
  });

  it('displays helpful context information', () => {
    render(<StoryUploadForm onSubmitStory={vi.fn()} />);

    // Check for helper text
    expect(screen.getByText('Write or paste the Spanish story text you wish to translate to English.')).toBeInTheDocument();
    expect(screen.getByText('Currently only English translation is supported.')).toBeInTheDocument();
    expect(screen.getByText('The story will be adapted to this English proficiency level.')).toBeInTheDocument();
  });

  it('submits with different difficulty levels', () => {
    const onSubmitStoryMock = vi.fn();
    render(<StoryUploadForm onSubmitStory={onSubmitStoryMock} />);
    
    const textArea = screen.getByRole('textbox', { name: /Spanish Story/i });
    const difficultySelectTrigger = screen.getByLabelText('Select difficulty level');
    const submitButton = screen.getByRole('button', { name: /Translate Story/i });

    // Change difficulty to B2
    fireEvent.click(difficultySelectTrigger);
    fireEvent.click(screen.getByRole('option', { name: 'B2 (Upper Intermediate)' }));

    fireEvent.change(textArea, { target: { value: 'Historia compleja' } });
    fireEvent.click(submitButton);

    expect(onSubmitStoryMock).toHaveBeenCalledWith({
      story: 'Historia compleja',
      language: 'English',
      difficulty: 'B2',
    });
  });

  it('defaults to English language and A1 difficulty', () => {
    const onSubmitStoryMock = vi.fn();
    render(<StoryUploadForm onSubmitStory={onSubmitStoryMock} />);
    
    const textArea = screen.getByRole('textbox', { name: /Spanish Story/i });
    const submitButton = screen.getByRole('button', { name: /Translate Story/i });

    fireEvent.change(textArea, { target: { value: 'Historia básica' } });
    fireEvent.click(submitButton);

    expect(onSubmitStoryMock).toHaveBeenCalledWith({
      story: 'Historia básica',
      language: 'English',
      difficulty: 'A1',
    });
  });
});
