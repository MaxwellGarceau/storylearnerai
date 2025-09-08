import React, { useState } from 'react';
import FullPageStoryInput from './FullPageStoryInput';
import {
  translationService,
  TranslationResponse,
  TranslationError,
} from '../../lib/translationService';
import { Alert, AlertDescription, AlertIcon } from '../ui/Alert';
import type { LanguageCode, DifficultyLevel } from '../../types/llm/prompts';
import { StoryFormData } from '../types/story';
import { logger } from '../../lib/logger';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from 'react-i18next';

interface StoryContainerProps {
  onStoryTranslated: (data: TranslationResponse) => void;
}

const StoryContainer: React.FC<StoryContainerProps> = ({
  onStoryTranslated,
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] =
    useState<TranslationError | null>(null);
  const [formData, setFormData] = useState<StoryFormData>({
    story: '',
    fromLanguage: 'es',
    language: 'en', // Language code instead of name
    difficulty: 'a1', // Difficulty code instead of name
    selectedVocabulary: [],
  });

  const { toast } = useToast();
  const { t } = useTranslation();

  const handleFormDataChange = (
    field: 'fromLanguage' | 'language' | 'difficulty' | 'selectedVocabulary',
    value: LanguageCode | DifficultyLevel | string[]
  ) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  const handleStoryChange = (story: string) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      story,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.story.trim()) {
      setTranslationError({
        message: 'Please enter a story to translate.',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);

    try {
      // Automatically uses mock or real translation based on VITE_ENABLE_MOCK_TRANSLATION env variable
      const response = await translationService.translate({
        text: formData.story,
        fromLanguage: formData.fromLanguage,
        toLanguage: formData.language,
        difficulty: formData.difficulty,
        selectedVocabulary: formData.selectedVocabulary,
      });

      // Trigger the view switch to story reader page
      onStoryTranslated(response);

      // Show toast notification if some TARGET LANGUAGE vocabulary words weren't included in TARGET LANGUAGE text
      if (response.missingVocabulary && response.missingVocabulary.length > 0) {
        const missingCount = response.missingVocabulary.length;
        const totalSelected = response.selectedVocabulary?.length ?? 0;

        toast({
          title: t('storyContainer.vocabularyWarningTitle', {
            count: missingCount,
          }),
          description: t('storyContainer.vocabularyWarningDescription', {
            missingCount,
            totalCount: totalSelected,
            missingWords: response.missingVocabulary.join(', '),
          }),
          variant: 'destructive',
        });
      }
    } catch (error) {
      logger.error('translation', 'Translation failed', { error });

      // Handle TranslationError type
      if (error && typeof error === 'object' && 'code' in error) {
        setTranslationError(error as TranslationError);
      } else {
        // Fallback for other error types
        setTranslationError({
          message:
            error instanceof Error
              ? error.message
              : 'Translation failed. Please try again.',
          code: 'UNKNOWN_ERROR',
        });
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const renderErrorMessage = (error: TranslationError) => {
    return (
      <div className='space-y-2'>
        <div className='font-medium'>Translation Error:</div>
        <div className='text-sm'>{error.message}</div>

        {(error.provider ??
          error.statusCode ??
          (error.code && error.code !== 'UNKNOWN_ERROR')) && (
          <div className='text-xs text-muted-foreground space-y-1'>
            {error.provider && <div>Provider: {error.provider}</div>}
            {error.statusCode && <div>Status: {error.statusCode}</div>}
            {error.code && error.code !== 'UNKNOWN_ERROR' && (
              <div>Error code: {error.code}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='h-full relative'>
      {/* Main content */}
      <div className='h-full'>
        <FullPageStoryInput
          value={formData.story}
          onChange={handleStoryChange}
          onSubmit={() => void handleSubmit()}
          isTranslating={isTranslating}
          formData={formData}
          onFormDataChange={handleFormDataChange}
        />
      </div>

      {/* Sidebar removed - options now integrated into main input */}

      {/* Error message */}
      {translationError && (
        <div className='fixed bottom-4 left-4 right-4 md:left-auto md:right-20 md:w-80 z-40'>
          <Alert variant='destructive' className='shadow-lg'>
            <AlertIcon.destructive className='h-4 w-4' />
            <AlertDescription>
              {renderErrorMessage(translationError)}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default StoryContainer;
