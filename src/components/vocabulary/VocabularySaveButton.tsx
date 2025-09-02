import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { BookOpen, Check } from 'lucide-react';
import { useVocabulary } from '../../hooks/useVocabulary';
import { useLocalization } from '../../hooks/useLocalization';
import type { VocabularyInsert } from '../../types/database/vocabulary';

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
  // New lifecycle hook to run before opening the modal (e.g., trigger translation)
  onBeforeOpen?: () => Promise<void> | void;
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
  onBeforeOpen,
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
    // Ensure translation (and any other prep) occurs first
    if (onBeforeOpen) {
      await onBeforeOpen();
    }

    // Guard: need translatedWord available
    if (!originalWord || !translatedWord) {
      return;
    }

    // Avoid duplicate saves
    const exists = await checkVocabularyExists(
      originalWord,
      translatedWord,
      fromLanguageId,
      translatedLanguageId
    );
    if (exists) {
      setIsSaved(true);
      return;
    }

    const payload: VocabularyInsert = {
      original_word: originalWord,
      translated_word: translatedWord,
      from_language_id: fromLanguageId,
      translated_language_id: translatedLanguageId,
      original_word_context: originalContext,
      translated_word_context: translatedContext,
    };

    setIsSaving(true);
    const saved = await saveVocabularyWord(payload);
    setIsSaving(false);
    if (saved) {
      setIsSaved(true);
    }
  };

  const handleSaveSuccess = () => {
    setIsSaved(true);
    setShowSaveModal(false);
  };

  if (isChecking) {
    return (
      <Button variant={variant} size={size} disabled className={className} type='button'>
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
        type='button'
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
        type='button'
      >
        <BookOpen className='h-3 w-3 mr-1' />
        {showTextOnly ? t('vocabulary.save.button') : t('vocabulary.save.title')}
      </Button>
    </>
  );
}
