import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import StoryRender from '../components/story/StoryRender';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TranslationResponse } from '../lib/translationService';
import SaveTranslationButton from '../components/story/SaveTranslationButton';
import { useLanguages } from '../hooks/useLanguages';
import StorySidebar from '../components/sidebar/StorySidebar';
import { testWalkthroughTranslationData } from '../__tests__/utils/testData';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { SavedTranslationService } from '../api/supabase/database/savedTranslationService';
import { FallbackTokenGenerator } from '../lib/llm/fallbackTokenGenerator';

const StoryReaderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { getLanguageName } = useLanguages();
  const [searchParams] = useSearchParams();
  const state = location.state as {
    translationData?: TranslationResponse;
    isSavedStory?: boolean;
    savedTranslationId?: number;
  } | null;
  const translationData = state?.translationData;
  const isSavedStoryFromState = state?.isSavedStory;
  const savedTranslationIdFromState = state?.savedTranslationId;

  const urlSavedTranslationId = useMemo(() => {
    const idParam = searchParams.get('id');
    if (!idParam) return undefined;
    const parsed = Number(idParam);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [searchParams]);

  const [loadingById, setLoadingById] = useState(false);
  const [errorById, setErrorById] = useState<string | null>(null);
  const [fetchedTranslationData, setFetchedTranslationData] = useState<
    TranslationResponse | undefined
  >(undefined);

  useEffect(() => {
    // If we don't already have translation data via state, but we have an id in the URL, fetch it
    if (!translationData && urlSavedTranslationId && user?.id) {
      const run = async () => {
        setLoadingById(true);
        setErrorById(null);
        try {
          const service = new SavedTranslationService();
          const saved = await service.getSavedTranslation(
            String(urlSavedTranslationId),
            user.id
          );
          if (saved) {
            // Generate tokens from saved translation using fallback tokenizer
            const tokens = FallbackTokenGenerator.generateTokens(
              saved.target_story
            );

            const response: TranslationResponse = {
              fromText: saved.from_story,
              targetText: saved.target_story,
              tokens,
              fromLanguage: saved.from_language.code,
              toLanguage: saved.target_language.code,
              difficulty: saved.difficulty_level.code,
              provider: 'saved',
              model: 'saved-translation',
              usedFallbackTokens: true, // Saved translations always use fallback
            };
            setFetchedTranslationData(response);
          } else {
            setErrorById('Saved translation not found');
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          setErrorById(message);
        } finally {
          setLoadingById(false);
        }
      };
      void run();
    }
  }, [translationData, urlSavedTranslationId, user]);

  // Use test data if in debug mode and no translation data
  const isDebugMode = window.location.search.includes('debug=walkthrough');
  const finalTranslationData =
    translationData ??
    fetchedTranslationData ??
    (isDebugMode ? testWalkthroughTranslationData : undefined);

  const resolvedIsSavedStory =
    isSavedStoryFromState ?? Boolean(urlSavedTranslationId);
  const resolvedSavedTranslationId =
    savedTranslationIdFromState ?? urlSavedTranslationId;

  const handleTranslateAnother = () => {
    void navigate('/translate');
  };

  const handleGoHome = () => {
    void navigate('/');
  };

  // Loading state when fetching by id
  if (!translationData && urlSavedTranslationId && loadingById) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='max-w-2xl mx-auto text-center p-8'>
          <div className='mb-4'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto' />
          </div>
          <p className='text-muted-foreground text-lg'>
            {t('storySidebar.loadingStory')}
          </p>
        </div>
      </div>
    );
  }

  // If no translation data is available, show a message
  if (!finalTranslationData) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='max-w-2xl mx-auto text-center p-8'>
          <div className='mb-8'>
            <h2 className='text-3xl font-bold mb-4'>
              {t('storyReader.noStory.title')}
            </h2>
            <p className='text-muted-foreground text-lg'>
              {t('storyReader.noStory.description')}
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            {errorById && (
              <div className='text-sm text-destructive'>{errorById}</div>
            )}
            <Button onClick={handleTranslateAnother} size='lg'>
              {t('storyReader.noStory.targetStory')}
            </Button>
            <Button onClick={handleGoHome} variant='secondary' size='lg'>
              {t('storyReader.noStory.home')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='relative'>
      {/* Header */}
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold mb-2'>
          {resolvedIsSavedStory
            ? t('storyReader.header.savedStory')
            : t('storyReader.header.translatedStory')}
        </h1>
        <p className='text-muted-foreground text-lg'>
          {resolvedIsSavedStory
            ? t('storyReader.header.savedDescription')
            : t('storyReader.header.translatedDescription')}
        </p>
        {resolvedIsSavedStory && (
          <div className='mt-2'>
            <Badge variant='secondary'>
              {t('storyReader.header.savedBadge')}
            </Badge>
          </div>
        )}
        {isDebugMode && !translationData && (
          <div className='mt-2'>
            <Badge variant='outline'>
              {t('storyReader.header.debugBadge')}
            </Badge>
          </div>
        )}
      </div>

      {/* Story Container with transparent background */}
      <div className='bg-transparent border border-border rounded-lg p-6 mb-8'>
        <StoryRender
          translationData={finalTranslationData}
          savedTranslationId={resolvedSavedTranslationId}
        />
      </div>

      {/* Action Buttons */}
      <div className='flex flex-col sm:flex-row gap-4 justify-center'>
        <SaveTranslationButton
          translationData={finalTranslationData}
          fromStory={finalTranslationData.fromText || ''}
          fromLanguage={getLanguageName(finalTranslationData.fromLanguage)}
          targetLanguage={getLanguageName(finalTranslationData.toLanguage)}
          difficultyLevel={finalTranslationData.difficulty}
          isSavedStory={resolvedIsSavedStory}
        />
        <Button onClick={handleTranslateAnother} size='lg'>
          {t('storyReader.actions.translateAnother')}
        </Button>
        <Button onClick={handleGoHome} variant='secondary' size='lg'>
          {t('storyReader.actions.home')}
        </Button>
      </div>

      {/* Combined Sidebar */}
      <StorySidebar translationData={finalTranslationData} />
    </div>
  );
};

export default StoryReaderPage;
