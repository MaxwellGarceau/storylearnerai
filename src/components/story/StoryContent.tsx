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

  // Default from and target language
  let fromLanguage = translationData.fromLanguage;
  let targetLanguage = translationData.toLanguage;

  // If showFrom is toggled then swap from and target language
  if (showFrom) {
    fromLanguage = translationData.toLanguage;
    targetLanguage = translationData.fromLanguage;
  }

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
