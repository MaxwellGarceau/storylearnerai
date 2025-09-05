import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSentenceContext } from '../useSentenceContext';

describe('useSentenceContext', () => {
  it('extracts sentence around given index', () => {
    const words = [
      'Hello',
      ', ',
      'world',
      '! ',
      'This',
      ' ',
      'is',
      ' ',
      'fine',
      '.',
    ];
    const { result } = renderHook(() => useSentenceContext(words));

    // Index 2 is in first sentence
    const s1 = result.current.extractSentenceContext(2);
    expect(s1).toBe('Hello, world!');

    // Index 8 is in second sentence
    const s2 = result.current.extractSentenceContext(8);
    expect(s2).toBe('This is fine.');
  });
});
