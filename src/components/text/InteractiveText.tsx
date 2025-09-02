import React, { useState } from 'react';
import WordHighlight from './WordHighlight';
import WordMenu from './WordMenu';
import { LanguageCode } from '../../types/llm/prompts';
import { useWordTranslation } from '../../hooks/useWordTranslation';

interface InteractiveTextProps {
  text: string;
  className?: string;
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  enableTooltips?: boolean;
  disabled?: boolean;
}

const InteractiveText: React.FC<InteractiveTextProps> = ({
  text,
  className,
  fromLanguage,
  targetLanguage,
  enableTooltips = true,
  disabled = false,
}) => {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [translatedWords, setTranslatedWords] = useState<Map<string, string>>(
    new Map()
  );
  const [translatedSentences, setTranslatedSentences] = useState<
    Map<string, string>
  >(new Map());
  const { translateWordInSentence, translateSentence } = useWordTranslation();

  // Handle empty text
  if (!text.trim()) {
    return <span className={className} />;
  }

  // Split text into words while preserving whitespace and punctuation
  const words = text.split(/(\s+)/);

  // Function to extract sentence context around a word
  const extractSentenceContext = (wordIndex: number): string => {
    const sentenceStart = findSentenceStart(wordIndex);
    const sentenceEnd = findSentenceEnd(wordIndex);
    return words
      .slice(sentenceStart, sentenceEnd + 1)
      .join('')
      .trim();
  };

  // Find the start of the sentence (looking backwards for sentence endings)
  const findSentenceStart = (wordIndex: number): number => {
    for (let i = wordIndex; i >= 0; i--) {
      const token = words[i];
      if (token && /[.!?]\s*$/.test(token)) {
        return i + 1;
      }
    }
    return 0;
  };

  // Find the end of the sentence (looking forwards for sentence endings)
  const findSentenceEnd = (wordIndex: number): number => {
    for (let i = wordIndex; i < words.length; i++) {
      const token = words[i];
      if (token && /[.!?]\s*$/.test(token)) {
        return i;
      }
    }
    return words.length - 1;
  };

  const handleTranslate = async (word: string, wordIndex: number) => {
    // Check if we already have a translation for this word
    if (translatedWords.has(word)) {
      return;
    }

    // Extract the sentence context from the target-language text
    const sentenceContext = extractSentenceContext(wordIndex);

    // Translate the entire sentence from target language -> from language for context
    if (!translatedSentences.has(sentenceContext)) {
      const translatedSentence = await translateSentence(
        sentenceContext,
        targetLanguage, // from target
        fromLanguage // to from
      );
      if (translatedSentence) {
        setTranslatedSentences(prev =>
          new Map(prev).set(sentenceContext, translatedSentence)
        );
      }
    }

    // Translate the clicked word (target -> from) for display next to the word
    const translatedText = await translateWordInSentence(
      word,
      sentenceContext,
      targetLanguage,
      fromLanguage
    );
    if (translatedText) {
      setTranslatedWords(prev => new Map(prev).set(word, translatedText));
    }
  };

  const handleSave = (_word: string) => {
    // Saving handled by VocabularySaveButton
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

          const originalSentence = extractSentenceContext(index);
          const translatedSentenceForMenu = translatedSentences.get(
            originalSentence
          );

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
                    // Auto-translate when menu opens
                    void handleTranslate(normalizedWord, index);
                  } else if (openMenuIndex === index) {
                    setOpenMenuIndex(null);
                  }
                }}
                onTranslate={w => {
                  void handleTranslate(w, index);
                }}
                _onSave={handleSave}
                fromLanguage={fromLanguage}
                targetLanguage={targetLanguage}
                translatedWord={translatedWord}
                originalSentence={originalSentence}
                translatedSentence={translatedSentenceForMenu}
              >
                <WordHighlight
                  word={normalizedWord}
                  disabled={disabled}
                  active={openMenuIndex === index}
                  onClick={() => {
                    setOpenMenuIndex(prev => (prev === index ? null : index));
                    // Auto-translate when word is clicked
                    if (openMenuIndex !== index) {
                      void handleTranslate(normalizedWord, index);
                    }
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
