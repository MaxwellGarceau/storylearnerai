import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

// Import after mocks so the component uses the mocked hooks
import { VocabularySaveButton } from '../VocabularySaveButton';

describe('VocabularySaveButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('saves directly on click and disables while saving', async () => {
    const user = userEvent.setup();

    render(
      <VocabularySaveButton
        originalWord='hola'
        translatedWord='hello'
        fromLanguageId={2}
        translatedLanguageId={1}
        savedTranslationId={42}
        isSaved={false}
        t={(k: string) => k as unknown as any}
        saveVocabularyOverride={mockSaveVocabularyWord}
        checkExistsOverride={mockCheckVocabularyExists}
      />
    );

    // Wait until initial checking completes and save label appears
    await screen.findByText('vocabulary.save.title');
    const button = screen.getByRole('button', {
      name: /vocabulary\.save\.(title|button)/i,
    });

    await user.click(button);

    // Wait for the save to be triggered

    // Eventually save should be invoked with the expected payload
    await waitFor(() => {
      expect(mockSaveVocabularyWord).toHaveBeenCalledTimes(1);
    });
    expect(mockSaveVocabularyWord).toHaveBeenCalledWith(
      expect.objectContaining({
        original_word: 'hola',
        translated_word: 'hello',
        from_language_id: 2,
        translated_language_id: 1,
        saved_translation_id: 42,
      })
    );
  });

  it('shows saving state and auto-saves when translatedWord arrives later', async () => {
    const user = userEvent.setup();

    // Component to simulate delayed translation arrival
    const Wrapper = () => {
      const [translated, setTranslated] = useState('');
      return (
        <div>
          <VocabularySaveButton
            originalWord='hola'
            translatedWord={translated}
            fromLanguageId={2}
            translatedLanguageId={1}
            savedTranslationId={99}
            isSaved={false}
            onBeforeOpen={async () => {
              // Simulate async translation finishing shortly after click
              await new Promise(r => setTimeout(r, 10));
              setTranslated('hello');
            }}
            t={(k: string) => k as unknown as any}
            saveVocabularyOverride={mockSaveVocabularyWord}
            checkExistsOverride={mockCheckVocabularyExists}
          />
        </div>
      );
    };

    render(<Wrapper />);

    // Wait for initial state to render save label
    await screen.findByText('vocabulary.save.title');
    const button = screen.getByRole('button', {
      name: /vocabulary\.save\.(title|button)/i,
    });

    await user.click(button);

    // Eventually auto-saves once translatedWord arrives
    await waitFor(() => {
      expect(mockSaveVocabularyWord).toHaveBeenCalledTimes(1);
    });
    expect(mockSaveVocabularyWord).toHaveBeenCalledWith(
      expect.objectContaining({
        original_word: 'hola',
        translated_word: 'hello',
        from_language_id: 2,
        translated_language_id: 1,
        saved_translation_id: 99,
      })
    );
  });
});
