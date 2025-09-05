import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VocabularySidebar } from '../VocabularySidebar';

// Mocks
vi.mock('../../../../hooks/useLocalization', () => ({
  useLocalization: () => ({ t: (k: string) => k }),
}));

const mockVocabulary = [
  {
    id: 1,
    original_word: 'hola',
    translated_word: 'hello',
    from_language_id: 2,
    translated_language_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    definition: 'greeting',
    part_of_speech: 'interjection',
    frequency_level: 'common',
    original_word_context: null,
    translated_word_context: null,
    saved_translation_id: null,
    from_language: { id: 2, code: 'es', name: 'Spanish' },
    translated_language: { id: 1, code: 'en', name: 'English' },
  },
];

vi.mock('../../../../hooks/useVocabulary', () => ({
  useVocabulary: () => ({ vocabulary: mockVocabulary, loading: false }),
}));

vi.mock('../../../../hooks/useLanguages', () => ({
  useLanguages: () => ({
    languages: [
      { id: 1, code: 'en', name: 'English' },
      { id: 2, code: 'es', name: 'Spanish' },
    ],
  }),
}));

vi.mock('../../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

describe('VocabularySidebar', () => {
  it('renders list and can open save modal when user is present', () => {
    render(
      <VocabularySidebar
        className=''
        currentLanguageId={1}
        currentFromLanguageId={2}
      />
    );

    // Header and count badge
    expect(screen.getByText('vocabulary.title')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    // List item
    expect(screen.getByText('hola')).toBeInTheDocument();
    expect(screen.getByText('hello')).toBeInTheDocument();

    // Open Save Modal via plus button in the header area
    const headerContainer = screen.getByText('vocabulary.title').closest('div')!
      .parentElement as HTMLElement; // The outer flex container has the add button
    const addBtn = within(headerContainer).getAllByRole('button')[0];
    fireEvent.click(addBtn);

    // Modal container should appear
    expect(screen.getByText('vocabulary.save.title')).toBeInTheDocument();
  });
});
