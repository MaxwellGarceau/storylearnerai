import React, { useState } from 'react';
import { TranslationResponse } from '../../lib/translationService';
import StoryHeader from './StoryHeader';
import StoryContent from './StoryContent';

interface StoryRenderProps {
  translationData: TranslationResponse;
}

const StoryRender: React.FC<StoryRenderProps> = ({ translationData }) => {
  const [showOriginal, setShowOriginal] = useState(false);

  if (!translationData) {
    return null;
  }

  const toggleStoryView = () => {
    setShowOriginal(!showOriginal);
  };

  return (
    <div className="space-y-4">
      {/* Single Story Container - Toggleable */}
      <div className={`transition-all duration-300 relative ${
        showOriginal 
          ? 'text-yellow-800' 
          : 'text-green-800'
      }`}>
        <StoryHeader 
          translationData={translationData}
          showOriginal={showOriginal}
          onToggleView={toggleStoryView}
        />
        
        <StoryContent 
          translationData={translationData}
          showOriginal={showOriginal}
        />
      </div>
    </div>
  );
};

export default StoryRender;
