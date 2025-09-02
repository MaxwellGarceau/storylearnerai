import React from 'react';
import { render, screen } from '@testing-library/react';
import InteractiveText from '../InteractiveText';

vi.mock('../../../hooks/useVocabulary', () => ({
  useVocabulary: () => ({
    vocabulary: [
      {
        id: 1,
        user_id: 'u',
        original_word: 'hola',
        translated_word: 'hello',
        translated_language_id: 1,
        from_language_id: 2,
        original_word_context: null,
        translated_word_context: null,
        definition: null,
        part_of_speech: null,
        frequency_level: null,
        saved_translation_id: null,
        created_at: '',
        updated_at: '',
        from_language_name: 'Spanish',
        translated_language_name: 'English',
      },
    ],
  }),
}));

vi.mock('../../../hooks/useLanguages', () => ({
  useLanguages: () => ({
    getLanguageIdByCode: (code: 'en' | 'es') => (code === 'en' ? 1 : 2),
  }),
}));

describe('InteractiveText saved word highlighting', () => {
  it('applies yellow highlight to saved words', () => {
    render(
      <InteractiveText
        text="Hola amigo."
        fromLanguage="es"
        targetLanguage="en"
        enableTooltips={false}
      />
    );

    // Find the word span for 'Hola'
    const hola = screen.getAllByText(/Hola/i)[0];
    // The WordHighlight applies classes on the same element
    expect(hola.parentElement?.querySelector('.bg-yellow-200')).toBeTruthy();
  });
});


