import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StoryRender from '../components/story/StoryRender';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TranslationResponse } from '../lib/translationService';
import SaveTranslationButton from '../components/story/SaveTranslationButton';
import StorySidebar from '../components/story/StorySidebar';
import { testWalkthroughTranslationData } from '../__tests__/utils/testData';

const StoryReaderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const translationData = location.state?.translationData as TranslationResponse | undefined;
  const isSavedStory = location.state?.isSavedStory as boolean | undefined;
  // const savedTranslationId = location.state?.savedTranslationId as string | undefined;

  // Use test data if in debug mode and no translation data
  const isDebugMode = window.location.search.includes('debug=walkthrough');
  const finalTranslationData = translationData ?? (isDebugMode ? testWalkthroughTranslationData : undefined);

  const handleTranslateAnother = () => {
    void navigate('/translate');
  };

  const handleGoHome = () => {
    void navigate('/');
  };

  // If no translation data is available, show a message
  if (!finalTranslationData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">No Story Found</h2>
            <p className="text-muted-foreground text-lg">Please translate a story first to view it here.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleTranslateAnother}
              size="lg"
            >
              Translate a Story
            </Button>
            <Button 
              onClick={handleGoHome}
              variant="secondary"
              size="lg"
            >
              Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isSavedStory ? 'Your Saved Story' : 'Your Translated Story'}
        </h1>
        <p className="text-muted-foreground text-lg">
          {isSavedStory 
            ? 'Reading your saved translation from your library' 
            : 'Enjoy reading your story in English!'
          }
        </p>
        {isSavedStory && (
          <div className="mt-2">
            <Badge variant="secondary">Saved Story</Badge>
          </div>
        )}
        {isDebugMode && !translationData && (
          <div className="mt-2">
            <Badge variant="outline">Debug Mode - Test Story</Badge>
          </div>
        )}
      </div>

      {/* Story Container with transparent background */}
      <div className="bg-transparent border border-border rounded-lg p-6 mb-8">
        <StoryRender translationData={finalTranslationData} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <SaveTranslationButton
          translationData={finalTranslationData}
          originalStory={finalTranslationData.originalText || ''}
          originalLanguage="Spanish"
          translatedLanguage="English"
          difficultyLevel={finalTranslationData.difficulty}
          isSavedStory={isSavedStory}
        />
        <Button 
          onClick={handleTranslateAnother}
          size="lg"
        >
            Translate Another Story
        </Button>
        <Button 
          onClick={handleGoHome}
          variant="secondary"
          size="lg"
        >
            Home
        </Button>
      </div>

      {/* Combined Sidebar */}
      <StorySidebar translationData={finalTranslationData} />
    </div>
  );
};

export default StoryReaderPage; 