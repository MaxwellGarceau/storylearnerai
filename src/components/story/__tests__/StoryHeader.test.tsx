import { render, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import StoryHeader from '../StoryHeader';
import { TranslationResponse } from '../../../lib/translationService';

// Mock the InfoButton component
vi.mock('../../ui/InfoButton', () => ({
  InfoButton: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick}>Show translation info</button>
  ),
}));

// Mock the useDifficultyLevels hook
vi.mock('../../../hooks/useDifficultyLevels', () => ({
  useDifficultyLevels: () => ({
    difficultyLevels: [
      { code: 'a1', name: 'Beginner' },
      { code: 'a2', name: 'Elementary' },
      { code: 'b1', name: 'Intermediate' },
      { code: 'b2', name: 'Upper Intermediate' }
    ],
    getDifficultyLevelDisplay: (code: string) => {
      const displayMap: Record<string, string> = {
        'a1': 'A1 (Beginner)',
        'a2': 'A2 (Elementary)',
        'b1': 'B1 (Intermediate)',
        'b2': 'B2 (Upper Intermediate)'
      };
      return displayMap[code] || code;
    },
    getDifficultyLevelCodeFromDisplay: (display: string) => {
      const codeMap: Record<string, string> = {
        'A1 (Beginner)': 'a1',
        'A2 (Elementary)': 'a2',
        'B1 (Intermediate)': 'b1',
        'B2 (Upper Intermediate)': 'b2'
      };
      return codeMap[display] || display;
    }
  })
}));

const mockTranslationData: TranslationResponse = {
  originalText: 'Esta es una historia de prueba.',
  translatedText: 'This is a test story.',
  fromLanguage: 'es',
  toLanguage: 'en',
  difficulty: 'a1',
  provider: 'test',
  model: 'test-model'
};

describe('StoryHeader Component', () => {
  it('renders translated story header when showOriginal is false', () => {
    const { container } = render(
      <StoryHeader
        translationData={mockTranslationData}
        showOriginal={false}
        onToggleView={vi.fn()}
      />
    );

    const header = within(container).getByText('Translated Story (English):');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('text-foreground');
  });

  it('renders original story header when showOriginal is true', () => {
    const { container } = render(
      <StoryHeader
        translationData={mockTranslationData}
        showOriginal={true}
        onToggleView={vi.fn()}
      />
    );

    const header = within(container).getByText('Original Story (Spanish):');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('text-muted-foreground');
  });

  it('shows difficulty badge when showing translated story', () => {
    const { container } = render(
      <StoryHeader
        translationData={mockTranslationData}
        showOriginal={false}
        onToggleView={vi.fn()}
      />
    );

    const difficultyBadge = within(container).getByText('A1 (Beginner)');
    expect(difficultyBadge).toBeInTheDocument();
  });

  it('hides difficulty badge when showing original story', () => {
    const { container } = render(
      <StoryHeader
        translationData={mockTranslationData}
        showOriginal={true}
        onToggleView={vi.fn()}
      />
    );

    expect(within(container).queryByText('A1 (Beginner)')).not.toBeInTheDocument();
  });

  it('renders toggle button with correct text based on current view', () => {
    const { container: translatedContainer } = render(
      <StoryHeader
        translationData={mockTranslationData}
        showOriginal={false}
        onToggleView={vi.fn()}
      />
    );

    const { container: originalContainer } = render(
      <StoryHeader
        translationData={mockTranslationData}
        showOriginal={true}
        onToggleView={vi.fn()}
      />
    );

    const translatedToggleButton = within(translatedContainer).getByRole('button', { name: 'Show original story' });
    const originalToggleButton = within(originalContainer).getByRole('button', { name: 'Show translated story' });

    expect(translatedToggleButton).toBeInTheDocument();
    expect(originalToggleButton).toBeInTheDocument();
  });

  it('calls onToggleView when toggle button is clicked', () => {
    const onToggleView = vi.fn();
    const { container } = render(
      <StoryHeader
        translationData={mockTranslationData}
        showOriginal={false}
        onToggleView={onToggleView}
      />
    );

    const toggleButton = within(container).getByRole('button', { name: 'Show original story' });
    fireEvent.click(toggleButton);

    expect(onToggleView).toHaveBeenCalledTimes(1);
  });

  it('applies secondary variant to toggle button when showing original', () => {
    const { container } = render(
      <StoryHeader
        translationData={mockTranslationData}
        showOriginal={true}
        onToggleView={vi.fn()}
      />
    );

    const toggleButton = within(container).getByRole('button', { name: 'Show translated story' });
    expect(toggleButton).toHaveClass('bg-secondary', 'text-secondary-foreground');
  });

  it('applies default variant to toggle button when showing translated', () => {
    const { container } = render(
      <StoryHeader
        translationData={mockTranslationData}
        showOriginal={false}
        onToggleView={vi.fn()}
      />
    );

    const toggleButton = within(container).getByRole('button', { name: 'Show original story' });
    expect(toggleButton).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('has proper responsive layout classes', () => {
    const { container } = render(
      <StoryHeader
        translationData={mockTranslationData}
        showOriginal={false}
        onToggleView={vi.fn()}
      />
    );

    const headerContainer = container.firstChild as HTMLElement;
    expect(headerContainer).toHaveClass(
      'flex',
      'flex-col',
      'lg:flex-row',
      'lg:items-center',
      'lg:justify-between'
    );
  });

  it('maintains proper button order on different screen sizes', () => {
    const { container } = render(
      <StoryHeader
        translationData={mockTranslationData}
        showOriginal={false}
        onToggleView={vi.fn()}
      />
    );

    const difficultyBadge = within(container).getByText('A1 (Beginner)');
    const toggleButton = within(container).getByRole('button', { name: 'Show original story' });

    expect(difficultyBadge).toHaveClass('order-1', 'sm:order-2');
    expect(toggleButton).toHaveClass('order-3');
  });
}); 