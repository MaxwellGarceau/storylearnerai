import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { Button } from '../ui/Button';
import { Languages, BookOpen } from 'lucide-react';
import { useDictionary } from '../../hooks/useDictionary';
import { VocabularySaveButton } from '../vocabulary/VocabularySaveButton';
import { useLanguages } from '../../hooks/useLanguages';
import DictionaryEntry from '../dictionary/DictionaryEntry/DictionaryEntry';
import { LanguageCode } from '../../types/llm/prompts';

interface WordMenuProps {
  children: React.ReactNode;
  word: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTranslate?: (word: string) => void;
  _onSave?: (_word: string) => void;
  fromLanguage?: LanguageCode;
  targetLanguage?: LanguageCode;
  translatedWord?: string;
}

const WordMenu: React.FC<WordMenuProps> = ({
  children,
  word,
  open,
  onOpenChange,
  onTranslate,
  _onSave,
  fromLanguage,
  targetLanguage,
  translatedWord,
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
    onTranslate?.(word);
    onOpenChange?.(false);
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

  return (
    <Popover
      open={open}
      onOpenChange={isOpen => {
        onOpenChange?.(isOpen);
      }}
    >
      <PopoverTrigger asChild>
        <span
          className={`cursor-pointer transition-colors duration-200 ${open ? 'bg-primary/30 ring-2 ring-primary/50' : 'hover:bg-muted/50'}`}
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
              <div className='text-sm font-medium text-center mb-2'>{word}</div>
              <div className='flex flex-wrap gap-2 justify-center'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleTranslate}
                  className='flex items-center gap-1'
                >
                  <Languages className='h-3 w-3' />
                  Translate
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
                    fromLanguageId={fromLanguageId}
                    translatedLanguageId={targetLanguageId}
                    size='sm'
                    variant='outline'
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
                      fromLanguageId={fromLanguageId}
                      translatedLanguageId={targetLanguageId}
                      size='sm'
                      variant='outline'
                      className='mr-2'
                      showTextOnly={true}
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
