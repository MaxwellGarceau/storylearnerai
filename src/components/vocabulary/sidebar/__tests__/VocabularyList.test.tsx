import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { VocabularyList } from '../VocabularyList';
import type { VocabularyWithLanguages } from '../../../../types/database/vocabulary';

const items: VocabularyWithLanguages[] = [
  {
    id: 1,
    from_word: 'hola',
    target_word: 'hello',
    from_language_id: 2,
    target_language_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    definition: 'greeting',
    part_of_speech: 'interjection',
    frequency_level: 'common',
    from_word_context: null,
    target_word_context: null,
    saved_translation_id: null,
    from_language: { id: 2, code: 'es', name: 'Spanish' },
    target_language: { id: 1, code: 'en', name: 'English' },
  },
];

const languages = [
  { id: 1, code: 'en', name: 'English' },
  { id: 2, code: 'es', name: 'Spanish' },
];

describe('VocabularyList', () => {
  it('renders list items with language names and calls onItemClick', () => {
    const onItemClick = vi.fn();
    render(
      <VocabularyList
        items={items}
        languages={languages}
        onItemClick={onItemClick}
      />
    );

    expect(screen.getByText('hola')).toBeInTheDocument();
    expect(screen.getByText('hello')).toBeInTheDocument();
    // Language names rendered in metadata line
    expect(screen.getByText(/Spanish/)).toBeInTheDocument();
    expect(screen.getByText(/English/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('hola'));
    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onItemClick).toHaveBeenCalledWith(items[0]);
  });
});
