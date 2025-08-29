import React, { useState } from 'react';
import WordHighlight from './WordHighlight';
import WordMenu from './WordMenu';
import { LanguageCode } from '../../types/llm/prompts';
import { useWordTranslation } from '../../hooks/useWordTranslation';

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
  const [translatedWords, setTranslatedWords] = useState<Map<string, string>>(
    new Map()
  );
  const { translateWord } = useWordTranslation();

  // Handle empty text
  if (!text.trim()) {
    return <span className={className} />;
  }

  // Split text into words while preserving whitespace and punctuation
  const words = text.split(/(\s+)/);

  const handleTranslate = async (word: string) => {
    if (!_fromLanguage || !_targetLanguage) {
      console.warn('Language codes not provided for translation');
      return;
    }

    // Check if we already have a translation for this word
    if (translatedWords.has(word)) {
      return;
    }

    const translatedText = await translateWord(
      word,
      _fromLanguage,
      _targetLanguage
    );
    if (translatedText) {
      setTranslatedWords(prev => new Map(prev).set(word, translatedText));
    }
  };

  const handleSave = (word: string) => {
    // This function will be called by the VocabularySaveButton
    // The actual save functionality is handled within the VocabularySaveButton component
    // Log for debugging purposes
  };

  return (
    <span className={className}>
      {words.map((word, index) => {
        // Skip pure whitespace
        if (/^\s+$/.test(word)) {
          return <React.Fragment key={index}>{word}</React.Fragment>;
        }

        // For words with punctuation, handle Unicode letters/numbers correctly
        const wordMatch = word.match(/^[\p{L}\p{N}'']+(.*)$/u)
          ? [
              '',
              // Extract the leading word (letters/numbers/apostrophes)
              (word.match(/^[\p{L}\p{N}'']+/u) ?? [''])[0],
              // The remaining punctuation/symbols/spaces after the word
              word.slice((word.match(/^[\p{L}\p{N}'']+/u) ?? [''])[0].length),
            ]
          : null;
        if (wordMatch) {
          const [, cleanWord, punctuation] = wordMatch;
          const normalizedWord = cleanWord.toLowerCase();
          const translatedWord = translatedWords.get(normalizedWord);

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
                onTranslate={(word) => {
                  void handleTranslate(word);
                }}
                onSave={handleSave}
                fromLanguage={_fromLanguage}
                targetLanguage={_targetLanguage}
                translatedWord={translatedWord}
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
              {/* Show translation if available */}
              {translatedWord && (
                <span className='ml-1 text-sm text-muted-foreground'>
                  ({translatedWord})
                </span>
              )}
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
