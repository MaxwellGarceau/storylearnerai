import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert, AlertDescription, AlertIcon } from '../ui/Alert';
import { useSavedTranslations } from '../../hooks/useSavedTranslations';
import { useLanguages } from '../../hooks/useLanguages';
import { useDifficultyLevels } from '../../hooks/useDifficultyLevels';
import { DatabaseSavedTranslationWithDetails } from '../../types/database';
import { TranslationResponse } from '../../lib/translationService';
import {
  DifficultyLevel,
  DifficultyLevelDisplay,
  LanguageCode,
} from '../../types/llm/prompts';
import { logger } from '../../lib/logger';
import { useTranslation } from 'react-i18next';
import { DateUtils } from '../../lib/utils/dateUtils';

export default function SavedTranslationsList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getDifficultyLevelDisplay } = useDifficultyLevels();

  // CEFR difficulty level options using the hook
  const CEFR_DIFFICULTY_OPTIONS: {
    value: DifficultyLevel;
    label: DifficultyLevelDisplay;
    description: string;
  }[] = [
    {
      value: 'a1',
      label: getDifficultyLevelDisplay('a1'),
      description: t('difficultyLevels.a1.description'),
    },
    {
      value: 'a2',
      label: getDifficultyLevelDisplay('a2'),
      description: t('difficultyLevels.a2.description'),
    },
    {
      value: 'b1',
      label: getDifficultyLevelDisplay('b1'),
      description: t('difficultyLevels.b1.description'),
    },
    {
      value: 'b2',
      label: getDifficultyLevelDisplay('b2'),
      description: t('difficultyLevels.b2.description'),
    },
  ];

  const {
    savedTranslations,
    loading: isLoading,
    error,
  } = useSavedTranslations();

  const { languages, loading: languagesLoading } = useLanguages();

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | ''>(
    ''
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    DifficultyLevel | ''
  >('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = () => {
    // TODO: Implement filtering when the hook supports it
    logger.info('ui', 'Filtering not yet implemented', {
      target_language_code: selectedLanguage || undefined,
      difficulty_level_code: selectedDifficulty || undefined,
      search: searchTerm.trim() || undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('savedTranslations.deleteConfirm'))) {
      try {
        // TODO: Implement delete when the hook supports it
        logger.info('ui', 'Delete not yet implemented for id:', { id });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        logger.error('ui', 'Failed to delete translation', {
          error: errorMessage,
        });
      }
    }
  };

  const convertToTranslationResponse = (
    savedTranslation: DatabaseSavedTranslationWithDetails
  ): TranslationResponse => {
    return {
      originalText: savedTranslation.from_story,
      translatedText: savedTranslation.target_story,
      fromLanguage: savedTranslation.from_language.code,
      toLanguage: savedTranslation.target_language.code,
      difficulty: savedTranslation.difficulty_level.code,
      provider: 'saved',
      model: 'saved-translation',
    };
  };

  const handleViewStory = (
    savedTranslation: DatabaseSavedTranslationWithDetails
  ) => {
    const translationData = convertToTranslationResponse(savedTranslation);
    void navigate('/story', {
      state: {
        translationData,
        isSavedStory: true,
        savedTranslationId: savedTranslation.id,
      },
    });
  };

  if ((isLoading || languagesLoading) && savedTranslations.length === 0) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>
            {t('story.loadingTranslation')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('savedTranslations.filters.title')}</CardTitle>
          <CardDescription>
            {t('savedTranslations.filters.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='text-sm font-medium mb-2 block'>
                {t('savedTranslations.filters.targetLanguage')}
              </label>
              <select
                className='w-full p-2 border rounded-md'
                value={selectedLanguage}
                onChange={e =>
                  setSelectedLanguage(e.target.value as LanguageCode | '')
                }
              >
                <option value=''>
                  {t('savedTranslations.filters.allLanguages')}
                </option>
                {languages.map(language => (
                  <option key={language.id} value={language.code}>
                    {language.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='text-sm font-medium mb-2 block'>
                {t('savedTranslations.filters.difficultyLevel')}
              </label>
              <select
                className='w-full p-2 border rounded-md'
                value={selectedDifficulty}
                onChange={e =>
                  setSelectedDifficulty(e.target.value as DifficultyLevel | '')
                }
              >
                <option value=''>
                  {t('savedTranslations.filters.allLevels')}
                </option>
                {CEFR_DIFFICULTY_OPTIONS.map(option => (
                  <option
                    key={option.value}
                    value={option.value}
                    title={option.description}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='text-sm font-medium mb-2 block'>
                {t('savedTranslations.filters.search')}
              </label>
              <input
                type='text'
                placeholder={t('savedTranslations.filters.searchPlaceholder')}
                className='w-full p-2 border rounded-md'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleFilterChange} className='w-full md:w-auto'>
            {t('savedTranslations.filters.applyFilters')}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant='destructive'>
          <AlertIcon.destructive className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Count */}
      <div className='flex justify-between items-center'>
        <p className='text-sm text-muted-foreground'>
          {t('savedTranslations.results.count', {
            count: savedTranslations.length,
          })}
        </p>
      </div>

      {/* Translations List */}
      <div className='space-y-4'>
        {savedTranslations.map(translation => (
          <Card
            key={translation.id}
            className='hover:shadow-md transition-shadow cursor-pointer'
            onClick={() => handleViewStory(translation)}
          >
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <CardTitle className='text-lg'>
                    {translation.title ??
                      t('savedTranslations.results.untitled')}
                  </CardTitle>
                  <CardDescription>
                    {DateUtils.formatDate(translation.created_at, 'en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {` • ${translation.from_language.name} → ${translation.target_language.name}`}
                  </CardDescription>
                </div>
                <div className='flex gap-2' onClick={e => e.stopPropagation()}>
                  <Badge variant='secondary'>
                    {translation.difficulty_level.name}
                  </Badge>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleViewStory(translation)}
                  >
                    {t('savedTranslations.results.viewStory')}
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => void handleDelete(translation.id)}
                    disabled={false}
                  >
                    {t('savedTranslations.results.delete')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {translation.notes && (
                <div>
                  <h4 className='font-medium text-sm mb-2'>
                    {t('savedTranslations.content.notes')}
                  </h4>
                  <p className='text-sm text-muted-foreground'>
                    {translation.notes}
                  </p>
                </div>
              )}

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                <div>
                  <h4 className='font-medium text-sm mb-2'>
                    {t('savedTranslations.content.originalStory')}
                  </h4>
                  <div className='text-sm text-muted-foreground max-h-32 overflow-y-auto border rounded p-2'>
                    {translation.from_story}
                  </div>
                </div>
                <div>
                  <h4 className='font-medium text-sm mb-2'>
                    {t('savedTranslations.content.translatedStory')}
                  </h4>
                  <div className='text-sm text-muted-foreground max-h-32 overflow-y-auto border rounded p-2'>
                    {translation.target_story}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button - TODO: Implement when pagination is supported */}

      {/* Empty State */}
      {!isLoading && savedTranslations.length === 0 && (
        <Card>
          <CardContent className='text-center py-8'>
            <div className='text-muted-foreground'>
              <svg
                className='h-12 w-12 mx-auto mb-4 opacity-50'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
              <h3 className='text-lg font-medium mb-2'>
                {t('savedTranslations.emptyState.title')}
              </h3>
              <p className='text-sm'>
                {t('savedTranslations.emptyState.description')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
