import React, { useMemo, useState } from 'react';
import WordHighlight from './WordHighlight';
import WordMenu from './WordMenu';
import { LanguageCode } from '../../types/llm/prompts';
import { useSavedWords } from '../../hooks/interactiveText/useSavedWords';
import { useSentenceContext } from '../../hooks/interactiveText/useSentenceContext';
import { useTranslationCache } from '../../hooks/interactiveText/useTranslationCache';
import { useTokenizedText } from '../../hooks/interactiveText/useTokenizedText';

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

  // Tokenize for rendering
  const tokens = useTokenizedText(text);

  // Split text into segments for sentence extraction (keeps indices aligned with token.segmentIndex)
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
      {tokens.map((t, idx) => {
        if (t.kind !== 'word') {
          const textNode = t.kind === 'punct' ? t.text : t.text;
          return <span key={idx}>{textNode}</span>;
        }

        const normalizedWord = t.normalizedWord;
        const cleanWord = t.cleanWord;
        const punctuation = t.punctuation;
        const translatedWord = translatedWords.get(normalizedWord);
        const isSaved = savedOriginalWords.has(normalizedWord);
        const savedHighlightClass = isSaved
          ? 'bg-yellow-200 dark:bg-yellow-900/30'
          : '';

        // If tooltips are disabled or the component is disabled, just render the word inline
        if (!enableTooltips || disabled) {
          return (
            <span key={idx}>
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

        const originalSentence = extractSentenceContext(t.segmentIndex);
        const translatedSentenceForMenu = translatedSentences.get(originalSentence);

        // Get saved word data for saved words
        const savedWordData = findSavedWordData(normalizedWord);
        const savedTranslation = savedWordData?.translated_word ?? null;

        // Use saved translation if available, otherwise use current translation
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const displayTranslation = savedTranslation || translatedWord;

        // Always render WordMenu so Radix trigger exists before click
        return (
          <span key={idx}>
            <WordMenu
              word={normalizedWord}
              open={openMenuIndex === idx}
              onOpenChange={open => {
                if (open) {
                  // Accept open events from Radix trigger as well (covers clicks on trigger padding)
                  setOpenMenuIndex(idx);
                } else if (openMenuIndex === idx) {
                  setOpenMenuIndex(null);
                }
              }}
              onTranslate={w => {
                void handleTranslate(w, t.segmentIndex);
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
                    active={openMenuIndex === idx}
                    className={`line-through decoration-2 decoration-red-500 ${savedHighlightClass}`}
                    onClick={() => {
                      setOpenMenuIndex(prev => (prev === idx ? null : idx));
                    }}
                  >
                    {cleanWord}
                  </WordHighlight>
                </span>
              ) : (
                <WordHighlight
                  word={normalizedWord}
                  disabled={disabled}
                  active={openMenuIndex === idx}
                  className={savedHighlightClass}
                  onClick={() => {
                    setOpenMenuIndex(prev => (prev === idx ? null : idx));
                  }}
                >
                  {cleanWord}
                </WordHighlight>
              )}
            </WordMenu>
            {punctuation}
          </span>
        );
      })}
    </span>
  );
};

export default InteractiveText;
