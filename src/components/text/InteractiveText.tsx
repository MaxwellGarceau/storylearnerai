import React, { useMemo, useState, useCallback } from 'react';
import WordHighlight from './WordHighlight';
import WordMenu from './WordMenu';
import { LanguageCode } from '../../types/llm/prompts';
import { useWordTranslation } from '../../hooks/useWordTranslation';
import { useVocabulary } from '../../hooks/useVocabulary';
import { useLanguages } from '../../hooks/useLanguages';

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
  const [translatingWords, setTranslatingWords] = useState<Set<string>>(
    new Set()
  );
  const { translateWordInSentence, translateSentence } = useWordTranslation();
  const { vocabulary } = useVocabulary();
  const { getLanguageIdByCode } = useLanguages();

  const fromLanguageId = getLanguageIdByCode(fromLanguage);
  const targetLanguageId = getLanguageIdByCode(targetLanguage);

  // Build a set of saved original words for this language pair (lowercased)
  const savedOriginalWords = useMemo(() => {
    if (fromLanguageId == null || targetLanguageId == null)
      return new Set<string>();
    const set = new Set<string>();
    for (const item of vocabulary) {
      if (
        item.from_language_id === fromLanguageId &&
        item.translated_language_id === targetLanguageId &&
        item.original_word
      ) {
        set.add(item.original_word.toLowerCase());
      }
    }
    return set;
  }, [vocabulary, fromLanguageId, targetLanguageId]);

  // Function to find saved word data
  const findSavedWordData = useCallback((word: string) => {
    if (fromLanguageId == null || targetLanguageId == null) return null;

    const normalizedWord = word.toLowerCase();
    return vocabulary.find(item =>
      item.from_language_id === fromLanguageId &&
      item.translated_language_id === targetLanguageId &&
      item.original_word?.toLowerCase() === normalizedWord
    ) || null;
  }, [vocabulary, fromLanguageId, targetLanguageId]);

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

    // Set loading state
    setTranslatingWords(prev => new Set(prev).add(word));

    try {
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
    } finally {
      // Clear loading state
      setTranslatingWords(prev => {
        const newSet = new Set(prev);
        newSet.delete(word);
        return newSet;
      });
    }
  };

  const handleSave = (_word: string) => {
    // Saving handled by VocabularySaveButton
  };

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
          const savedTranslation = savedWordData?.translated_word || null;

          // Use saved translation if available, otherwise use current translation
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
                _onSave={handleSave}
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
