import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSavedWords } from '../useSavedWords';

vi.mock('../../useVocabulary', () => ({
  useVocabulary: () => ({
    vocabulary: [
      {
        id: 1,
        user_id: 'u1',
        from_word: 'Hello',
        target_word: 'Hola',
        from_language_id: 1,
        target_language_id: 2,
        from_word_context: null,
        target_word_context: null,
        definition: null,
        part_of_speech: null,
        frequency_level: null,
        saved_translation_id: null,
        created_at: 'now',
        updated_at: 'now',
        from_language: {
          id: 1,
          code: 'en',
          name: 'English',
          native_name: 'English',
        },
        target_language: {
          id: 2,
          code: 'es',
          name: 'Spanish',
          native_name: 'Español',
        },
      },
    ],
  }),
}));

vi.mock('../../useLanguages', () => ({
  useLanguages: () => ({
    getLanguageIdByCode: (code: 'en' | 'es') => (code === 'en' ? 1 : 2),
  }),
}));

describe('useSavedWords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds set of saved words and finder for language pair', () => {
    const { result } = renderHook(() => useSavedWords('en', 'es'));

    expect(result.current.savedOriginalWords.has('hello')).toBe(true);
    expect(result.current.findSavedWordData('hello')).toMatchObject({
      from_word: 'Hello',
      target_word: 'Hola',
    });
    expect(result.current.findSavedWordData('missing')).toBeNull();
  });
});
