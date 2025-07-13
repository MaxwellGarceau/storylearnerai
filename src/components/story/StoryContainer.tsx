import React, { useState } from 'react';
import StoryUploadForm from './StoryUploadForm';
import StoryRender from './StoryRender';
import { translationService, TranslationResponse } from '../../lib/translationService';

const StoryContainer: React.FC = () => {
  const [translatedStory, setTranslatedStory] = useState<TranslationResponse | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const handleStorySubmit = async (storyData: { story: string; language: string; difficulty: string }) => {
    setIsTranslating(true);
    setTranslationError(null);
    setTranslatedStory(null);

    try {
      // Using mock translation for development - replace with actual service when ready
      const response = await translationService.mockTranslateStory({
        text: storyData.story,
        fromLanguage: 'Spanish',
        toLanguage: 'English',
        difficulty: storyData.difficulty,
      });

      setTranslatedStory(response);
    } catch (error) {
      console.error('Translation failed:', error);
      setTranslationError(
        error instanceof Error ? error.message : 'Translation failed. Please try again.'
      );
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-6">
      <StoryUploadForm onSubmitStory={handleStorySubmit} />
      
      {isTranslating && (
        <div className="mt-4 p-4 border rounded-md bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" role="status" aria-label="Loading"></div>
            <span className="text-blue-800">Translating your story...</span>
          </div>
        </div>
      )}

      {translationError && (
        <div className="mt-4 p-4 border rounded-md bg-red-50 border-red-200">
          <div className="flex items-center space-x-2">
            <span className="text-red-800">❌ Translation Error:</span>
            <span className="text-red-700">{translationError}</span>
          </div>
        </div>
      )}

      {translatedStory && <StoryRender translationData={translatedStory} />}
    </div>
  );
};

export default StoryContainer;
