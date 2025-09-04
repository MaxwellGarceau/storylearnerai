import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import Label from '../ui/Label';
import type { TFunction } from 'i18next';
import type { DifficultyLevel } from '../../types/llm/prompts';
import type { TranslationResponse } from '../../lib/translationService';
import { cn } from '../../lib/utils';
import type { LanguageCode } from '../../types/llm/prompts';

interface InfoSectionProps {
  translationData: TranslationResponse;
  getLanguageName: (code: LanguageCode) => string;
  getDifficultyColor: (difficulty: DifficultyLevel) => string;
  getDifficultyLabel: (difficulty: DifficultyLevel) => string;
  t: TFunction;
}

const InfoSection: React.FC<InfoSectionProps> = ({
  translationData,
  getLanguageName,
  getDifficultyColor,
  getDifficultyLabel,
  t,
}) => {
  return (
    <div className='p-4 space-y-6'>
      <div className='border-b pb-4'>
        <h3 className='text-lg font-semibold text-foreground'>
          {t('storySidebar.storyOptions')}
        </h3>
        <p className='text-sm text-muted-foreground mt-1'>
          {t('storySidebar.currentSettings')}
        </p>
      </div>

      <Card variant='outline' className='bg-accent/50'>
        <CardContent className='p-3'>
          <p className='text-sm text-accent-foreground'>
            <strong>{t('storySidebar.translation')}:</strong>{' '}
            {getLanguageName(translationData.fromLanguage)} →{' '}
            {getLanguageName(translationData.toLanguage)}
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            {t('storySidebar.optionsEditing')}
          </p>
        </CardContent>
      </Card>

      <div className='space-y-2'>
        <Label htmlFor='target-language'>
          {t('storySidebar.targetLanguage')}
        </Label>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='text-sm'>
            {getLanguageName(translationData.toLanguage)}
          </Badge>
        </div>
        <p className='text-xs text-muted-foreground'>
          {t('storySidebar.currentlySupported')}
        </p>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='story-difficulty'>
          {t('storySidebar.difficultyLevel')} (CEFR)
        </Label>
        <div className='flex items-center gap-2'>
          <Badge
            variant='secondary'
            className={cn(
              'text-sm',
              getDifficultyColor(translationData.difficulty)
            )}
          >
            {getDifficultyLabel(translationData.difficulty)}
          </Badge>
        </div>
        <p className='text-xs text-muted-foreground'>
          {t('storySidebar.storyAdaptedToLevel')}
        </p>
      </div>
    </div>
  );
};

export default InfoSection;
