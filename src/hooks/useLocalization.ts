import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { useLanguages } from './useLanguages';
import { LanguageCode } from '../types/llm/prompts';

export interface LocalizationInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageCode[] = ['en', 'es'];

export const useLocalization = () => {
  const { i18n, t } = useTranslation();
  const { getLanguageName, getNativeLanguageName } = useLanguages();

  const currentLanguage = i18n.language;
  const isLanguageLoaded = i18n.hasResourceBundle ? i18n.hasResourceBundle(currentLanguage, 'translation') : true;

  const changeLanguage = useCallback(async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      // Store the language preference in localStorage
      localStorage.setItem('i18nextLng', languageCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, [i18n]);

  const getCurrentLocalization = useCallback((): LocalizationInfo => {
    const name = getLanguageName(currentLanguage as LanguageCode);
    const nativeName = getNativeLanguageName(currentLanguage as LanguageCode);
    return {
      code: currentLanguage as LanguageCode,
      name: name,
      nativeName: nativeName
    };
  }, [currentLanguage, getLanguageName, getNativeLanguageName]);

  const getSupportedLocalizations = useCallback((): LocalizationInfo[] => {
    return SUPPORTED_LANGUAGES.map(code => ({
      code,
      name: getLanguageName(code),
      nativeName: getNativeLanguageName(code)
    }));
  }, [getLanguageName, getNativeLanguageName]);

  return {
    currentLocalization: currentLanguage,
    isLocalizationLoaded: isLanguageLoaded,
    changeLocalization: changeLanguage,
    getCurrentLocalization,
    getSupportedLocalizations,
    t,
  };
};
