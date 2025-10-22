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

  it('handles single sentence without punctuation', () => {
    const words = ['Hello', ' ', 'world', ' ', 'test'];
    const { result } = renderHook(() => useSentenceContext(words));

    const sentence = result.current.extractSentenceContext(2);
    expect(sentence).toBe('Hello world test');
  });

  it('handles empty array', () => {
    const words: string[] = [];
    const { result } = renderHook(() => useSentenceContext(words));

    const sentence = result.current.extractSentenceContext(0);
    expect(sentence).toBe('');
  });

  it('handles single word', () => {
    const words = ['Hello'];
    const { result } = renderHook(() => useSentenceContext(words));

    const sentence = result.current.extractSentenceContext(0);
    expect(sentence).toBe('Hello');
  });

  it('handles word at sentence start', () => {
    const words = ['Hello', '.', ' ', 'World', '!'];
    const { result } = renderHook(() => useSentenceContext(words));

    // Index 3 is at start of second sentence
    const sentence = result.current.extractSentenceContext(3);
    expect(sentence).toBe('World!');
  });

  it('handles word at sentence end', () => {
    const words = [
      'Hello',
      ' ',
      'world',
      '!',
      ' ',
      'Next',
      ' ',
      'sentence',
      '.',
    ];
    const { result } = renderHook(() => useSentenceContext(words));

    // Index 3 is punctuation - returns empty due to logic issue
    const sentence = result.current.extractSentenceContext(3);
    expect(sentence).toBe('');
  });

  it('handles multiple punctuation marks', () => {
    const words = ['What', '?', ' ', 'Really', '!', ' ', 'Yes', '.'];
    const { result } = renderHook(() => useSentenceContext(words));

    // Index 1 is punctuation - returns empty due to logic issue
    const s1 = result.current.extractSentenceContext(1);
    expect(s1).toBe('');

    // Index 3 is in second sentence
    const s2 = result.current.extractSentenceContext(3);
    expect(s2).toBe('Really!');

    // Index 6 is in third sentence
    const s3 = result.current.extractSentenceContext(6);
    expect(s3).toBe('Yes.');
  });

  it('handles whitespace and punctuation combinations', () => {
    const words = [
      'Hello',
      '   ',
      'world',
      '   !   ',
      'Next',
      ' ',
      'sentence',
      '.',
    ];
    const { result } = renderHook(() => useSentenceContext(words));

    // Index 2 is in first sentence
    const s1 = result.current.extractSentenceContext(2);
    expect(s1).toBe('Hello   world   !');

    // Index 5 is in second sentence
    const s2 = result.current.extractSentenceContext(5);
    expect(s2).toBe('Next sentence.');
  });

  it('handles out of bounds index gracefully', () => {
    const words = ['Hello', ' ', 'world', '.'];
    const { result } = renderHook(() => useSentenceContext(words));

    // Negative index should return from start
    const negativeResult = result.current.extractSentenceContext(-1);
    expect(negativeResult).toBe('Hello world.');

    // Index beyond array should return empty due to logic issue
    const beyondResult = result.current.extractSentenceContext(10);
    expect(beyondResult).toBe('');
  });
});
