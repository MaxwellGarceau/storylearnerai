import React from 'react';
import { useTranslation } from 'react-i18next';
import type { LanguageCode, DifficultyLevel } from '../../types/llm/prompts';

interface DifficultySelectorProps {
  selectedDifficulty: DifficultyLevel;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  getLanguageName: (code: LanguageCode) => string;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onDifficultyChange,
  getLanguageName,
}) => {
  const { t } = useTranslation();

  return (
    <div className='space-y-2' data-difficulty-section>
      <label className='text-sm font-medium'>
        {t('storyInput.optionsModal.difficultyLabel')}
      </label>
      <select
        value={selectedDifficulty}
        onChange={e => onDifficultyChange(e.target.value as DifficultyLevel)}
        className='w-full p-2 border rounded-md bg-background'
      >
        <option value='a1'>{t('storyInput.optionsModal.a1')}</option>
        <option value='a2'>{t('storyInput.optionsModal.a2')}</option>
        <option value='b1'>{t('storyInput.optionsModal.b1')}</option>
        <option value='b2'>{t('storyInput.optionsModal.b2')}</option>
      </select>
      <p className='text-xs text-muted-foreground'>
        {t('storyInput.difficultyDescription', {
          language: getLanguageName('en' as LanguageCode),
        })}
      </p>
    </div>
  );
};

export default DifficultySelector;
