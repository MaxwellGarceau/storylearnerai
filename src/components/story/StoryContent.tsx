import React from 'react';
import { TranslationResponse } from '../../lib/translationService';

interface StoryContentProps {
  translationData: TranslationResponse;
  showOriginal: boolean;
}

const StoryContent: React.FC<StoryContentProps> = ({
  translationData,
  showOriginal
}) => {
  return (
    <div className="relative overflow-hidden">
      <p className="text-foreground whitespace-pre-wrap transition-opacity duration-300 leading-relaxed">
        {showOriginal ? translationData.originalText : translationData.translatedText}
      </p>
    </div>
  );
};

export default StoryContent; 