import React from 'react';
import { Button } from '../ui/Button';
import { X, BookOpen, Settings, BookMarked, Globe } from 'lucide-react';
import type { TFunction } from 'i18next';
import { useLanguageFilter } from '../../hooks/useLanguageFilter';
import { useLanguages } from '../../hooks/useLanguages';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';

type ActiveSection = 'stories' | 'vocabulary' | 'info';

interface SidebarHeaderProps {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  onClose: () => void;
  t: TFunction;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  activeSection,
  setActiveSection,
  onClose,
  t,
}) => {
  const {
    fromLanguage,
    targetLanguage,
    setTargetLanguage,
    availableTargetLanguages,
  } = useLanguageFilter();
  const { getNativeLanguageName } = useLanguages();
  return (
    <div className='p-4 border-b bg-muted/50'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <BookOpen className='w-5 h-5 text-primary' />
          <h2 className='text-lg font-semibold'>
            {t('storySidebar.storyLibrary')}
          </h2>
        </div>
        <Button
          variant='ghost'
          size='sm'
          onClick={onClose}
          className='h-8 w-8 p-0'
          aria-label={t('storySidebar.closeLibrary')}
        >
          <X className='w-4 h-4' />
        </Button>
      </div>

      {/* Language selector row */}
      <div className='mt-3 flex items-center justify-between'>
        <Select
          value={targetLanguage}
          onValueChange={(val: string) =>
            setTargetLanguage(val as unknown as string)
          }
        >
          <SelectTrigger className='w-[160px] h-8'>
            <Globe className='h-4 w-4 mr-2' />
            <SelectValue placeholder={t('storySidebar.targetLanguage')} />
          </SelectTrigger>
          <SelectContent
            className='
              data-[state=closed]:fade-out-0
              data-[state=open]:fade-in-0
              data-[state=open]:zoom-in-0
              data-[state=closed]:zoom-out-0
              data-[side=bottom]:slide-in-from-top-0
              data-[side=left]:slide-in-from-right-0
              data-[side=right]:slide-in-from-left-0
              data-[side=top]:slide-in-from-bottom-0
            '
          >
            {availableTargetLanguages.map(lang => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className='text-xs text-muted-foreground whitespace-nowrap'>
          {fromLanguage
            ? t('storySidebar.fromLanguageShort') +
              ': ' +
              getNativeLanguageName(fromLanguage)
            : ''}
        </div>
      </div>

      {/* Section buttons row */}
      <div className='flex gap-1 mt-3 flex-wrap items-center'>
        <Button
          variant={activeSection === 'stories' ? 'default' : 'ghost'}
          size='sm'
          onClick={() => setActiveSection('stories')}
          className='flex-1'
        >
          <BookOpen className='w-4 h-4 mr-2' />
          {t('storySidebar.stories')}
        </Button>
        <Button
          variant={activeSection === 'vocabulary' ? 'default' : 'ghost'}
          size='sm'
          onClick={() => setActiveSection('vocabulary')}
          className='flex-1'
        >
          <BookMarked className='w-4 h-4 mr-2' />
          {t('storySidebar.vocabulary')}
        </Button>
        <Button
          variant={activeSection === 'info' ? 'default' : 'ghost'}
          size='sm'
          onClick={() => setActiveSection('info')}
          className='flex-1'
        >
          <Settings className='w-4 h-4 mr-2' />
          {t('storySidebar.info')}
        </Button>
      </div>
    </div>
  );
};

export default SidebarHeader;
