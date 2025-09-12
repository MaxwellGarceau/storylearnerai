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
    : translationData.targetText;

  // Keep canonical language orientation for saving/lookups
  const fromLanguage = translationData.fromLanguage;
  const targetLanguage = translationData.toLanguage;

  return (
    <div className='relative overflow-hidden'>
      <div className='text-foreground whitespace-pre-wrap transition-opacity duration-300 leading-relaxed'>
        <InteractiveText
          text={displayText}
          fromLanguage={fromLanguage}
          targetLanguage={targetLanguage}
          savedTranslationId={savedTranslationId}
          includedVocabulary={translationData.includedVocabulary}
        />
      </div>
    </div>
  );
};

export default StoryContent;
