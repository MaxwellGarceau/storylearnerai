import { render, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import StoryUploadForm from '../StoryUploadForm';
import { vi, afterEach } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'storyInput.translation': 'Translation:',
        'storyInput.enterYour': 'Enter your',
        'storyInput.storyBelowAndItWillBeTranslatedTo': 'story below, and it will be translated to',
        'storyInput.atYourSelectedDifficultyLevel': 'at your selected difficulty level.',
        'storyInput.targetLanguage': 'Target Language',
        'storyInput.currentlyOnly': 'Currently only',
        'storyInput.translationIsSupported': 'translation is supported.',
        'storyInput.theStoryWillBeAdaptedToThis': 'The story will be adapted to this',
        'storyInput.proficiencyLevel': 'proficiency level.',
        'storyInput.translateStory': 'Translate Story',
        'storyInput.placeholder': 'Ingresa tu historia en español aquí... (Enter your Spanish story here...)',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock the useLanguages hook
vi.mock('../../hooks/useLanguages', () => ({
  useLanguages: () => ({
    getLanguageName: (code: string) => {
      const languageMap: Record<string, string> = {
        'es': 'Spanish',
        'en': 'English',
        'fr': 'French',
        'de': 'German',
      };
      return languageMap[code] || code;
    },
    languages: [],
    loading: false,
    error: null,
    languageMap: new Map([
      ['es', 'Spanish'],
      ['en', 'English'],
      ['fr', 'French'],
      ['de', 'German'],
    ]),
  }),
}));

describe('StoryUploadForm', () => {
  // Cleanup after each test to prevent DOM pollution
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the form with correct Spanish to English translation context', () => {
    const { container } = render(<StoryUploadForm onSubmitStory={vi.fn()} />);

    // Check for Spanish to English translation info within this container
    expect(within(container).getByText('Translation:')).toBeInTheDocument();
    expect(within(container).getByText('Spanish → English')).toBeInTheDocument();
    expect(within(container).getByText(/Enter your Spanish story below/)).toBeInTheDocument();

    // Check form elements
    expect(within(container).getByRole('textbox', { name: /Spanish Story/i })).toBeInTheDocument();
    expect(within(container).getByLabelText(/Target Language/i)).toBeInTheDocument();
    expect(within(container).getByLabelText(/Target Difficulty \(CEFR\)/i)).toBeInTheDocument();
    expect(within(container).getByRole('button', { name: /Translate Story/i })).toBeInTheDocument();
  });

  it('has correct placeholder text for Spanish input', () => {
    const { container } = render(<StoryUploadForm onSubmitStory={vi.fn()} />);
    const textArea = within(container).getByRole('textbox', { name: /Spanish Story/i });

    expect(textArea).toHaveAttribute('placeholder', 'Ingresa tu historia en español aquí... (Enter your Spanish story here...)');
  });

  it('allows the user to type in the textarea', () => {
    const { container } = render(<StoryUploadForm onSubmitStory={vi.fn()} />);
    const textArea = within(container).getByRole('textbox', { name: /Spanish Story/i });

    fireEvent.change(textArea, { target: { value: 'Una historia de ejemplo' } });

    expect(textArea).toHaveValue('Una historia de ejemplo');
  });

  it('triggers onSubmitStory with complete form data when the form is submitted', () => {
    const onSubmitStoryMock = vi.fn();
    const { container } = render(<StoryUploadForm onSubmitStory={onSubmitStoryMock} />);
    const textArea = within(container).getByRole('textbox', { name: /Spanish Story/i });
    const submitButton = within(container).getByRole('button', { name: /Translate Story/i });

    fireEvent.change(textArea, { target: { value: 'Historia de prueba' } });
    fireEvent.click(submitButton);

    expect(onSubmitStoryMock).toHaveBeenCalledWith({
      story: 'Historia de prueba',
      language: 'en',
      difficulty: 'a1',
    });
    expect(onSubmitStoryMock).toHaveBeenCalledTimes(1);
  });

  it('displays enhanced difficulty options with descriptions', () => {
    const { container } = render(<StoryUploadForm onSubmitStory={vi.fn()} />);
    
    const difficultySelectTrigger = within(container).getByLabelText('Select difficulty level');
    fireEvent.click(difficultySelectTrigger);

    // Check for enhanced difficulty options within this container
    expect(within(container).getByRole('option', { name: 'A1 (Beginner)' })).toBeInTheDocument();
    expect(within(container).getByRole('option', { name: 'A2 (Elementary)' })).toBeInTheDocument();
    expect(within(container).getByRole('option', { name: 'B1 (Intermediate)' })).toBeInTheDocument();
    expect(within(container).getByRole('option', { name: 'B2 (Upper Intermediate)' })).toBeInTheDocument();
  });

  it('handles select changes for difficulty', () => {
    const { container } = render(<StoryUploadForm onSubmitStory={vi.fn()} />);
  
    const difficultySelectTrigger = within(container).getByLabelText('Select difficulty level');
    fireEvent.click(difficultySelectTrigger);
  
    const difficultyOption = within(container).getByRole('option', { name: 'B1 (Intermediate)' });
    fireEvent.click(difficultyOption);
  
    expect(within(container).getByLabelText('Select difficulty level')).toHaveTextContent('b1');
  });

  it('displays helpful context information', () => {
    const { container } = render(<StoryUploadForm onSubmitStory={vi.fn()} />);

    // Check for helper text within this container
    expect(within(container).getByText('Write or paste the Spanish story text you wish to translate to English.')).toBeInTheDocument();
    expect(within(container).getByText('Currently only English translation is supported.')).toBeInTheDocument();
    expect(within(container).getByText('The story will be adapted to this English proficiency level.')).toBeInTheDocument();
  });

  it('submits with different difficulty levels', () => {
    const onSubmitStoryMock = vi.fn();
    const { container } = render(<StoryUploadForm onSubmitStory={onSubmitStoryMock} />);
    
    const textArea = within(container).getByRole('textbox', { name: /Spanish Story/i });
    const difficultySelectTrigger = within(container).getByLabelText('Select difficulty level');
    const submitButton = within(container).getByRole('button', { name: /Translate Story/i });

    // Change difficulty to B2
    fireEvent.click(difficultySelectTrigger);
    fireEvent.click(within(container).getByRole('option', { name: 'B2 (Upper Intermediate)' }));

    fireEvent.change(textArea, { target: { value: 'Historia compleja' } });
    fireEvent.click(submitButton);

    expect(onSubmitStoryMock).toHaveBeenCalledWith({
      story: 'Historia compleja',
      language: 'en',
      difficulty: 'b2',
    });
  });

  it('defaults to English language and A1 difficulty', () => {
    const onSubmitStoryMock = vi.fn();
    const { container } = render(<StoryUploadForm onSubmitStory={onSubmitStoryMock} />);
    
    const textArea = within(container).getByRole('textbox', { name: /Spanish Story/i });
    const submitButton = within(container).getByRole('button', { name: /Translate Story/i });

    fireEvent.change(textArea, { target: { value: 'Historia básica' } });
    fireEvent.click(submitButton);

    expect(onSubmitStoryMock).toHaveBeenCalledWith({
      story: 'Historia básica',
      language: 'en',
      difficulty: 'a1',
    });
  });
});
