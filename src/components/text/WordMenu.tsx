import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { Button } from '../ui/Button';
import { LoadingButton } from '../ui/LoadingButton';
import { Languages, BookOpen } from 'lucide-react';
import { useDictionary } from '../../hooks/useDictionary';
import { VocabularySaveButton } from '../vocabulary/buttons/VocabularySaveButton';
import { useLanguages } from '../../hooks/useLanguages';
import DictionaryEntry from '../dictionary/DictionaryEntry/DictionaryEntry';
import { useAuth } from '../../hooks/useAuth';
import { AuthPrompt } from '../ui/AuthPrompt';
import { useLocalization } from '../../hooks/useLocalization';
import { useWordActions } from '../../hooks/useWordActions';
import { useLanguageSettings } from '../../hooks/useLanguageFilter';
import { useStoryContext } from '../../contexts/StoryContext';
import { useSentenceContext } from '../../hooks/interactiveText/useSentenceContext';

interface WordMenuProps {
  children: React.ReactNode;
  word: string;
  position?: number;
}

const WordMenu: React.FC<WordMenuProps> = ({ children, word, position }) => {
  const {
    isSaved,
    isTranslating,
    translation,
    isOpen,
    handleTranslate,
    handleToggleMenu,
    metadata,
  } = useWordActions(word, position);

  const location = useLocation();
  const routeSavedTranslationId = (
    location.state as { savedTranslationId?: number } | null
  )?.savedTranslationId;
  const { user } = useAuth();
  const { t } = useLocalization();
  const [showDictionary, setShowDictionary] = useState(false);
  const { wordInfo, isLoading, error, searchWord } = useDictionary();
  const { getLanguageIdByCode } = useLanguages();
  const { fromLanguage, targetLanguage } = useLanguageSettings();
  const { translationData } = useStoryContext();

  // Get language IDs for the VocabularySaveButton using actual language codes
  const fromLanguageId = getLanguageIdByCode(fromLanguage);
  const targetLanguageId = getLanguageIdByCode(targetLanguage);

  // Build token strings for each side to extract full sentence context
  const tokens = translationData.tokens ?? [];
  const fromSideTokens: string[] = useMemo(
    () =>
      tokens.map(token =>
        token.type === 'word' ? token.from_word : (token as { value: string }).value
      ),
    [tokens]
  );
  const toSideTokens: string[] = useMemo(
    () =>
      tokens.map(token =>
        token.type === 'word' ? token.to_word : (token as { value: string }).value
      ),
    [tokens]
  );

  const { extractSentenceContext: extractFromSentence } =
    useSentenceContext(fromSideTokens);
  const { extractSentenceContext: extractToSentence } =
    useSentenceContext(toSideTokens);

  const fromSentence = useMemo(
    () =>
      position !== undefined && tokens.length > 0
        ? extractFromSentence(position)
        : '',
    [position, tokens.length, extractFromSentence]
  );
  const targetSentence = useMemo(
    () =>
      position !== undefined && tokens.length > 0
        ? extractToSentence(position)
        : '',
    [position, tokens.length, extractToSentence]
  );

  // Search for word info when dictionary is shown - only if we have a lemma
  const wordForDictionary = metadata.from_lemma;

  useEffect(() => {
    if (showDictionary && isOpen && wordForDictionary) {
      void searchWord(wordForDictionary, fromLanguage, targetLanguage);
    }
  }, [
    showDictionary,
    isOpen,
    wordForDictionary,
    searchWord,
    fromLanguage,
    targetLanguage,
  ]);

  const handleDictionary = () => {
    setShowDictionary(true);
  };

  const handleBackToMenu = () => {
    setShowDictionary(false);
  };

  const translateButtonDisabled = isTranslating;
  const translateButtonLabel = isTranslating
    ? 'Translating...'
    : translation && !isSaved
      ? 'Translated'
      : 'Translate';

  return (
    <Popover open={isOpen} onOpenChange={handleToggleMenu}>
      <PopoverTrigger asChild>
        <span
          className={`inline-block align-baseline rounded-sm px-0.5 py-0 transition-colors duration-200 cursor-pointer ${isOpen ? 'bg-primary/30 ring-1 ring-primary/40' : 'hover:bg-primary/20 hover:ring-1 hover:ring-primary/30'}`}
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
                <div className='text-sm font-medium mb-1'>
                  {metadata.to_word}
                </div>
                {translation && (
                  <div className='text-sm text-muted-foreground'>
                    {translation}
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
                      loading={isTranslating}
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
                        fromWord={metadata.from_word}
                        targetWord={metadata.to_word}
                        fromContext={fromSentence}
                        targetContext={targetSentence}
                        fromLanguageId={fromLanguageId}
                        targetLanguageId={targetLanguageId}
                        partOfSpeech={metadata.pos ?? undefined}
                        definition={metadata.from_definition ?? undefined}
                        frequencyLevel={metadata.difficulty ?? undefined}
                        savedTranslationId={routeSavedTranslationId}
                        size='sm'
                        variant='outline'
                        isSaved={isSaved}
                        onBeforeOpen={() => {
                          if (!translation) {
                            handleTranslate();
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
                      fromWord={metadata.from_word}
                      targetWord={metadata.to_word}
                      fromContext={fromSentence}
                      targetContext={targetSentence}
                      fromLanguageId={fromLanguageId}
                      targetLanguageId={targetLanguageId}
                      partOfSpeech={undefined}
                      definition={undefined}
                      savedTranslationId={routeSavedTranslationId}
                      size='sm'
                      variant='outline'
                      className='mr-2'
                      showTextOnly={true}
                      isSaved={isSaved}
                      onBeforeOpen={() => {
                        if (!translation) {
                          handleTranslate();
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
                word={wordForDictionary}
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
