import React from 'react';
import { useTranslation } from 'react-i18next';
import type { LanguageCode } from '../../types/llm/prompts';
import { useLanguages } from '../../hooks/useLanguages';

interface LanguageSelectorProps {
  selectedLanguage: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  getLanguageName: (code: LanguageCode) => string;
  labelKey?: string;
  excludeLanguage?: LanguageCode; // Language to exclude from options (e.g., source language when selecting target)
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  getLanguageName,
  labelKey,
  excludeLanguage,
}) => {
  const { t } = useTranslation();
  const { languages } = useLanguages();

  return (
    <div className='space-y-2' data-language-section data-testid='language-section'>
      <label className='text-sm font-medium'>
        {t(labelKey ?? 'storyInput.optionsModal.languageLabel')}
      </label>
      <select
        value={selectedLanguage}
        onChange={e => onLanguageChange(e.target.value as LanguageCode)}
        className='w-full p-2 border rounded-md bg-background'
      >
        {languages
          .filter(lang => !excludeLanguage || lang.code !== excludeLanguage)
          .map(lang => (
            <option key={lang.code} value={lang.code}>
              {getLanguageName(lang.code as LanguageCode)}
            </option>
          ))}
      </select>
      <p className='text-xs text-muted-foreground'>
        {t('storyInput.currentlySupported', {
          language: getLanguageName(selectedLanguage),
        })}
      </p>
    </div>
  );
};

export default LanguageSelector;
