import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import TextArea from '../ui/TextArea';
import { Alert, AlertDescription, AlertIcon } from '../ui/Alert';
import { useAuth } from '../../hooks/useAuth';
import { TranslationResponse } from '../../lib/translationService';
import { useToast } from '../../hooks/useToast';
import { useLanguages } from '../../hooks/useLanguages';
import { useDifficultyLevels } from '../../hooks/useDifficultyLevels';
import { SavedTranslationService } from '../../api/supabase/database/savedTranslationService';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip';
import { validateTextInput, sanitizeText } from '../../lib/utils/sanitization';
import type { DifficultyLevel } from '../../types/llm/prompts';
import type { SaveFieldType, TextAreaChangeEvent } from '../../types/common';

interface SaveTranslationButtonProps {
  translationData: TranslationResponse;
  originalStory: string;
  originalLanguage: string;
  translatedLanguage: string;
  difficultyLevel: DifficultyLevel;
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
  
  const { user } = useAuth();
  const savedTranslationService = new SavedTranslationService();
  const { toast } = useToast();
  const { getLanguageCode } = useLanguages();
  const { getDifficultyLevelName } = useDifficultyLevels();

  // Validate and sanitize input fields
  const validateAndSanitizeInput = (field: SaveFieldType, value: string) => {
    // Align with database schema: title VARCHAR(255), notes TEXT (unlimited)
    const sanitizedValue = sanitizeText(value, { 
      maxLength: field === 'title' ? 255 : undefined 
    });
    
    const validation = validateTextInput(sanitizedValue, {
      maxLength: field === 'title' ? 255 : undefined, // title: 255 chars, notes: unlimited
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
  const handleInputChange = (field: SaveFieldType, value: string) => {
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

      await savedTranslationService.createSavedTranslation({
        original_story: originalStory,
        translated_story: translationData.translatedText,
        original_language_code: originalLanguageCode,
        translated_language_code: translatedLanguageCode,
        difficulty_level_code: difficultyLevel,
        title: sanitizedTitle ?? undefined,
        notes: sanitizedNotes ?? undefined,
      }, user.id);

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
      const errorMessage = err instanceof Error ? err.message : 'Failed to save translation';
      setError(errorMessage);
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
                  onChange={(e: TextAreaChangeEvent) => {
                    handleInputChange('title', e.target.value);
                  }}
                  maxLength={255}
                  showCharacterCount={true}
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
                  onChange={(e: TextAreaChangeEvent) => {
                    handleInputChange('notes', e.target.value);
                  }}
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
                  <span className="font-medium">Difficulty Level:</span> {getDifficultyLevelName(difficultyLevel)}
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
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? 'Saving...' : 'Save Translation'}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isSaving}
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