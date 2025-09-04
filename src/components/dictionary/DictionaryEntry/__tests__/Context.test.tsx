import React from 'react';
import { render } from '@testing-library/react';
import { useDictionaryEntryContext } from '../Context';

// Test added by assistant: verifies hook usage contract without unhandled errors

describe('DictionaryEntry Context', () => {
  let consoleErrorSpy: vi.SpyInstance;
  let consoleWarnSpy: vi.SpyInstance;

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
    // Create a test component that uses the hook
    const TestComponent = () => {
      useDictionaryEntryContext();
      return null;
    };

    // Expect the render to throw
    expect(() => {
      render(<TestComponent />);
    }).toThrow(
      'DictionaryEntry components must be used within DictionaryEntry.Root'
    );
  });
});
