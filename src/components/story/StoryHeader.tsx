import React, { useState, useRef } from 'react';
import { TranslationResponse } from '../../lib/translationService';
import TranslationInfoModal from './TranslationInfoModal';
import InfoButton from './InfoButton';
import InfoLabel from './InfoLabel';

interface StoryHeaderProps {
  translationData: TranslationResponse;
  showOriginal: boolean;
  onToggleView: () => void;
}

const StoryHeader: React.FC<StoryHeaderProps> = ({
  translationData,
  showOriginal,
  onToggleView
}) => {
  const [showTranslationInfo, setShowTranslationInfo] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleTranslationInfo = () => {
    setShowTranslationInfo(!showTranslationInfo);
  };

  const closeTranslationInfo = () => {
    setShowTranslationInfo(false);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-2 mb-4">
      <h3 className={`text-lg font-semibold transition-colors duration-300 lg:flex-shrink-0 ${
        showOriginal ? 'text-yellow-800' : 'text-green-800'
      }`}>
        {showOriginal 
          ? 'Original Story (Spanish):' 
          : 'Translated Story (English):'
        }
      </h3>
      
      <div className="flex flex-col sm:flex-row lg:flex-row items-start sm:items-center lg:items-center gap-2 sm:gap-3 lg:gap-2 flex-wrap relative">
        {!showOriginal && (
          <>
            <InfoButton
              ref={buttonRef}
              onClick={toggleTranslationInfo}
              variant="primary"
              size="small"
              className="order-2 sm:order-1"
            >
              Show translation info
            </InfoButton>
            
            <InfoLabel 
              variant="success"
              className="order-1 sm:order-2"
            >
              {translationData.difficulty} Level
            </InfoLabel>
          </>
        )}
        
        <InfoButton
          onClick={onToggleView}
          variant="secondary"
          size="medium"
          className={`order-3 ${
            showOriginal
              ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
              : 'bg-green-200 text-green-800 hover:bg-green-300'
          }`}
        >
          {showOriginal ? 'Show translated story' : 'Show original story'}
        </InfoButton>

        {/* Translation Info Modal */}
        <TranslationInfoModal
          translationData={translationData}
          isOpen={showTranslationInfo}
          onClose={closeTranslationInfo}
          triggerButtonRef={buttonRef}
        />
      </div>
    </div>
  );
};

export default StoryHeader; 