import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import Label from '../ui/Label';
import type { TFunction } from 'i18next';
import type { DifficultyLevel } from '../../types/llm/prompts';
import type { TranslationResponse } from '../../lib/translationService';
import { cn } from '../../lib/utils';
import type { LanguageCode } from '../../types/llm/prompts';
import { CheckCircle, AlertTriangle } from 'lucide-react';

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

      {/* Vocabulary Section */}
      {translationData.selectedVocabulary &&
        translationData.selectedVocabulary.length > 0 && (
          <div className='space-y-4'>
            <div className='border-t pt-4'>
              <h3 className='text-lg font-semibold text-foreground mb-4'>
                {t('storySidebar.vocabularySection')}
              </h3>

              {/* Included Vocabulary */}
              {translationData.includedVocabulary &&
                translationData.includedVocabulary.length > 0 && (
                  <Card className='mb-4'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-sm flex items-center gap-2'>
                        <CheckCircle className='w-4 h-4 text-green-600' />
                        {t('storySidebar.includedVocabulary')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='flex flex-wrap gap-2'>
                        {translationData.includedVocabulary.map(
                          (word, index) => (
                            <Badge
                              key={index}
                              variant='secondary'
                              className='bg-green-100 text-green-800 hover:bg-green-200'
                            >
                              {word}
                            </Badge>
                          )
                        )}
                      </div>
                      <p className='text-xs text-muted-foreground mt-2'>
                        {t('storySidebar.includedVocabularyDescription')}
                      </p>
                    </CardContent>
                  </Card>
                )}

              {/* Missing Vocabulary */}
              {translationData.missingVocabulary &&
                translationData.missingVocabulary.length > 0 && (
                  <Card className='mb-4'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-sm flex items-center gap-2'>
                        <AlertTriangle className='w-4 h-4 text-amber-600' />
                        {t('storySidebar.missingVocabulary')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='flex flex-wrap gap-2'>
                        {translationData.missingVocabulary.map(
                          (word, index) => (
                            <Badge
                              key={index}
                              variant='secondary'
                              className='bg-amber-100 text-amber-800 hover:bg-amber-200'
                            >
                              {word}
                            </Badge>
                          )
                        )}
                      </div>
                      <p className='text-xs text-muted-foreground mt-2'>
                        {t('storySidebar.missingVocabularyDescription')}
                      </p>
                    </CardContent>
                  </Card>
                )}

              {/* Selected Vocabulary Summary */}
              <Card variant='outline'>
                <CardContent className='pt-4'>
                  <div className='text-sm text-muted-foreground'>
                    <div className='flex items-center justify-between mb-2'>
                      <span>{t('storySidebar.totalSelected')}:</span>
                      <span className='font-medium'>
                        {translationData.selectedVocabulary.length}
                      </span>
                    </div>
                    <div className='flex items-center justify-between mb-2'>
                      <span>{t('storySidebar.totalIncluded')}:</span>
                      <span className='font-medium text-green-600'>
                        {translationData.includedVocabulary?.length ?? 0}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>{t('storySidebar.totalMissing')}:</span>
                      <span className='font-medium text-amber-600'>
                        {translationData.missingVocabulary?.length ?? 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      {/* No Vocabulary Selected Message */}
      {(!translationData.selectedVocabulary ||
        translationData.selectedVocabulary.length === 0) && (
        <div className='border-t pt-4'>
          <Card variant='outline' className='bg-muted/50'>
            <CardContent className='pt-4'>
              <p className='text-sm text-muted-foreground text-center'>
                {t('storySidebar.noVocabularySelected')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InfoSection;
