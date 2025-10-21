import React from 'react';
import { render, screen } from '@testing-library/react';
import InteractiveText from '../InteractiveText';

// Mock StoryContext to provide the necessary context
vi.mock('../../../contexts/StoryContext', () => ({
  useStoryContext: () => ({
    fromLanguage: 'es',
    targetLanguage: 'en',
    translationData: {
      fromLanguage: 'es',
      toLanguage: 'en',
      includedVocabulary: [],
    },
    isDisplayingFromSide: true, // Show source language (Spanish)
  }),
  StoryProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock useWordActions hook
vi.mock('../../../hooks/useWordActions', () => ({
  useWordActions: () => ({
    isSaved: false,
    isTranslating: false,
    translation: null,
    isOpen: false,
    handleToggleMenu: vi.fn(),
    handleTranslate: vi.fn(),
    handleSave: vi.fn(),
  }),
}));

// Mock useSavedWords hook to return saved words
vi.mock('../../../hooks/interactiveText/useSavedWords', () => ({
  useSavedWords: () => ({
    savedOriginalWords: new Set<string>(['hola']), // 'hola' is saved in original words
    savedTargetWords: new Set<string>(),
    loading: false,
  }),
}));

// Mock useLanguages hook
vi.mock('../../../hooks/useLanguages', () => ({
  useLanguages: () => ({
    getLanguageIdByCode: (code: 'en' | 'es') => (code === 'en' ? 1 : 2),
  }),
}));

describe('InteractiveText saved word highlighting', () => {
  it('applies yellow highlight to saved words', () => {
    const tokens = [
      {
        type: 'word' as const,
        from_word: 'Hola',
        from_lemma: 'hola',
        to_word: 'Hello',
        to_lemma: 'hello',
        pos: 'interjection' as const,
        difficulty: 'a1' as const,
        from_definition: 'A greeting',
      },
      {
        type: 'whitespace' as const,
        value: ' ',
      },
      {
        type: 'word' as const,
        from_word: 'amigo',
        from_lemma: 'amigo',
        to_word: 'friend',
        to_lemma: 'friend',
        pos: 'noun' as const,
        difficulty: 'a1' as const,
        from_definition: 'A friend',
      },
      {
        type: 'punctuation' as const,
        value: '.',
      },
    ];

    render(
      <InteractiveText
        text='Hola amigo.'
        tokens={tokens}
        fromLanguage='es'
        targetLanguage='en'
        enableTooltips={false}
      />
    );

    // Find the word span for 'Hola'
    const hola = screen.getAllByText(/Hola/i)[0];
    // The WordHighlight applies classes on the same element
    expect(hola.parentElement?.querySelector('.bg-yellow-200')).toBeTruthy();
  });
});
