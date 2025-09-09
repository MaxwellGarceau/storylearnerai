import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import DifficultySelector from '../DifficultySelector';

// Tests in this file were added by the assistant.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) => {
      const map: Record<string, string> = {
        'storyInput.optionsModal.difficultyLabel': 'Difficulty',
        'storyInput.optionsModal.a1': 'A1 (Beginner)',
        'storyInput.optionsModal.a2': 'A2 (Elementary)',
        'storyInput.optionsModal.b1': 'B1 (Intermediate)',
        'storyInput.optionsModal.b2': 'B2 (Upper Intermediate)',
        'storyInput.difficultyDescription': `Adapted for ${(vars?.language as string) ?? ''}`,
      };
      return map[key] ?? key;
    },
  }),
}));

describe('DifficultySelector', () => {
  it('renders and changes difficulty', () => {
    const onChange = vi.fn();
    const getLanguageName = vi.fn().mockReturnValue('English');

    render(
      <DifficultySelector
        selectedDifficulty={'a1'}
        onDifficultyChange={onChange}
        getLanguageName={getLanguageName}
      />
    );

    expect(screen.getByText('Difficulty')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect((select as HTMLSelectElement).value).toBe('a1');

    fireEvent.change(select, { target: { value: 'b2' } });
    expect(onChange).toHaveBeenCalledWith('b2');

    expect(screen.getByText('Adapted for English')).toBeInTheDocument();
  });
});


