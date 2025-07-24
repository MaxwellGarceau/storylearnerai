import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SaveTranslationButton from '../SaveTranslationButton';
import { TranslationResponse } from '../../../lib/translationService';

// Mock the hooks
vi.mock('../../../hooks/useSavedTranslations', () => ({
  useSavedTranslations: () => ({
    createSavedTranslation: vi.fn(),
    isCreating: false,
  }),
}));

vi.mock('../../../hooks/useSupabase', () => ({
  useSupabase: () => ({
    user: { id: 'test-user-id' },
  }),
}));

vi.mock('../../../hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('SaveTranslationButton Component', () => {
  const mockTranslationData: TranslationResponse = {
    originalText: 'Esta es una historia de prueba.',
    translatedText: 'This is a test story.',
    fromLanguage: 'Spanish',
    toLanguage: 'English',
    difficulty: 'A1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders save button for new translations', () => {
    render(
      <SaveTranslationButton
        translationData={mockTranslationData}
        originalStory="Esta es una historia de prueba."
        originalLanguage="Spanish"
        translatedLanguage="English"
        difficultyLevel="A1"
        isSavedStory={false}
      />
    );

    expect(screen.getByText('Save Translation')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('renders disabled button for saved stories', () => {
    render(
      <SaveTranslationButton
        translationData={mockTranslationData}
        originalStory="Esta es una historia de prueba."
        originalLanguage="Spanish"
        translatedLanguage="English"
        difficultyLevel="A1"
        isSavedStory={true}
      />
    );

    expect(screen.getByText('Already Saved')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows correct tooltip for saved stories', () => {
    render(
      <SaveTranslationButton
        translationData={mockTranslationData}
        originalStory="Esta es una historia de prueba."
        originalLanguage="Spanish"
        translatedLanguage="English"
        difficultyLevel="A1"
        isSavedStory={true}
      />
    );

    // The tooltip content should be in the DOM
    expect(screen.getByText('The ability to edit and resave already translated stories is under construction =)')).toBeInTheDocument();
  });

  it('shows correct tooltip for new translations', () => {
    render(
      <SaveTranslationButton
        translationData={mockTranslationData}
        originalStory="Esta es una historia de prueba."
        originalLanguage="Spanish"
        translatedLanguage="English"
        difficultyLevel="A1"
        isSavedStory={false}
      />
    );

    // The tooltip content should be in the DOM
    expect(screen.getByText('Save this translation')).toBeInTheDocument();
  });

  it('opens modal when save button is clicked for new translations', () => {
    render(
      <SaveTranslationButton
        translationData={mockTranslationData}
        originalStory="Esta es una historia de prueba."
        originalLanguage="Spanish"
        translatedLanguage="English"
        difficultyLevel="A1"
        isSavedStory={false}
      />
    );

    fireEvent.click(screen.getByText('Save Translation'));
    
    expect(screen.getByText('Save Translation')).toBeInTheDocument();
    expect(screen.getByText('Save this translation to your library for future reference')).toBeInTheDocument();
  });

  it('does not open modal when button is clicked for saved stories', () => {
    render(
      <SaveTranslationButton
        translationData={mockTranslationData}
        originalStory="Esta es una historia de prueba."
        originalLanguage="Spanish"
        translatedLanguage="English"
        difficultyLevel="A1"
        isSavedStory={true}
      />
    );

    fireEvent.click(screen.getByText('Already Saved'));
    
    // Modal should not appear
    expect(screen.queryByText('Save this translation to your library for future reference')).not.toBeInTheDocument();
  });
}); 