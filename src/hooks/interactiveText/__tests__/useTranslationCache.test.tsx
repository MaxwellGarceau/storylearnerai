import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTranslationCache } from '../useTranslationCache';

vi.mock('../../useWordTranslation', () => ({
  useWordTranslation: () => ({
    translateWordInSentence: vi.fn(
      async ({}, _s, _t, _f) => 'hola' as unknown as string
    ) as any,
    translateSentence: vi.fn(async (_s: string) => 'hola mundo'),
  }),
}));

describe('useTranslationCache', () => {
  beforeEach(() => vi.clearAllMocks());

  it('caches word translations and tracks translating state', async () => {
    const extractSentenceContext = vi.fn(() => 'Hello world.');
    const { result } = renderHook(() =>
      useTranslationCache({
        extractSentenceContext,
        fromLanguage: 'en',
        targetLanguage: 'es',
      })
    );

    expect(result.current.translatingWords.size).toBe(0);

    await act(async () => {
      await result.current.handleTranslate('hello', 0);
    });

    expect(result.current.translatedWords.get('hello')).toBeTruthy();
    expect(result.current.translatingWords.size).toBe(0);

    // Second call should hit cache and not change
    await act(async () => {
      await result.current.handleTranslate('hello', 0);
    });
    expect(result.current.translatedWords.get('hello')).toBeTruthy();
  });
});
