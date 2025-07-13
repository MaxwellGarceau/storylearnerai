import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StoryContainer from '../StoryContainer';
import { translationService } from '../../../lib/translationService';
import type { TranslationResponse } from '../../../lib/translationService';

// Mock the translation service
vi.mock('../../../lib/translationService', () => ({
  translationService: {
    mockTranslateStory: vi.fn(),
    translateStory: vi.fn(),
  },
}));

const mockTranslationService = vi.mocked(translationService);

describe('StoryContainer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders StoryRender with translation data when a story is submitted', async () => {
    const mockTranslationResponse: TranslationResponse = {
      originalText: 'Esta es una historia de prueba.',
      translatedText: 'This is a test story.',
      fromLanguage: 'Spanish',
      toLanguage: 'English',
      difficulty: 'A1',
    };

    mockTranslationService.mockTranslateStory.mockResolvedValue(mockTranslationResponse);

    render(<StoryContainer />);

    // Find the textarea and submit button
    const textArea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /translate story/i });

    // Simulate entering a story and submitting
    fireEvent.change(textArea, { target: { value: 'Esta es una historia de prueba.' } });
    fireEvent.click(submitButton);

    // Check for loading state
    expect(screen.getByText('Translating your story...')).toBeInTheDocument();

    // Wait for translation to complete
    await waitFor(() => {
      expect(screen.getByText('Original Story (Spanish):')).toBeInTheDocument();
      expect(screen.getByText('Translated Story (English):')).toBeInTheDocument();
    });

    // Check for specific content in the translation sections using more specific selectors
    const originalStorySection = screen.getByText('Original Story (Spanish):').closest('div');
    expect(originalStorySection).toHaveTextContent('Esta es una historia de prueba.');

    // For the translated story, look for the actual translated text content
    const translatedStoryText = screen.getByText('This is a test story.');
    expect(translatedStoryText).toBeInTheDocument();
    
    // Verify the difficulty badge is displayed
    expect(screen.getByText('A1 Level')).toBeInTheDocument();
  });

  it('displays error message when translation fails', async () => {
    mockTranslationService.mockTranslateStory.mockRejectedValue(new Error('Translation service error'));

    render(<StoryContainer />);

    const textArea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /translate story/i });

    fireEvent.change(textArea, { target: { value: 'Test story' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('❌ Translation Error:')).toBeInTheDocument();
      expect(screen.getByText('Translation service error')).toBeInTheDocument();
    });
  });

  it('shows loading state during translation', async () => {
    // Mock a delayed response
    mockTranslationService.mockTranslateStory.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<StoryContainer />);

    const textArea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /translate story/i });

    fireEvent.change(textArea, { target: { value: 'Test story' } });
    fireEvent.click(submitButton);

    // Should show loading immediately
    expect(screen.getByText('Translating your story...')).toBeInTheDocument();
    
    // Loading spinner should be present
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('calls translation service with correct parameters', async () => {
    const mockTranslationResponse: TranslationResponse = {
      originalText: 'Test story',
      translatedText: 'Translated story',
      fromLanguage: 'Spanish',
      toLanguage: 'English',
      difficulty: 'B1',
    };

    mockTranslationService.mockTranslateStory.mockResolvedValue(mockTranslationResponse);

    render(<StoryContainer />);

    const textArea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /translate story/i });

    fireEvent.change(textArea, { target: { value: 'Test story' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockTranslationService.mockTranslateStory).toHaveBeenCalledWith({
        text: 'Test story',
        fromLanguage: 'Spanish',
        toLanguage: 'English',
        difficulty: 'A1', // Default difficulty
      });
    });
  });
});
