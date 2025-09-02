import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { BookOpen, Check } from 'lucide-react';
import { useVocabulary } from '../../hooks/useVocabulary';
import { useLocalization } from '../../hooks/useLocalization';

interface VocabularySaveButtonProps {
  originalWord: string;
  translatedWord: string;
  originalContext?: string;
  translatedContext?: string;
  fromLanguageId: number;
  translatedLanguageId: number;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showTextOnly?: boolean;
  // New props for sentence-level context
  originalSentence?: string;
  translatedSentence?: string;
}

export function VocabularySaveButton({
  originalWord,
  translatedWord,
  originalContext,
  translatedContext,
  fromLanguageId,
  translatedLanguageId,
  className,
  variant = 'outline',
  size = 'sm',
  showTextOnly = false,
}: VocabularySaveButtonProps) {
  const { t } = useLocalization();
  const { checkVocabularyExists, saveVocabularyWord } = useVocabulary();
  const [isSaved, setIsSaved] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if word is already saved
  React.useEffect(() => {
    const checkIfSaved = async () => {
      setIsChecking(true);
      try {
        const exists = await checkVocabularyExists(
          originalWord,
          translatedWord,
          fromLanguageId,
          translatedLanguageId
        );
        setIsSaved(exists);
      } catch (error) {
        console.error('Error checking vocabulary existence:', error);
      } finally {
        setIsChecking(false);
      }
    };

    if (originalWord && translatedWord) {
      checkIfSaved();
    }
  }, [
    originalWord,
    translatedWord,
    fromLanguageId,
    translatedLanguageId,
    checkVocabularyExists,
  ]);

  const handleSaveClick = async () => {
    if (isSaving || isSaved) return;

    setIsSaving(true);
    try {
      // TODO: Include auto-generated definition when available in save payload
      const vocabularyData = {
        original_word: originalWord.trim(),
        translated_word: translatedWord.trim(),
        from_language_id: fromLanguageId,
        translated_language_id: translatedLanguageId,
        original_word_context: (originalContext || '').trim() || null,
        translated_word_context: (translatedContext || '').trim() || null,
        definition: null,
      };

      const result = await saveVocabularyWord(vocabularyData);
      if (result) {
        setIsSaved(true);
      }
    } catch (error) {
      // Error toasts are handled inside the hook
      // No-op
    } finally {
      setIsSaving(false);
    }
  };

  // Note: Success handling occurs inline after save

  if (isChecking) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <div className='animate-spin rounded-full h-3 w-3 border-b border-current mr-1'></div>
        {t('vocabulary.checking')}
      </Button>
    );
  }

  if (isSaved) {
    return (
      <Button
        variant='ghost'
        size={size}
        disabled
        className={`text-green-600 ${className}`}
      >
        <Check className='h-3 w-3 mr-1' />
        {t('vocabulary.saved')}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleSaveClick}
        className={className}
        title={t('vocabulary.save.tooltip')}
        disabled={isSaving}
      >
        <BookOpen className='h-3 w-3 mr-1' />
        {isSaving
          ? t('common.saving')
          : showTextOnly
            ? t('vocabulary.save.button')
            : t('vocabulary.save.title')}
      </Button>
    </>
  );
}
