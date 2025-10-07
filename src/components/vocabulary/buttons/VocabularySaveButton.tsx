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
  fromWord: string;
  targetWord: string;
  fromContext?: string;
  targetContext?: string;
  fromLanguageId: number;
  targetLanguageId: number;
  // Optional metadata to persist with saved vocab
  partOfSpeech?: string;
  definition?: string;
  frequencyLevel?: string;
  // TODO: difficultyLevel requires DB support; add when schema updated
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showTextOnly?: boolean;
  // New props for sentence-level context
  fromSentence?: string;
  targetSentence?: string;
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
    fromWord: string,
    targetWord: string,
    fromLanguageId: number,
    targetLanguageId: number
  ) => Promise<boolean>;
}

export function VocabularySaveButton({
  fromWord,
  targetWord,
  fromContext,
  targetContext,
  fromLanguageId,
  targetLanguageId,
  partOfSpeech,
  definition,
  frequencyLevel,
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
          fromWord,
          targetWord,
          fromLanguageId,
          targetLanguageId
        );
        setIsSaved(exists);
      } catch (error) {
        logger.error('ui', 'Error checking vocabulary existence', { error });
      } finally {
        setIsChecking(false);
      }
    };

    if (fromWord && targetWord) {
      void checkIfSaved();
    }
  }, [
    fromWord,
    targetWord,
    fromLanguageId,
    targetLanguageId,
    checkVocabularyExists,
    externalIsSaved,
    effectiveCheck,
  ]);

  const attemptSave = async () => {
    // Do not proceed without required fields
    if (!fromWord || !targetWord) return;

    // Assume not saved based on upstream check; proceed to save

    const payload: VocabularyInsert = {
      from_word: fromWord,
      target_word: targetWord,
      from_language_id: fromLanguageId,
      target_language_id: targetLanguageId,
      from_word_context: fromContext,
      target_word_context: targetContext,
      part_of_speech: partOfSpeech,
      definition,
      frequency_level: frequencyLevel,
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
    if (!fromWord || !targetWord) {
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
    if (isPendingSave && fromWord && targetWord) {
      setIsSaving(true);
      const run = async () => {
        await delay(0);
        await attemptSave();
      };
      void run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPendingSave, fromWord, targetWord]);

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
      data-original-word={fromWord}
      data-translated-word={targetWord}
      data-from-language-id={fromLanguageId}
      data-target-language-id={targetLanguageId}
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
