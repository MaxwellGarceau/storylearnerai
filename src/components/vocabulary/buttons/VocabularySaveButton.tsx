import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '../../ui/Button';
import type { TFunction } from 'i18next';
import { BookOpen, Check } from 'lucide-react';
import { useVocabulary } from '../../../hooks/useVocabulary';
import { useLocalization } from '../../../hooks/useLocalization';
import type { VocabularyInsert } from '../../../types/database/vocabulary';
import { logger } from '../../../lib/logger';

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
  // When saving from a saved story, attach its id
  savedTranslationId?: number;
  // Optional i18n override (primarily for tests)
  t?: TFunction;
  // Optional overrides for testing to bypass hooks
  saveVocabularyOverride?: (data: VocabularyInsert) => Promise<unknown>;
  checkExistsOverride?: (
    originalWord: string,
    translatedWord: string,
    fromLanguageId: number,
    translatedLanguageId: number
  ) => Promise<boolean>;
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
  savedTranslationId,
  t: tOverride,
  saveVocabularyOverride,
  checkExistsOverride,
}: VocabularySaveButtonProps) {
  const { t } = useLocalization();
  const translate: TFunction = tOverride ?? t;
  const { checkVocabularyExists, saveVocabularyWord } = useVocabulary();
  const effectiveSave = saveVocabularyOverride ?? saveVocabularyWord;
  const effectiveCheck = checkExistsOverride ?? checkVocabularyExists;
  const [isSaved, setIsSaved] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPendingSave, setIsPendingSave] = useState(false);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
        const exists = await effectiveCheck(
          originalWord,
          translatedWord,
          fromLanguageId,
          translatedLanguageId
        );
        setIsSaved(exists);
      } catch (error) {
        logger.error('ui', 'Error checking vocabulary existence', { error });
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
    effectiveCheck,
  ]);

  const attemptSave = async () => {
    // Do not proceed without required fields
    if (!originalWord || !translatedWord) return;

    // Assume not saved based on upstream check; proceed to save

    const payload: VocabularyInsert = {
      from_word: originalWord,
      target_word: translatedWord,
      from_language_id: fromLanguageId,
      target_language_id: translatedLanguageId,
      from_word_context: originalContext,
      target_word_context: translatedContext,
      ...(typeof savedTranslationId === 'number'
        ? { saved_translation_id: savedTranslationId }
        : {}),
    };

    const saved = await effectiveSave(payload);
    // keep saving state visible briefly so UI/tests can observe it
    await delay(15);
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

    flushSync(() => {
      setIsSaving(true);
    });
    await delay(0);
    await attemptSave();
  };

  // If we clicked save while translation was not ready, auto-save once it arrives
  React.useEffect(() => {
    if (isPendingSave && originalWord && translatedWord) {
      setIsSaving(true);
      const run = async () => {
        await delay(0);
        await attemptSave();
      };
      void run();
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
        void handleSaveClick();
      }}
      className={currentClassName}
      title={translate('vocabulary.save.tooltip')}
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
          {isChecking
            ? translate('vocabulary.checking')
            : translate('vocabulary.saving')}
        </>
      ) : isSaved ? (
        <>
          <Check className='h-3 w-3 mr-1' />
          {translate('vocabulary.saved')}
        </>
      ) : (
        <>
          <BookOpen className='h-3 w-3 mr-1' />
          {showTextOnly
            ? translate('vocabulary.save.button')
            : translate('vocabulary.save.title')}
        </>
      )}
    </Button>
  );
}
