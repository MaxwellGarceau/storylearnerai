import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StoryProvider, useStoryContext } from '../StoryContext';
import { useWordActions } from '../../hooks/useWordActions';
import { TranslationResponse } from '../../lib/translationService';

// Test component that uses the context
const TestComponent = () => {
  const { translateWord, getWordState, isWordTranslating } = useStoryContext();
  const wordState = getWordState('hello', 0);

  return (
    <div>
      <div data-testid='word-state'>{JSON.stringify(wordState)}</div>
      <div data-testid='is-translating'>
        {isWordTranslating('hello', 0).toString()}
      </div>
      <button onClick={() => translateWord('hello', 0)}>Translate</button>
    </div>
  );
};

// Test component that uses word actions
const WordActionsTestComponent = ({
  word,
  position,
}: {
  word: string;
  position?: number;
}) => {
  const { wordState, isTranslating, handleTranslate } = useWordActions(
    word,
    position
  );

  return (
    <div>
      <div data-testid='word-state'>{JSON.stringify(wordState)}</div>
      <div data-testid='is-translating'>{isTranslating.toString()}</div>
      <button onClick={handleTranslate}>Translate</button>
    </div>
  );
};

const mockTranslationData: TranslationResponse = {
  fromText: 'Hello world',
  toText: 'Hola mundo',
  fromLanguage: 'en',
  toLanguage: 'es',
  difficulty: 'a1',
  provider: 'mock',
  model: 'test-model',
  tokens: [
    {
      type: 'word',
      from_word: 'Hello',
      from_lemma: 'hello',
      to_word: 'Hola',
      to_lemma: 'hola',
      pos: 'interjection',
      difficulty: 'a1',
      from_definition: 'A greeting',
    },
    {
      type: 'whitespace',
      value: ' ',
    },
    {
      type: 'word',
      from_word: 'world',
      from_lemma: 'world',
      to_word: 'mundo',
      to_lemma: 'mundo',
      pos: 'noun',
      difficulty: 'a1',
      from_definition: 'The Earth',
    },
  ],
  includedVocabulary: [],
};

describe('StoryContext', () => {
  it('provides context values correctly', () => {
    render(
      <StoryProvider translationData={mockTranslationData}>
        <TestComponent />
      </StoryProvider>
    );

    const wordStateElement = screen.getByTestId('word-state');
    const wordState = JSON.parse(wordStateElement.textContent ?? '{}');

    expect(wordState.metadata.from_word).toBe('Hello');
    expect(wordState.metadata.to_word).toBe('Hola');
    expect(wordState.isOpen).toBe(false);
    expect(wordState.isSaved).toBe(false);
    expect(wordState.isTranslating).toBe(false);
  });

  it('handles word translation', () => {
    render(
      <StoryProvider translationData={mockTranslationData}>
        <TestComponent />
      </StoryProvider>
    );

    const translateButton = screen.getByText('Translate');
    fireEvent.click(translateButton);

    // Check that translation state is set
    const isTranslatingElement = screen.getByTestId('is-translating');
    expect(isTranslatingElement.textContent).toBe('true');
  });

  it('useWordActions hook works correctly', () => {
    render(
      <StoryProvider translationData={mockTranslationData}>
        <WordActionsTestComponent word='Hello' position={0} />
      </StoryProvider>
    );

    const wordStateElement = screen.getByTestId('word-state');
    const wordState = JSON.parse(wordStateElement.textContent ?? '{}');

    expect(wordState.metadata.from_word).toBe('Hello');
    expect(wordState.metadata.to_word).toBe('Hola');
    expect(wordState.position).toBe(0);
  });

  it('handles word actions translation', () => {
    render(
      <StoryProvider translationData={mockTranslationData}>
        <WordActionsTestComponent word='Hello' position={0} />
      </StoryProvider>
    );

    const translateButton = screen.getByText('Translate');
    fireEvent.click(translateButton);

    // Check that translation state is set
    const isTranslatingElement = screen.getByTestId('is-translating');
    expect(isTranslatingElement.textContent).toBe('true');
  });
});
