import React from 'react';
import { TranslationResponse } from '../../lib/translationService';
import InteractiveText from '../text/InteractiveText';

interface StoryContentProps {
  translationData: TranslationResponse;
  showOriginal: boolean;
}

const StoryContent: React.FC<StoryContentProps> = ({
  translationData,
  showOriginal,
}) => {
  const displayText = showOriginal
    ? translationData.originalText
    : translationData.translatedText;

  const targetLanguage = showOriginal
    ? translationData.fromLanguage
    : translationData.toLanguage;

  return (
    <div className='relative overflow-hidden'>
      <div className='text-foreground whitespace-pre-wrap transition-opacity duration-300 leading-relaxed'>
        <InteractiveText text={displayText} targetLanguage={targetLanguage} />
      </div>
    </div>
  );
};

export default StoryContent;
