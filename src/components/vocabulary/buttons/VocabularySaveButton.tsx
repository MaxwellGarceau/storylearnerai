import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { BookOpen, Check } from 'lucide-react';
import { useVocabulary } from '../../../hooks/useVocabulary';
import { useLocalization } from '../../../hooks/useLocalization';
import type { VocabularyInsert } from '../../../types/database/vocabulary';

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
  // Override internal saved state check - useful for consistency with other UI elements
  isSaved?: boolean;
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
  isSaved: externalIsSaved,
}: VocabularySaveButtonProps) {
  const { t } = useLocalization();
  const { checkVocabularyExists, saveVocabularyWord } = useVocabulary();
  const [isSaved, setIsSaved] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPendingSave, setIsPendingSave] = useState(false);

  // Check if word is already saved (only if external isSaved is not provided)
  React.useEffect(() => {
    // If external isSaved is provided, use it directly
    if (externalIsSaved !== undefined) {
      setIsSaved(externalIsSaved);
      setIsChecking(false);
      return;
    }

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
      void checkIfSaved();
    }
  }, [
    originalWord,
    translatedWord,
    fromLanguageId,
    translatedLanguageId,
    checkVocabularyExists,
    externalIsSaved,
  ]);

  const hasAttemptedSaveRef = React.useRef(false);

  const attemptSave = async () => {
    if (hasAttemptedSaveRef.current) return;
    hasAttemptedSaveRef.current = true;
    // Do not proceed without required fields
    if (!originalWord || !translatedWord) return;

    // Avoid duplicate saves
    const exists = await checkVocabularyExists(
      originalWord,
      translatedWord,
      fromLanguageId,
      translatedLanguageId
    );
    if (exists) {
      setIsSaved(true);
      setIsSaving(false);
      setIsPendingSave(false);
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

    const saved = await saveVocabularyWord(payload);
    setIsSaving(false);
    setIsPendingSave(false);
    if (saved) {
      setIsSaved(true);
    }
  };

  const handleSaveClick = async () => {
    // Ensure translation (and any other prep) occurs first
    if (onBeforeOpen) {
      await onBeforeOpen();
    }

    // If translation not yet available, enter pending save state
    if (!originalWord || !translatedWord) {
      setIsSaving(true);
      setIsPendingSave(true);
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      void attemptSave();
    }, 0);
  };

  // If we clicked save while translation was not ready, auto-save once it arrives
  React.useEffect(() => {
    if (isPendingSave && originalWord && translatedWord) {
      setIsSaving(true);
      setTimeout(() => {
        void attemptSave();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPendingSave, originalWord, translatedWord]);

  const isDisabled = isChecking || isSaving || isSaved;
  const currentVariant = isSaved ? 'ghost' : variant;
  const currentClassName = isSaved ? `text-green-600 ${className}` : className;

  return (
    <Button
      variant={currentVariant}
      size={size}
      onClick={() => {
        if (!isDisabled) {
          void handleSaveClick();
        }
      }}
      className={currentClassName}
      title={t('vocabulary.save.tooltip')}
      disabled={isDisabled}
      type='button'
      data-testid='vocabulary-save-button'
      data-original-word={originalWord}
      data-translated-word={translatedWord}
      data-from-language-id={fromLanguageId}
      data-translated-language-id={translatedLanguageId}
    >
      {isChecking || isSaving ? (
        <>
          <div className='animate-spin rounded-full h-3 w-3 border-b border-current mr-1'></div>
          {isChecking ? t('vocabulary.checking') : t('vocabulary.saving')}
        </>
      ) : isSaved ? (
        <>
          <Check className='h-3 w-3 mr-1' />
          {t('vocabulary.saved')}
        </>
      ) : (
        <>
          <BookOpen className='h-3 w-3 mr-1' />
          {showTextOnly
            ? t('vocabulary.save.button')
            : t('vocabulary.save.title')}
        </>
      )}
    </Button>
  );
}
