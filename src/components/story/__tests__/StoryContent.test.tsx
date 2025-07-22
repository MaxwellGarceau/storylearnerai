import { render, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import StoryContent from '../StoryContent';
import { TranslationResponse } from '../../../lib/translationService';

describe('StoryContent Component', () => {
  const mockTranslationData: TranslationResponse = {
    originalText: 'Esta es una historia de prueba.',
    translatedText: 'This is a test story.',
    fromLanguage: 'Spanish',
    toLanguage: 'English',
    difficulty: 'A1',
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('displays translated text when showOriginal is false', () => {
    const { container } = render(
      <StoryContent
        translationData={mockTranslationData}
        showOriginal={false}
      />
    );

    const content = within(container).getByText('This is a test story.');
    expect(content).toBeInTheDocument();
  });

  it('displays original text when showOriginal is true', () => {
    const { container } = render(
      <StoryContent
        translationData={mockTranslationData}
        showOriginal={true}
      />
    );

    const content = within(container).getByText('Esta es una historia de prueba.');
    expect(content).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    const { container } = render(
      <StoryContent
        translationData={mockTranslationData}
        showOriginal={false}
      />
    );

    const contentContainer = container.firstChild as HTMLElement;
    expect(contentContainer).toHaveClass('relative', 'overflow-hidden');

    const textElement = within(container).getByText('This is a test story.');
    expect(textElement).toHaveClass(
      'text-foreground',
      'whitespace-pre-wrap',
      'transition-opacity',
      'duration-300',
      'leading-relaxed'
    );
  });

  it('preserves whitespace formatting with whitespace-pre-wrap', () => {
    const multilineTranslationData: TranslationResponse = {
      ...mockTranslationData,
      originalText: 'Primera línea.\n\nSegunda línea.',
      translatedText: 'First line.\n\nSecond line.',
    };

    const { container } = render(
      <StoryContent
        translationData={multilineTranslationData}
        showOriginal={false}
      />
    );

    // Check that the paragraph element exists and has the correct class
    const paragraph = container.querySelector('p');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveClass('whitespace-pre-wrap');
    expect(paragraph?.textContent).toContain('First line.');
    expect(paragraph?.textContent).toContain('Second line.');
  });

  it('handles empty content gracefully', () => {
    const emptyTranslationData: TranslationResponse = {
      ...mockTranslationData,
      originalText: '',
      translatedText: '',
    };

    const { container: translatedContainer } = render(
      <StoryContent
        translationData={emptyTranslationData}
        showOriginal={false}
      />
    );

    const { container: originalContainer } = render(
      <StoryContent
        translationData={emptyTranslationData}
        showOriginal={true}
      />
    );

    // Should still render the paragraph element even with empty content
    expect(translatedContainer.querySelector('p')).toBeInTheDocument();
    expect(originalContainer.querySelector('p')).toBeInTheDocument();
  });

  it('handles long content properly', () => {
    const longText = 'This is a very long story that should wrap properly and maintain proper formatting throughout multiple lines and paragraphs. '.repeat(10);
    
    const longTranslationData: TranslationResponse = {
      ...mockTranslationData,
      translatedText: longText,
    };

    const { container } = render(
      <StoryContent
        translationData={longTranslationData}
        showOriginal={false}
      />
    );

    // Check that the paragraph element exists and contains the long text
    const paragraph = container.querySelector('p');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveClass('whitespace-pre-wrap'); // Ensures proper wrapping
    expect(paragraph?.textContent).toBe(longText);
  });

  it('handles special characters and unicode content', () => {
    const unicodeTranslationData: TranslationResponse = {
      ...mockTranslationData,
      originalText: 'Había una vez un niño que vivía en España... ¡Qué historia más emocionante!',
      translatedText: 'Once upon a time there was a boy who lived in Spain... What an exciting story!',
    };

    const { container: originalContainer } = render(
      <StoryContent
        translationData={unicodeTranslationData}
        showOriginal={true}
      />
    );

    const { container: translatedContainer } = render(
      <StoryContent
        translationData={unicodeTranslationData}
        showOriginal={false}
      />
    );

    expect(within(originalContainer).getByText(/Había una vez un niño/)).toBeInTheDocument();
    expect(within(translatedContainer).getByText(/Once upon a time there was a boy/)).toBeInTheDocument();
  });

  it('switches content correctly when showOriginal prop changes', () => {
    const { container, rerender } = render(
      <StoryContent
        translationData={mockTranslationData}
        showOriginal={false}
      />
    );

    // Initially shows translated text
    expect(within(container).getByText('This is a test story.')).toBeInTheDocument();
    expect(within(container).queryByText('Esta es una historia de prueba.')).not.toBeInTheDocument();

    // After rerender with showOriginal=true, shows original text
    rerender(
      <StoryContent
        translationData={mockTranslationData}
        showOriginal={true}
      />
    );

    expect(within(container).getByText('Esta es una historia de prueba.')).toBeInTheDocument();
    expect(within(container).queryByText('This is a test story.')).not.toBeInTheDocument();
  });

  it('has transition classes for smooth content switching', () => {
    const { container } = render(
      <StoryContent
        translationData={mockTranslationData}
        showOriginal={false}
      />
    );

    const textElement = within(container).getByText('This is a test story.');
    expect(textElement).toHaveClass('transition-opacity', 'duration-300');
  });

  it('maintains consistent structure regardless of content', () => {
    const shortTranslationData: TranslationResponse = {
      ...mockTranslationData,
      originalText: 'Corto.',
      translatedText: 'Short.',
    };

    const longTranslationData: TranslationResponse = {
      ...mockTranslationData,
      originalText: 'Esta es una historia muy larga que contiene múltiples párrafos y líneas de texto para probar el comportamiento del componente.',
      translatedText: 'This is a very long story that contains multiple paragraphs and lines of text to test component behavior.',
    };

    const { container: shortContainer } = render(
      <StoryContent
        translationData={shortTranslationData}
        showOriginal={false}
      />
    );

    const { container: longContainer } = render(
      <StoryContent
        translationData={longTranslationData}
        showOriginal={false}
      />
    );

    // Both should have the same container structure
    expect(shortContainer.firstChild?.nodeName).toBe('DIV');
    expect(longContainer.firstChild?.nodeName).toBe('DIV');
    
    expect(shortContainer.querySelector('p')).toBeInTheDocument();
    expect(longContainer.querySelector('p')).toBeInTheDocument();
  });
}); 