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
      fromLanguage: 'es',
      toLanguage: 'en',
      difficulty: 'a1',
    };

    mockTranslationService.translate.mockResolvedValue(mockTranslationResponse);
    const mockOnStoryTranslated = vi.fn();

    const { container } = render(<StoryContainer onStoryTranslated={mockOnStoryTranslated} />);

    // Find the textarea by its id and the submit button in the sidebar
    const textArea = within(container).getByDisplayValue('');
    const submitButton = within(container).getByRole('button', { name: /translate story/i });

    // Simulate entering a story and submitting
    fireEvent.change(textArea, { target: { value: 'Esta es una historia de prueba.' } });
    fireEvent.click(submitButton);

    // Wait for translation to complete - check that the callback was called
    await waitFor(() => {
      expect(mockOnStoryTranslated).toHaveBeenCalledWith(mockTranslationResponse);
    });

    // Verify the translation service was called with correct parameters
    expect(mockTranslationService.translate).toHaveBeenCalledWith({
      text: 'Esta es una historia de prueba.',
      fromLanguage: 'es',
      toLanguage: 'en',
      difficulty: 'a1',
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
      statusCode: 500
    };
    mockTranslationService.translate.mockRejectedValue(mockTranslationError);
    const mockOnStoryTranslated = vi.fn();

    const { container } = render(<StoryContainer onStoryTranslated={mockOnStoryTranslated} />);

    const textArea = within(container).getByDisplayValue('');
    const submitButton = within(container).getByRole('button', { name: /translate story/i });

    fireEvent.change(textArea, { target: { value: 'Test story' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(within(container).getByText('Translation Error:')).toBeInTheDocument();
      expect(within(container).getByText('Translation service error')).toBeInTheDocument();
      expect(within(container).getByText('Provider: gemini')).toBeInTheDocument();
      expect(within(container).getByText('Status: 500')).toBeInTheDocument();
      expect(within(container).getByText('Error code: API_ERROR')).toBeInTheDocument();
    });
  });

  it('displays error message with minimal details when error lacks provider info', async () => {
    const mockTranslationError = {
      message: 'Network connection error',
      code: 'NETWORK_ERROR'
    };
    mockTranslationService.translate.mockRejectedValue(mockTranslationError);
    const mockOnStoryTranslated = vi.fn();

    const { container } = render(<StoryContainer onStoryTranslated={mockOnStoryTranslated} />);

    const textArea = within(container).getByDisplayValue('');
    const submitButton = within(container).getByRole('button', { name: /translate story/i });

    fireEvent.change(textArea, { target: { value: 'Test story' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(within(container).getByText('Translation Error:')).toBeInTheDocument();
      expect(within(container).getByText('Network connection error')).toBeInTheDocument();
      expect(within(container).getByText('Error code: NETWORK_ERROR')).toBeInTheDocument();
    });
  });

  it('shows loading state during translation', async () => {
    // Mock a delayed response
    mockTranslationService.translate.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    const mockOnStoryTranslated = vi.fn();

    const { container } = render(<StoryContainer onStoryTranslated={mockOnStoryTranslated} />);

    const textArea = within(container).getByDisplayValue('');
    const submitButton = within(container).getByRole('button', { name: /translate story/i });

    fireEvent.change(textArea, { target: { value: 'Test story' } });
    fireEvent.click(submitButton);

    // Should show loading state in the button
    expect(within(container).getByText('Translating...')).toBeInTheDocument();
    
    // Loading spinner should be present in the button
    expect(within(container).getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('calls translation service with correct parameters', async () => {
    const mockTranslationResponse: TranslationResponse = {
      originalText: 'Test story',
      translatedText: 'Translated story',
      fromLanguage: 'es',
      toLanguage: 'en',
      difficulty: 'b1',
    };

    mockTranslationService.translate.mockResolvedValue(mockTranslationResponse);
    const mockOnStoryTranslated = vi.fn();

    const { container } = render(<StoryContainer onStoryTranslated={mockOnStoryTranslated} />);

    const textArea = within(container).getByDisplayValue('');
    const submitButton = within(container).getByRole('button', { name: /translate story/i });

    fireEvent.change(textArea, { target: { value: 'Test story' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockTranslationService.translate).toHaveBeenCalledWith({
        text: 'Test story',
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1', // Default difficulty
      });
    });
  });
});
