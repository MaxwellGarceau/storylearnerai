import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { Button } from '../ui/Button';
import { Languages, BookOpen } from 'lucide-react';
import { useDictionary } from '../../hooks/useDictionary';
import { VocabularySaveButton } from '../vocabulary/buttons/VocabularySaveButton';
import { useLanguages } from '../../hooks/useLanguages';
import DictionaryEntry from '../dictionary/DictionaryEntry/DictionaryEntry';
import { LanguageCode } from '../../types/llm/prompts';

interface WordMenuProps {
  children: React.ReactNode;
  word: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTranslate?: (word: string) => void;
  fromLanguage?: LanguageCode;
  targetLanguage?: LanguageCode;
  translatedWord?: string;
  originalSentence?: string;
  translatedSentence?: string;
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
  translatedWord,
  originalSentence,
  translatedSentence,
  isSaved = false,
  isTranslating = false,
}) => {
  const [showDictionary, setShowDictionary] = useState(false);
  const { wordInfo, isLoading, error, searchWord } = useDictionary();
  const { getLanguageIdByCode } = useLanguages();

  // Search for word info when dictionary is shown
  useEffect(() => {
    if (showDictionary && open) {
      void searchWord(word, fromLanguage, targetLanguage);
    }
  }, [showDictionary, open, word, fromLanguage, targetLanguage, searchWord]);

  const handleTranslate = () => {
    // Allow translate if there is no runtime translation yet
    if (!translatedWord && !isTranslating) {
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
  const fromLanguageId = fromLanguage
    ? getLanguageIdByCode(fromLanguage)
    : null;
  const targetLanguageId = targetLanguage
    ? getLanguageIdByCode(targetLanguage)
    : null;

  const translateButtonDisabled = Boolean(translatedWord) || isTranslating;

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
                {translatedWord && (
                  <div className='text-sm text-muted-foreground'>
                    {translatedWord}
                  </div>
                )}
              </div>
              <div className='flex flex-wrap gap-2 justify-center'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleTranslate}
                  disabled={translateButtonDisabled}
                  className='flex items-center gap-1'
                >
                  {isTranslating ? (
                    <>
                      <div className='animate-spin rounded-full h-3 w-3 border-b border-current mr-1'></div>
                      Translating...
                    </>
                  ) : (
                    <>
                      <Languages className='h-3 w-3' />
                      {translatedWord
                        ? 'Translated'
                        : 'Translate'}
                    </>
                  )}
                </Button>
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
                    originalWord={word}
                    translatedWord={translatedWord ?? ''}
                    originalContext={originalSentence}
                    translatedContext={translatedSentence}
                    fromLanguageId={fromLanguageId}
                    translatedLanguageId={targetLanguageId}
                    size='sm'
                    variant='outline'
                    isSaved={isSaved}
                    onBeforeOpen={() => {
                      if (!translatedWord) {
                        onTranslate?.(word);
                      }
                    }}
                  />
                )}
              </div>
            </>
          ) : (
            <div className='min-w-[300px] max-w-[400px]'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-sm font-medium'>Dictionary</h3>
                <div className='flex items-center gap-2'>
                  {fromLanguageId && targetLanguageId && (
                    <VocabularySaveButton
                      originalWord={word}
                      translatedWord={translatedWord ?? ''}
                      originalContext={originalSentence}
                      translatedContext={translatedSentence}
                      fromLanguageId={fromLanguageId}
                      translatedLanguageId={targetLanguageId}
                      size='sm'
                      variant='outline'
                      className='mr-2'
                      showTextOnly={true}
                      isSaved={isSaved}
                      onBeforeOpen={() => {
                        if (!translatedWord) {
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
