import React from 'react';
import { TranslationResponse } from '../../lib/translationService';
import InteractiveText from '../text/InteractiveText';

interface StoryContentProps {
  translationData: TranslationResponse;
  showFrom: boolean;
  savedTranslationId?: number;
}

const StoryContent: React.FC<StoryContentProps> = ({
  translationData,
  showFrom,
  savedTranslationId,
}) => {
  const displayText = showFrom
    ? translationData.fromText
    : translationData.toText;

  // Keep canonical language orientation for saving/lookups
  const fromLanguage = translationData.fromLanguage;
  const targetLanguage = translationData.toLanguage;

  // Always pass tokens - they contain both from and to data that we can swap based on display side
  const tokens = translationData.tokens;

  return (
    <div className='relative'>
      <div className='text-foreground whitespace-pre-wrap transition-opacity duration-300 leading-relaxed'>
        <InteractiveText
          text={displayText}
          tokens={tokens}
          fromLanguage={fromLanguage}
          targetLanguage={targetLanguage}
          isDisplayingFromSide={showFrom}
          // Disable interactive functionality when showing original story
          disabled={showFrom}
          // Provide display-side flag via context: true when showing from-language text
          savedTranslationId={savedTranslationId}
          includedVocabulary={translationData.includedVocabulary}
        />
      </div>
    </div>
  );
};

export default StoryContent;
