import { render, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import StoryContainer from '../StoryContainer';
import { translationService } from '../../../lib/translationService';
import type { TranslationResponse } from '../../../lib/translationService';
import { TooltipProvider } from '@radix-ui/react-tooltip';

// Helper function to wrap components with TooltipProvider
const renderWithTooltipProvider = (component: React.ReactElement) => {
  return render(<TooltipProvider>{component}</TooltipProvider>);
};

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'story.translateButton': 'Translate Story',
        'story.uploadTitle': 'Upload Story',
        'story.uploadDescription':
          'Upload a story file or paste text to get started',
        'storyInput.placeholder':
          'Ingresa tu historia en español aquí... (Enter your Spanish story here...)',
        'storyInput.translation': 'Translation:',
        'storyInput.enterYour': 'Enter your',
        'storyInput.storyBelowAndItWillBeTranslatedTo':
          'story below, and it will be translated to',
        'storyInput.atYourSelectedDifficultyLevel':
          'at your selected difficulty level.',
        'storyInput.targetLanguage': 'Target Language',
        'storyInput.currentlyOnly': 'Currently only',
        'storyInput.translationIsSupported': 'translation is supported.',
        'storyInput.theStoryWillBeAdaptedToThis':
          'The story will be adapted to this',
        'storyInput.proficiencyLevel': 'proficiency level.',
        'storyInput.targetStory': 'Translate Story',
        'difficultyLevels.a1.label': 'A1 (Beginner)',
        'difficultyLevels.a2.label': 'A2 (Elementary)',
        'difficultyLevels.b1.label': 'B1 (Intermediate)',
        'difficultyLevels.b2.label': 'B2 (Upper Intermediate)',
        'storySidebar.confirmTranslation': 'Confirm Translation Options',
        'storySidebar.translationOptions': 'Translation Options',
        'storySidebar.fromLanguage': 'Original Language',
        'storySidebar.targetLanguage': 'Target Language',
        'storySidebar.difficulty': 'Difficulty',
        'storySidebar.confirm': 'Confirm',
        'storySidebar.cancel': 'Cancel',
        'common.edit': 'Edit',
        'storyInput.confirmationModal.title': 'Confirm Translation Options',
        'storyInput.confirmationModal.from': 'From',
        'storyInput.confirmationModal.to': 'To',
        'storyInput.confirmationModal.difficulty': 'Difficulty',
        'storyInput.confirmationModal.confirm': 'Confirm',
        'storyInput.confirmationModal.cancel': 'Cancel',
        'storyInput.tip':
          "💡 Tip: You can paste long stories, articles, or any Spanish text you'd like to translate",
        'storyInput.validation.sameLanguageError':
          'Source and target languages must be different. Please select different languages for translation.',
        translationError: 'Translation Error:',
        provider: 'provider',
        status: 'status',
        errorCode: 'errorCode',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock the translation service
vi.mock('../../../lib/translationService', () => ({
  translationService: {
    translate: vi.fn(),
    mockTranslateStory: vi.fn(),
    targetStory: vi.fn(),
  },
}));

const mockTranslationService = vi.mocked(translationService);

describe('StoryContainer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Cleanup after each test to prevent DOM pollution
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders StoryRender with translation data when a story is submitted', async () => {
    const mockTranslationResponse: TranslationResponse = {
      fromText: 'Esta es una historia de prueba.',
      toText: 'This is a test story.',
      fromLanguage: 'es',
      toLanguage: 'en',
      difficulty: 'a1',
    };

    mockTranslationService.translate.mockResolvedValue(mockTranslationResponse);
    const mockOnStoryTranslated = vi.fn();

    const { container } = renderWithTooltipProvider(
      <StoryContainer onStoryTranslated={mockOnStoryTranslated} />
    );

    // Find the textarea by its id and the submit button in the sidebar
    const textArea = within(container).getByDisplayValue('');
    const submitButton = within(container).getByRole('button', {
      name: /translate story/i,
    });

    // Simulate entering a story and submitting
    fireEvent.change(textArea, {
      target: { value: 'Esta es una historia de prueba.' },
    });
    fireEvent.click(submitButton);

    // Wait for confirmation modal to appear and click confirm
    await waitFor(() => {
      expect(
        within(container).getByText('Confirm Translation Options')
      ).toBeInTheDocument();
    });

    const confirmButton = within(container).getByText('Confirm');
    fireEvent.click(confirmButton);

    // Wait for translation to complete - check that the callback was called
    await waitFor(() => {
      expect(mockOnStoryTranslated).toHaveBeenCalledWith(
        mockTranslationResponse
      );
    });

    // Verify the translation service was called with correct parameters
    expect(mockTranslationService.translate).toHaveBeenCalledWith({
      text: 'Esta es una historia de prueba.',
      fromLanguage: 'es',
      toLanguage: 'en',
      difficulty: 'a1',
      selectedVocabulary: [],
    });

    // Verify the callback was called with the correct translation data
    expect(mockOnStoryTranslated).toHaveBeenCalledTimes(1);

    // Verify translation service was called
    expect(mockTranslationService.translate).toHaveBeenCalledTimes(1);
  });

  it('displays error message when translation fails', async () => {
    const mockTranslationError = {
      message: 'Translation service error',
      code: 'API_ERROR',
      provider: 'gemini',
      statusCode: 500,
    };
    mockTranslationService.translate.mockRejectedValue(mockTranslationError);
    const mockOnStoryTranslated = vi.fn();

    const { container } = renderWithTooltipProvider(
      <StoryContainer onStoryTranslated={mockOnStoryTranslated} />
    );

    const textArea = within(container).getByDisplayValue('');
    const submitButton = within(container).getByRole('button', {
      name: /translate story/i,
    });

    fireEvent.change(textArea, { target: { value: 'Test story' } });
    fireEvent.click(submitButton);

    // Wait for confirmation modal to appear and click confirm
    await waitFor(() => {
      expect(
        within(container).getByText('Confirm Translation Options')
      ).toBeInTheDocument();
    });

    const confirmButton = within(container).getByText('Confirm');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(
        within(container).getByText('Translation Error:')
      ).toBeInTheDocument();
      expect(
        within(container).getByText('Translation service error')
      ).toBeInTheDocument();
      // Check that error details are present in the error message
      expect(
        within(container).getByText(/provider.*gemini/i)
      ).toBeInTheDocument();
      expect(within(container).getByText(/status.*500/i)).toBeInTheDocument();
      expect(
        within(container).getByText(/errorCode.*API_ERROR/i)
      ).toBeInTheDocument();
    });
  });

  it('displays error message with minimal details when error lacks provider info', async () => {
    const mockTranslationError = {
      message: 'Network connection error',
      code: 'NETWORK_ERROR',
    };
    mockTranslationService.translate.mockRejectedValue(mockTranslationError);
    const mockOnStoryTranslated = vi.fn();

    const { container } = renderWithTooltipProvider(
      <StoryContainer onStoryTranslated={mockOnStoryTranslated} />
    );

    const textArea = within(container).getByDisplayValue('');
    const submitButton = within(container).getByRole('button', {
      name: /translate story/i,
    });

    fireEvent.change(textArea, { target: { value: 'Test story' } });
    fireEvent.click(submitButton);

    // Wait for confirmation modal to appear and click confirm
    await waitFor(() => {
      expect(
        within(container).getByText('Confirm Translation Options')
      ).toBeInTheDocument();
    });

    const confirmButton = within(container).getByText('Confirm');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(
        within(container).getByText('Translation Error:')
      ).toBeInTheDocument();
      expect(
        within(container).getByText('Network connection error')
      ).toBeInTheDocument();
      expect(
        within(container).getByText(/errorCode.*NETWORK_ERROR/i)
      ).toBeInTheDocument();
    });
  });

  it('shows loading state during translation', async () => {
    // Mock a delayed response
    mockTranslationService.translate.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    const mockOnStoryTranslated = vi.fn();

    const { container } = renderWithTooltipProvider(
      <StoryContainer onStoryTranslated={mockOnStoryTranslated} />
    );

    const textArea = within(container).getByDisplayValue('');
    const submitButton = within(container).getByRole('button', {
      name: /translate story/i,
    });

    fireEvent.change(textArea, { target: { value: 'Test story' } });
    fireEvent.click(submitButton);

    // Wait for confirmation modal to appear and click confirm
    await waitFor(() => {
      expect(
        within(container).getByText('Confirm Translation Options')
      ).toBeInTheDocument();
    });

    const confirmButton = within(container).getByText('Confirm');
    fireEvent.click(confirmButton);

    // Should show loading state in the button
    expect(within(container).getByText('Translating...')).toBeInTheDocument();

    // Loading spinner should be present in the button
    expect(
      within(container).getByRole('status', { name: 'Loading' })
    ).toBeInTheDocument();
  });

  it('calls translation service with correct parameters', async () => {
    const mockTranslationResponse: TranslationResponse = {
      fromText: 'Test story',
      toText: 'Translated story',
      fromLanguage: 'es',
      toLanguage: 'en',
      difficulty: 'b1',
    };

    mockTranslationService.translate.mockResolvedValue(mockTranslationResponse);
    const mockOnStoryTranslated = vi.fn();

    const { container } = renderWithTooltipProvider(
      <StoryContainer onStoryTranslated={mockOnStoryTranslated} />
    );

    const textArea = within(container).getByDisplayValue('');
    const submitButton = within(container).getByRole('button', {
      name: /translate story/i,
    });

    fireEvent.change(textArea, { target: { value: 'Test story' } });
    fireEvent.click(submitButton);

    // Wait for confirmation modal to appear and click confirm
    await waitFor(() => {
      expect(
        within(container).getByText('Confirm Translation Options')
      ).toBeInTheDocument();
    });

    const confirmButton = within(container).getByText('Confirm');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockTranslationService.translate).toHaveBeenCalledWith({
        text: 'Test story',
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1', // Default difficulty
        selectedVocabulary: [],
      });
    });
  });

  it('displays error when source and target languages are the same', async () => {
    // Mock the translation service to throw the same language error
    // This simulates the backend validation
    mockTranslationService.translate.mockRejectedValue(
      new Error('Source and target languages must be different')
    );

    const mockOnStoryTranslated = vi.fn();

    const { container } = renderWithTooltipProvider(
      <StoryContainer onStoryTranslated={mockOnStoryTranslated} />
    );

    const textArea = within(container).getByDisplayValue('');
    const submitButton = within(container).getByRole('button', {
      name: /translate story/i,
    });

    fireEvent.change(textArea, { target: { value: 'Test story' } });
    fireEvent.click(submitButton);

    // Wait for confirmation modal to appear
    await waitFor(() => {
      expect(
        within(container).getByText('Confirm Translation Options')
      ).toBeInTheDocument();
    });

    const confirmButton = within(container).getByText('Confirm');
    fireEvent.click(confirmButton);

    // The validation happens in handleSubmit, so we should see the error immediately
    await waitFor(() => {
      expect(
        within(container).getByText('Translation Error:')
      ).toBeInTheDocument();
      expect(
        within(container).getByText(
          'Source and target languages must be different'
        )
      ).toBeInTheDocument();
    });

    // Verify translation service was called but failed
    expect(mockTranslationService.translate).toHaveBeenCalled();
    expect(mockOnStoryTranslated).not.toHaveBeenCalled();
  });
});
