import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WordToken from '../interactiveText/WordToken';
import type { LanguageCode } from '../../../types/llm/prompts';
import { MemoryRouter } from 'react-router-dom';
import * as useAuthModule from '../../../hooks/useAuth';

// Tests in this file were added by the assistant.

// Mock language id lookup used by WordMenu → VocabularySaveButton
vi.mock('../../../hooks/useLanguages', () => ({
  __esModule: true,
  useLanguages: () => ({
    getLanguageIdByCode: (code: string) =>
      code === 'en' ? 1 : code === 'es' ? 2 : 0,
    languages: [
      { id: 1, code: 'en', name: 'English', native_name: 'English' },
      { id: 2, code: 'es', name: 'Spanish', native_name: 'Español' },
    ],
  }),
}));

// Provide InteractiveText context with toggleable display side
const ctxBase = {
  fromLanguage: 'en' as LanguageCode,
  targetLanguage: 'es' as LanguageCode,
  savedOriginalWords: new Set<string>(),
  findSavedWordData: vi.fn(),
  targetWords: new Map<string, string>(),
  targetSentences: new Map<string, string>(),
  translatingWords: new Set<string>(),
  includedVocabulary: [],
  getOppositeWordFor: vi.fn(),
  isTranslatingWord: vi.fn(() => false),
  isSavedWord: vi.fn(() => false),
  isIncludedVocabulary: vi.fn(() => false),
};

let isDisplayingFromSide = true;

vi.mock('../useInteractiveTextContext', () => ({
  __esModule: true,
  useInteractiveTextContext: () => ({ ...ctxBase, isDisplayingFromSide }),
}));

// Ensure user is logged in so VocabularySaveButton renders
beforeEach(() => {
  vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
    user: { id: 'test-user' },
  } as unknown as ReturnType<typeof useAuthModule.useAuth>);
});

// Mock VocabularySaveButton to expose what WordMenu passes into it
vi.mock('../../vocabulary/buttons/VocabularySaveButton', () => ({
  __esModule: true,
  VocabularySaveButton: ({
    fromWord,
    targetWord,
    fromContext,
    targetContext,
    fromLanguageId,
    targetLanguageId,
    ...rest
  }: any) => (
    <div
      data-testid='mock-save-button'
      data-from-word={fromWord}
      data-target-word={targetWord}
      data-from-context={fromContext ?? ''}
      data-target-context={targetContext ?? ''}
      data-from-lang-id={fromLanguageId}
      data-target-lang-id={targetLanguageId}
      data-props={JSON.stringify(Object.keys(rest))}
    />
  ),
}));

describe('Canonical save mapping (from → target) passed to save button', () => {
  beforeEach(() => {
    // reset runtime translation overlay per test
    ctxBase.targetWords.clear();
  });

  it('from-side (displaying from-language): passes fromWord=display, targetWord=overlay', () => {
    isDisplayingFromSide = true;

    // Displayed token is from-language (en): "hello"; overlay opposite word is target-language (es): "hola"
    render(
      <MemoryRouter>
        <WordToken
          actionWordNormalized='hello'
          inclusionCheckWord='hello'
          cleanWord='Hello'
          punctuation=''
          isOpen={true}
          isSaved={false}
          isTranslating={false}
          overlayOppositeWord='hola'
          displaySentenceContext='Hello world.'
          overlaySentenceContext='Hola mundo.'
          fromLanguage='en'
          targetLanguage='es'
          onOpenChange={() => {}}
          onWordClick={() => {}}
          onTranslate={() => {}}
          enableTooltips={true}
          disabled={false}
        />
      </MemoryRouter>
    );

    const save = screen.getByTestId('mock-save-button');
    expect(save).toHaveAttribute('data-from-word', 'hello');
    expect(save).toHaveAttribute('data-target-word', 'hola');
  });

  it('target-side (displaying target-language): passes fromWord=overlay, targetWord=display', () => {
    isDisplayingFromSide = false;

    // Displayed token is target-language (es): "hola"; overlay opposite word is from-language (en): "hello"
    render(
      <MemoryRouter>
        <WordToken
          actionWordNormalized='hola'
          inclusionCheckWord='hola'
          cleanWord='Hola'
          punctuation=''
          isOpen={true}
          isSaved={false}
          isTranslating={false}
          overlayOppositeWord='hello'
          displaySentenceContext='Hola mundo.'
          overlaySentenceContext='Hello world.'
          fromLanguage='en'
          targetLanguage='es'
          onOpenChange={() => {}}
          onWordClick={() => {}}
          onTranslate={() => {}}
          enableTooltips={true}
          disabled={false}
        />
      </MemoryRouter>
    );

    const save = screen.getByTestId('mock-save-button');
    expect(save).toHaveAttribute('data-from-word', 'hello');
    expect(save).toHaveAttribute('data-target-word', 'hola');
  });
});
