import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { X, BookOpen, Settings, BookMarked } from 'lucide-react';
import { VocabularySidebar } from '../vocabulary/sidebar/VocabularySidebar';
import { cn } from '../../lib/utils';
import savedStoriesData from '../../data/savedStories.json';
import { useNavigate } from 'react-router-dom';
import { translationService } from '../../lib/translationService';
import type { DifficultyLevel } from '../../types/llm/prompts';
import type { DatabaseSavedTranslationWithDetails } from '../../types/database/translation';
import { useViewport } from '../../hooks/useViewport';
import { useLanguages } from '../../hooks/useLanguages';
import { useSavedTranslations } from '../../hooks/useSavedTranslations';
import { logger } from '../../lib/logger';
import { useTranslation } from 'react-i18next';

import Label from '../ui/Label';
import { TranslationResponse } from '../../lib/translationService';

interface StorySidebarProps {
  className?: string;
  translationData?: TranslationResponse;
}

const StorySidebar: React.FC<StorySidebarProps> = ({
  className,
  translationData,
}) => {
  const { isMobile } = useViewport();
  const { getLanguageName, getLanguageIdByCode } = useLanguages();
  const { savedTranslations, loading: isLoadingSavedTranslations } =
    useSavedTranslations();
  const { t } = useTranslation();

  // Use DB type directly for sample stories
  const sampleStories: DatabaseSavedTranslationWithDetails[] =
    savedStoriesData.stories as DatabaseSavedTranslationWithDetails[];

  // Get initial state from localStorage or default based on screen size
  const getInitialSidebarState = (): boolean => {
    try {
      const saved = localStorage.getItem('sidebarOpen');
      if (saved !== null) {
        return JSON.parse(saved) as boolean;
      }
      // Default to closed on mobile, open on larger screens
      return !isMobile;
    } catch (error) {
      logger.warn('ui', 'Failed to read sidebar state from localStorage', {
        error,
      });
      return !isMobile; // Default based on screen size if localStorage fails
    }
  };

  const [isOpen, setIsOpen] = useState(getInitialSidebarState);
  const [activeSection, setActiveSection] = useState<
    'stories' | 'vocabulary' | 'info'
  >('stories');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
    } catch (error) {
      logger.warn('ui', 'Failed to save sidebar state to localStorage', {
        error,
      });
    }
  }, [isOpen]);

  // Update sidebar state when viewport changes (e.g., screen resize, orientation change)
  useEffect(() => {
    const saved = localStorage.getItem('sidebarOpen');
    // Only auto-adjust if no preference is saved
    if (saved === null) {
      setIsOpen(!isMobile);
    }
  }, [isMobile]);

  const handleStoryClick = async (
    story: DatabaseSavedTranslationWithDetails
  ) => {
    setIsLoading(String(story.id));

    try {
      // Use the translation service to translate the story
      const response = await translationService.translate({
        text: story.original_story,
        fromLanguage: story.original_language.code,
        toLanguage: story.translated_language.code,
        difficulty: story.difficulty_level.code,
      });

      // Navigate to story page with the translated data
      void navigate('/story', {
        state: {
          translationData: response,
          isSavedStory: true,
        },
      });
    } catch (error) {
      logger.error('ui', 'Failed to load story', { error });
    } finally {
      setIsLoading(null);
    }
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'a1':
        return 'bg-green-100 text-green-800';
      case 'a2':
        return 'bg-blue-100 text-blue-800';
      case 'b1':
        return 'bg-yellow-100 text-yellow-800';
      case 'b2':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: DifficultyLevel) => {
    return t(`difficultyLevels.${difficulty}.label`);
  };

  // Get language IDs with error handling
  const currentLanguageId = (() => {
    if (!translationData?.toLanguage) return undefined;
    try {
      return getLanguageIdByCode(translationData.toLanguage);
    } catch (error) {
      logger.error('general', 'Failed to get language ID', {
        code: translationData.toLanguage,
        error,
      });
      return undefined;
    }
  })();

  const currentFromLanguageId = (() => {
    if (!translationData?.fromLanguage) return undefined;
    try {
      return getLanguageIdByCode(translationData.fromLanguage);
    } catch (error) {
      logger.error('general', 'Failed to get language ID', {
        code: translationData.fromLanguage,
        error,
      });
      return undefined;
    }
  })();

  return (
    <>
      {/* Toggle Button - Fixed Position (only visible when sidebar is closed) */}
      {!isOpen && (
        <div className='fixed top-20 left-4 z-50'>
          <Button
            variant='outline'
            size='default'
            onClick={() => setIsOpen(true)}
            className='inline-flex items-center gap-2 shadow-lg bg-background/80 backdrop-blur-sm'
            aria-label={t('storySidebar.openLibrary')}
          >
            <BookOpen className='w-4 h-4' />
            <span className='hidden sm:inline'>
              {t('storySidebar.storyLibrary')}
            </span>
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-16 left-0 z-40 w-80 max-w-[calc(100vw-16px)] h-[calc(100vh-64px)]',
          'bg-background border-r shadow-lg transition-all duration-300',
          'overflow-hidden',
          isOpen
            ? 'translate-x-0 opacity-100'
            : '-translate-x-full opacity-0 pointer-events-none',
          className
        )}
      >
        <div className='h-full flex flex-col'>
          {/* Header */}
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
                onClick={() => setIsOpen(false)}
                className='h-8 w-8 p-0'
                aria-label={t('storySidebar.closeLibrary')}
              >
                <X className='w-4 h-4' />
              </Button>
            </div>

            {/* Section Tabs */}
            <div className='flex gap-1 mt-3 flex-wrap'>
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

          {/* Content */}
          <div className='flex-1 overflow-y-auto'>
            {activeSection === 'stories' && (
              <div className='p-4 space-y-6'>
                {/* Help Text */}
                <p className='text-sm text-muted-foreground text-center'>
                  {t('storySidebar.clickOnStoryToRead')}
                </p>

                {/* Saved Stories Section */}
                <div className='space-y-3'>
                  <h3 className='text-lg font-semibold text-foreground border-b pb-2'>
                    {t('storySidebar.savedStories')}
                  </h3>
                  {isLoadingSavedTranslations ? (
                    <div className='text-sm text-muted-foreground text-center py-4'>
                      {t('storySidebar.loadingSavedStories')}
                    </div>
                  ) : savedTranslations.length > 0 ? (
                    savedTranslations.map(savedTranslation => (
                      <Card
                        key={savedTranslation.id}
                        className={cn(
                          'cursor-pointer transition-all duration-200 hover:shadow-md',
                          'hover:border-primary/50 hover:bg-accent/50'
                        )}
                        onClick={() => {
                          // Navigate to story page with saved translation data
                          void navigate('/story', {
                            state: {
                              translationData: {
                                originalText: savedTranslation.original_story,
                                translatedText:
                                  savedTranslation.translated_story,
                                difficulty:
                                  savedTranslation.difficulty_level.code,
                                fromLanguage:
                                  savedTranslation.original_language.code,
                                toLanguage:
                                  savedTranslation.translated_language.code,
                              },
                              isSavedStory: true,
                            },
                          });
                        }}
                      >
                        <CardHeader className='pb-2'>
                          <div className='flex items-start justify-between'>
                            <CardTitle className='text-base leading-tight'>
                              {savedTranslation.title ??
                                t('storySidebar.untitledStory')}
                            </CardTitle>
                            <Badge
                              variant='secondary'
                              className={cn(
                                'text-xs',
                                getDifficultyColor(
                                  savedTranslation.difficulty_level.code
                                )
                              )}
                            >
                              {getDifficultyLabel(
                                savedTranslation.difficulty_level.code
                              )}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className='pt-0'>
                          <p className='text-sm text-muted-foreground line-clamp-2'>
                            {savedTranslation.original_story.substring(0, 100)}
                            ...
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

                {/* Sample Stories Section */}
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
                        isLoading === String(story.id) &&
                          'opacity-50 pointer-events-none'
                      )}
                      onClick={() => void handleStoryClick(story)}
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
                          {story.notes ??
                            t('storySidebar.noDescriptionAvailable')}
                        </p>
                        {isLoading === String(story.id) && (
                          <div className='mt-2 text-xs text-primary'>
                            {t('storySidebar.loadingStory')}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'vocabulary' && (
              <div className='p-4'>
                <VocabularySidebar
                  currentLanguageId={currentLanguageId}
                  currentFromLanguageId={currentFromLanguageId}
                />
              </div>
            )}

            {activeSection === 'info' && translationData && (
              <div className='p-4 space-y-6'>
                {/* Header */}
                <div className='border-b pb-4'>
                  <h3 className='text-lg font-semibold text-foreground'>
                    {t('storySidebar.storyOptions')}
                  </h3>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {t('storySidebar.currentSettings')}
                  </p>
                </div>

                {/* Info Box */}
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

                {/* Language Display */}
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

                {/* Difficulty Selection (Disabled) */}
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
            )}

            {activeSection === 'vocabulary' && !translationData && (
              <div className='p-4 text-center'>
                <p className='text-muted-foreground'>
                  {t('storySidebar.noTranslationData')}
                </p>
              </div>
            )}

            {activeSection === 'info' && !translationData && (
              <div className='p-4 text-center'>
                <p className='text-muted-foreground'>
                  {t('storySidebar.noTranslationData')}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='p-4 border-t bg-muted/30'>
            <p className='text-xs text-muted-foreground text-center'>
              {activeSection === 'stories'
                ? t('storySidebar.demoStories')
                : activeSection === 'vocabulary'
                  ? t('storySidebar.vocabularySettings')
                  : t('storySidebar.translationSettings')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default StorySidebar;
