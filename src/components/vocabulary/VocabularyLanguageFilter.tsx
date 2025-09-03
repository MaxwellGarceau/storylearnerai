import React from 'react';
import { Button } from '../ui/Button';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocalization } from '../../hooks/useLocalization';
import type { DatabaseLanguage } from '../../types/database';

interface VocabularyLanguageFilterProps {
  show: boolean;
  onToggle: () => void;
  selectedLanguageId: number | null;
  onChange: (languageId: number | null) => void;
  languages: DatabaseLanguage[];
}

export function VocabularyLanguageFilter({ show, onToggle, selectedLanguageId, onChange, languages }: VocabularyLanguageFilterProps) {
  const { t } = useLocalization();

  return (
    <div className='space-y-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={onToggle}
        className='w-full justify-between'
      >
        <div className='flex items-center gap-2'>
          <Filter className='h-4 w-4' />
          {t('vocabulary.filters.title')}
        </div>
        {show ? (
          <ChevronUp className='h-4 w-4' />
        ) : (
          <ChevronDown className='h-4 w-4' />
        )}
      </Button>

      {show && (
        <div className='space-y-2 p-3 border rounded-md bg-muted/50'>
          <label className='text-sm font-medium'>
            {t('vocabulary.filters.language')}
          </label>
          <select
            value={selectedLanguageId ?? ''}
            onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
            className='w-full p-2 text-sm border rounded-md'
          >
            <option value=''>
              {t('vocabulary.filters.allLanguages')}
            </option>
            {languages.map(language => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default VocabularyLanguageFilter;


