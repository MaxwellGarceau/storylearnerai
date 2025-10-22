import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTokenSentenceContexts } from '../useTokenSentenceContexts';
import type { TranslationToken } from '../../../types/llm/tokens';

describe('useTokenSentenceContexts', () => {
  const createWordToken = (
    fromWord: string,
    toWord: string,
    fromLemma?: string,
    toLemma?: string
  ): TranslationToken => ({
    type: 'word',
    from_word: fromWord,
    to_word: toWord,
    from_lemma: fromLemma ?? fromWord,
    to_lemma: toLemma ?? toWord,
    pos: 'noun',
    difficulty: 'a1',
    from_definition: 'Test definition',
  });

  const createPunctuationToken = (value: string): TranslationToken =>
    ({
      type: 'punctuation',
      value,
    }) as TranslationToken;

  const createWhitespaceToken = (value: string): TranslationToken =>
    ({
      type: 'whitespace',
      value,
    }) as TranslationToken;

  it('extracts sentence contexts for both sides', () => {
    const tokens: TranslationToken[] = [
      createWordToken('Hello', 'Hola'),
      createWhitespaceToken(' '),
      createWordToken('world', 'mundo'),
      createPunctuationToken('!'),
      createWhitespaceToken(' '),
      createWordToken('This', 'Esto'),
      createWhitespaceToken(' '),
      createWordToken('is', 'es'),
      createWhitespaceToken(' '),
      createWordToken('fine', 'bien'),
      createPunctuationToken('.'),
    ];

    const { result } = renderHook(() => useTokenSentenceContexts(tokens, 2));

    expect(result.current.fromSentence).toBe('Hello world!');
    expect(result.current.targetSentence).toBe('Hola mundo!');
  });

  it('handles undefined position', () => {
    const tokens: TranslationToken[] = [
      createWordToken('Hello', 'Hola'),
      createWhitespaceToken(' '),
      createWordToken('world', 'mundo'),
      createPunctuationToken('.'),
    ];

    const { result } = renderHook(() =>
      useTokenSentenceContexts(tokens, undefined)
    );

    expect(result.current.fromSentence).toBe('');
    expect(result.current.targetSentence).toBe('');
  });

  it('handles empty tokens array', () => {
    const tokens: TranslationToken[] = [];

    const { result } = renderHook(() => useTokenSentenceContexts(tokens, 0));

    expect(result.current.fromSentence).toBe('');
    expect(result.current.targetSentence).toBe('');
  });

  it('handles single word sentence', () => {
    const tokens: TranslationToken[] = [
      createWordToken('Hello', 'Hola'),
      createPunctuationToken('.'),
    ];

    const { result } = renderHook(() => useTokenSentenceContexts(tokens, 0));

    expect(result.current.fromSentence).toBe('Hello.');
    expect(result.current.targetSentence).toBe('Hola.');
  });

  it('handles sentence without punctuation', () => {
    const tokens: TranslationToken[] = [
      createWordToken('Hello', 'Hola'),
      createWhitespaceToken(' '),
      createWordToken('world', 'mundo'),
      createWhitespaceToken(' '),
      createWordToken('test', 'prueba'),
    ];

    const { result } = renderHook(() => useTokenSentenceContexts(tokens, 2));

    expect(result.current.fromSentence).toBe('Hello world test');
    expect(result.current.targetSentence).toBe('Hola mundo prueba');
  });

  it('handles multiple sentences', () => {
    const tokens: TranslationToken[] = [
      createWordToken('First', 'Primero'),
      createWhitespaceToken(' '),
      createWordToken('sentence', 'oración'),
      createPunctuationToken('.'),
      createWhitespaceToken(' '),
      createWordToken('Second', 'Segundo'),
      createWhitespaceToken(' '),
      createWordToken('sentence', 'oración'),
      createPunctuationToken('!'),
    ];

    // Test first sentence
    const { result: result1 } = renderHook(() =>
      useTokenSentenceContexts(tokens, 1)
    );
    expect(result1.current.fromSentence).toBe('First sentence.');
    expect(result1.current.targetSentence).toBe('Primero oración.');

    // Test second sentence
    const { result: result2 } = renderHook(() =>
      useTokenSentenceContexts(tokens, 6)
    );
    expect(result2.current.fromSentence).toBe('Second sentence!');
    expect(result2.current.targetSentence).toBe('Segundo oración!');
  });

  it('handles complex punctuation and whitespace', () => {
    const tokens: TranslationToken[] = [
      createWordToken('What', 'Qué'),
      createPunctuationToken('?'),
      createWhitespaceToken('   '),
      createWordToken('Really', 'Realmente'),
      createPunctuationToken('!'),
      createWhitespaceToken('   '),
      createWordToken('Yes', 'Sí'),
      createPunctuationToken('.'),
    ];

    const { result } = renderHook(() => useTokenSentenceContexts(tokens, 1));

    expect(result.current.fromSentence).toBe('');
    expect(result.current.targetSentence).toBe('');
  });

  it('handles word at sentence boundaries', () => {
    const tokens: TranslationToken[] = [
      createWordToken('Hello', 'Hola'),
      createPunctuationToken('.'),
      createWhitespaceToken(' '),
      createWordToken('World', 'Mundo'),
      createPunctuationToken('!'),
    ];

    // Test word at start of second sentence
    const { result: result1 } = renderHook(() =>
      useTokenSentenceContexts(tokens, 3)
    );
    expect(result1.current.fromSentence).toBe('World!');
    expect(result1.current.targetSentence).toBe('Mundo!');

    // Test word at end of first sentence
    const { result: result2 } = renderHook(() =>
      useTokenSentenceContexts(tokens, 1)
    );
    expect(result2.current.fromSentence).toBe('');
    expect(result2.current.targetSentence).toBe('');
  });

  it('handles out of bounds position', () => {
    const tokens: TranslationToken[] = [
      createWordToken('Hello', 'Hola'),
      createWhitespaceToken(' '),
      createWordToken('world', 'mundo'),
      createPunctuationToken('.'),
    ];

    // Test negative position
    const { result: result1 } = renderHook(() =>
      useTokenSentenceContexts(tokens, -1)
    );
    expect(result1.current.fromSentence).toBe('Hello world.');
    expect(result1.current.targetSentence).toBe('Hola mundo.');

    // Test position beyond array
    const { result: result2 } = renderHook(() =>
      useTokenSentenceContexts(tokens, 10)
    );
    expect(result2.current.fromSentence).toBe('');
    expect(result2.current.targetSentence).toBe('');
  });

  it('handles mixed token types correctly', () => {
    const tokens: TranslationToken[] = [
      createWordToken('Hello', 'Hola'),
      createWhitespaceToken(' '),
      createPunctuationToken(','),
      createWhitespaceToken(' '),
      createWordToken('world', 'mundo'),
      createPunctuationToken('!'),
    ];

    const { result } = renderHook(() => useTokenSentenceContexts(tokens, 2));

    expect(result.current.fromSentence).toBe('Hello , world!');
    expect(result.current.targetSentence).toBe('Hola , mundo!');
  });

  it('handles tokens with empty strings', () => {
    const tokens: TranslationToken[] = [
      createWordToken('', ''),
      createWhitespaceToken(' '),
      createWordToken('test', 'prueba'),
      createPunctuationToken('.'),
    ];

    const { result } = renderHook(() => useTokenSentenceContexts(tokens, 2));

    expect(result.current.fromSentence).toBe('test.');
    expect(result.current.targetSentence).toBe('prueba.');
  });

  it('handles position at different sentence positions', () => {
    const tokens: TranslationToken[] = [
      createWordToken('First', 'Primero'),
      createWhitespaceToken(' '),
      createWordToken('sentence', 'oración'),
      createPunctuationToken('.'),
      createWhitespaceToken(' '),
      createWordToken('Second', 'Segundo'),
      createWhitespaceToken(' '),
      createWordToken('sentence', 'oración'),
      createPunctuationToken('!'),
      createWhitespaceToken(' '),
      createWordToken('Third', 'Tercero'),
      createWhitespaceToken(' '),
      createWordToken('sentence', 'oración'),
      createPunctuationToken('?'),
    ];

    // Test each sentence
    const positions = [1, 6, 11];
    const expectedFrom = [
      'First sentence.',
      'Second sentence!',
      'Third sentence?',
    ];
    const expectedTarget = [
      'Primero oración.',
      'Segundo oración!',
      'Tercero oración?',
    ];

    positions.forEach((position, index) => {
      const { result } = renderHook(() =>
        useTokenSentenceContexts(tokens, position)
      );
      expect(result.current.fromSentence).toBe(expectedFrom[index]);
      expect(result.current.targetSentence).toBe(expectedTarget[index]);
    });
  });
});
