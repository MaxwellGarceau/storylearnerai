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

  // Align interactive direction with the displayed text language
  // When showing target text, treat it as the "from" for interactions
  let fromLanguage = showFrom
    ? translationData.fromLanguage
    : translationData.toLanguage;
  let targetLanguage = showFrom
    ? translationData.toLanguage
    : translationData.fromLanguage;

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
