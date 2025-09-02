import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VocabularySaveButton } from '../VocabularySaveButton';

// Stable mocks across renders to avoid infinite effect loops
const mockCheckVocabularyExists = vi.fn().mockResolvedValue(false);
const mockSaveVocabularyWord = vi.fn().mockResolvedValue({ id: 1 });

vi.mock('../../../hooks/useVocabulary', () => ({
  useVocabulary: () => ({
    checkVocabularyExists: mockCheckVocabularyExists,
    saveVocabularyWord: mockSaveVocabularyWord,
  }),
}));

// Mock useLocalization to return keys directly
vi.mock('../../../hooks/useLocalization', () => ({
  useLocalization: () => ({ t: (k: string) => k }),
}));

describe('VocabularySaveButton', () => {
  it('saves directly on click and disables while saving', async () => {
    const user = userEvent.setup();

    render(
      <VocabularySaveButton
        originalWord="hola"
        translatedWord="hello"
        fromLanguageId={2}
        translatedLanguageId={1}
      />
    );

    // Wait until initial checking completes and save label appears
    await screen.findByText('vocabulary.save.title');
    const button = screen.getByRole('button', {
      name: /vocabulary\.save\.(title|button)/i,
    });

    await user.click(button);

    // While saving, the button should become disabled
    await waitFor(() => expect(button).toBeDisabled());

    // Eventually after the promise resolves, button should show saved state
    // Saved state renders a disabled ghost button with check icon and label
    await waitFor(() => {
      expect(mockSaveVocabularyWord).toHaveBeenCalledTimes(1);
      expect(mockSaveVocabularyWord).toHaveBeenCalledWith(
        expect.objectContaining({
          original_word: 'hola',
          translated_word: 'hello',
          from_language_id: 2,
          translated_language_id: 1,
        })
      );
    });
  });
});


