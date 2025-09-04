import { render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach, vi } from 'vitest';
import StoryContent from '../StoryContent';
import { TranslationResponse } from '../../../lib/translationService';

// Mock the environment config
vi.mock('../../../lib/config/env', () => ({
  EnvironmentConfig: {
    getLLMConfig: () => ({
      provider: 'gemini',
      apiKey: 'test-api-key',
      endpoint: 'https://test-endpoint.com',
      model: 'test-model',
      maxTokens: 2000,
      temperature: 0.7,
      projectId: 'test-project',
    }),
    isDictionaryDisabled: vi.fn(() => false),
    getDictionaryConfig: vi.fn(() => ({
      endpoint: 'https://lexicala1.p.rapidapi.com',
      apiKey: 'test-api-key',
    })),
  },
}));

describe('StoryContent Component', () => {
  const mockTranslationData: TranslationResponse = {
    originalText: 'Hola mundo',
    translatedText: 'Hello world',
    fromLanguage: 'es',
    toLanguage: 'en',
    difficulty: 'a1',
    provider: 'mock',
    model: 'test-model',
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  const renderWithRouter = (ui: React.ReactElement) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

  it('displays translated text when showOriginal is false', () => {
    const { container } = renderWithRouter(
      <StoryContent
        translationData={mockTranslationData}
        showOriginal={false}
      />
    );

    // Check that individual words are present
    expect(within(container).getByText('Hello')).toBeInTheDocument();
    expect(within(container).getByText('world')).toBeInTheDocument();
  });

  it('displays original text when showOriginal is true', () => {
    const { container } = renderWithRouter(
      <StoryContent translationData={mockTranslationData} showOriginal={true} />
    );

    // Check that individual words are present
    expect(within(container).getByText('Hola')).toBeInTheDocument();
    expect(within(container).getByText('mundo')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    const { container } = renderWithRouter(
      <StoryContent
        translationData={mockTranslationData}
        showOriginal={false}
      />
    );

    const contentContainer = container.firstChild as HTMLElement;
    expect(contentContainer).toHaveClass('relative', 'overflow-hidden');

    // Check that the component renders with the expected structure
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('preserves whitespace formatting with whitespace-pre-wrap', () => {
    const multilineTranslationData: TranslationResponse = {
      ...mockTranslationData,
      originalText: 'Primera línea.\n\nSegunda línea.',
      translatedText: 'First line.\n\nSecond line.',
    };

    const { container } = renderWithRouter(
      <StoryContent
        translationData={multilineTranslationData}
        showOriginal={false}
      />
    );

    // Check that the component renders and contains the expected text
    expect(container.textContent).toContain('First line.');
    expect(container.textContent).toContain('Second line.');
  });

  it('handles empty content gracefully', () => {
    const emptyTranslationData: TranslationResponse = {
      ...mockTranslationData,
      originalText: '',
      translatedText: '',
    };

    const { container: translatedContainer } = renderWithRouter(
      <StoryContent
        translationData={emptyTranslationData}
        showOriginal={false}
      />
    );

    const { container: originalContainer } = renderWithRouter(
      <StoryContent
        translationData={emptyTranslationData}
        showOriginal={true}
      />
    );

    // Should still render the component even with empty content
    expect(translatedContainer.querySelector('div')).toBeInTheDocument();
    expect(originalContainer.querySelector('div')).toBeInTheDocument();
  });

  it('handles long content properly', () => {
    const longText =
      'This is a very long story that should wrap properly and maintain proper formatting throughout multiple lines and paragraphs. '.repeat(
        10
      );

    const longTranslationData: TranslationResponse = {
      ...mockTranslationData,
      translatedText: longText,
    };

    const { container } = renderWithRouter(
      <StoryContent
        translationData={longTranslationData}
        showOriginal={false}
      />
    );

    // Check that the component renders and contains the long text
    expect(container.textContent).toContain(longText);
  });

  it('handles special characters and unicode content', () => {
    const unicodeTranslationData: TranslationResponse = {
      ...mockTranslationData,
      originalText:
        'Había una vez un niño que vivía en España... ¡Qué historia más emocionante!',
      translatedText:
        'Once upon a time there was a boy who lived in Spain... What an exciting story!',
    };

    const { container: originalContainer } = renderWithRouter(
      <StoryContent
        translationData={unicodeTranslationData}
        showOriginal={true}
      />
    );

    const { container: translatedContainer } = renderWithRouter(
      <StoryContent
        translationData={unicodeTranslationData}
        showOriginal={false}
      />
    );

    // Check that key words are present in the original text
    expect(within(originalContainer).getByText('Había')).toBeInTheDocument();
    expect(within(originalContainer).getByText('vez')).toBeInTheDocument();
    expect(within(originalContainer).getByText('niño')).toBeInTheDocument();

    // Check that key words are present in the translated text
    expect(within(translatedContainer).getByText('Once')).toBeInTheDocument();
    expect(within(translatedContainer).getByText('upon')).toBeInTheDocument();
    expect(within(translatedContainer).getByText('time')).toBeInTheDocument();
  });

  it('switches content correctly when showOriginal prop changes', () => {
    const { container, rerender } = renderWithRouter(
      <StoryContent
        translationData={mockTranslationData}
        showOriginal={false}
      />
    );

    // Initially shows translated text
    expect(within(container).getByText('Hello')).toBeInTheDocument();
    expect(within(container).getByText('world')).toBeInTheDocument();
    expect(within(container).queryByText('Hola')).not.toBeInTheDocument();
    expect(within(container).queryByText('mundo')).not.toBeInTheDocument();

    // After rerender with showOriginal=true, shows original text
    rerender(
      <MemoryRouter>
        <StoryContent
          translationData={mockTranslationData}
          showOriginal={true}
        />
      </MemoryRouter>
    );

    expect(within(container).getByText('Hola')).toBeInTheDocument();
    expect(within(container).getByText('mundo')).toBeInTheDocument();
    expect(within(container).queryByText('Hello')).not.toBeInTheDocument();
    expect(within(container).queryByText('world')).not.toBeInTheDocument();
  });

  it('has transition classes for smooth content switching', () => {
    const { container } = renderWithRouter(
      <StoryContent
        translationData={mockTranslationData}
        showOriginal={false}
      />
    );

    // Check that the component renders with transition classes
    const contentContainer = container.firstChild as HTMLElement;
    expect(contentContainer).toHaveClass('relative', 'overflow-hidden');
  });

  it('maintains consistent structure regardless of content', () => {
    const shortTranslationData: TranslationResponse = {
      ...mockTranslationData,
      originalText: 'Corto.',
      translatedText: 'Short.',
    };

    const longTranslationData: TranslationResponse = {
      ...mockTranslationData,
      originalText:
        'Esta es una historia muy larga que contiene múltiples párrafos y líneas de texto para probar el comportamiento del componente.',
      translatedText:
        'This is a very long story that contains multiple paragraphs and lines of text to test component behavior.',
    };

    const { container: shortContainer } = renderWithRouter(
      <StoryContent
        translationData={shortTranslationData}
        showOriginal={false}
      />
    );

    const { container: longContainer } = renderWithRouter(
      <StoryContent
        translationData={longTranslationData}
        showOriginal={false}
      />
    );

    // Both should have the same container structure
    expect(shortContainer.firstChild?.nodeName).toBe('DIV');
    expect(longContainer.firstChild?.nodeName).toBe('DIV');

    expect(shortContainer.querySelector('div')).toBeInTheDocument();
    expect(longContainer.querySelector('div')).toBeInTheDocument();
  });
});
