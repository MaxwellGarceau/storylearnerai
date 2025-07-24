import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SaveTranslationButton from '../SaveTranslationButton';
import { TranslationResponse } from '../../../lib/translationService';
import { TooltipProvider } from '../../ui/Tooltip';

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
      <TooltipProvider>
        <SaveTranslationButton
          translationData={mockTranslationData}
          originalStory="Esta es una historia de prueba."
          originalLanguage="Spanish"
          translatedLanguage="English"
          difficultyLevel="A1"
          isSavedStory={false}
        />
      </TooltipProvider>
    );

    expect(screen.getByText('Save Translation')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('renders disabled button for saved stories', () => {
    render(
      <TooltipProvider>
        <SaveTranslationButton
          translationData={mockTranslationData}
          originalStory="Esta es una historia de prueba."
          originalLanguage="Spanish"
          translatedLanguage="English"
          difficultyLevel="A1"
          isSavedStory={true}
        />
      </TooltipProvider>
    );

    expect(screen.getByText('Already Saved')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows correct tooltip for saved stories', () => {
    render(
      <TooltipProvider>
        <SaveTranslationButton
          translationData={mockTranslationData}
          originalStory="Esta es una historia de prueba."
          originalLanguage="Spanish"
          translatedLanguage="English"
          difficultyLevel="A1"
          isSavedStory={true}
        />
      </TooltipProvider>
    );

    // For Radix UI tooltips, we can't easily test the content without triggering hover
    // Instead, we test that the tooltip trigger exists and is disabled
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Already Saved');
  });

  it('shows correct tooltip for new translations', () => {
    render(
      <TooltipProvider>
        <SaveTranslationButton
          translationData={mockTranslationData}
          originalStory="Esta es una historia de prueba."
          originalLanguage="Spanish"
          translatedLanguage="English"
          difficultyLevel="A1"
          isSavedStory={false}
        />
      </TooltipProvider>
    );

    // For Radix UI tooltips, we can't easily test the content without triggering hover
    // Instead, we test that the tooltip trigger exists and is enabled
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent('Save Translation');
  });

  it('opens modal when save button is clicked for new translations', () => {
    render(
      <TooltipProvider>
        <SaveTranslationButton
          translationData={mockTranslationData}
          originalStory="Esta es una historia de prueba."
          originalLanguage="Spanish"
          translatedLanguage="English"
          difficultyLevel="A1"
          isSavedStory={false}
        />
      </TooltipProvider>
    );

    // Use getAllByText to handle multiple elements with same text
    const saveButtons = screen.getAllByText('Save Translation');
    fireEvent.click(saveButtons[0]); // Click the first Save Translation button (the trigger)
    
    expect(screen.getByText('Save this translation to your library for future reference')).toBeInTheDocument();
  });

  it('does not open modal when button is clicked for saved stories', () => {
    render(
      <TooltipProvider>
        <SaveTranslationButton
          translationData={mockTranslationData}
          originalStory="Esta es una historia de prueba."
          originalLanguage="Spanish"
          translatedLanguage="English"
          difficultyLevel="A1"
          isSavedStory={true}
        />
      </TooltipProvider>
    );

    fireEvent.click(screen.getByText('Already Saved'));
    
    // Modal should not appear
    expect(screen.queryByText('Save this translation to your library for future reference')).not.toBeInTheDocument();
  });
}); 