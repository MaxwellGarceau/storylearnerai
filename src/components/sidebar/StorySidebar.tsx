import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import savedStoriesData from '../../data/savedStories.json';
import { useNavigate, useLocation } from 'react-router-dom';
import { translationService } from '../../lib/translationService';
import type { DifficultyLevel } from '../../types/llm/prompts';
import type { DatabaseSavedTranslationWithDetails } from '../../types/database/translation';
import { useViewport } from '../../hooks/useViewport';
import { useLanguages } from '../../hooks/useLanguages';
import { useSavedTranslations } from '../../hooks/useSavedTranslations';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../lib/logger';
import { useTranslation } from 'react-i18next';

import SidebarToggle from './SidebarToggle';
import SidebarHeader from './SidebarHeader';
import StoriesSection from './StoriesSection';
import VocabularySection from './VocabularySection';
import InfoSection from './InfoSection';
import type { TranslationResponse } from '../../lib/translationService';

interface StorySidebarProps {
  className?: string;
  translationData?: TranslationResponse;
}

type ActiveSection = 'stories' | 'vocabulary' | 'info';

const StorySidebar: React.FC<StorySidebarProps> = ({
  className,
  translationData,
}) => {
  const { isMobile } = useViewport();
  const { getLanguageName, getLanguageIdByCode } = useLanguages();
  const { savedTranslations, loading: isLoadingSavedTranslations } =
    useSavedTranslations();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const sampleStories: DatabaseSavedTranslationWithDetails[] =
    savedStoriesData.stories as DatabaseSavedTranslationWithDetails[];

  const getInitialSidebarState = (): boolean => {
    try {
      const saved = localStorage.getItem('sidebarOpen');
      if (saved !== null) {
        return JSON.parse(saved) as boolean;
      }
      return !isMobile;
    } catch (error) {
      logger.warn('ui', 'Failed to read sidebar state from localStorage', {
        error,
      });
      return !isMobile;
    }
  };

  const [isOpen, setIsOpen] = useState(getInitialSidebarState);
  const [activeSection, setActiveSection] = useState<ActiveSection>('stories');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
    } catch (error) {
      logger.warn('ui', 'Failed to save sidebar state to localStorage', {
        error,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarOpen');
    if (saved === null) {
      setIsOpen(!isMobile);
    }
  }, [isMobile]);

  // Allow deep-linking to the vocabulary tab via URL hash
  useEffect(() => {
    if (location.hash === '#vocabulary') {
      setActiveSection('vocabulary');
      setIsOpen(true);
    }
  }, [location]);

  const handleStoryClick = async (
    story: DatabaseSavedTranslationWithDetails
  ) => {
    setIsLoading(String(story.id));
    try {
      const response = await translationService.translate({
        text: story.original_story,
        fromLanguage: story.original_language.code,
        toLanguage: story.translated_language.code,
        difficulty: story.difficulty_level.code,
      });

      void navigate('/story', {
        state: {
          translationData: response,
          isSavedStory: true,
          savedTranslationId: story.id,
        },
      });
    } catch (error) {
      logger.error('ui', 'Failed to load story', { error });
    } finally {
      setIsLoading(null);
    }
  };

  const openSavedTranslation = (saved: DatabaseSavedTranslationWithDetails) => {
    void navigate('/story', {
      state: {
        translationData: {
          originalText: saved.original_story,
          translatedText: saved.translated_story,
          difficulty: saved.difficulty_level.code,
          fromLanguage: saved.original_language.code,
          toLanguage: saved.translated_language.code,
        },
        isSavedStory: true,
        savedTranslationId: saved.id,
      },
    });
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

  const currentLanguageId = translationData?.toLanguage
    ? getLanguageIdByCode(translationData.toLanguage)
    : undefined;

  const currentFromLanguageId = translationData?.fromLanguage
    ? getLanguageIdByCode(translationData.fromLanguage)
    : undefined;

  const footerText =
    activeSection === 'stories'
      ? t('storySidebar.demoStories')
      : activeSection === 'vocabulary'
        ? t('storySidebar.vocabularySettings')
        : t('storySidebar.translationSettings');

  return (
    <>
      {!isOpen && <SidebarToggle onOpen={() => setIsOpen(true)} t={t} />}

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
          <SidebarHeader
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onClose={() => setIsOpen(false)}
            t={t}
          />

          <div className='flex-1 overflow-y-auto'>
            {activeSection === 'stories' && (
              <StoriesSection
                savedTranslations={
                  savedTranslations as unknown as DatabaseSavedTranslationWithDetails[]
                }
                isLoadingSavedTranslations={isLoadingSavedTranslations}
                sampleStories={sampleStories}
                isLoadingSampleId={isLoading}
                onOpenSavedTranslation={openSavedTranslation}
                onOpenSampleStory={s => {
                  void handleStoryClick(s);
                }}
                getDifficultyColor={getDifficultyColor}
                getDifficultyLabel={getDifficultyLabel}
                t={t}
                user={user}
              />
            )}

            {activeSection === 'vocabulary' && (
              <VocabularySection
                currentLanguageId={currentLanguageId}
                currentFromLanguageId={currentFromLanguageId}
              />
            )}

            {activeSection === 'info' && translationData && (
              <InfoSection
                translationData={translationData}
                getLanguageName={getLanguageName}
                getDifficultyColor={getDifficultyColor}
                getDifficultyLabel={getDifficultyLabel}
                t={t}
              />
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

          <div className='p-4 border-t bg-muted/30'>
            <p className='text-xs text-muted-foreground text-center'>
              {footerText}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default StorySidebar;
