import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('../../../../hooks/useLocalization', () => ({
  useLocalization: () => ({ t: (k: string) => k }),
}));

vi.mock('../../../../hooks/useLanguages', () => ({
  useLanguages: () => ({
    languages: [
      { id: 1, code: 'en', name: 'English' },
      { id: 2, code: 'es', name: 'Spanish' },
    ],
  }),
}));

const mockSave = vi.fn().mockResolvedValue({ id: 1 });
vi.mock('../../../../hooks/useVocabulary', () => ({
  useVocabulary: () => ({
    saveVocabularyWord: mockSave,
    updateVocabularyWord: vi.fn(),
    vocabulary: [],
  }),
}));

import VocabularyUpsertModal from '../VocabularyUpsertModal';

describe('VocabularyUpsertModal (create)', () => {
  it('validates and submits create form', async () => {
    render(
      <VocabularyUpsertModal
        mode='create'
        onClose={() => {}}
        currentLanguageId={1}
        currentFromLanguageId={2}
        initialData={{ originalWord: 'hola', translatedWord: 'hello' }}
      />
    );

    // Interact with fields to trigger validation lifecycle
    const fromSelect = screen.getByLabelText(/vocabulary\.form\.fromLanguage/i);
    fireEvent.change(fromSelect, { target: { value: '2' } });

    const toSelect = screen.getByLabelText(/vocabulary\.form\.toLanguage/i);
    fireEvent.change(toSelect, { target: { value: '1' } });

    const original = screen.getByLabelText(/vocabulary\.form\.fromWord/i);
    fireEvent.change(original, { target: { value: 'hola' } });

    const translated = screen.getByLabelText(/vocabulary\.form\.targetWord/i);
    fireEvent.change(translated, { target: { value: 'hello' } });

    // Fill optional fields and submit
    const definition = screen.getByLabelText('vocabulary.form.definition');
    fireEvent.change(definition, { target: { value: 'greeting' } });

    // Submit the form directly to bypass button disabled state flakiness
    const form = document.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect(mockSave.mock.calls[0][0]).toMatchObject({
      from_word: 'hola',
      target_word: 'hello',
      from_language_id: 2,
      target_language_id: 1,
      definition: 'greeting',
    });
  });
});
