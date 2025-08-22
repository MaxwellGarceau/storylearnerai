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
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const { wordInfo, isLoading, error, searchWord } = useDictionary();

  // Search for word info when hovered
  useEffect(() => {
    if (hoveredWord) {
      void searchWord(hoveredWord, fromLanguage, targetLanguage);
    }
  }, [hoveredWord, fromLanguage, targetLanguage, searchWord]);

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
                <WordHighlight
                  word={normalizedWord}
                  disabled={disabled}
                >
                  {cleanWord}
                </WordHighlight>
                {punctuation}
              </span>
            );
          }

          // Create dictionary content for tooltip
          const dictionaryContent = (
            <DictionaryEntry.Root
              word={normalizedWord}
              wordInfo={hoveredWord === normalizedWord ? wordInfo : null}
              isLoading={hoveredWord === normalizedWord ? isLoading : false}
              error={hoveredWord === normalizedWord ? error : null}
            >
              <DictionaryEntry.Content />
            </DictionaryEntry.Root>
          );

          // Use WordTooltip with DictionaryEntry as content
          return (
            <span key={index}>
              <WordTooltip
                content={dictionaryContent}
                onMouseEnter={() => setHoveredWord(normalizedWord)}
                onMouseLeave={() => setHoveredWord(null)}
              >
                <WordHighlight word={normalizedWord}>
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
