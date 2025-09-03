import React, { useMemo, useState } from 'react';
import WordHighlight from './WordHighlight';
import WordMenu from './WordMenu';
import { LanguageCode } from '../../types/llm/prompts';
import { useSavedWords } from '../../hooks/interactiveText/useSavedWords';
import { useSentenceContext } from '../../hooks/interactiveText/useSentenceContext';
import { useTranslationCache } from '../../hooks/interactiveText/useTranslationCache';

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

  // Handle empty text
  if (!text.trim()) {
    return <span className={className} />;
  }

  // Split text into words while preserving whitespace and punctuation
  const words = useMemo(() => text.split(/(\s+)/), [text]);

  // Sentence context helpers
  const { extractSentenceContext } = useSentenceContext(words);

  // Saved words and lookup
  const { savedOriginalWords, findSavedWordData } = useSavedWords(
    fromLanguage,
    targetLanguage
  );

  // Translation cache and handler
  const { translatedWords, translatedSentences, translatingWords, handleTranslate } =
    useTranslationCache({ extractSentenceContext, fromLanguage, targetLanguage });

  return (
    <span
      className={`${className ?? ''} relative block leading-9 md:leading-10 pt-5`}
    >
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
          const isSaved = savedOriginalWords.has(normalizedWord);
          const savedHighlightClass = isSaved
            ? 'bg-yellow-200 dark:bg-yellow-900/30'
            : '';

          // If tooltips are disabled or the component is disabled, just render the word inline
          if (!enableTooltips || disabled) {
            return (
              <span key={index}>
                {translatedWord ? (
                  <span className='relative inline-block align-baseline'>
                    <span className='absolute left-1/2 -translate-x-1/2 -top-[1.35rem] text-[0.7rem] italic text-primary font-medium pointer-events-none select-none px-1'>
                      {translatedWord}
                    </span>
                    <WordHighlight
                      word={normalizedWord}
                      disabled={disabled}
                      className={`line-through decoration-2 decoration-red-500 ${savedHighlightClass}`}
                    >
                      {cleanWord}
                    </WordHighlight>
                  </span>
                ) : (
                  <WordHighlight
                    word={normalizedWord}
                    disabled={disabled}
                    className={savedHighlightClass}
                  >
                    {cleanWord}
                  </WordHighlight>
                )}
                {punctuation}
              </span>
            );
          }

          const originalSentence = extractSentenceContext(index);
          const translatedSentenceForMenu =
            translatedSentences.get(originalSentence);

          // Get saved word data for saved words
          const savedWordData = findSavedWordData(normalizedWord);
          const savedTranslation = savedWordData?.translated_word ?? null;

          // Use saved translation if available, otherwise use current translation
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          const displayTranslation = savedTranslation || translatedWord;

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
                onTranslate={w => {
                  void handleTranslate(w, index);
                }}
                fromLanguage={fromLanguage}
                targetLanguage={targetLanguage}
                translatedWord={displayTranslation}
                originalSentence={originalSentence}
                translatedSentence={translatedSentenceForMenu}
                isSaved={isSaved}
                isTranslating={translatingWords.has(normalizedWord)}
                savedTranslation={savedTranslation}
              >
                {translatedWord ? (
                  <span className='relative inline-block align-baseline'>
                    <span className='absolute left-1/2 -translate-x-1/2 -top-[1.35rem] text-[0.7rem] italic text-primary font-medium pointer-events-none select-none px-1'>
                      {translatedWord}
                    </span>
                    <WordHighlight
                      word={normalizedWord}
                      disabled={disabled}
                      active={openMenuIndex === index}
                      className={`line-through decoration-2 decoration-red-500 ${savedHighlightClass}`}
                      onClick={() => {
                        setOpenMenuIndex(prev =>
                          prev === index ? null : index
                        );
                      }}
                    >
                      {cleanWord}
                    </WordHighlight>
                  </span>
                ) : (
                  <WordHighlight
                    word={normalizedWord}
                    disabled={disabled}
                    active={openMenuIndex === index}
                    className={savedHighlightClass}
                    onClick={() => {
                      setOpenMenuIndex(prev => (prev === index ? null : index));
                    }}
                  >
                    {cleanWord}
                  </WordHighlight>
                )}
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
