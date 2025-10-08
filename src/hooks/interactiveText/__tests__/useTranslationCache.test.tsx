import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTranslationCache } from '../useTranslationCache';

vi.mock('../../useWordTranslation', () => ({
  useWordTranslation: () => ({
    targetWordInSentence: vi.fn(
      (_word: string, _sentence: string, _from: string, _to: string) =>
        Promise.resolve('hola')
    ),
    translateSentence: vi.fn((_s: string) => Promise.resolve('hola mundo')),
  }),
}));

describe('useTranslationCache', () => {
  beforeEach(() => vi.clearAllMocks());

  it('caches word translations and tracks translating state', async () => {
    const extractSentenceContext = vi.fn(() => 'Hello world.');
    const mockTokens = [
      { type: 'word', to_lemma: 'hello', from_lemma: 'hello', from_word: 'hola' },
      { type: 'whitespace', value: ' ' },
      { type: 'word', to_lemma: 'world', from_lemma: 'world', from_word: 'mundo' },
    ];
    const { result } = renderHook(() =>
      useTranslationCache({
        extractSentenceContext,
        tokens: mockTokens,
      })
    );

    expect(result.current.translatingWords.size).toBe(0);

    await act(async () => {
      await result.current.handleTranslate('hello', 0);
    });

    // Check that translation is stored with position-based key
    expect(result.current.targetWords.get('hello:0')).toBeTruthy();
    expect(result.current.translatingWords.size).toBe(0);

    // Second call should hit cache and not change
    await act(async () => {
      await result.current.handleTranslate('hello', 0);
    });
    expect(result.current.targetWords.get('hello:0')).toBeTruthy();
  });
});
