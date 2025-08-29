import React, { useState } from 'react';
import WordHighlight from './WordHighlight';
import WordMenu from './WordMenu';
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
  fromLanguage: _fromLanguage,
  targetLanguage: _targetLanguage = 'en',
  enableTooltips = true,
  disabled = false,
}) => {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  // Handle empty text
  if (!text.trim()) {
    return <span className={className} />;
  }

  // Split text into words while preserving whitespace and punctuation
  const words = text.split(/(\s+)/);

  

  const handleTranslate = (_word: string) => {
    // TODO: Implement translation functionality
  };

  const handleSave = (_word: string) => {
    // TODO: Implement save functionality
  };

  return (
    <span className={className}>
      {words.map((word, index) => {
        // Skip pure whitespace
        if (/^\s+$/.test(word)) {
          return <React.Fragment key={index}>{word}</React.Fragment>;
        }

        // For words with punctuation, handle Unicode letters/numbers correctly
        const wordMatch = word.match(/^[\p{L}\p{N}’']+(.*)$/u)
          ? [
              '',
              // Extract the leading word (letters/numbers/apostrophes)
              (word.match(/^[\p{L}\p{N}’']+/u) ?? [''])[0],
              // The remaining punctuation/symbols/spaces after the word
              word.slice((word.match(/^[\p{L}\p{N}’']+/u) ?? [''])[0].length),
            ]
          : null;
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

          // Always render WordMenu so Radix trigger exists before click
          return (
            <span key={index}>
              <WordMenu
                word={normalizedWord}
                open={openMenuIndex === index}
                onOpenChange={open => {
                  if (open) {
                    // Accept open events from Radix trigger as well (covers clicks on trigger padding)
                    setOpenMenuIndex(index);
                  } else if (openMenuIndex === index) {
                    setOpenMenuIndex(null);
                  }
                }}
                onTranslate={handleTranslate}
                onSave={handleSave}
                fromLanguage={_fromLanguage}
                targetLanguage={_targetLanguage}
              >
                <WordHighlight
                  word={normalizedWord}
                  disabled={disabled}
                  active={openMenuIndex === index}
                  onClick={() => {
                    setOpenMenuIndex(prev => (prev === index ? null : index));
                  }}
                >
                  {cleanWord}
                </WordHighlight>
              </WordMenu>
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
