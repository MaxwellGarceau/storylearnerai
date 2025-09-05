import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock UpsertModal to capture props
vi.mock('../VocabularyUpsertModal', () => ({
  __esModule: true,
  default: (props: unknown) => (
    <div data-testid='upsert-modal' data-props={JSON.stringify(props)}>
      Upsert
    </div>
  ),
}));

import { VocabularyEditModal } from '../VocabularyEditModal';
import type { VocabularyWithLanguages } from '../../../../types/database/vocabulary';

const vocab: VocabularyWithLanguages = {
  id: 1,
  original_word: 'hola',
  translated_word: 'hello',
  from_language_id: 2,
  translated_language_id: 1,
  created_at: '2024-01-01T00:00:00Z',
  definition: null,
  part_of_speech: null,
  frequency_level: null,
  original_word_context: null,
  translated_word_context: null,
  saved_translation_id: null,
  from_language: { id: 2, code: 'es', name: 'Spanish' },
  translated_language: { id: 1, code: 'en', name: 'English' },
};

describe('VocabularyEditModal', () => {
  it('renders UpsertModal in edit mode with vocabulary', () => {
    render(<VocabularyEditModal vocabulary={vocab} onClose={() => {}} />);

    const el = screen.getByTestId('upsert-modal');
    const props = JSON.parse(el.getAttribute('data-props') || '{}');
    expect(props.mode).toBe('edit');
    expect(props.vocabulary.original_word).toBe('hola');
  });
});
