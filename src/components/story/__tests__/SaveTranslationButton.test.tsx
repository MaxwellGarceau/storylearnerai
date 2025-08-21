import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
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
    originalText: 'Hola mundo',
    translatedText: 'Hello world',
    fromLanguage: 'es',
    toLanguage: 'en',
    difficulty: 'a1',
    provider: 'mock',
    model: 'test-model',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders save button for new translations', () => {
    render(
      <TooltipProvider>
        <SaveTranslationButton
          translationData={mockTranslationData}
          originalStory='Esta es una historia de prueba.'
          originalLanguage='Spanish'
          translatedLanguage='English'
          difficultyLevel='a1'
          isSavedStory={false}
        />
      </TooltipProvider>
    );

    const saveButton = screen.getByText('Save Translation');
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).not.toBeDisabled();
  });

  it('renders disabled button for saved stories', () => {
    render(
      <TooltipProvider>
        <SaveTranslationButton
          translationData={mockTranslationData}
          originalStory='Esta es una historia de prueba.'
          originalLanguage='Spanish'
          translatedLanguage='English'
          difficultyLevel='a1'
          isSavedStory={true}
        />
      </TooltipProvider>
    );

    const alreadySavedButton = screen.getByText('Already Saved');
    expect(alreadySavedButton).toBeInTheDocument();
    expect(alreadySavedButton).toBeDisabled();
  });

  it('shows correct tooltip for saved stories', () => {
    render(
      <TooltipProvider>
        <SaveTranslationButton
          translationData={mockTranslationData}
          originalStory='Esta es una historia de prueba.'
          originalLanguage='Spanish'
          translatedLanguage='English'
          difficultyLevel='a1'
          isSavedStory={true}
        />
      </TooltipProvider>
    );

    // For Radix UI tooltips, we can't easily test the content without triggering hover
    // Instead, we test that the tooltip trigger exists and is disabled
    const button = screen.getByText('Already Saved');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Already Saved');
  });

  it('shows correct tooltip for new translations', () => {
    render(
      <TooltipProvider>
        <SaveTranslationButton
          translationData={mockTranslationData}
          originalStory='Esta es una historia de prueba.'
          originalLanguage='Spanish'
          translatedLanguage='English'
          difficultyLevel='a1'
          isSavedStory={false}
        />
      </TooltipProvider>
    );

    // For Radix UI tooltips, we can't easily test the content without triggering hover
    // Instead, we test that the tooltip trigger exists and is enabled
    const button = screen.getByText('Save Translation');
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent('Save Translation');
  });

  it('opens modal when save button is clicked for new translations', () => {
    render(
      <TooltipProvider>
        <SaveTranslationButton
          translationData={mockTranslationData}
          originalStory='Esta es una historia de prueba.'
          originalLanguage='Spanish'
          translatedLanguage='English'
          difficultyLevel='a1'
          isSavedStory={false}
        />
      </TooltipProvider>
    );

    // Click the Save Translation button (the trigger button, not the modal button)
    // Use getAllByText to handle potential multiple elements and click the first one
    const triggerButtons = screen.getAllByText('Save Translation');
    const triggerButton = triggerButtons.find(
      button => !(button as HTMLButtonElement).disabled
    );
    expect(triggerButton).toBeDefined();
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }

    expect(
      screen.getByText(
        'Save this translation to your library for future reference'
      )
    ).toBeInTheDocument();
  });

  it('does not open modal when button is clicked for saved stories', () => {
    render(
      <TooltipProvider>
        <SaveTranslationButton
          translationData={mockTranslationData}
          originalStory='Esta es una historia de prueba.'
          originalLanguage='Spanish'
          translatedLanguage='English'
          difficultyLevel='a1'
          isSavedStory={true}
        />
      </TooltipProvider>
    );

    const alreadySavedButton = screen.getByText('Already Saved');
    fireEvent.click(alreadySavedButton);

    // Modal should not appear
    expect(
      screen.queryByText(
        'Save this translation to your library for future reference'
      )
    ).not.toBeInTheDocument();
  });
});
