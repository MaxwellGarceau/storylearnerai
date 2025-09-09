import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Settings, Upload } from 'lucide-react';
import { useLanguages } from '../../hooks/useLanguages';
import { validateStoryText } from '../../lib/utils/sanitization';
import type { LanguageCode, DifficultyLevel } from '../../types/llm/prompts';
import { useVocabulary } from '../../hooks/useVocabulary';
import type { VoidFunction } from '../../types/common';
import { useTranslation } from 'react-i18next';
import PDFUploadModal from './PDFUploadModal';
import OptionsModal from './OptionsModal';
import ConfirmationModal from './ConfirmationModal';

interface FullPageStoryInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: VoidFunction;
  isTranslating: boolean;
  placeholder?: string;
  formData: {
    fromLanguage: LanguageCode;
    language: LanguageCode;
    difficulty: DifficultyLevel;
    selectedVocabulary: string[];
  };
  onFormDataChange: (
    field: 'fromLanguage' | 'language' | 'difficulty' | 'selectedVocabulary',
    value: LanguageCode | DifficultyLevel | string[]
  ) => void;
}

const FullPageStoryInput: React.FC<FullPageStoryInputProps> = ({
  value,
  onChange,
  onSubmit,
  isTranslating,
  placeholder,
  formData,
  onFormDataChange,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPDFUpload, setShowPDFUpload] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { getLanguageName } = useLanguages();
  const { t } = useTranslation();
  const { vocabulary, loading: vocabLoading } = useVocabulary();

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = event.target.value;

    // Validate and sanitize the input
    const validation = validateStoryText(rawValue);

    if (validation.isValid) {
      setValidationError(null);
      // Use the sanitized text
      onChange(validation.sanitizedText);
    } else {
      // Show validation error but still allow editing
      setValidationError(
        validation.errors[0] || t('storyInput.validation.invalidInput')
      );
      // Still update with sanitized text to prevent malicious content
      onChange(validation.sanitizedText);
    }
  };

  const handleTranslateClick = () => {
    // Final validation before translation
    const validation = validateStoryText(value);

    if (!validation.isValid) {
      setValidationError(
        validation.errors[0] || t('storyInput.validation.fixInput')
      );
      return;
    }

    setValidationError(null);
    setShowConfirmation(true);
  };

  const handleConfirmTranslation = () => {
    setShowConfirmation(false);
    onSubmit();
  };

  const handleCancelTranslation = () => {
    setShowConfirmation(false);
  };

  const handlePDFTextExtracted = (text: string) => {
    onChange(text);
  };

  const handleGoToOptionsSection = (
    sectionName: 'language' | 'difficulty' | 'vocabulary'
  ) => {
    setShowConfirmation(false);
    setShowOptions(true);
    // Small delay to ensure modal is rendered before scrolling
    setTimeout(() => {
      const sectionSelector = `[data-${sectionName}-section]`;
      const sectionElement = document.querySelector(sectionSelector);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const getDifficultyLabel = (difficulty: DifficultyLevel) => {
    return t(`difficultyLevels.${difficulty}.label`);
  };

  // Compute available vocabulary for the current language pair.
  // Filter by the form's fromLanguage (source) and current target language.
  // We present items as "from_word → target_word" but when selecting
  // we store ONLY the translated word (target-language word) so we can ask the LLM
  // to include those specific target-language words in the output.
  const availableVocabulary = vocabulary.filter(v => {
    return (
      v.from_language?.code === formData.fromLanguage &&
      v.target_language?.code === formData.language
    );
  });

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='mb-6'>
        <h2 className='text-3xl font-bold text-foreground mb-2'>
          {t('story.uploadTitle')}
        </h2>
        <p className='text-muted-foreground text-lg'>
          {t('story.uploadDescription')}
        </p>
      </div>

      {/* Full-page text area */}
      <div className='flex-1 min-h-0'>
        <Card className='h-full'>
          <CardContent className='p-0 h-full'>
            <textarea
              id='fullpage-story-input'
              name='fullpage-story-input'
              data-testid='story-textarea'
              value={value}
              onChange={handleInputChange}
              placeholder={placeholder ?? t('storyInput.placeholder')}
              className='w-full h-full min-h-[calc(100vh-300px)] resize-none border-0 focus:ring-0 focus:border-0 p-6 text-lg leading-relaxed bg-transparent text-foreground placeholder:text-muted-foreground'
              style={{
                minHeight: 'calc(100vh - 300px)',
                fontFamily: 'Georgia, serif',
                lineHeight: '1.8',
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Action area with buttons and tip */}
      <div className='mt-6 space-y-4'>
        {/* Buttons */}
        <div className='flex justify-center items-center gap-4'>
          {/* PDF Upload Button */}
          <Button
            type='button'
            variant='outline'
            onClick={() => setShowPDFUpload(true)}
            size='lg'
            className='px-6 py-3 text-lg font-medium'
            data-testid='pdf-upload-button'
          >
            <Upload className='w-5 h-5 mr-2' />
            {t('story.uploadPDF')}
          </Button>

          {/* Options Button */}
          <Button
            type='button'
            variant='outline'
            onClick={() => setShowOptions(!showOptions)}
            size='lg'
            className='px-6 py-3 text-lg font-medium'
            data-testid='options-button'
          >
            <Settings className='w-5 h-5 mr-2' />
            {t('common.edit')}
          </Button>

          {/* Translate Button */}
          <Button
            type='button'
            onClick={handleTranslateClick}
            disabled={isTranslating || !value.trim()}
            size='lg'
            className='px-8 py-3 text-lg font-medium'
            data-testid='translate-button'
          >
            {isTranslating ? (
              <div className='flex items-center space-x-2'>
                <div
                  className='animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent'
                  role='status'
                  aria-label='Loading'
                />
                <span>Translating...</span>
              </div>
            ) : (
              t('story.translateButton')
            )}
          </Button>
        </div>

        {/* Options Panel - Removed from here, now in floating modal */}

        {/* Validation Error */}
        {validationError && (
          <div className='text-sm text-red-600 text-center bg-red-50 p-3 rounded-md border border-red-200'>
            <p className='font-medium'>
              {t('storyInput.validation.securityWarning')}
            </p>
            <p>{validationError}</p>
            <p className='text-xs mt-1'>
              {t('storyInput.validation.maliciousContentRemoved')}
            </p>
          </div>
        )}

        {/* Footer info */}
        <div className='text-sm text-muted-foreground text-center'>
          <p>{t('storyInput.tip')}</p>
        </div>
      </div>

      {/* Options Modal */}
      <OptionsModal
        isOpen={showOptions}
        onClose={() => setShowOptions(false)}
        selectedLanguage={formData.language}
        onLanguageChange={language => onFormDataChange('language', language)}
        selectedDifficulty={formData.difficulty}
        onDifficultyChange={difficulty =>
          onFormDataChange('difficulty', difficulty)
        }
        availableVocabulary={availableVocabulary}
        selectedVocabulary={formData.selectedVocabulary}
        onVocabularyChange={vocabulary =>
          onFormDataChange('selectedVocabulary', vocabulary)
        }
        vocabLoading={vocabLoading}
        getLanguageName={getLanguageName}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCancelTranslation}
        onConfirm={handleConfirmTranslation}
        fromLanguage={formData.fromLanguage}
        toLanguage={formData.language}
        difficulty={formData.difficulty}
        selectedVocabulary={formData.selectedVocabulary}
        getLanguageName={getLanguageName}
        getDifficultyLabel={getDifficultyLabel}
        onGoToOptionsSection={handleGoToOptionsSection}
      />

      {/* PDF Upload Modal */}
      <PDFUploadModal
        isOpen={showPDFUpload}
        onClose={() => setShowPDFUpload(false)}
        onTextExtracted={handlePDFTextExtracted}
        maxPages={10}
        maxFileSize={5}
      />
    </div>
  );
};

export default FullPageStoryInput;
