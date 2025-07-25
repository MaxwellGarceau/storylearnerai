import React, { useState } from 'react';
import FullPageStoryInput from './FullPageStoryInput';
import TranslationOptionsSidebar from './TranslationOptionsSidebar';
import { translationService, TranslationResponse } from '../../lib/translationService';
import { Alert, AlertDescription, AlertIcon } from '../ui/Alert';
import type { LanguageCode, DifficultyLevel } from '../../lib/types/prompt';
import { StoryFormData } from '../types/story';

interface StoryContainerProps {
  onStoryTranslated: (data: TranslationResponse) => void;
}

const StoryContainer: React.FC<StoryContainerProps> = ({ onStoryTranslated }) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [formData, setFormData] = useState<StoryFormData>({
    story: '',
    language: 'en', // Language code instead of name
    difficulty: 'a1', // Difficulty code instead of name
  });

  const handleFormDataChange = (field: 'language' | 'difficulty', value: LanguageCode | DifficultyLevel) => {
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
        fromLanguage: 'es', // Spanish language code
        toLanguage: formData.language,
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
          onSubmit={handleSubmit}
          isTranslating={isTranslating}
        />
      </div>

      {/* Sidebar */}
      <TranslationOptionsSidebar
        formData={formData}
        onFormDataChange={handleFormDataChange}
      />

      {/* Error message */}
      {translationError && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-20 md:w-80 z-40">
          <Alert variant="destructive" className="shadow-lg">
            <AlertIcon.destructive className="h-4 w-4" />
            <AlertDescription>
              <span className="font-medium">Translation Error:</span> {translationError}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default StoryContainer;
