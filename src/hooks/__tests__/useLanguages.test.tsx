import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLanguages } from '../useLanguages';

vi.mock('../../api/supabase/database/languageService', () => ({
  LanguageService: class {
    async getLanguages() {
      return [
        {
          id: 1,
          code: 'en',
          name: 'English',
          native_name: 'English',
          created_at: 'now',
        },
        {
          id: 2,
          code: 'es',
          name: 'Spanish',
          native_name: 'Español',
          created_at: 'now',
        },
      ];
    }
  },
}));

describe('useLanguages', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads languages and provides lookups', async () => {
    const { result } = renderHook(() => useLanguages());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.languages.length).toBe(2);
    expect(result.current.getLanguageName('en')).toBe('English');
    expect(result.current.getNativeLanguageName('es')).toBe('Español');
    expect(result.current.getLanguageCode('Spanish')).toBe('es');
  });
});
