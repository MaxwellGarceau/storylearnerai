import React from 'react';
import { vi } from 'vitest';
import { useDictionaryEntryContext } from '../Context';

// Test added by assistant: verifies hook usage contract without unhandled errors

type ViSpyInstance = ReturnType<typeof vi.spyOn>;

describe('DictionaryEntry Context', () => {
  let consoleErrorSpy: ViSpyInstance;
  let consoleWarnSpy: ViSpyInstance;

  beforeEach(() => {
    // Mock console methods to suppress React error boundary warnings
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('throws when used outside of DictionaryEntry.Root', () => {
    // Test that the hook throws when context is null
    // Mock React.useContext to return null
    const originalUseContext = React.useContext;
    React.useContext = vi.fn().mockReturnValue(null);

    expect(() => {
      useDictionaryEntryContext();
    }).toThrow(
      'DictionaryEntry components must be used within DictionaryEntry.Root'
    );

    // Restore original useContext
    React.useContext = originalUseContext;
  });
});
