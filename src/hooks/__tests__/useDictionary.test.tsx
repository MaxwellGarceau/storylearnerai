import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDictionary } from '../useDictionary';
import { dictionaryService } from '../../lib/dictionary/dictionaryService';
import { DictionaryWord } from '../../types/dictionary';

// Mock the environment config
vi.mock('../../lib/config/env', () => ({
  EnvironmentConfig: {
    isDictionaryDisabled: vi.fn(() => false),
  },
}));

// Mock the dictionary service
vi.mock('../../lib/dictionary/dictionaryService', () => ({
  dictionaryService: {
    getWordInfo: vi.fn(),
  },
  createDictionaryError: vi.fn((code, message, details) => ({
    code,
    message,
    details: {
      ...details,
      timestamp: new Date().toISOString(),
    },
  })),
}));

const mockDictionaryService = vi.mocked(dictionaryService);

describe('useDictionary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDictionary());

    expect(result.current.wordInfo).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.searchWord).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('should search for a word successfully', async () => {
    const mockWordInfo = {
      word: 'hello',
      definitions: [{ definition: 'A greeting', partOfSpeech: 'noun' }],
      source: 'Test API',
    };

    mockDictionaryService.getWordInfo.mockResolvedValue(mockWordInfo);

    const { result } = renderHook(() => useDictionary());

    await act(async () => {
      await result.current.searchWord('hello');
    });

    await waitFor(() => {
      expect(result.current.wordInfo).toEqual(mockWordInfo);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(mockDictionaryService.getWordInfo).toHaveBeenCalledWith(
      'hello',
      undefined,
      'en'
    );
  });

  it('should handle loading state during search', async () => {
    // Create a promise that we can control
    let resolvePromise: (value: DictionaryWord) => void;
    const promise = new Promise<DictionaryWord>(resolve => {
      resolvePromise = resolve;
    });

    mockDictionaryService.getWordInfo.mockReturnValue(promise);

    const { result } = renderHook(() => useDictionary());

    act(() => {
      void result.current.searchWord('hello');
    });

    // Should be loading immediately
    expect(result.current.isLoading).toBe(true);
    expect(result.current.wordInfo).toBeNull();

    // Resolve the promise
    await act(async () => {
      resolvePromise!({
        word: 'hello',
        definitions: [{ definition: 'A greeting' }],
      });
      await promise;
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle search errors', async () => {
    const mockError = {
      code: 'WORD_NOT_FOUND' as const,
      message: 'Word not found',
      details: { word: 'nonexistent' },
    };

    mockDictionaryService.getWordInfo.mockRejectedValue(mockError);

    const { result } = renderHook(() => useDictionary());

    await act(async () => {
      await result.current.searchWord('nonexistent');
    });

    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.wordInfo).toBeNull();
    });
  });

  it('should handle empty word input', async () => {
    const { result } = renderHook(() => useDictionary());

    await act(async () => {
      await result.current.searchWord('');
    });

    expect(result.current.error).toMatchObject({
      code: 'INVALID_REQUEST',
      message: 'Word cannot be empty',
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.wordInfo).toBeNull();
  });

  it('should handle whitespace-only word input', async () => {
    const { result } = renderHook(() => useDictionary());

    await act(async () => {
      await result.current.searchWord('   ');
    });

    expect(result.current.error).toMatchObject({
      code: 'INVALID_REQUEST',
      message: 'Word cannot be empty',
    });
  });

  it('should clear error when clearError is called', async () => {
    const mockError = {
      code: 'API_ERROR' as const,
      message: 'API error',
      details: {},
    };

    mockDictionaryService.getWordInfo.mockRejectedValue(mockError);

    const { result } = renderHook(() => useDictionary());

    // First, trigger an error
    await act(async () => {
      await result.current.searchWord('error');
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    // Then clear the error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should cancel previous requests when new search is initiated', async () => {
    // Create a promise that we can control
    let resolveFirstPromise: (value: any) => void;
    const firstPromise = new Promise<any>(resolve => {
      resolveFirstPromise = resolve;
    });

    let resolveSecondPromise: (value: any) => void;
    const secondPromise = new Promise<any>(resolve => {
      resolveSecondPromise = resolve;
    });

    mockDictionaryService.getWordInfo
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(secondPromise);

    const { result } = renderHook(() => useDictionary());

    // Start first search
    act(() => {
      result.current.searchWord('first');
    });

    expect(result.current.isLoading).toBe(true);

    // Start second search before first completes
    act(() => {
      result.current.searchWord('second');
    });

    // Resolve first promise - should not affect state since it was cancelled
    await act(async () => {
      resolveFirstPromise!({
        word: 'first',
        definitions: [{ definition: 'First word' }],
      });
      await firstPromise;
    });

    // State should still be loading for second request
    expect(result.current.isLoading).toBe(true);
    expect(result.current.wordInfo).toBeNull();

    // Resolve second promise
    await act(async () => {
      resolveSecondPromise!({
        word: 'second',
        definitions: [{ definition: 'Second word' }],
      });
      await secondPromise;
    });

    await waitFor(() => {
      expect(result.current.wordInfo?.word).toBe('second');
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should search with custom language', async () => {
    const mockWordInfo = {
      word: 'hola',
      definitions: [{ definition: 'Hello in Spanish' }],
    };

    mockDictionaryService.getWordInfo.mockResolvedValue(mockWordInfo);

    const { result } = renderHook(() => useDictionary());

    await act(async () => {
      await result.current.searchWord('hola', undefined, 'es');
    });

    await waitFor(() => {
      expect(result.current.wordInfo).toEqual(mockWordInfo);
    });

    expect(mockDictionaryService.getWordInfo).toHaveBeenCalledWith(
      'hola',
      undefined,
      'es'
    );
  });

  it('should normalize word input', async () => {
    const mockWordInfo = {
      word: 'hello',
      definitions: [{ definition: 'A greeting' }],
    };

    mockDictionaryService.getWordInfo.mockResolvedValue(mockWordInfo);

    const { result } = renderHook(() => useDictionary());

    await act(async () => {
      await result.current.searchWord('  HELLO  ');
    });

    expect(mockDictionaryService.getWordInfo).toHaveBeenCalledWith(
      'hello',
      undefined,
      'en'
    );
  });
});
