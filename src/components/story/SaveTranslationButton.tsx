import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import Label from '../ui/Label';
import TextArea from '../ui/TextArea';
import { Alert, AlertDescription, AlertIcon } from '../ui/Alert';
import { useSavedTranslations } from '../../hooks/useSavedTranslations';
import { useSupabase } from '../../hooks/useSupabase';
import { TranslationResponse } from '../../lib/translationService';
import { useToast } from '../../hooks/useToast';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip';

interface SaveTranslationButtonProps {
  translationData: TranslationResponse;
  originalStory: string;
  originalLanguage: string;
  translatedLanguage: string;
  difficultyLevel: string;
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
  
  const { createSavedTranslation, isCreating } = useSavedTranslations();
  const { user } = useSupabase();
  const { toast } = useToast();

  // Map language names to ISO codes
  const getLanguageCode = (languageName: string): string => {
    const languageMap: Record<string, string> = {
      'spanish': 'es',
      'english': 'en',
      'french': 'fr',
      'german': 'de',
      'italian': 'it',
      'portuguese': 'pt',
      'russian': 'ru',
      'japanese': 'ja',
      'korean': 'ko',
      'chinese': 'zh',
      'arabic': 'ar',
      'hindi': 'hi',
      'dutch': 'nl',
      'swedish': 'sv',
      'norwegian': 'no',
      'danish': 'da',
      'finnish': 'fi',
      'polish': 'pl',
      'turkish': 'tr',
      'hebrew': 'he',
      'thai': 'th',
      'vietnamese': 'vi',
      'indonesian': 'id',
      'malay': 'ms',
      'persian': 'fa',
      'urdu': 'ur',
      'bengali': 'bn',
      'tamil': 'ta',
      'telugu': 'te',
      'marathi': 'mr',
      'gujarati': 'gu',
      'kannada': 'kn',
      'malayalam': 'ml',
      'punjabi': 'pa',
      'odia': 'or',
      'assamese': 'as',
      'nepali': 'ne',
      'sinhala': 'si',
      'burmese': 'my',
      'khmer': 'km',
      'lao': 'lo',
      'georgian': 'ka',
      'amharic': 'am',
      'swahili': 'sw',
      'zulu': 'zu',
      'afrikaans': 'af',
      'icelandic': 'is',
      'maltese': 'mt',
      'welsh': 'cy',
      'irish': 'ga',
      'basque': 'eu',
      'catalan': 'ca',
      'galician': 'gl',
      'croatian': 'hr',
      'slovak': 'sk',
      'slovenian': 'sl',
      'estonian': 'et',
      'latvian': 'lv',
      'lithuanian': 'lt',
      'bulgarian': 'bg',
      'romanian': 'ro',
      'ukrainian': 'uk',
      'belarusian': 'be',
      'macedonian': 'mk',
      'albanian': 'sq',
      'bosnian': 'bs',
      'serbian': 'sr',
      'montenegrin': 'me',
      'mongolian': 'mn',
      'kyrgyz': 'ky',
      'kazakh': 'kk',
      'uzbek': 'uz',
      'tajik': 'tg',
      'turkmen': 'tk',
      'azerbaijani': 'az',
      'armenian': 'hy'
    };
    
    return languageMap[languageName.toLowerCase()] || languageName.toLowerCase();
  };

  // Map CEFR levels to database difficulty codes
  const getDifficultyCode = (cefrLevel: string): string => {
    const difficultyMap: Record<string, string> = {
      'a1': 'beginner',
      'a2': 'beginner',
      'b1': 'intermediate',
      'b2': 'intermediate',
      'c1': 'advanced',
      'c2': 'advanced'
    };
    
    return difficultyMap[cefrLevel.toLowerCase()] || 'beginner';
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

    try {
      setIsSaving(true);
      setError(null);

      await createSavedTranslation({
        original_story: originalStory,
        translated_story: translationData.translatedText,
        original_language_code: getLanguageCode(originalLanguage),
        translated_language_code: getLanguageCode(translatedLanguage),
        difficulty_level_code: getDifficultyCode(difficultyLevel),
        title: title.trim() || undefined,
        notes: notes.trim() || undefined,
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
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <TextArea
                  id="notes"
                  name="notes"
                  label="Notes (optional)"
                  placeholder="Add any notes about this translation..."
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                />
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <div>
                  <span className="font-medium">Original Language:</span> {originalLanguage}
                </div>
                <div>
                  <span className="font-medium">Translated Language:</span> {translatedLanguage}
                </div>
                <div>
                  <span className="font-medium">Difficulty Level:</span> {difficultyLevel}
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