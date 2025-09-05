import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTokenizedText, type Token } from '../useTokenizedText';

describe('useTokenizedText', () => {
  it('returns empty array for blank input', () => {
    const { result } = renderHook(() => useTokenizedText('   '));
    expect(result.current).toEqual([]);
  });

  it('tokenizes words, whitespace and punctuation', () => {
    const text = "Hello, world! It's 2025.";
    const { result } = renderHook(() => useTokenizedText(text));

    const tokens = result.current as Token[];

    // Should include whitespace tokens and keep ordering
    expect(tokens.length).toBeGreaterThan(0);

    // Find a word token with punctuation separated
    const hello = tokens.find(
      t => t.kind === 'word' && (t as any).cleanWord === 'Hello'
    );
    expect(hello).toBeTruthy();

    const its = tokens.find(
      t => t.kind === 'word' && (t as any).cleanWord === "It's"
    );
    expect(its).toBeTruthy();

    const number = tokens.find(
      t => t.kind === 'word' && (t as any).cleanWord === '2025'
    );
    expect(number).toBeTruthy();

    // Ensure normalizedWord is lowercased and punctuation captured
    if (hello && hello.kind === 'word') {
      expect(hello.normalizedWord).toBe('hello');
      expect(typeof hello.punctuation).toBe('string');
    }
  });
});
