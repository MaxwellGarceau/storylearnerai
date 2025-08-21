import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Select';
import { Button } from './Button';
import { Globe } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

interface LanguageSelectorProps {
  variant?: 'button' | 'select';
  className?: string;
}

export const LanguageSelector = React.forwardRef<
  HTMLButtonElement,
  LanguageSelectorProps
>(({ variant = 'select', className }, _ref) => {
  const {
    currentLocalization,
    changeLocalization,
    getCurrentLocalization,
    getSupportedLocalizations,
  } = useLocalization();
  const { t } = useTranslation();

  const currentLang = getCurrentLocalization();
  const supportedLanguages = getSupportedLocalizations();

  if (variant === 'button') {
    return (
      <Button
        variant='outline'
        size='sm'
        onClick={() => {
          const nextLang = supportedLanguages.find(
            lang => lang.code !== currentLocalization
          );
          if (nextLang) {
            void changeLocalization(nextLang.code);
          }
        }}
        className={cn(className)}
      >
        <Globe className='h-4 w-4 mr-2' />
        {currentLang.nativeName}
      </Button>
    );
  }

  return (
    <Select
      value={currentLocalization}
      onValueChange={value => void changeLocalization(value)}
    >
      <SelectTrigger className={cn('w-[140px]', className)}>
        <Globe className='h-4 w-4 mr-2' />
        <SelectValue placeholder={t('languageSelector.title')} />
      </SelectTrigger>
      <SelectContent>
        {supportedLanguages.map(language => (
          <SelectItem key={language.code} value={language.code}>
            {language.nativeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

LanguageSelector.displayName = 'LanguageSelector';
