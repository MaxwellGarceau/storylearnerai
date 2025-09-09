import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WordToken from '../WordToken';
import { LanguageCode } from '../../../../types/llm/prompts';
import React from 'react';

// Mock InteractiveText context to provide languages
vi.mock('../../useInteractiveTextContext', () => ({
  __esModule: true,
  useInteractiveTextContext: () => ({
    fromLanguage: 'en',
    targetLanguage: 'es',
    isIncludedVocabulary: vi.fn(() => false),
    getTargetWord: vi.fn(),
    isTranslatingWord: vi.fn(() => false),
    isSavedWord: vi.fn(() => false),
    savedOriginalWords: new Set(),
    findSavedWordData: vi.fn(),
    targetWords: new Map(),
    targetSentences: new Map(),
    translatingWords: new Set(),
    includedVocabulary: [],
  }),
}));

interface WordMenuProps {
  children: React.ReactNode;
  word: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTranslate?: (word: string) => void;
  fromLanguage?: LanguageCode;
  targetLanguage?: LanguageCode;
  targetWord?: string;
  fromSentence?: string;
  targetSentence?: string;
  isSaved?: boolean;
  isTranslating?: boolean;
}

// Mock WordMenu to be a lightweight wrapper we can interact with
vi.mock('../../WordMenu', () => ({
  __esModule: true,
  default: ({
    word,
    open,
    onOpenChange,
    onTranslate,
    fromLanguage,
    targetLanguage,
    targetWord,
    fromSentence,
    targetSentence,
    isSaved,
    isTranslating,
    children,
  }: WordMenuProps) => (
    <div data-testid='word-menu' data-open={String(open)}>
      <div data-testid='menu-props'>
        <span data-testid='menu-word'>{word}</span>
        <span data-testid='menu-from'>{fromLanguage}</span>
        <span data-testid='menu-target'>{targetLanguage}</span>
        <span data-testid='menu-saved'>{String(isSaved)}</span>
        <span data-testid='menu-translating'>{String(isTranslating)}</span>
        <span data-testid='menu-translated-word'>{targetWord ?? ''}</span>
        <span data-testid='menu-orig-sent'>{fromSentence ?? ''}</span>
        <span data-testid='menu-trans-sent'>{targetSentence ?? ''}</span>
      </div>
      <button data-testid='menu-open-true' onClick={() => onOpenChange?.(true)}>
        open
      </button>
      <button data-testid='menu-translate' onClick={() => onTranslate?.(word)}>
        translate
      </button>
      <div>{children}</div>
    </div>
  ),
}));

describe('WordToken', () => {
  afterEach(() => {
    cleanup();
  });

  const commonProps = {
    normalizedWord: 'hello',
    cleanWord: 'Hello',
    punctuation: ',',
    isOpen: false,
    isSaved: true,
    isTranslating: false,
    targetWord: undefined as string | undefined,
    fromSentence: 'Hello world.',
    targetSentence: 'Hola mundo.',
    fromLanguage: 'en' as LanguageCode,
    targetLanguage: 'es' as LanguageCode,
    onOpenChange: vi.fn(),
    onWordClick: vi.fn(),
    onTranslate: vi.fn(),
    enableTooltips: true,
    disabled: false,
  };

  it('renders with tooltips disabled using plain highlight and overlay when provided', () => {
    render(
      <WordToken {...commonProps} enableTooltips={false} targetWord='hola' />
    );

    // No WordMenu when tooltips disabled
    expect(screen.queryByTestId('word-menu')).not.toBeInTheDocument();

    // Overlay text and punctuation should be present in DOM
    expect(screen.getByText('hola')).toBeInTheDocument();
    expect(screen.getByText(',')).toBeInTheDocument();
    // The clean word appears as text within highlight
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders WordMenu when tooltips enabled and forwards props and context languages', () => {
    render(<WordToken {...commonProps} />);

    expect(screen.getByTestId('word-menu')).toBeInTheDocument();
    expect(screen.getByTestId('menu-word')).toHaveTextContent('hello');
    expect(screen.getByTestId('menu-from')).toHaveTextContent('en');
    expect(screen.getByTestId('menu-target')).toHaveTextContent('es');
    expect(screen.getByTestId('menu-saved')).toHaveTextContent('true');
    expect(screen.getByTestId('menu-orig-sent')).toHaveTextContent(
      'Hello world.'
    );
    expect(screen.getByTestId('menu-trans-sent')).toHaveTextContent(
      'Hola mundo.'
    );
  });

  it('calls onWordClick when the word is clicked', () => {
    const onWordClick = vi.fn();
    render(<WordToken {...commonProps} onWordClick={onWordClick} />);

    fireEvent.click(screen.getByText('Hello'));
    expect(onWordClick).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenChange from menu mock', () => {
    const onOpenChange = vi.fn();
    render(<WordToken {...commonProps} onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByTestId('menu-open-true'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('delegates translate action to onTranslate via menu mock', () => {
    const onTranslate = vi.fn();
    render(<WordToken {...commonProps} onTranslate={onTranslate} />);

    fireEvent.click(screen.getByTestId('menu-translate'));
    expect(onTranslate).toHaveBeenCalledTimes(1);
  });
});
