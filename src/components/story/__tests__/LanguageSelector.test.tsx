import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';

// Tests in this file were added by the assistant.

// Mock the hooks before importing the component
vi.mock('../../hooks/useLanguages', () => ({
  useLanguages: () => ({
    languages: [
      { id: 1, code: 'en', name: 'English', native_name: 'English' },
      { id: 2, code: 'es', name: 'Spanish', native_name: 'Español' },
    ],
    loading: false,
    error: null,
    getLanguageName: vi.fn((code: string) => code === 'en' ? 'English' : 'Spanish'),
    getNativeLanguageName: vi.fn((code: string) => code === 'en' ? 'English' : 'Español'),
    getLanguageIdByCode: vi.fn((code: string) => code === 'en' ? 1 : 2),
    getLanguageNameById: vi.fn((id: number) => id === 1 ? 'English' : 'Spanish'),
    getLanguageCode: vi.fn((name: string) => name.toLowerCase() === 'english' ? 'en' : 'es'),
  }),
}));

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

// Import the component after setting up mocks
import LanguageSelector from '../LanguageSelector';

describe('LanguageSelector', () => {
  it('renders with correct label and selected language', () => {
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
    expect(screen.getByText('Only English is supported')).toBeInTheDocument();
  });

  it('renders select element', () => {
    const onChange = vi.fn();
    const getLanguageName = vi.fn().mockReturnValue('English');

    render(
      <LanguageSelector
        selectedLanguage={'en'}
        onLanguageChange={onChange}
        getLanguageName={getLanguageName}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('renders with data-language-section attribute', () => {
    const onChange = vi.fn();
    const getLanguageName = vi.fn().mockReturnValue('English');

    render(
      <LanguageSelector
        selectedLanguage={'en'}
        onLanguageChange={onChange}
        getLanguageName={getLanguageName}
      />
    );

    const section = screen.getByTestId('language-section');
    expect(section).toBeInTheDocument();
  });
});
