import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWordTranslation } from '../useWordTranslation';

vi.mock('../useToast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

vi.mock('../../lib/translationService', () => ({
  translationService: {
    translate: vi.fn(() => Promise.resolve({ targetText: 'hola' })),
    targetWordWithContext: vi.fn(() => Promise.resolve({ targetWord: 'hola' })),
  },
}));

describe('useWordTranslation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('translates a sentence', async () => {
    const { result } = renderHook(() => useWordTranslation());
    await act(async () => {
      const out = await result.current.translateSentence('Hello', 'en', 'es');
      expect(out).toBe('hola');
    });
  });

  it('translates word in sentence', async () => {
    const { result } = renderHook(() => useWordTranslation());
    await act(async () => {
      const out = await result.current.targetWordInSentence(
        'Hello',
        'Hello world.',
        'en',
        'es'
      );
      expect(out).toBe('hola');
    });
  });
});
