import { render, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import TranslationInfoContent from '../TranslationInfoContent';
import { TranslationResponse } from '../../../lib/translationService';

describe('TranslationInfoContent Component', () => {
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

  it('renders translation details heading', () => {
    const { container } = render(
      <TranslationInfoContent translationData={mockTranslationData} />
    );

    const heading = within(container).getByText('Translation Details');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H4');
  });

  it('displays from language information', () => {
    const { container } = render(
      <TranslationInfoContent translationData={mockTranslationData} />
    );

    // Check that "From:" and "Spanish" appear somewhere in the component
    expect(within(container).getByText('From:')).toBeInTheDocument();
    expect(within(container).getByText('Spanish')).toBeInTheDocument();
  });

  it('displays to language information', () => {
    const { container } = render(
      <TranslationInfoContent translationData={mockTranslationData} />
    );

    // Check that "To:" and "English" appear somewhere in the component
    expect(within(container).getByText('To:')).toBeInTheDocument();
    expect(within(container).getByText('English')).toBeInTheDocument();
  });

  it('displays difficulty level information', () => {
    const { container } = render(
      <TranslationInfoContent translationData={mockTranslationData} />
    );

    // Check that difficulty components appear in the component
    expect(within(container).getByText('Difficulty Level:')).toBeInTheDocument();
    // Use regex to match A1 with optional whitespace
    expect(within(container).getByText(/A1/)).toBeInTheDocument();
    // Use regex to match (CEFR) with optional whitespace
    expect(within(container).getByText(/\(CEFR\)/)).toBeInTheDocument();
  });

  it('has proper heading styling', () => {
    const { container } = render(
      <TranslationInfoContent translationData={mockTranslationData} />
    );

    const heading = within(container).getByText('Translation Details');
    expect(heading).toHaveClass(
      'text-sm',
      'font-semibold',
      'text-foreground',
      'mb-3'
    );
  });

  it('has proper list styling', () => {
    const { container } = render(
      <TranslationInfoContent translationData={mockTranslationData} />
    );

    const list = container.querySelector('ul');
    expect(list).toHaveClass(
      'text-xs',
      'text-muted-foreground',
      'space-y-1'
    );
  });

  it('has bullet points for each list item', () => {
    const { container } = render(
      <TranslationInfoContent translationData={mockTranslationData} />
    );

    const listItems = container.querySelectorAll('li');
    expect(listItems).toHaveLength(3);

    // Each list item should have a bullet point span
    listItems.forEach(item => {
      const bulletPoint = item.querySelector('span.bg-primary');
      expect(bulletPoint).toBeInTheDocument();
      expect(bulletPoint).toHaveClass(
        'w-2',
        'h-2',
        'bg-primary',
        'rounded-full',
        'mt-1.5',
        'mr-2',
        'flex-shrink-0'
      );
    });
  });

  it('displays different difficulty levels correctly', () => {
    const testCases = [
      { difficulty: 'A1' as const },
      { difficulty: 'A2' as const },
      { difficulty: 'B1' as const },
      { difficulty: 'B2' as const },
    ];

    testCases.forEach(({ difficulty }) => {
      const { container } = render(
        <TranslationInfoContent
          translationData={{ ...mockTranslationData, difficulty }}
        />
      );

      // Check that difficulty level appears in the component
      expect(within(container).getByText('Difficulty Level:')).toBeInTheDocument();
      // Use regex to match difficulty level with optional whitespace
      const regex = new RegExp(difficulty);
      expect(within(container).getByText(regex)).toBeInTheDocument();
      // Use regex to match (CEFR) with optional whitespace
      expect(within(container).getByText(/\(CEFR\)/)).toBeInTheDocument();
    });
  });

  it('displays different language pairs correctly', () => {
    const frenchTranslationData: TranslationResponse = {
      ...mockTranslationData,
      fromLanguage: 'French',
      toLanguage: 'German',
    };

    const { container } = render(
      <TranslationInfoContent translationData={frenchTranslationData} />
    );

    expect(within(container).getByText('From:')).toBeInTheDocument();
    expect(within(container).getByText('French')).toBeInTheDocument();
    expect(within(container).getByText('To:')).toBeInTheDocument();
    expect(within(container).getByText('German')).toBeInTheDocument();
  });

  it('has proper container structure and spacing', () => {
    const { container } = render(
      <TranslationInfoContent translationData={mockTranslationData} />
    );

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('space-y-2');
  });

  it('list items have proper flexbox layout', () => {
    const { container } = render(
      <TranslationInfoContent translationData={mockTranslationData} />
    );

    const listItems = container.querySelectorAll('li');
    
    listItems.forEach(item => {
      expect(item).toHaveClass('flex', 'items-start');
    });
  });

  it('renders all required elements in correct structure', () => {
    const { container } = render(
      <TranslationInfoContent translationData={mockTranslationData} />
    );

    // Should have main container div
    expect(container.firstChild?.nodeName).toBe('DIV');

    // Should have heading
    expect(container.querySelector('h4')).toBeInTheDocument();

    // Should have unordered list
    expect(container.querySelector('ul')).toBeInTheDocument();

    // Should have exactly 3 list items
    expect(container.querySelectorAll('li')).toHaveLength(3);

    // Each list item should contain the bullet point and text content
    const listItems = container.querySelectorAll('li');
    expect(listItems[0]).toHaveTextContent('From: Spanish');
    expect(listItems[1]).toHaveTextContent('To: English');
    expect(listItems[2]).toHaveTextContent('Difficulty Level: A1 (CEFR)');
  });

  it('uses theme-aware CSS variables for colors', () => {
    const { container } = render(
      <TranslationInfoContent translationData={mockTranslationData} />
    );

    const heading = within(container).getByText('Translation Details');
    const list = container.querySelector('ul');
    const bulletPoints = container.querySelectorAll('span.bg-primary');

    expect(heading).toHaveClass('text-foreground');
    expect(list).toHaveClass('text-muted-foreground');
    bulletPoints.forEach(bullet => {
      expect(bullet).toHaveClass('bg-primary');
    });
  });

  it('handles long language names properly', () => {
    const longLanguageData: TranslationResponse = {
      ...mockTranslationData,
      fromLanguage: 'Brazilian Portuguese',
      toLanguage: 'Simplified Chinese',
    };

    const { container } = render(
      <TranslationInfoContent translationData={longLanguageData} />
    );

    expect(within(container).getByText('From:')).toBeInTheDocument();
    expect(within(container).getByText('Brazilian Portuguese')).toBeInTheDocument();
    expect(within(container).getByText('To:')).toBeInTheDocument();
    expect(within(container).getByText('Simplified Chinese')).toBeInTheDocument();
  });
}); 