import React, { useState } from 'react';
import { TranslationResponse } from '../../lib/translationService';
import StoryHeader from './StoryHeader';
import StoryContent from './StoryContent';

interface StoryRenderProps {
  translationData: TranslationResponse;
  savedTranslationId?: number;
}

const StoryRender: React.FC<StoryRenderProps> = ({
  translationData,
  savedTranslationId,
}) => {
  const [showFrom, setShowFrom] = useState(false);

  if (!translationData) {
    return null;
  }

  const toggleStoryView = () => {
    setShowFrom(!showFrom);
  };

  return (
    <div className='space-y-4'>
      {/* Single Story Container - Toggleable */}
      <div className='transition-all duration-300 relative'>
        <StoryHeader
          translationData={translationData}
          showFrom={showFrom}
          onToggleView={toggleStoryView}
        />

        <StoryContent
          translationData={translationData}
          showFrom={showFrom}
          savedTranslationId={savedTranslationId}
        />
      </div>
    </div>
  );
};

export default StoryRender;
