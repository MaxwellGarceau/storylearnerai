import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Settings, Check, X, Upload } from 'lucide-react';
import { useLanguages } from '../../hooks/useLanguages';
import { validateStoryText } from '../../lib/utils/sanitization';
import type { LanguageCode, DifficultyLevel } from '../../types/llm/prompts';
import { useVocabulary } from '../../hooks/useVocabulary';
import type { VoidFunction } from '../../types/common';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/Tooltip';
import PDFUploadModal from './PDFUploadModal';

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
  const { user } = useAuth();

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
  // We present items as "original_word → translated_word" but when selecting
  // we store ONLY the translated word (target-language word) so we can ask the LLM
  // to include those specific target-language words in the output.
  const availableVocabulary = vocabulary.filter(v => {
    return (
      v.from_language?.code === formData.fromLanguage &&
      v.translated_language?.code === formData.language
    );
  });

  const isSelected = (word: string) =>
    Array.isArray(formData.selectedVocabulary) &&
    formData.selectedVocabulary.includes(word);

  // Store target-language words in the selection (e.g., English words for es→en)
  // IMPORTANT: This ensures we only store TARGET LANGUAGE words for vocabulary inclusion checking
  const toggleSelected = (word: string) => {
    const current = new Set(formData.selectedVocabulary ?? []);
    if (current.has(word)) {
      current.delete(word);
    } else {
      current.add(word);
    }
    onFormDataChange('selectedVocabulary', Array.from(current));
  };

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
      {showOptions && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-background rounded-lg p-6 max-w-md w-full mx-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>
                {t('storyInput.optionsModal.title')}
              </h3>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowOptions(false)}
                className='h-8 w-8 p-0'
              >
                <X className='w-4 h-4' />
              </Button>
            </div>

            <div className='space-y-4'>
              {/* Language Selection */}
              <div className='space-y-2' data-language-section>
                <label className='text-sm font-medium'>
                  {t('storyInput.optionsModal.languageLabel')}
                </label>
                <select
                  value={formData.language}
                  onChange={e =>
                    onFormDataChange('language', e.target.value as LanguageCode)
                  }
                  className='w-full p-2 border rounded-md bg-background'
                >
                  <option value='en'>{getLanguageName('en')}</option>
                </select>
                <p className='text-xs text-muted-foreground'>
                  {t('storyInput.currentlySupported', {
                    language: getLanguageName('en'),
                  })}
                </p>
              </div>

              {/* Difficulty Selection */}
              <div className='space-y-2' data-difficulty-section>
                <label className='text-sm font-medium'>
                  {t('storyInput.optionsModal.difficultyLabel')}
                </label>
                <select
                  value={formData.difficulty}
                  onChange={e =>
                    onFormDataChange(
                      'difficulty',
                      e.target.value as DifficultyLevel
                    )
                  }
                  className='w-full p-2 border rounded-md bg-background'
                >
                  <option value='a1'>{t('storyInput.optionsModal.a1')}</option>
                  <option value='a2'>{t('storyInput.optionsModal.a2')}</option>
                  <option value='b1'>{t('storyInput.optionsModal.b1')}</option>
                  <option value='b2'>{t('storyInput.optionsModal.b2')}</option>
                </select>
                <p className='text-xs text-muted-foreground'>
                  {t('storyInput.difficultyDescription', {
                    language: getLanguageName('en'),
                  })}
                </p>
              </div>

              {/* Vocabulary Selection */}
              <div className='space-y-2' data-vocabulary-section>
                <label className='text-sm font-medium'>
                  {t('storyInput.optionsModal.vocabularyTitle')}
                </label>
                <p className='text-xs text-muted-foreground'>
                  {t('storyInput.optionsModal.vocabularySubtitle')}
                </p>
                <div className='mt-2 max-h-48 overflow-auto border rounded-md p-2 bg-background'>
                  {vocabLoading ? (
                    <div className='text-sm text-muted-foreground'>
                      {t('common.loading')}
                    </div>
                  ) : availableVocabulary.length === 0 ? (
                    <div className='text-sm text-muted-foreground'>
                      {t('storyInput.optionsModal.noVocabularyForPair')}
                    </div>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      {availableVocabulary.map(v => {
                        // Display format: "source_word → target_word" but store only TARGET WORD
                        const display = `${v.original_word} → ${v.translated_word}`;
                        const key = `${v.id}-${v.translated_word}`;
                        const selected = isSelected(v.translated_word); // Check target word selection
                        return (
                          <button
                            key={key}
                            type='button'
                            onClick={() => toggleSelected(v.translated_word)} // Store target word only
                            className={`text-sm px-2 py-1 rounded-md border transition-colors ${
                              selected
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background hover:bg-accent border-input'
                            }`}
                            aria-pressed={selected}
                          >
                            {display}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className='text-xs text-muted-foreground'>
                  {t('storyInput.optionsModal.selectedCount', {
                    count: formData.selectedVocabulary?.length ?? 0,
                  })}
                </div>
              </div>
            </div>

            <div className='flex justify-end mt-6'>
              <Button onClick={() => setShowOptions(false)} className='px-6'>
                {t('storyInput.done')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-background rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold mb-4'>
              {t('storyInput.confirmationModal.title')}
            </h3>

            <div className='space-y-3 mb-6'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>
                  {t('storyInput.confirmationModal.from')}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type='button'
                      onClick={() => handleGoToOptionsSection('language')}
                      className='font-medium text-primary underline underline-offset-2 hover:opacity-90'
                      aria-label={t(
                        'storyInput.confirmationModal.editLanguage'
                      )}
                    >
                      {getLanguageName(formData.fromLanguage)}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {t('storyInput.confirmationModal.clickToChangeLanguage')}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>
                  {t('storyInput.confirmationModal.to')}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type='button'
                      onClick={() => handleGoToOptionsSection('language')}
                      className='font-medium text-primary underline underline-offset-2 hover:opacity-90'
                      aria-label={t(
                        'storyInput.confirmationModal.editLanguage'
                      )}
                    >
                      {getLanguageName(formData.language)}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {t('storyInput.confirmationModal.clickToChangeLanguage')}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>
                  {t('storyInput.confirmationModal.difficulty')}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type='button'
                      onClick={() => handleGoToOptionsSection('difficulty')}
                      className='font-medium text-primary underline underline-offset-2 hover:opacity-90'
                      aria-label={t(
                        'storyInput.confirmationModal.editDifficulty'
                      )}
                    >
                      {getDifficultyLabel(formData.difficulty)}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {t(
                        'storyInput.confirmationModal.clickToChangeDifficulty'
                      )}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className='flex justify-between items-start'>
                <span className='text-muted-foreground'>
                  {t('storyInput.confirmationModal.vocabulary')}
                </span>
                <div className='text-right'>
                  {formData.selectedVocabulary?.length ? (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type='button'
                            onClick={() =>
                              handleGoToOptionsSection('vocabulary')
                            }
                            className='text-xs text-muted-foreground underline underline-offset-2 hover:opacity-90 text-right block'
                            aria-label={t(
                              'storyInput.confirmationModal.editVocabulary'
                            )}
                          >
                            {t(
                              'storyInput.confirmationModal.vocabularySelectedCount',
                              { count: formData.selectedVocabulary.length }
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {t(
                              'storyInput.confirmationModal.clickToChangeVocabulary'
                            )}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type='button'
                            onClick={() =>
                              handleGoToOptionsSection('vocabulary')
                            }
                            className='mt-1 text-sm underline underline-offset-2 hover:opacity-90 text-right block'
                            aria-label={t(
                              'storyInput.confirmationModal.editVocabulary'
                            )}
                          >
                            {formData.selectedVocabulary.join(', ')}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {t(
                              'storyInput.confirmationModal.clickToChangeVocabulary'
                            )}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </>
                  ) : (
                    <div className='text-sm'>
                      <span>
                        {t('storyInput.confirmationModal.noVocabularySelected')}
                      </span>
                      {user && (
                        <>
                          <span className='mx-1'>·</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type='button'
                                onClick={() =>
                                  handleGoToOptionsSection('vocabulary')
                                }
                                className='text-primary underline underline-offset-2 hover:opacity-90'
                                aria-label={t(
                                  'storyInput.confirmationModal.goToVocabulary'
                                )}
                              >
                                {t(
                                  'storyInput.confirmationModal.goToVocabulary'
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {t(
                                  'storyInput.confirmationModal.clickToChangeVocabulary'
                                )}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='flex gap-3'>
              <Button
                onClick={handleCancelTranslation}
                variant='outline'
                className='flex-1'
              >
                <X className='w-4 h-4 mr-2' />
                {t('storyInput.confirmationModal.cancel')}
              </Button>
              <Button onClick={handleConfirmTranslation} className='flex-1'>
                <Check className='w-4 h-4 mr-2' />
                {t('storyInput.confirmationModal.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}

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
