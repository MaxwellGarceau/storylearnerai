import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { Button } from '../ui/Button';
import { LoadingButton } from '../ui/LoadingButton';
import { Languages, BookOpen } from 'lucide-react';
import { useDictionary } from '../../hooks/useDictionary';
import { VocabularySaveButton } from '../vocabulary/buttons/VocabularySaveButton';
import { useLanguages } from '../../hooks/useLanguages';
import DictionaryEntry from '../dictionary/DictionaryEntry/DictionaryEntry';
import { LanguageCode } from '../../types/llm/prompts';
import { useInteractiveTextContext } from './useInteractiveTextContext';
import { useAuth } from '../../hooks/useAuth';
import { AuthPrompt } from '../ui/AuthPrompt';
import { useLocalization } from '../../hooks/useLocalization';

interface WordMenuProps {
  children: React.ReactNode;
  word: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTranslate?: (word: string) => void;
  fromLanguage?: LanguageCode;
  targetLanguage?: LanguageCode;
  targetWord?: string;
  fromSentence?: string;
  targetSentence?: string;
  isSaved?: boolean;
  isTranslating?: boolean;
}

const WordMenu: React.FC<WordMenuProps> = ({
  children,
  word,
  open,
  onOpenChange,
  onTranslate,
  fromLanguage,
  targetLanguage,
  targetWord,
  fromSentence,
  targetSentence,
  isSaved,
  isTranslating,
}) => {
  const ctx = useInteractiveTextContext();
  const location = useLocation();
  const routeSavedTranslationId = (
    location.state as { savedTranslationId?: number } | null
  )?.savedTranslationId;
  const effectiveSavedTranslationId =
    ctx?.savedTranslationId ?? routeSavedTranslationId;
  const { user } = useAuth();
  const { t } = useLocalization();
  const [showDictionary, setShowDictionary] = useState(false);
  const { wordInfo, isLoading, error, searchWord } = useDictionary();
  const { getLanguageIdByCode } = useLanguages();

  const effectiveFromLanguage = fromLanguage ?? ctx?.fromLanguage;
  const effectiveTargetLanguage = targetLanguage ?? ctx?.targetLanguage;
  const isDisplayingFromSide = ctx?.isDisplayingFromSide ?? true;
  // Opposite-language word for the current token (may be undefined until translated/saved)
  const effectiveOppositeWord = targetWord ?? ctx?.getOppositeWordFor?.(word);
  const effectiveIsSaved = isSaved ?? ctx?.isSavedWord?.(word) ?? false;
  const effectiveIsTranslating =
    isTranslating ?? ctx?.isTranslatingWord?.(word) ?? false;

  // Search for word info when dictionary is shown
  useEffect(() => {
    if (showDictionary && open) {
      void searchWord(word, effectiveFromLanguage, effectiveTargetLanguage);
    }
  }, [
    showDictionary,
    open,
    word,
    effectiveFromLanguage,
    effectiveTargetLanguage,
    searchWord,
  ]);

  const handleTranslate = () => {
    // Always allow translate click unless actively translating
    if (!effectiveIsTranslating) {
      onTranslate?.(word);
    }
  };

  const handleDictionary = () => {
    setShowDictionary(true);
  };

  const handleBackToMenu = () => {
    setShowDictionary(false);
  };

  // Get language IDs for the VocabularySaveButton
  const fromLanguageId = effectiveFromLanguage
    ? getLanguageIdByCode(effectiveFromLanguage)
    : null;
  const targetLanguageId = effectiveTargetLanguage
    ? getLanguageIdByCode(effectiveTargetLanguage)
    : null;

  const translateButtonDisabled = effectiveIsTranslating;

  const translateButtonLabel = effectiveIsTranslating
    ? 'Translating...'
    : effectiveOppositeWord
      ? effectiveIsSaved
        ? 'Already Saved'
        : 'Translated'
      : 'Translate';

  // Compute canonical contexts: from = user's from-language sentence, target = user's target-language sentence
  let effectiveFromContext = fromSentence;
  let effectiveTargetContext = targetSentence;
  // Trust the display-side flag for orientation instead of string checks
  if (!isDisplayingFromSide) {
    effectiveFromContext = targetSentence;
    effectiveTargetContext = fromSentence;
  }

  // Compute canonical words (from = user's from-language, target = user's target-language)
  const canonicalFromWord = isDisplayingFromSide
    ? word
    : (effectiveOppositeWord ?? '');
  const canonicalTargetWord = isDisplayingFromSide
    ? (effectiveOppositeWord ?? '')
    : word;

  return (
    <Popover
      open={open}
      onOpenChange={isOpen => {
        onOpenChange?.(isOpen);
      }}
    >
      <PopoverTrigger asChild>
        <span
          className={`inline-block align-baseline rounded-sm px-0.5 py-0 transition-colors duration-200 cursor-pointer ${open ? 'bg-primary/30 ring-1 ring-primary/40' : 'hover:bg-primary/20 hover:ring-1 hover:ring-primary/30'}`}
          style={{ lineHeight: '1.35em' }}
          data-word-trigger
          onClick={() => {}}
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent
        side='bottom'
        align='start'
        updatePositionStrategy='always'
        className={
          'p-4 w-auto z-[9999] bg-white text-black dark:bg-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg'
        }
        sideOffset={8}
        onPointerDownOutside={e => {
          const target = e.target as HTMLElement | null;
          const prevent = target?.closest('[data-word-trigger]') != null;
          if (prevent) e.preventDefault();
        }}
        onInteractOutside={e => {
          const target = e.target as HTMLElement | null;
          const prevent = target?.closest('[data-word-trigger]') != null;
          if (prevent) e.preventDefault();
        }}
      >
        <div className='flex flex-col gap-2'>
          {!showDictionary ? (
            <>
              <div className='text-center mb-3'>
                <div className='text-sm font-medium mb-1'>{word}</div>
                {effectiveOppositeWord && (
                  <div className='text-sm text-muted-foreground'>
                    {effectiveOppositeWord}
                  </div>
                )}
              </div>
              <div className='flex flex-wrap gap-2 justify-center'>
                {user ? (
                  <>
                    <LoadingButton
                      variant='outline'
                      size='sm'
                      onClick={handleTranslate}
                      disabled={translateButtonDisabled}
                      loading={effectiveIsTranslating}
                      loadingText='Translating...'
                      spinnerSize='sm'
                    >
                      <Languages className='h-3 w-3' />
                      {translateButtonLabel}
                    </LoadingButton>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleDictionary}
                      className='flex items-center gap-1'
                    >
                      <BookOpen className='h-3 w-3' />
                      Dictionary
                    </Button>
                    {fromLanguageId && targetLanguageId && (
                      <VocabularySaveButton
                        fromWord={canonicalFromWord}
                        targetWord={canonicalTargetWord}
                        fromContext={effectiveFromContext}
                        targetContext={effectiveTargetContext}
                        fromLanguageId={fromLanguageId}
                        targetLanguageId={targetLanguageId}
                        savedTranslationId={effectiveSavedTranslationId}
                        size='sm'
                        variant='outline'
                        isSaved={effectiveIsSaved}
                        onBeforeOpen={() => {
                          if (!effectiveOppositeWord) {
                            onTranslate?.(word);
                          }
                        }}
                      />
                    )}
                  </>
                ) : (
                  <AuthPrompt t={t} variant='link' />
                )}
              </div>
            </>
          ) : (
            <div className='min-w-[300px] max-w-[400px]'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-sm font-medium'>Dictionary</h3>
                <div className='flex items-center gap-2'>
                  {user && fromLanguageId && targetLanguageId && (
                    <VocabularySaveButton
                      fromWord={canonicalFromWord}
                      targetWord={canonicalTargetWord}
                      fromContext={effectiveFromContext}
                      targetContext={effectiveTargetContext}
                      fromLanguageId={fromLanguageId}
                      targetLanguageId={targetLanguageId}
                      savedTranslationId={effectiveSavedTranslationId}
                      size='sm'
                      variant='outline'
                      className='mr-2'
                      showTextOnly={true}
                      isSaved={effectiveIsSaved}
                      onBeforeOpen={() => {
                        if (!effectiveOppositeWord) {
                          onTranslate?.(word);
                        }
                      }}
                    />
                  )}
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleBackToMenu}
                    className='h-6 w-6 p-0'
                  >
                    ×
                  </Button>
                </div>
              </div>
              <DictionaryEntry.Root
                word={word}
                wordInfo={wordInfo}
                isLoading={isLoading}
                error={error}
              >
                <DictionaryEntry.Content />
              </DictionaryEntry.Root>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default WordMenu;
