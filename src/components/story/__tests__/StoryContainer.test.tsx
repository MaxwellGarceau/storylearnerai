import { render, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import StoryContainer from '../StoryContainer';
import { translationService } from '../../../lib/translationService';
import type { TranslationResponse } from '../../../lib/translationService';

// Mock the translation service
vi.mock('../../../lib/translationService', () => ({
  translationService: {
    translate: vi.fn(),
    mockTranslateStory: vi.fn(),
    translateStory: vi.fn(),
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
      originalText: 'Esta es una historia de prueba.',
      translatedText: 'This is a test story.',
      fromLanguage: 'Spanish',
      toLanguage: 'English',
      difficulty: 'A1',
    };

    mockTranslationService.translate.mockResolvedValue(mockTranslationResponse);

    const { container } = render(<StoryContainer />);

    // Find the textarea by its label (more specific than just role) - scoped to this container
    const textArea = within(container).getByLabelText('Spanish Story');
    const submitButton = within(container).getByRole('button', { name: /translate story/i });

    // Simulate entering a story and submitting
    fireEvent.change(textArea, { target: { value: 'Esta es una historia de prueba.' } });
    fireEvent.click(submitButton);

    // Check for loading state within this container
    expect(within(container).getByText('Translating your story...')).toBeInTheDocument();

    // Wait for translation to complete - look for the results sections
    await waitFor(() => {
      // Look for the yellow container (original story) and green container (translated story)
      const originalStoryContainer = within(container).getByText('Original Story (Spanish):').closest('.bg-yellow-50');
      const translatedStoryContainer = within(container).getByText('Translated Story (English):').closest('.bg-green-50');
      
      expect(originalStoryContainer).toBeInTheDocument();
      expect(translatedStoryContainer).toBeInTheDocument();
    });

    // Check for specific content in the translation sections
    const originalStorySection = within(container).getByText('Original Story (Spanish):').closest('div');
    expect(originalStorySection).toHaveTextContent('Esta es una historia de prueba.');

    // For the translated story, look for the actual translated text content
    const translatedStoryText = within(container).getByText('This is a test story.');
    expect(translatedStoryText).toBeInTheDocument();
    
    // Verify the difficulty badge is displayed - look in the green container
    const translatedSection = within(container).getByText('Translated Story (English):').closest('div');
    const difficultyBadge = within(translatedSection!).getByText('A1 Level');
    expect(difficultyBadge).toBeInTheDocument();
  });

  it('displays error message when translation fails', async () => {
    mockTranslationService.translate.mockRejectedValue(new Error('Translation service error'));

    const { container } = render(<StoryContainer />);

    const textArea = within(container).getByLabelText('Spanish Story');
    const submitButton = within(container).getByRole('button', { name: /translate story/i });

    fireEvent.change(textArea, { target: { value: 'Test story' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(within(container).getByText('❌ Translation Error:')).toBeInTheDocument();
      expect(within(container).getByText('Translation service error')).toBeInTheDocument();
    });
  });

  it('shows loading state during translation', async () => {
    // Mock a delayed response
    mockTranslationService.translate.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const { container } = render(<StoryContainer />);

    const textArea = within(container).getByLabelText('Spanish Story');
    const submitButton = within(container).getByRole('button', { name: /translate story/i });

    fireEvent.change(textArea, { target: { value: 'Test story' } });
    fireEvent.click(submitButton);

    // Should show loading immediately within this container
    expect(within(container).getByText('Translating your story...')).toBeInTheDocument();
    
    // Loading spinner should be present within this container
    expect(within(container).getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('calls translation service with correct parameters', async () => {
    const mockTranslationResponse: TranslationResponse = {
      originalText: 'Test story',
      translatedText: 'Translated story',
      fromLanguage: 'Spanish',
      toLanguage: 'English',
      difficulty: 'B1',
    };

    mockTranslationService.translate.mockResolvedValue(mockTranslationResponse);

    const { container } = render(<StoryContainer />);

    const textArea = within(container).getByLabelText('Spanish Story');
    const submitButton = within(container).getByRole('button', { name: /translate story/i });

    fireEvent.change(textArea, { target: { value: 'Test story' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockTranslationService.translate).toHaveBeenCalledWith({
        text: 'Test story',
        fromLanguage: 'Spanish',
        toLanguage: 'English',
        difficulty: 'A1', // Default difficulty
      });
    });
  });
});
