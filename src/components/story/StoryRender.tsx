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
    <div className="mt-4 space-y-4">
      {/* Single Story Container - Toggleable */}
      <div className={`p-4 border rounded-md transition-all duration-300 relative ${
        showOriginal 
          ? 'bg-yellow-50 border-yellow-200' 
          : 'bg-green-50 border-green-200'
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
