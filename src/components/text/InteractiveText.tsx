import React, { useMemo } from 'react';
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
}

const InteractiveText: React.FC<InteractiveTextProps> = ({
  text,
  className,
  fromLanguage,
  targetLanguage,
  enableTooltips = true,
  disabled = false,
}) => {
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
    <InteractiveTextProvider
      value={{
        fromLanguage,
        targetLanguage,
        savedOriginalWords,
        findSavedWordData,
        translatedWords,
        translatedSentences,
        translatingWords,
      }}
    >
      <InteractiveTextView
        className={className}
        tokens={tokens}
        enableTooltips={enableTooltips}
        disabled={disabled}
        getOriginalSentence={(segmentIndex: number) => extractSentenceContext(segmentIndex)}
        getTranslatedSentence={(originalSentence: string) => translatedSentences.get(originalSentence)}
        isSaved={(w: string) => savedOriginalWords.has(w)}
        getSavedTranslation={(w: string) => findSavedWordData(w)?.translated_word ?? null}
        getDisplayTranslation={(w: string) => translatedWords.get(w)}
        isTranslating={(w: string) => translatingWords.has(w)}
        onTranslate={(w: string, segmentIndex: number) => {
          void handleTranslate(w, segmentIndex);
        }}
      />
    </InteractiveTextProvider>
  );
};

export default InteractiveText;
