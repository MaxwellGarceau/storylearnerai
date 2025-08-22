import React from 'react';
import { TranslationResponse } from '../../lib/translationService';
import InteractiveText from './InteractiveText';

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

  return (
    <div className='relative overflow-hidden'>
      <p className='text-foreground whitespace-pre-wrap transition-opacity duration-300 leading-relaxed'>
        <InteractiveText text={displayText} />
      </p>
    </div>
  );
};

export default StoryContent;
