import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDifficultyLevels } from '../useDifficultyLevels';

vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) =>
        (
          ({
            'difficultyLevels.a1.label': 'A1',
            'difficultyLevels.a2.label': 'A2',
            'difficultyLevels.b1.label': 'B1',
            'difficultyLevels.b2.label': 'B2',
          }) as Record<string, string>
        )[key] ?? key,
    }),
  };
});

vi.mock('../../api/supabase/database/difficultyLevelService', () => ({
  DifficultyLevelService: class {
    getDifficultyLevels() {
      return Promise.resolve([
        { id: 1, code: 'a1', name: 'Beginner', created_at: 'now' },
        { id: 2, code: 'a2', name: 'Elementary', created_at: 'now' },
      ]);
    }
  },
}));

describe('useDifficultyLevels', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads levels and maps names/displays', async () => {
    const { result } = renderHook(() => useDifficultyLevels());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.difficultyLevels.length).toBe(2);
    expect(result.current.getDifficultyLevelName('a1')).toBe('Beginner');
    expect(result.current.getDifficultyLevelDisplay('a2')).toBe('A2');
    expect(result.current.getDifficultyLevelCode('Beginner')).toBe('a1');
  });
});
