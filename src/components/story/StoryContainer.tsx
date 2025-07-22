import React, { useState } from 'react';
import FullPageStoryInput from './FullPageStoryInput';
import TranslationOptionsSidebar from './TranslationOptionsSidebar';
import { translationService, TranslationResponse } from '../../lib/translationService';

interface StoryContainerProps {
  onStoryTranslated: (data: TranslationResponse) => void;
}

const StoryContainer: React.FC<StoryContainerProps> = ({ onStoryTranslated }) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    story: '',
    language: 'English',
    difficulty: 'A1',
  });

  const handleFormDataChange = (field: 'language' | 'difficulty', value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  const handleStoryChange = (story: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      story,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.story.trim()) {
      setTranslationError('Please enter a story to translate.');
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);

    try {
      // Automatically uses mock or real translation based on VITE_ENABLE_MOCK_TRANSLATION env variable
      const response = await translationService.translate({
        text: formData.story,
        fromLanguage: 'Spanish',
        toLanguage: 'English',
        difficulty: formData.difficulty,
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
    <div className="h-full relative">
      {/* Main content */}
      <div className="h-full">
        <FullPageStoryInput
          value={formData.story}
          onChange={handleStoryChange}
        />
      </div>

      {/* Sidebar */}
      <TranslationOptionsSidebar
        formData={formData}
        onFormDataChange={handleFormDataChange}
        onSubmit={handleSubmit}
        isTranslating={isTranslating}
      />

      {/* Error message */}
      {translationError && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-20 md:w-80 z-40">
          <div className="p-4 border rounded-md bg-red-50 border-red-200 shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-800">❌ Translation Error:</span>
              <span className="text-red-700">{translationError}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryContainer;
