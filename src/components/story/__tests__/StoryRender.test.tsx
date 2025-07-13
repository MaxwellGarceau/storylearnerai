import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import StoryRender from '../StoryRender';
import { TranslationResponse } from '../../../lib/translationService';

describe('StoryRender Component', () => {
  const mockTranslationData: TranslationResponse = {
    originalText: 'Esta es una historia de prueba.',
    translatedText: 'This is a test story.',
    fromLanguage: 'Spanish',
    toLanguage: 'English',
    difficulty: 'A1',
  };

  it('renders the component with translation data', () => {
    render(<StoryRender translationData={mockTranslationData} />);

    // Check if both original and translated content are present
    expect(screen.getByText('Original Story (Spanish):')).toBeInTheDocument();
    expect(screen.getByText('Translated Story (English):')).toBeInTheDocument();
    expect(screen.getByText('Esta es una historia de prueba.')).toBeInTheDocument();
    expect(screen.getByText('This is a test story.')).toBeInTheDocument();
  });

  it('displays translation information correctly', () => {
    render(<StoryRender translationData={mockTranslationData} />);

    // Check translation metadata
    expect(screen.getByText('Translation:')).toBeInTheDocument();
    expect(screen.getByText('Spanish → English')).toBeInTheDocument();
    expect(screen.getByText('Difficulty Level:')).toBeInTheDocument();
    expect(screen.getByText('A1 (CEFR)')).toBeInTheDocument();
  });

  it('displays difficulty level badge', () => {
    render(<StoryRender translationData={mockTranslationData} />);

    // Check if the difficulty badge is present
    expect(screen.getByText('A1 Level')).toBeInTheDocument();
  });

  it('does not render anything when translation data is null', () => {
    const { container } = render(<StoryRender translationData={null as unknown as TranslationResponse} />);

    // Check if the container is empty
    expect(container.firstChild).toBeNull();
  });

  it('applies correct styling classes', () => {
    render(<StoryRender translationData={mockTranslationData} />);
    
    // Check if the original story container has yellow styling
    const originalStoryContainer = screen.getByText('Original Story (Spanish):').closest('div');
    expect(originalStoryContainer).toHaveClass('bg-yellow-50', 'border-yellow-200');

    // Check if the translated story container has green styling
    // Need to get the parent div, not the inner flex div
    const translatedStoryHeader = screen.getByText('Translated Story (English):');
    const translatedStoryContainer = translatedStoryHeader.closest('div')?.parentElement;
    expect(translatedStoryContainer).toHaveClass('bg-green-50', 'border-green-200');
  });

  it('renders with different difficulty levels', () => {
    const b2TranslationData: TranslationResponse = {
      ...mockTranslationData,
      difficulty: 'B2',
    };

    render(<StoryRender translationData={b2TranslationData} />);

    expect(screen.getByText('B2 Level')).toBeInTheDocument();
    expect(screen.getByText('B2 (CEFR)')).toBeInTheDocument();
  });

  it('preserves whitespace in story content', () => {
    const multilineTranslationData: TranslationResponse = {
      ...mockTranslationData,
      originalText: 'Primera línea.\n\nSegunda línea.',
      translatedText: 'First line.\n\nSecond line.',
    };

    render(<StoryRender translationData={multilineTranslationData} />);

    // Check if the whitespace-pre-wrap class is applied to preserve formatting
    // Use a more flexible text matcher for multiline content
    const originalTextElement = screen.getByText((_, element) => {
      return element?.textContent === 'Primera línea.\n\nSegunda línea.';
    });
    expect(originalTextElement).toHaveClass('whitespace-pre-wrap');

    const translatedTextElement = screen.getByText((_, element) => {
      return element?.textContent === 'First line.\n\nSecond line.';
    });
    expect(translatedTextElement).toHaveClass('whitespace-pre-wrap');
  });
});
