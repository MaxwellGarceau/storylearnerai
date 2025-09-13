import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import VocabularySelector from '../VocabularySelector';
import type { VocabularyWithLanguages } from '../../../types/database/vocabulary';

// Tests in this file were added by the assistant.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) => {
      const map: Record<string, string> = {
        'storyInput.optionsModal.vocabularyTitle': 'Learner Vocabulary',
        'storyInput.optionsModal.vocabularySubtitle':
          'Select target words to include',
        'storyInput.optionsModal.noVocabularyForPair':
          'No vocabulary available',
        'common.loading': 'Loading…',
        'storyInput.optionsModal.selectedCount': String(
          (vars?.count as number) ?? 0
        ),
      };
      return map[key] ?? key;
    },
  }),
}));

const makeVocab = (
  id: number,
  from: string,
  target: string
): VocabularyWithLanguages => ({
  id,
  user_id: 'u1',
  from_word: from,
  target_word: target,
  from_language_id: 1,
  target_language_id: 2,
  from_word_context: null,
  target_word_context: null,
  definition: null,
  part_of_speech: null,
  frequency_level: null,
  saved_translation_id: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  from_language: { id: 1, code: 'es', name: 'Spanish', native_name: 'Español' },
  target_language: {
    id: 2,
    code: 'en',
    name: 'English',
    native_name: 'English',
  },
});

describe('VocabularySelector', () => {
  it('renders empty state and loading state', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <VocabularySelector
        availableVocabulary={[]}
        selectedVocabulary={[]}
        onVocabularyChange={onChange}
        vocabLoading={true}
      />
    );
    expect(screen.getByText('Loading…')).toBeInTheDocument();

    rerender(
      <VocabularySelector
        availableVocabulary={[]}
        selectedVocabulary={[]}
        onVocabularyChange={onChange}
        vocabLoading={false}
      />
    );
    expect(screen.getByText('No vocabulary available')).toBeInTheDocument();
  });

  it('lists vocabulary and toggles selection using target_word as key', () => {
    const onChange = vi.fn();
    const items = [
      makeVocab(1, 'hola', 'hello'),
      makeVocab(2, 'adiós', 'goodbye'),
    ];

    render(
      <VocabularySelector
        availableVocabulary={items}
        selectedVocabulary={['hello']}
        onVocabularyChange={onChange}
        vocabLoading={false}
      />
    );

    // Buttons display "target → from"
    const holaBtn = screen.getByRole('button', { name: 'hello → hola' });
    const adiosBtn = screen.getByRole('button', { name: 'goodbye → adiós' });
    expect(holaBtn).toBeInTheDocument();
    expect(adiosBtn).toBeInTheDocument();

    // Toggling a selected item removes it (selection uses target_word)
    fireEvent.click(holaBtn);
    expect(onChange).toHaveBeenCalledWith([]);

    // Toggling an unselected item adds it; component preserves existing selections
    fireEvent.click(adiosBtn);
    expect(onChange).toHaveBeenLastCalledWith(['hello', 'goodbye']);
  });
});
