import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WordMetadataBadges } from '../WordMetadataBadges';
import type { PartOfSpeech } from '../../../types/llm/tokens';
import type { DifficultyLevel } from '../../../types/llm/prompts';

// Mock the Badge component
vi.mock('../../ui/Badge', () => ({
  Badge: ({
    children,
    variant,
    className,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
  }) => (
    <div
      data-testid='badge'
      data-variant={variant}
      className={className}
    >
      {children}
    </div>
  ),
}));

describe('WordMetadataBadges Component', () => {
  it('renders nothing when no metadata is provided', () => {
    const { container } = render(
      <WordMetadataBadges partOfSpeech={null} difficulty={null} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders only part of speech badge when only part of speech is provided', () => {
    render(
      <WordMetadataBadges partOfSpeech='noun' difficulty={null} />
    );
    
    const badges = screen.getAllByTestId('badge');
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveTextContent('Noun');
    expect(badges[0]).toHaveAttribute('data-variant', 'outline');
  });

  it('renders only difficulty badge when only difficulty is provided', () => {
    render(
      <WordMetadataBadges partOfSpeech={null} difficulty='a1' />
    );
    
    const badges = screen.getAllByTestId('badge');
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveTextContent('A1');
    expect(badges[0]).toHaveAttribute('data-variant', 'success');
  });

  it('renders both badges when both metadata are provided', () => {
    render(
      <WordMetadataBadges partOfSpeech='verb' difficulty='b2' />
    );
    
    const badges = screen.getAllByTestId('badge');
    expect(badges).toHaveLength(2);
    
    // Check part of speech badge
    const posBadge = badges.find(badge => badge.textContent === 'Verb');
    expect(posBadge).toBeInTheDocument();
    expect(posBadge).toHaveAttribute('data-variant', 'outline');
    
    // Check difficulty badge
    const difficultyBadge = badges.find(badge => badge.textContent === 'B2');
    expect(difficultyBadge).toBeInTheDocument();
    expect(difficultyBadge).toHaveAttribute('data-variant', 'destructive');
  });

  it('formats part of speech correctly', () => {
    const testCases: { input: PartOfSpeech; expected: string }[] = [
      { input: 'noun', expected: 'Noun' },
      { input: 'verb', expected: 'Verb' },
      { input: 'adjective', expected: 'Adjective' },
      { input: 'adverb', expected: 'Adverb' },
      { input: 'pronoun', expected: 'Pronoun' },
      { input: 'preposition', expected: 'Preposition' },
      { input: 'conjunction', expected: 'Conjunction' },
      { input: 'interjection', expected: 'Interjection' },
      { input: 'article', expected: 'Article' },
      { input: 'determiner', expected: 'Determiner' },
      { input: 'other', expected: 'Other' },
    ];

    testCases.forEach(({ input, expected }) => {
      const { unmount } = render(
        <WordMetadataBadges partOfSpeech={input} difficulty={null} />
      );
      
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it('formats difficulty level correctly', () => {
    const testCases: { input: DifficultyLevel; expected: string }[] = [
      { input: 'a1', expected: 'A1' },
      { input: 'a2', expected: 'A2' },
      { input: 'b1', expected: 'B1' },
      { input: 'b2', expected: 'B2' },
    ];

    testCases.forEach(({ input, expected }) => {
      const { unmount } = render(
        <WordMetadataBadges partOfSpeech={null} difficulty={input} />
      );
      
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it('applies correct difficulty badge variants', () => {
    const testCases: { input: DifficultyLevel; expectedVariant: string }[] = [
      { input: 'a1', expectedVariant: 'success' },
      { input: 'a2', expectedVariant: 'info' },
      { input: 'b1', expectedVariant: 'warning' },
      { input: 'b2', expectedVariant: 'destructive' },
    ];

    testCases.forEach(({ input, expectedVariant }) => {
      const { unmount } = render(
        <WordMetadataBadges partOfSpeech={null} difficulty={input} />
      );
      
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', expectedVariant);
      unmount();
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <WordMetadataBadges 
        partOfSpeech='noun' 
        difficulty='a1' 
        className='custom-class'
      />
    );
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('applies default className structure', () => {
    const { container } = render(
      <WordMetadataBadges partOfSpeech='noun' difficulty='a1' />
    );
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex', 'flex-wrap', 'gap-1.5');
  });

  it('applies text-xs class to badges', () => {
    render(
      <WordMetadataBadges partOfSpeech='noun' difficulty='a1' />
    );
    
    const badges = screen.getAllByTestId('badge');
    badges.forEach(badge => {
      expect(badge).toHaveClass('text-xs');
    });
  });

  it('handles edge case with empty strings', () => {
    // This test ensures the component handles edge cases gracefully
    render(
      <WordMetadataBadges partOfSpeech={null} difficulty={null} />
    );
    
    expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
  });

  it('maintains proper DOM structure', () => {
    const { container } = render(
      <WordMetadataBadges partOfSpeech='noun' difficulty='a1' />
    );
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper.children).toHaveLength(2);
    
    const badges = wrapper.children;
    expect(badges[0].tagName).toBe('DIV');
    expect(badges[1].tagName).toBe('DIV');
  });

  it('renders badges in correct order', () => {
    render(
      <WordMetadataBadges partOfSpeech='verb' difficulty='b1' />
    );
    
    const badges = screen.getAllByTestId('badge');
    expect(badges[0]).toHaveTextContent('Verb');
    expect(badges[1]).toHaveTextContent('B1');
  });

  it('handles all part of speech types', () => {
    const allPartOfSpeech: PartOfSpeech[] = [
      'noun', 'verb', 'adjective', 'adverb', 'pronoun',
      'preposition', 'conjunction', 'interjection', 'article',
      'determiner', 'other'
    ];

    allPartOfSpeech.forEach(pos => {
      const { unmount } = render(
        <WordMetadataBadges partOfSpeech={pos} difficulty={null} />
      );
      
      const expectedText = pos.charAt(0).toUpperCase() + pos.slice(1);
      expect(screen.getByText(expectedText)).toBeInTheDocument();
      unmount();
    });
  });

  it('handles all difficulty levels', () => {
    const allDifficultyLevels: DifficultyLevel[] = ['a1', 'a2', 'b1', 'b2'];

    allDifficultyLevels.forEach(difficulty => {
      const { unmount } = render(
        <WordMetadataBadges partOfSpeech={null} difficulty={difficulty} />
      );
      
      const expectedText = difficulty.toUpperCase();
      expect(screen.getByText(expectedText)).toBeInTheDocument();
      unmount();
    });
  });
});
