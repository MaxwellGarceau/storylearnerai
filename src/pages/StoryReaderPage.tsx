import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StoryRender from '../components/story/StoryRender';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TranslationResponse } from '../lib/translationService';
import SaveTranslationButton from '../components/story/SaveTranslationButton';
import StorySidebar from '../components/story/StorySidebar';
import { testWalkthroughTranslationData } from '../__tests__/utils/testData';
import { useTranslation } from 'react-i18next';

const StoryReaderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const state = location.state as {
    translationData?: TranslationResponse;
    isSavedStory?: boolean;
  } | null;
  const translationData = state?.translationData;
  const isSavedStory = state?.isSavedStory;
  // const savedTranslationId = location.state?.savedTranslationId as string | undefined;

  // Use test data if in debug mode and no translation data
  const isDebugMode = window.location.search.includes('debug=walkthrough');
  const finalTranslationData =
    translationData ??
    (isDebugMode ? testWalkthroughTranslationData : undefined);

  const handleTranslateAnother = () => {
    void navigate('/translate');
  };

  const handleGoHome = () => {
    void navigate('/');
  };

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
            <Button onClick={handleTranslateAnother} size='lg'>
              {t('storyReader.noStory.translateStory')}
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
          {isSavedStory
            ? t('storyReader.header.savedStory')
            : t('storyReader.header.translatedStory')}
        </h1>
        <p className='text-muted-foreground text-lg'>
          {isSavedStory
            ? t('storyReader.header.savedDescription')
            : t('storyReader.header.translatedDescription')}
        </p>
        {isSavedStory && (
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
        <StoryRender translationData={finalTranslationData} />
      </div>

      {/* Action Buttons */}
      <div className='flex flex-col sm:flex-row gap-4 justify-center'>
        <SaveTranslationButton
          translationData={finalTranslationData}
          originalStory={finalTranslationData.originalText || ''}
          originalLanguage='Spanish'
          translatedLanguage='English'
          difficultyLevel={finalTranslationData.difficulty}
          isSavedStory={isSavedStory}
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
