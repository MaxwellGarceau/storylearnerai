import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import LanguageSelector from '../LanguageSelector';

// Tests in this file were added by the assistant.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) => {
      const map: Record<string, string> = {
        'storyInput.optionsModal.languageLabel': 'Language',
        'storyInput.currentlySupported': `Only ${(vars?.language as string) ?? ''} is supported`,
      };
      return map[key] ?? key;
    },
  }),
}));

describe('LanguageSelector', () => {
  it('renders and changes language', () => {
    const onChange = vi.fn();
    const getLanguageName = vi.fn().mockReturnValue('English');

    render(
      <LanguageSelector
        selectedLanguage={'en'}
        onLanguageChange={onChange}
        getLanguageName={getLanguageName}
      />
    );

    expect(screen.getByText('Language')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect((select as HTMLSelectElement).value).toBe('en');

    fireEvent.change(select, { target: { value: 'en' } });
    expect(onChange).toHaveBeenCalledWith('en');

    expect(screen.getByText('Only English is supported')).toBeInTheDocument();
  });
});
