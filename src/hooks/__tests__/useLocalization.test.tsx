import { renderHook, act } from '@testing-library/react';
import { useLocalization } from '../useLocalization';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../lib/i18n';
import { vi } from 'vitest';

// Mock i18next
const mockChangeLanguage = vi.fn();
const baseI18n = {
  language: 'en',
  changeLanguage: mockChangeLanguage,
  hasResourceBundle: () => true,
};

vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({
      i18n: baseI18n,
      t: (key: string) => key,
    }),
  };
});

// Mock useLanguages to avoid side effects (Supabase) in full suite runs
vi.mock('../useLanguages', () => ({
  useLanguages: () => ({
    languages: [
      { id: '1', code: 'en', name: 'English', native_name: 'English', created_at: '2023-01-01T00:00:00Z' },
      { id: '2', code: 'es', name: 'Spanish', native_name: 'Español', created_at: '2023-01-01T00:00:00Z' },
    ],
    loading: false,
    error: null,
    getLanguageName: (code: string) => (code === 'en' ? 'English' : code === 'es' ? 'Spanish' : code),
    getNativeLanguageName: (code: string) => (code === 'en' ? 'English' : code === 'es' ? 'Español' : code),
    languageMap: new Map([
      ['en', 'English'],
      ['es', 'Spanish'],
    ]),
  }),
}));

describe('useLocalization', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    mockChangeLanguage.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the correct initial state', () => {
    const { result } = renderHook(() => useLocalization(), { wrapper });

    expect(result.current.currentLocalization).toBe('en');
    expect(result.current.isLocalizationLoaded).toBe(true);
    expect(typeof result.current.changeLocalization).toBe('function');
    expect(typeof result.current.getCurrentLocalization).toBe('function');
    expect(typeof result.current.getSupportedLocalizations).toBe('function');
    expect(typeof result.current.t).toBe('function');
  });

  it('returns supported languages', () => {
    const { result } = renderHook(() => useLocalization(), { wrapper });

    const supportedLanguages = result.current.getSupportedLocalizations();
    expect(supportedLanguages).toEqual([
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' }
    ]);
  });

  it('returns current language object', () => {
    const { result } = renderHook(() => useLocalization(), { wrapper });

    const currentLanguage = result.current.getCurrentLocalization();
    expect(currentLanguage).toEqual({
      code: 'en',
      name: 'English',
      nativeName: 'English',
    });
  });

  it('returns fallback language when current language is not supported', () => {
    // Mock i18next to return an unsupported language
    baseI18n.language = 'fr';

    const { result } = renderHook(() => useLocalization(), { wrapper });

    const currentLanguage = result.current.getCurrentLocalization();
    expect(currentLanguage).toEqual({ code: 'en', name: 'English', nativeName: 'English' }); // Should return first supported language
  });

  it('calls changeLanguage and stores preference in localStorage', async () => {
    mockChangeLanguage.mockImplementation(async (code: string) => {
      baseI18n.language = code;
      return undefined;
    });
    baseI18n.language = 'en';
    const { result } = renderHook(() => useLocalization(), { wrapper });
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    await act(async () => {
      await result.current.changeLocalization('es');
    });

    expect(mockChangeLanguage).toHaveBeenCalledWith('es');
    expect(setItemSpy).toHaveBeenCalledWith('i18nextLng', 'es');
  });

  it('handles changeLanguage errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockChangeLanguage.mockRejectedValueOnce(new Error('Language change failed'));

    const { result } = renderHook(() => useLocalization(), { wrapper });

    await act(async () => {
      await result.current.changeLocalization('es');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to change language:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('maintains stable function references', () => {
    const { result, rerender } = renderHook(() => useLocalization(), { wrapper });

    const initialChangeLocalization = result.current.changeLocalization;
    const initialGetCurrentLanguage = result.current.getCurrentLocalization;
    const initialGetSupportedLanguages = result.current.getSupportedLocalizations;

    rerender();

    expect(result.current.changeLocalization).toBe(initialChangeLocalization);
    expect(result.current.getCurrentLocalization).toBe(initialGetCurrentLanguage);
    expect(result.current.getSupportedLocalizations).toBe(initialGetSupportedLanguages);
  });
});
