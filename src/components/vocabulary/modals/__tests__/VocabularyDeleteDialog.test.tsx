import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('../../../../hooks/useLocalization', () => ({
  useLocalization: () => ({ t: (k: string, _?: unknown) => k }),
}));

const mockDelete = vi.fn().mockResolvedValue(true);
vi.mock('../../../../hooks/useVocabulary', () => ({
  useVocabulary: () => ({ deleteVocabularyWord: mockDelete }),
}));

import { VocabularyDeleteDialog } from '../VocabularyDeleteDialog';
import type { VocabularyWithLanguages } from '../../../../types/database/vocabulary';

const vocab: VocabularyWithLanguages = {
  id: 1,
  from_word: 'hola',
  target_word: 'hello',
  from_language_id: 2,
  target_language_id: 1,
  created_at: '2024-01-01T00:00:00Z',
  definition: null,
  part_of_speech: null,
  frequency_level: null,
  from_word_context: null,
  target_word_context: null,
  saved_translation_id: null,
  from_language: { id: 2, code: 'es', name: 'Spanish' },
  translated_language: { id: 1, code: 'en', name: 'English' },
};

describe('VocabularyDeleteDialog', () => {
  it('calls delete and onClose/onDeleteSuccess on confirm', async () => {
    const onClose = vi.fn();
    const onDeleteSuccess = vi.fn();
    render(
      <VocabularyDeleteDialog
        vocabulary={vocab}
        onClose={onClose}
        onDeleteSuccess={onDeleteSuccess}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: 'common.delete' });
    fireEvent.click(deleteBtn);

    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(1));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDeleteSuccess).toHaveBeenCalledTimes(1);
  });
});
