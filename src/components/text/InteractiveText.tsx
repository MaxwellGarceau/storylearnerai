import React, { useMemo, useCallback } from 'react';
import { LanguageCode } from '../../types/llm/prompts';
import { useSavedWords } from '../../hooks/interactiveText/useSavedWords';
import { useSentenceContext } from '../../hooks/interactiveText/useSentenceContext';
import { useTranslationCache } from '../../hooks/interactiveText/useTranslationCache';
import { useTokenizedText } from '../../hooks/interactiveText/useTokenizedText';
import { InteractiveTextProvider } from './InteractiveTextContext';
import InteractiveTextView from './interactiveText/InteractiveTextView';

interface InteractiveTextProps {
  text: string | undefined;
  className?: string;
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  enableTooltips?: boolean;
  disabled?: boolean;
  savedTranslationId?: number;
  includedVocabulary?: string[];
}

const InteractiveTextComponent: React.FC<InteractiveTextProps> = ({
  text,
  className,
  fromLanguage,
  targetLanguage,
  enableTooltips = true,
  disabled = false,
  savedTranslationId,
  includedVocabulary = [],
}) => {
  // Always call hooks first, regardless of text content
  // Tokenize for rendering
  const tokens = useTokenizedText(text);

  // Split text into segments for sentence extraction (keeps indices aligned with token.segmentIndex)
  const words = useMemo(() => text?.split(/(\s+)/) ?? [], [text]);

  // Sentence context helpers
  const { extractSentenceContext } = useSentenceContext(words);

  // Saved words and lookup
  const {
    savedOriginalWords,
    savedTargetWords,
    findSavedWordData,
    findSavedByTargetWord,
  } = useSavedWords(
    fromLanguage,
    targetLanguage
  );

  // Translation cache and handler
  const {
    targetWords,
    targetSentences,
    translatingWords,
    setWordTranslation,
    handleTranslate,
  } = useTranslationCache({
    extractSentenceContext,
    fromLanguage,
    targetLanguage,
  });

  // Create callbacks before conditional return (hooks must be called unconditionally)
  const getTargetWord = useCallback(
    (word: string) => {
      // Try runtime overlay first
      const runtime = targetWords.get(word);
      if (runtime) return runtime;
      // Then try saved reverse lookup (when viewing target-side word)
      const saved = findSavedByTargetWord(word);
      if (saved?.from_word) return saved.from_word;
      return undefined;
    },
    [targetWords, findSavedByTargetWord]
  );

  const isTranslatingWord = useCallback(
    (word: string) => translatingWords.has(word),
    [translatingWords]
  );

  const isSavedWord = useCallback(
    (word: string) => savedOriginalWords.has(word) || savedTargetWords.has(word),
    [savedOriginalWords, savedTargetWords]
  );

  const isIncludedVocabulary = useCallback(
    (word: string) => includedVocabulary.includes(word),
    [includedVocabulary]
  );

  const handleTranslateWithSavedCheck = (w: string, segmentIndex: number) => {
    const alreadyRuntime = targetWords.get(w);
    if (alreadyRuntime) return;

    // If w is a from-word saved key, inject its target
    const savedByFrom = findSavedWordData(w);
    if (savedByFrom?.target_word) {
      setWordTranslation(w, savedByFrom.target_word);
      return;
    }

    // If w is a target-word saved key (viewing target side), inject its from word as overlay
    const savedByTarget = findSavedByTargetWord(w);
    if (savedByTarget?.from_word) {
      setWordTranslation(w, savedByTarget.from_word);
      return;
    }

    void handleTranslate(w, segmentIndex);
  };

  // Early return for undefined or empty text (after all hooks are called)
  if (!text?.trim()) {
    return <span className={className} />;
  }

  return (
    <InteractiveTextProvider
      value={{
        fromLanguage,
        targetLanguage,
        savedOriginalWords,
        // expose only existing finders to keep context stable
        findSavedWordData,
        targetWords,
        targetSentences,
        translatingWords,
        savedTranslationId,
        includedVocabulary,
        getTargetWord,
        isTranslatingWord,
        isSavedWord,
        isIncludedVocabulary,
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
        getTargetSentence={(fromSentence: string) =>
          targetSentences.get(fromSentence)
        }
        isSaved={(w: string) => isSavedWord(w)}
        getDisplayTranslation={(w: string) => targetWords.get(w)}
        isTranslating={(w: string) => translatingWords.has(w)}
        onTranslate={handleTranslateWithSavedCheck}
      />
    </InteractiveTextProvider>
  );
};

const InteractiveText = React.memo(InteractiveTextComponent);
InteractiveText.displayName = 'InteractiveText';

export default InteractiveText;
