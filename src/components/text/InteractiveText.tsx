import React, { useMemo, useCallback } from 'react';
import { LanguageCode } from '../../types/llm/prompts';
import { useSavedWords } from '../../hooks/interactiveText/useSavedWords';
import { useSentenceContext } from '../../hooks/interactiveText/useSentenceContext';
import { useTranslationCache } from '../../hooks/interactiveText/useTranslationCache';
import { useTokenizedText } from '../../hooks/interactiveText/useTokenizedText';
import { InteractiveTextProvider } from './InteractiveTextContext';
import InteractiveTextView from './interactiveText/InteractiveTextView';

interface InteractiveTextProps {
  text: string;
  className?: string;
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  enableTooltips?: boolean;
  disabled?: boolean;
  savedTranslationId?: number;
  includedVocabulary?: string[];
}

const InteractiveText: React.FC<InteractiveTextProps> = ({
  text,
  className,
  fromLanguage,
  targetLanguage,
  enableTooltips = true,
  disabled = false,
  savedTranslationId,
  includedVocabulary = [],
}) => {
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
  const {
    translatedWords,
    translatedSentences,
    translatingWords,
    setWordTranslation,
    handleTranslate,
  } = useTranslationCache({
    extractSentenceContext,
    fromLanguage,
    targetLanguage,
  });

  const handleTranslateWithSavedCheck = (w: string, segmentIndex: number) => {
    const saved = findSavedWordData(w);
    const alreadyRuntime = translatedWords.get(w);
    if (saved?.translated_word && !alreadyRuntime) {
      setWordTranslation(w, saved.translated_word);
      return;
    }
    void handleTranslate(w, segmentIndex);
  };

  return (
    <InteractiveTextProvider
      value={{
        fromLanguage,
        targetLanguage,
        savedOriginalWords,
        findSavedWordData,
        translatedWords,
        translatedSentences,
        translatingWords,
        savedTranslationId,
        includedVocabulary,
        getTranslatedWord: useCallback(
          (word: string) => translatedWords.get(word),
          [translatedWords]
        ),
        isTranslatingWord: useCallback(
          (word: string) => translatingWords.has(word),
          [translatingWords]
        ),
        isSavedWord: useCallback(
          (word: string) => savedOriginalWords.has(word),
          [savedOriginalWords]
        ),
        isIncludedVocabulary: useCallback(
          (word: string) => includedVocabulary.includes(word),
          [includedVocabulary]
        ),
      }}
    >
      <InteractiveTextView
        className={className}
        tokens={tokens}
        enableTooltips={enableTooltips}
        disabled={disabled}
        fromLanguage={fromLanguage}
        targetLanguage={targetLanguage}
        getOriginalSentence={(segmentIndex: number) =>
          extractSentenceContext(segmentIndex)
        }
        getTranslatedSentence={(originalSentence: string) =>
          translatedSentences.get(originalSentence)
        }
        isSaved={(w: string) => savedOriginalWords.has(w)}
        getDisplayTranslation={(w: string) => translatedWords.get(w)}
        isTranslating={(w: string) => translatingWords.has(w)}
        onTranslate={handleTranslateWithSavedCheck}
      />
    </InteractiveTextProvider>
  );
};

export default InteractiveText;
