import { renderHook, act } from '@testing-library/react';
import { useLocalization, SUPPORTED_LANGUAGES } from '../useLocalization';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../lib/i18n';
import { vi } from 'vitest';

// Mock i18next
vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({
      i18n: {
        language: 'en',
        changeLanguage: vi.fn(),
        isLanguageLoadedToLocale: vi.fn().mockReturnValue(true),
      },
      t: vi.fn((key: string) => key),
    }),
  };
});

describe('useLocalization', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
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
    vi.doMock('react-i18next', async () => {
      const actual = await vi.importActual('react-i18next');
      return {
        ...actual,
        useTranslation: () => ({
          i18n: {
            language: 'fr', // Unsupported language
            changeLanguage: vi.fn(),
            isLanguageLoadedToLocale: vi.fn().mockReturnValue(true),
          },
          t: vi.fn((key: string) => key),
        }),
      };
    });

    const { result } = renderHook(() => useLocalization(), { wrapper });

    const currentLanguage = result.current.getCurrentLocalization();
    expect(currentLanguage).toEqual({ code: 'en', name: 'English', nativeName: 'English' }); // Should return first supported language
  });

  it('calls changeLanguage and stores preference in localStorage', async () => {
    const mockChangeLanguage = vi.fn();
    const mockI18n = {
      language: 'en',
      changeLanguage: mockChangeLanguage,
      isLanguageLoadedToLocale: vi.fn().mockReturnValue(true),
    };

    vi.doMock('react-i18next', async () => {
      const actual = await vi.importActual('react-i18next');
      return {
        ...actual,
        useTranslation: () => ({
          i18n: mockI18n,
          t: vi.fn((key: string) => key),
        }),
      };
    });

    const { result } = renderHook(() => useLocalization(), { wrapper });

    await act(async () => {
      await result.current.changeLocalization('es');
    });

    expect(mockChangeLanguage).toHaveBeenCalledWith('es');
    expect(localStorage.getItem('i18nextLng')).toBe('es');
  });

  it('handles changeLanguage errors gracefully', async () => {
    const mockChangeLanguage = vi.fn().mockRejectedValue(new Error('Language change failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockI18n = {
      language: 'en',
      changeLanguage: mockChangeLanguage,
      isLanguageLoadedToLocale: vi.fn().mockReturnValue(true),
    };

    vi.doMock('react-i18next', async () => {
      const actual = await vi.importActual('react-i18next');
      return {
        ...actual,
        useTranslation: () => ({
          i18n: mockI18n,
          t: vi.fn((key: string) => key),
        }),
      };
    });

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
