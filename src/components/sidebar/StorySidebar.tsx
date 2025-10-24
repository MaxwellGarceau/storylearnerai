import React, { useEffect, useState } from 'react';
import savedStoriesData from '../../data/savedStoriesEsToEn.json';
import savedStoriesEnToEsData from '../../data/savedStoriesEnToEs.json';
import { useNavigate, useLocation } from 'react-router-dom';
import { translationService } from '../../lib/translationService';
import type { DifficultyLevel } from '../../types/llm/prompts';
import type { DatabaseSavedTranslationWithDetails } from '../../types/database/translation';
import { useLanguages } from '../../hooks/useLanguages';
import { useSavedTranslations } from '../../hooks/useSavedTranslations';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../lib/logger';
import { useTranslation } from 'react-i18next';
import { useLanguageFilter } from '../../hooks/useLanguageFilter';
import { TokenConverter } from '../../lib/llm/tokens/tokenConverter';
import { Button } from '../ui/Button';
import { BookOpen, BookMarked, Settings } from 'lucide-react';

import BaseSidebar from './BaseSidebar';
import BaseSidebarHeader from './BaseSidebarHeader';
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
  const { getLanguageName, getLanguageIdByCode } = useLanguages();
  const {
    savedTranslations,
    loading: isLoadingSavedTranslations,
    refreshTranslations,
    loadTranslationWithTokens,
  } = useSavedTranslations();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { targetLanguage, fromLanguage } = useLanguageFilter();

  const sampleStories: DatabaseSavedTranslationWithDetails[] = (
    fromLanguage === 'en'
      ? savedStoriesEnToEsData.stories
      : savedStoriesData.stories
  ) as DatabaseSavedTranslationWithDetails[];

  const [activeSection, setActiveSection] = useState<ActiveSection>('stories');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Allow deep-linking to the vocabulary tab via URL hash
  useEffect(() => {
    if (location.hash === '#vocabulary') {
      setActiveSection('vocabulary');
      setIsOpen(true);
    }
  }, [location]);

  // Listen for saved translations updates to refresh the sidebar
  useEffect(() => {
    const handleSavedTranslationsUpdate = () => {
      void refreshTranslations();
    };

    window.addEventListener(
      'saved-translations:updated',
      handleSavedTranslationsUpdate
    );

    return () => {
      window.removeEventListener(
        'saved-translations:updated',
        handleSavedTranslationsUpdate
      );
    };
  }, [refreshTranslations]);

  const handleStoryClick = async (
    story: DatabaseSavedTranslationWithDetails
  ) => {
    setIsLoading(String(story.id));
    try {
      const response = await translationService.translate({
        text: story.from_text,
        fromLanguage: story.from_language.code,
        toLanguage: story.to_language.code,
        difficulty: story.difficulty_level.code,
      });

      void navigate(`/story?id=${story.id}`, {
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

  const openSavedTranslation = async (
    saved: DatabaseSavedTranslationWithDetails
  ) => {
    try {
      const savedTranslation = await loadTranslationWithTokens(saved.id);

      if (savedTranslation) {
        // Convert loaded tokens to TranslationToken format
        const tokens = TokenConverter.convertDatabaseTokensToUITokens(
          savedTranslation.tokens
        );

        void navigate(`/story?id=${saved.id}`, {
          state: {
            translationData: {
              fromText: savedTranslation.from_text,
              toText: savedTranslation.to_text,
              tokens,
              fromLanguage: savedTranslation.from_language.code,
              toLanguage: savedTranslation.to_language.code,
              difficulty: savedTranslation.difficulty_level.code,
              provider: 'saved',
              model: 'saved-translation',
            },
            isSavedStory: true,
            savedTranslationId: saved.id,
          },
        });
      } else {
        logger.error('ui', 'Failed to load saved translation with tokens', {
          translationId: saved.id,
        });
        // Fallback to basic navigation without tokens
        void navigate(`/story?id=${saved.id}`);
      }
    } catch (error) {
      logger.error('ui', 'Error loading saved translation with tokens', {
        error,
        translationId: saved.id,
      });
      // Fallback to basic navigation without tokens
      void navigate(`/story?id=${saved.id}`);
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

  const currentLanguageId = translationData?.toLanguage
    ? getLanguageIdByCode(translationData.toLanguage)
    : undefined;

  const currentFromLanguageId = translationData?.fromLanguage
    ? getLanguageIdByCode(translationData.fromLanguage)
    : undefined;

  const header = (
    <BaseSidebarHeader
      title={t('storySidebar.storyLibrary')}
      icon={<BookOpen className='w-5 h-5 text-primary' />}
      onClose={() => setIsOpen(false)}
      t={t}
    >
      <div className='flex gap-1 flex-wrap items-center'>
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
    </BaseSidebarHeader>
  );

  const footerText =
    activeSection === 'stories'
      ? t('storySidebar.demoStories')
      : activeSection === 'vocabulary'
        ? t('storySidebar.vocabularySettings')
        : t('storySidebar.translationSettings');

  return (
    <BaseSidebar
      className={className}
      header={header}
      footerText={footerText}
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
    >
      {activeSection === 'stories' && (
        <StoriesSection
          savedTranslations={(
            savedTranslations as unknown as DatabaseSavedTranslationWithDetails[]
          ).filter(s => s.to_language.code === targetLanguage)}
          isLoadingSavedTranslations={isLoadingSavedTranslations}
          sampleStories={sampleStories}
          isLoadingSampleId={isLoading}
          onOpenSavedTranslation={translation => {
            void openSavedTranslation(translation);
          }}
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
    </BaseSidebar>
  );
};

export default StorySidebar;
