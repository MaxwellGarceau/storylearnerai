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
import type { WordMetadata } from './interactiveText/WordToken';

// TODO: mgarceau 2025-10-07
// Refactor WordMenu to eliminate redundant props (e.g., targetWord. wordMetaData is the source of truth).
// Currently, saved target words are tracked via useTranslationCache (see src/hooks/interactiveText/useTranslationCache.ts).
// Consider centralizing state management, possibly using a story-level context for cleaner data flow.
interface WordMenuProps {
  children: React.ReactNode;
  word: string; // Word to display in menu
  dictionaryWord?: string; // Word to use for dictionary lookup (from_lemma)
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
  wordMetadata: WordMetadata;
}

const WordMenu: React.FC<WordMenuProps> = ({
  children,
  open,
  targetWord,
  onOpenChange,
  onTranslate,
  fromLanguage,
  targetLanguage,
  fromSentence,
  targetSentence,
  isSaved,
  isTranslating,
  wordMetadata: {
    to_word: toWord,
    from_word: fromWord,
    from_lemma: fromLemma,
    // to_lemma: toLemma,
    // pos: pos,
    // difficulty: difficulty,
    // from_definition: fromDefinition,
  },
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
  // Show overlay only when this token has been translated (parent passes targetWord when translated)
  const effectiveOppositeWord = targetWord;
  const effectiveIsSaved = isSaved ?? ctx?.isSavedWord?.(toWord) ?? false;
  const effectiveIsTranslating =
    isTranslating ?? ctx?.isTranslatingWord?.(toWord) ?? false;

  // Search for word info when dictionary is shown
  // Use dictionaryWord (from_lemma) if available, otherwise fall back to word
  const wordForDictionary = fromLemma ?? fromWord;
  
  useEffect(() => {
    if (showDictionary && open) {
      void searchWord(
        wordForDictionary,
        effectiveFromLanguage,
        effectiveTargetLanguage
      );
    }
  }, [
    showDictionary,
    open,
    wordForDictionary,
    effectiveFromLanguage,
    effectiveTargetLanguage,
    searchWord,
  ]);

  const handleTranslate = () => {
    // Always allow translate click unless actively translating
    // The parent component (InteractiveText) will check metadata and decide
    // whether to use it directly or make an API call
    if (!effectiveIsTranslating) {
      onTranslate?.(toWord);
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
    : effectiveOppositeWord && !effectiveIsSaved
      ? 'Translated'
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
    ? toWord
    : (effectiveOppositeWord ?? '');
  const canonicalTargetWord = isDisplayingFromSide
    ? (effectiveOppositeWord ?? '')
    : toWord;

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
                <div className='text-sm font-medium mb-1'>{toWord}</div>
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
                            onTranslate?.(toWord);
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
                          onTranslate?.(toWord);
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
                word={wordForDictionary} // from_lemma
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
