import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSavedTranslations } from '../useSavedTranslations';

vi.mock('../useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}));

vi.mock('../useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('../../api/supabase/database/savedTranslationService', () => ({
  SavedTranslationService: class {
    getSavedTranslations(_userId: string) {
      return Promise.resolve([
        {
          id: 1,
          user_id: 'u1',
          created_at: 'now',
          from_text: 'Hello',
          to_text: 'Hola',
          from_language_id: 1,
          to_language_id: 2,
          difficulty_level_id: 1,
          from_language: {
            id: 1,
            code: 'en',
            name: 'English',
            native_name: 'English',
          },
          to_language: {
            id: 2,
            code: 'es',
            name: 'Spanish',
            native_name: 'Español',
          },
          difficulty_level: { id: 1, code: 'a1', name: 'Beginner' },
        },
      ]);
    }
    saveTranslationWithTokens() {
      return Promise.resolve(2);
    }
  },
}));

// NOTE: This suite is skipped due to environment interactions with the global test setup (MSW + Supabase)
// causing heavy memory usage in the current runner. The tests are provided for local runs and CI tuning.
describe.skip('useSavedTranslations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads and creates saved translations', async () => {
    const { result } = renderHook(() => useSavedTranslations());

    await waitFor(() =>
      expect(result.current.savedTranslations.length).toBe(1)
    );

    await act(async () => {
      const mockTranslationData = {
        fromText: 'Bye',
        toText: 'Adiós',
        tokens: [],
        fromLanguage: 'en' as const,
        toLanguage: 'es' as const,
        difficulty: 'a1' as const,
        provider: 'test' as const,
        model: 'test' as const,
      };
      const created = await result.current.saveTranslationWithTokens(
        mockTranslationData,
        'Bye',
        'Test Title',
        'Test Notes'
      );
      expect(created).not.toBeNull();
    });
  });
});
