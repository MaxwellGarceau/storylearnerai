import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AuthPrompt } from '../ui/AuthPrompt';
import { cn } from '../../lib/utils';
import type { TFunction } from 'i18next';
import type { DifficultyLevel } from '../../types/llm/prompts';
import type { DatabaseSavedTranslationWithDetails } from '../../types/database/translation';
import type { User } from '@supabase/supabase-js';

interface StoriesSectionProps {
  savedTranslations: DatabaseSavedTranslationWithDetails[];
  isLoadingSavedTranslations: boolean;
  sampleStories: DatabaseSavedTranslationWithDetails[];
  isLoadingSampleId: string | null;
  onOpenSavedTranslation: (saved: DatabaseSavedTranslationWithDetails) => void;
  onOpenSampleStory: (story: DatabaseSavedTranslationWithDetails) => void;
  getDifficultyColor: (difficulty: DifficultyLevel) => string;
  getDifficultyLabel: (difficulty: DifficultyLevel) => string;
  t: TFunction;
  user: User | null;
}

const StoriesSection: React.FC<StoriesSectionProps> = ({
  savedTranslations,
  isLoadingSavedTranslations,
  sampleStories,
  isLoadingSampleId,
  onOpenSavedTranslation,
  onOpenSampleStory,
  getDifficultyColor,
  getDifficultyLabel,
  t,
  user,
}) => {
  return (
    <div className='p-4 space-y-6'>
      <p className='text-sm text-muted-foreground text-center'>
        {t('storySidebar.clickOnStoryToRead')}
      </p>

      <div className='space-y-3'>
        <h3 className='text-lg font-semibold text-foreground border-b pb-2'>
          {t('storySidebar.savedStories')}
        </h3>
        {isLoadingSavedTranslations ? (
          <div className='text-sm text-muted-foreground text-center py-4'>
            {t('storySidebar.loadingSavedStories')}
          </div>
        ) : !user ? (
          <AuthPrompt t={t} variant='button' />
        ) : savedTranslations.length > 0 ? (
          savedTranslations.map(savedTranslation => (
            <Card
              key={savedTranslation.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md',
                'hover:border-primary/50 hover:bg-accent/50'
              )}
              onClick={() => onOpenSavedTranslation(savedTranslation)}
            >
              <CardHeader className='pb-2'>
                <div className='flex items-start justify-between'>
                  <CardTitle className='text-base leading-tight'>
                    {savedTranslation.title ?? t('storySidebar.untitledStory')}
                  </CardTitle>
                  <Badge
                    variant='secondary'
                    className={cn(
                      'text-xs',
                      getDifficultyColor(savedTranslation.difficulty_level.code)
                    )}
                  >
                    {getDifficultyLabel(savedTranslation.difficulty_level.code)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <p className='text-sm text-muted-foreground line-clamp-2'>
                  {savedTranslation.from_story.substring(0, 100)}...
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className='text-sm text-muted-foreground text-center py-4'>
            {t('storySidebar.noSavedStoriesYet')}
          </div>
        )}
      </div>

      <div className='space-y-3'>
        <h3 className='text-lg font-semibold text-foreground border-b pb-2'>
          {t('storySidebar.sampleStories')}
        </h3>
        {sampleStories.map(story => (
          <Card
            key={story.id}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md',
              'hover:border-primary/50 hover:bg-accent/50',
              isLoadingSampleId === String(story.id) &&
                'opacity-50 pointer-events-none'
            )}
            onClick={() => onOpenSampleStory(story)}
          >
            <CardHeader className='pb-2'>
              <div className='flex items-start justify-between'>
                <CardTitle className='text-base leading-tight'>
                  {story.title ?? t('storySidebar.untitled')}
                </CardTitle>
                <Badge
                  variant='secondary'
                  className={cn(
                    'text-xs',
                    getDifficultyColor(story.difficulty_level.code)
                  )}
                >
                  {getDifficultyLabel(story.difficulty_level.code)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <p className='text-sm text-muted-foreground line-clamp-2'>
                {story.notes ?? t('storySidebar.noDescriptionAvailable')}
              </p>
              {isLoadingSampleId === String(story.id) && (
                <div className='mt-2 text-xs text-primary'>
                  {t('storySidebar.loadingStory')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StoriesSection;
