import React, { useMemo } from 'react';
import { LanguageCode } from '../../types/llm/prompts';
import { TranslationToken } from '../../types/llm/tokens';
import { StoryProvider } from '../../contexts/StoryContext';
import InteractiveTextView from './interactiveText/InteractiveTextView';

interface InteractiveTextProps {
  text: string | undefined;
  // Structured tokens with rich metadata (always provided by TranslationService)
  tokens?: TranslationToken[];
  className?: string;
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  // Whether the currently displayed text is the from-language side
  isDisplayingFromSide?: boolean;
  enableTooltips?: boolean;
  disabled?: boolean;
  savedTranslationId?: number;
  includedVocabulary?: string[];
}

const InteractiveTextComponent: React.FC<InteractiveTextProps> = ({
  text,
  tokens = [],
  className,
  fromLanguage,
  targetLanguage,
  isDisplayingFromSide = true,
  enableTooltips = true,
  disabled = false,
  savedTranslationId,
  includedVocabulary = [],
}) => {
  // Create mock translation data for the context
  const translationData = useMemo(
    () => ({
      fromText: text ?? '',
      toText: text ?? '', // Simplified for now
      fromLanguage,
      toLanguage: targetLanguage,
      difficulty: 'a1' as const,
      provider: 'mock' as const,
      model: 'test-model',
      tokens,
      includedVocabulary,
    }),
    [text, fromLanguage, targetLanguage, tokens, includedVocabulary]
  );

  // Early return for undefined or empty text
  if (!text?.trim()) {
    return <span className={className} />;
  }

  return (
    <StoryProvider
      translationData={translationData}
      savedTranslationId={savedTranslationId}
      isDisplayingFromSide={isDisplayingFromSide}
    >
      <InteractiveTextView
        className={className}
        tokens={tokens}
        enableTooltips={enableTooltips}
        disabled={disabled}
      />
    </StoryProvider>
  );
};

const InteractiveText = React.memo(InteractiveTextComponent);
InteractiveText.displayName = 'InteractiveText';

export default InteractiveText;
