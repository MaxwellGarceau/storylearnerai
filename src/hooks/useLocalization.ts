import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { useLanguages } from './useLanguages';
import { LanguageCode, EnglishLanguageName, NativeLanguageName } from '../types/llm/prompts';

export interface LocalizationInfo {
  code: LanguageCode;
  name: EnglishLanguageName;
  nativeName: NativeLanguageName;
}

export const SUPPORTED_LANGUAGES: LanguageCode[] = ['en', 'es'];

export const useLocalization = () => {
  const { i18n, t } = useTranslation();
  const { getLanguageName, getNativeLanguageName } = useLanguages();

  const currentLanguage = i18n.language as LanguageCode;
  const effectiveLanguage: LanguageCode = (SUPPORTED_LANGUAGES as string[]).includes(currentLanguage)
    ? currentLanguage
    : SUPPORTED_LANGUAGES[0];
  const isLanguageLoaded = i18n.hasResourceBundle ? i18n.hasResourceBundle(currentLanguage, 'translation') : true;

  const changeLanguage = useCallback(async (languageCode: LanguageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      // Store the language preference in localStorage
      localStorage.setItem('i18nextLng', languageCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, [i18n]);

  const getCurrentLocalization = useCallback((): LocalizationInfo => {
    const name = getLanguageName(effectiveLanguage);
    const nativeName = getNativeLanguageName(effectiveLanguage);
    return {
      code: effectiveLanguage,
      name: name,
      nativeName: nativeName
    };
  // Depend only on the language code so the reference remains stable across rerenders
  }, [effectiveLanguage, getLanguageName, getNativeLanguageName]);

  const getSupportedLocalizations = useCallback((): LocalizationInfo[] => {
    return SUPPORTED_LANGUAGES.map(code => ({
      code,
      name: getLanguageName(code),
      nativeName: getNativeLanguageName(code)
    }));
  // Keep reference stable
  }, []);

  return {
    currentLocalization: currentLanguage,
    isLocalizationLoaded: isLanguageLoaded,
    changeLocalization: changeLanguage,
    getCurrentLocalization,
    getSupportedLocalizations,
    t,
  };
};
