import React, { useState, useEffect } from 'react';
import WordHighlight from './WordHighlight';
import WordTooltip from './WordTooltip';
import { useDictionary } from '../../hooks/useDictionary';
import DictionaryEntry from '../dictionary/DictionaryEntry';
import { LanguageCode } from '../../types/llm/prompts';

interface InteractiveTextProps {
  text: string;
  className?: string;
  fromLanguage?: LanguageCode;
  targetLanguage?: LanguageCode;
  enableTooltips?: boolean;
  disabled?: boolean;
}

const InteractiveText: React.FC<InteractiveTextProps> = ({
  text,
  className,
  fromLanguage,
  targetLanguage = 'en',
  enableTooltips = true,
  disabled = false,
}) => {
  const [clickedWordIndex, setClickedWordIndex] = useState<number | null>(null);
  const [openTooltipIndex, setOpenTooltipIndex] = useState<number | null>(null);
  const { wordInfo, isLoading, error, searchWord } = useDictionary();

  // Search for word info when clicked
  useEffect(() => {
    if (clickedWordIndex !== null) {
      const words = text.split(/(\s+)/);
      const clickedWordText = words[clickedWordIndex];
      if (clickedWordText) {
        const wordMatch = clickedWordText.match(/^(\w+)(.*)$/);
        if (wordMatch) {
          const [, cleanWord] = wordMatch;
          const normalizedWord = cleanWord.toLowerCase();
          void searchWord(normalizedWord, fromLanguage, targetLanguage);
        }
      }
    }
  }, [clickedWordIndex, text, fromLanguage, targetLanguage, searchWord]);

  // Handle empty text
  if (!text.trim()) {
    return <span className={className} />;
  }

  // Split text into words while preserving whitespace and punctuation
  const words = text.split(/(\s+)/);

  return (
    <span className={className}>
      {words.map((word, index) => {
        // Skip pure whitespace
        if (/^\s+$/.test(word)) {
          return <span key={index}>{word}</span>;
        }

        // For words with punctuation, we need to handle them carefully
        const wordMatch = word.match(/^(\w+)(.*)$/);
        if (wordMatch) {
          const [, cleanWord, punctuation] = wordMatch;
          const normalizedWord = cleanWord.toLowerCase();

          // If tooltips are disabled or the component is disabled, just use WordHighlight
          if (!enableTooltips || disabled) {
            return (
              <span key={index}>
                <WordHighlight word={normalizedWord} disabled={disabled}>
                  {cleanWord}
                </WordHighlight>
                {punctuation}
              </span>
            );
          }

          // Create tooltip content for clicked word
          const wordTooltipContent = (
            <div className='p-2 min-w-[250px] max-w-[350px]'>
              {clickedWordIndex === index ? (
                <DictionaryEntry.Root
                  word={normalizedWord}
                  wordInfo={wordInfo}
                  isLoading={isLoading}
                  error={error}
                >
                  <DictionaryEntry.Content />
                </DictionaryEntry.Root>
              ) : (
                <div className='text-center'>
                  <div className='font-medium'>{cleanWord}</div>
                  <div className='text-xs text-muted-foreground mt-1'>
                    Click to see dictionary info
                  </div>
                </div>
              )}
            </div>
          );

          // Use WordTooltip only for clicked words
          return (
            <span key={index}>
              <WordTooltip
                content={wordTooltipContent}
                open={openTooltipIndex === index}
                onOpenChange={open => {
                  if (!open && openTooltipIndex === index) {
                    setOpenTooltipIndex(null);
                  }
                }}
              >
                <WordHighlight
                  word={normalizedWord}
                  disabled={disabled}
                  onClick={() => {
                    setClickedWordIndex(index);
                    setOpenTooltipIndex(index);
                  }}
                >
                  {cleanWord}
                </WordHighlight>
              </WordTooltip>
              {punctuation}
            </span>
          );
        }

        // For words without letters (pure punctuation), just return as is
        return <span key={index}>{word}</span>;
      })}
    </span>
  );
};

export default InteractiveText;
