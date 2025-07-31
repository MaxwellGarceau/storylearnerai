import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import TextArea from '../ui/TextArea';
import { Alert, AlertDescription, AlertIcon } from '../ui/Alert';
import { useSavedTranslations } from '../../hooks/useSavedTranslations';
import { useSupabase } from '../../hooks/useSupabase';
import { TranslationResponse } from '../../lib/translationService';
import { useToast } from '../../hooks/useToast';
import { useLanguages } from '../../hooks/useLanguages';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip';
import { validateTextInput, sanitizeText } from '../../lib/utils/sanitization';
import type { LanguageCode, DifficultyLevel, DifficultyLevelDisplay } from '../../lib/types/prompt';

interface SaveTranslationButtonProps {
  translationData: TranslationResponse;
  originalStory: string;
  originalLanguage: string;
  translatedLanguage: string;
  difficultyLevel: DifficultyLevelDisplay;
  isSavedStory?: boolean;
}

export default function SaveTranslationButton({
  translationData,
  originalStory,
  originalLanguage,
  translatedLanguage,
  difficultyLevel,
  isSavedStory = false,
}: SaveTranslationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    notes?: string;
  }>({});
  
  const { createSavedTranslation, isCreating } = useSavedTranslations();
  const { user } = useSupabase();
  const { toast } = useToast();
  const { languageMap, getLanguageCode } = useLanguages();



  // Convert difficulty level to CEFR format (database expects CEFR codes)
  const getDifficultyCode = (difficultyLevel: DifficultyLevelDisplay): DifficultyLevel => {
    // Ensure the difficulty level is in lowercase CEFR format
    return difficultyLevel.toLowerCase() as DifficultyLevel;
  };

  // Validate and sanitize input fields
  const validateAndSanitizeInput = (field: 'title' | 'notes', value: string) => {
    const sanitizedValue = sanitizeText(value, { maxLength: field === 'title' ? 200 : 1000 });
    
    const validation = validateTextInput(sanitizedValue, {
      maxLength: field === 'title' ? 200 : 1000,
      allowHTML: false,
      allowLineBreaks: true,
      trim: true,
    });

    if (!validation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: validation.errors[0] || `Invalid ${field}`
      }));
      return null;
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: undefined
    }));
    return sanitizedValue;
  };

  // Handle input changes with validation
  const handleInputChange = (field: 'title' | 'notes', value: string) => {
    if (field === 'title') {
      setTitle(value);
    } else {
      setNotes(value);
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError('Please sign in to save translations');
      return;
    }

    if (!translationData.translatedText) {
      setError('No translated text available to save');
      return;
    }

    // Validate and sanitize input fields
    const sanitizedTitle = validateAndSanitizeInput('title', title);
    const sanitizedNotes = validateAndSanitizeInput('notes', notes);

    // Check if there are any validation errors
    if (validationErrors.title || validationErrors.notes) {
      setError('Please fix the validation errors before saving');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const originalLanguageCode = getLanguageCode(originalLanguage);
      const translatedLanguageCode = getLanguageCode(translatedLanguage);

      if (!originalLanguageCode || !translatedLanguageCode) {
        setError('Unsupported language combination');
        return;
      }

      await createSavedTranslation({
        original_story: originalStory,
        translated_story: translationData.translatedText,
        original_language_code: originalLanguageCode,
        translated_language_code: translatedLanguageCode,
        difficulty_level_code: getDifficultyCode(difficultyLevel),
        title: sanitizedTitle || undefined,
        notes: sanitizedNotes || undefined,
      });

      // Show success toast
      toast({
        variant: "success",
        title: "Translation Saved!",
        description: "Your translation has been saved to your library.",
      });

      // Close the modal and reset form
      setIsOpen(false);
      setTitle('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save translation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setTitle('');
    setNotes('');
    setError(null);
    setValidationErrors({});
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block cursor-help">
            <Button
              onClick={() => setIsOpen(true)}
              variant="outline"
              className="gap-2"
              disabled={!user || isSavedStory}
              data-testid="save-translation-button"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {!user 
                ? 'Sign in to Save' 
                : isSavedStory 
                  ? 'Already Saved' 
                  : 'Save Translation'
              }
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {!user 
            ? 'Sign in to save translations' 
            : isSavedStory 
              ? 'The ability to edit and resave already translated stories is under construction =)' 
              : 'Save this translation'
          }
        </TooltipContent>
      </Tooltip>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Save Translation</CardTitle>
              <CardDescription>
                Save this translation to your library for future reference
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <TextArea
                  id="title"
                  name="title"
                  label="Title (optional)"
                  placeholder="Enter a title for this translation..."
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('title', e.target.value)}
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-600">{validationErrors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <TextArea
                  id="notes"
                  name="notes"
                  label="Notes (optional)"
                  placeholder="Add any notes about this translation..."
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
                />
                {validationErrors.notes && (
                  <p className="text-sm text-red-600">{validationErrors.notes}</p>
                )}
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <div>
                  <span className="font-medium">Original Language:</span> {originalLanguage}
                </div>
                <div>
                  <span className="font-medium">Translated Language:</span> {translatedLanguage}
                </div>
                <div>
                  <span className="font-medium">Difficulty Level:</span> {difficultyLevel.toUpperCase()}
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertIcon.destructive className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || isCreating}
                  className="flex-1"
                >
                  {isSaving || isCreating ? 'Saving...' : 'Save Translation'}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isSaving || isCreating}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
} 