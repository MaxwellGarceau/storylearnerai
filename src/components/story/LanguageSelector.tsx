import React from 'react';
import { useTranslation } from 'react-i18next';
import type { LanguageCode } from '../../types/llm/prompts';

interface LanguageSelectorProps {
  selectedLanguage: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  getLanguageName: (code: LanguageCode) => string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  getLanguageName,
}) => {
  const { t } = useTranslation();

  return (
    <div className='space-y-2' data-language-section>
      <label className='text-sm font-medium'>
        {t('storyInput.optionsModal.languageLabel')}
      </label>
      <select
        value={selectedLanguage}
        onChange={e => onLanguageChange(e.target.value as LanguageCode)}
        className='w-full p-2 border rounded-md bg-background'
      >
        <option value='en'>{getLanguageName('en')}</option>
      </select>
      <p className='text-xs text-muted-foreground'>
        {t('storyInput.currentlySupported', {
          language: getLanguageName('en'),
        })}
      </p>
    </div>
  );
};

export default LanguageSelector;
