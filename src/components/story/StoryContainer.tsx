import React, { useState } from 'react';
import StoryUploadForm from './StoryUploadForm';
import { translationService, TranslationResponse } from '../../lib/translationService';

interface StoryContainerProps {
  onStoryTranslated: (data: TranslationResponse) => void;
}

const StoryContainer: React.FC<StoryContainerProps> = ({ onStoryTranslated }) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const handleStorySubmit = async (storyData: { story: string; language: string; difficulty: string }) => {
    setIsTranslating(true);
    setTranslationError(null);

    try {
      // Automatically uses mock or real translation based on VITE_ENABLE_MOCK_TRANSLATION env variable
      const response = await translationService.translate({
        text: storyData.story,
        fromLanguage: 'Spanish',
        toLanguage: 'English',
        difficulty: storyData.difficulty,
      });

      // Trigger the view switch to story reader page
      onStoryTranslated(response);
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
    </div>
  );
};

export default StoryContainer;
